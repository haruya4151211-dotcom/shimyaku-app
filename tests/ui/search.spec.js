// 横断検索のモーダル（ヘッダーの検索ボタン・Cmd/Ctrl+K）。復元テスト search-ui-test.mjs の移行。
// 入力は実際のキー入力（fill）で行い、OS の判定（navigator.platform）に頼らず Cmd と Ctrl の両方を確かめる
import { test, expect } from "./fixtures.js";

const dialog = (page) => page.getByRole("dialog", { name: "キーワード検索" });
const input = (page) => page.getByRole("combobox", { name: "検索キーワード" });
const sections = (page) => page.locator("#search-results section").evaluateAll((s) => s.map((x) => x.getAttribute("aria-label")));
const firstIn = (page, cat) => page.locator(`#search-results section[aria-label="${cat}"] [role=option] span.block`).first().textContent();

test("検索ボタン・結果・絞り込み・キーボード操作", async ({ page, ui }) => {
  const W = page.viewportSize().width;
  await ui.goto("/");
  const btn = page.getByRole("button", { name: "キーワード検索を開く" });
  const box = await btn.boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(40);
  expect(box.height).toBeGreaterThanOrEqual(40);
  expect(box.x + box.width).toBeLessThanOrEqual(W);
  const kbd = await btn.locator("kbd").evaluate((k) => getComputedStyle(k).display);
  if (ui.mobile) expect(kbd, "スマホではショートカット表記を隠す").toBe("none");
  else expect(kbd, "PC ではショートカット表記を出す").not.toBe("none");
  expect(await page.evaluate((w) => document.documentElement.scrollWidth > w + 1, W), "横スクロールが出ない").toBe(false);

  await ui.press(btn);
  await expect(dialog(page)).toBeVisible();
  await expect(input(page)).toBeFocused();
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe("hidden");
  await ui.snapshot("search-empty.png");

  await input(page).fill("ローマ");
  await expect.poll(() => sections(page)).toEqual(expect.arrayContaining(["勢力", "都市・拠点", "問題カード"]));
  await expect(page.locator("#search-results mark", { hasText: /^ローマ$/ }).first()).toBeVisible();
  await ui.snapshot("search-rome.png");

  // 表記ゆれ（ひらがな・旧字体）と各カテゴリの先頭
  for (const [q, cat, name] of [["べねつぃあ", "勢力", "ヴェネツィア"], ["ナイル", "地理", "ナイル川"], ["ちちぇんいつぁ", "都市・拠点", "チチェン＝イツァ"], ["ハンムラビ法典", "問題カード", null]]) {
    await input(page).fill(q);
    await expect.poll(() => sections(page), { message: `「${q}」で ${cat} が出る` }).toContain(cat);
    const first = await firstIn(page, cat);
    if (name) expect(first.startsWith(name), `「${q}」→ ${cat} の先頭「${first}」`).toBe(true);
  }

  // カテゴリの絞り込みと「さらに表示」
  await input(page).fill("ローマ");
  await expect.poll(() => sections(page)).toContain("問題カード");
  await ui.press(page.getByRole("tab", { name: /^問題カード/ }));
  await expect.poll(() => sections(page)).toEqual(["問題カード"]);
  expect(await page.locator("#search-results [role=option]").count(), "絞り込み時は5件を超えて出す").toBeGreaterThan(5);
  await ui.press(page.getByRole("tab", { name: /^すべて/ }));
  const more = page.locator("#search-results button", { hasText: /さらに\d+件表示/ }).first();
  const before = await page.locator("#search-results [role=option]").count();
  await ui.press(more);
  await expect.poll(() => page.locator("#search-results [role=option]").count()).toBeGreaterThan(before);

  // キーボード：↓↓↑ と aria-activedescendant、Enter で選んで閉じる
  await input(page).focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await expect(page.locator("[role=option][aria-selected=true]")).toHaveAttribute("data-search-index", "2");
  await page.keyboard.press("ArrowUp");
  await expect(page.locator("[role=option][aria-selected=true]")).toHaveAttribute("data-search-index", "1");
  await expect(input(page)).toHaveAttribute("aria-activedescendant", "search-opt-1");
  await page.keyboard.press("Enter");
  await expect(dialog(page)).toBeHidden();
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe("hidden");
});

test("ショートカット（Cmd+K・Ctrl+K）と Esc", async ({ page, ui }) => {
  await ui.goto("/");
  // 開いたら入力欄にカーソルが入るのを待つ（利用者は入力欄を見てから次のキーを押す。
  // 入力欄にフォーカスが移る前の Esc は効かない：Esc はモーダルの中にフォーカスがあるときだけ受け取る作り）
  await page.keyboard.press("Control+k");
  await expect(dialog(page)).toBeVisible();
  await expect(input(page)).toBeFocused();
  await page.keyboard.press("Control+k");
  await expect(dialog(page)).toBeHidden();
  await page.keyboard.press("Meta+k");
  await expect(dialog(page)).toBeVisible();
  await expect(input(page)).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toBeHidden();
});

test("一致なしの案内と、画面の大きさに合わせた配置", { tag: "@viewport" }, async ({ page, ui }) => {
  const { width: W, height: H } = page.viewportSize();
  await ui.goto("/");
  await ui.press(page.getByRole("button", { name: "キーワード検索を開く" }));
  await input(page).fill("ぜったいにないことば");
  await expect(page.locator("#search-results")).toContainText("見つかりませんでした");
  if (ui.mobile) {
    // ソフトウェアキーボードが出て表示領域が縮んだ状態を想定し、表示領域の高さを縮める
    await page.setViewportSize({ width: W, height: 470 });
    await ui.sleep(300);
    const lay = await page.evaluate(() => {
      const d = document.querySelector("[role=dialog]").getBoundingClientRect();
      const i = document.querySelector('[aria-label="検索キーワード"]').getBoundingClientRect();
      return { top: d.top, bottom: d.bottom, vh: window.visualViewport.height, inputBottom: i.bottom, w: d.width };
    });
    expect(lay.top).toBe(0);
    expect(Math.abs(lay.bottom - lay.vh), "表示領域いっぱいに開く").toBeLessThan(2);
    expect(lay.inputBottom).toBeLessThan(lay.vh);
    expect(lay.w).toBe(W);
    await input(page).fill("ローマ");
    await expect.poll(() => page.evaluate(() => { const l = document.querySelector("#search-results"); return l.scrollHeight > l.clientHeight && l.getBoundingClientRect().bottom <= window.visualViewport.height + 1; }), { message: "結果は表示領域の中でスクロールする" }).toBe(true);
    expect(await input(page).evaluate((i) => parseFloat(getComputedStyle(i).fontSize)), "入力欄は16px以上（iOS の自動拡大を防ぐ）").toBeGreaterThanOrEqual(16);
    await ui.snapshot("search-keyboard.png");
    await ui.press(dialog(page).getByRole("button", { name: "閉じる", exact: true }));
    await expect(dialog(page)).toBeHidden();
  } else {
    const d = await dialog(page).boundingBox();
    expect(d.width).toBeLessThanOrEqual(640);
    expect(d.y).toBeGreaterThan(40);
    expect(d.y + d.height).toBeLessThan(H);
    await page.mouse.click(30, H - 30);
    await expect(dialog(page), "背景クリックで閉じる").toBeHidden();
  }
});
