// 検索結果の選択 → 年代の移動・カメラの移動・強調表示・詳細シートの連携。復元テスト search-warp-test.mjs の移行。
// サマルカンドは「その年に都市としてあれば都市、なければオアシス」を強調する（2026-11-03 に決めた仕様）
import { test, expect } from "./fixtures.js";
import { SPEC } from "./helpers/spec.js";

const spot = (page) => page.evaluate(() => document.querySelector("[data-spotlight]")?.dataset.spotlight ?? null);
const onMap = (page) => page.locator(".glass-thumb-gold[role=slider]").count().then((n) => n > 0);
const labelBox = (page, text, sheetOpen) => page.evaluate(([text, sheetOpen]) => {
  const el = [...document.querySelectorAll("svg text")].find((t) => t.textContent.trim() === text && !t.closest("[data-spotlight]"));
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const cx = r.x + r.width / 2, cy = r.y + r.height / 2;
  const bottom = innerHeight - (sheetOpen ? innerHeight * 0.56 : 0);
  return { cx: Math.round(cx), cy: Math.round(cy), in: cx > 0 && cx < innerWidth && cy > 0 && cy < bottom, op: +getComputedStyle(el).opacity, groupOp: +getComputedStyle(el.closest("g")).opacity };
}, [text, sheetOpen]);

// 検索して、指定のカテゴリで name から始まる結果（null なら先頭）を選ぶ
const pick = async (page, ui, q, cat, name) => {
  await ui.press(page.getByRole("button", { name: "キーワード検索を開く" }));
  await page.getByRole("combobox", { name: "検索キーワード" }).fill(q);
  const options = page.locator(`#search-results section[aria-label="${cat}"] [role=option]`);
  await expect(options.first()).toBeVisible();
  const option = name ? options.filter({ has: page.locator("span.block", { hasText: new RegExp(`^${name}`) }) }).first() : options.first();
  // 結果の行は「名前」「種類・年代」「（カードは）解答」の span.block を持つ。先頭が名前
  const title = await option.locator("span.block").first().textContent();
  await ui.press(option);
  await expect(page.getByRole("dialog", { name: "キーワード検索" })).toBeHidden();
  return title;
};

test("検索結果から地図へ：勢力・都市・遺跡・河川・カード", async ({ page, ui }) => {
  await ui.goto("/");
  // 1. 勢力：別の年代の勢力 → その年へ移り、輪郭が発光し、寄せ終わるとシートが開く
  expect(await pick(page, ui, "モンゴル帝国", "勢力", "モンゴル帝国")).toContain("モンゴル帝国");
  await expect.poll(() => onMap(page), { message: "地図タブへ切り替わる" }).toBe(true);
  await expect.poll(() => spot(page)).toBe("r:モンゴル帝国");
  expect(await page.locator("[data-spotlight] .spot-glow").count()).toBeGreaterThan(0);
  expect(await page.locator("[data-spotlight] .spot-dim").count()).toBeGreaterThan(0);
  await expect.poll(ui.sheetTitle, { message: "寄せ終わると詳細シートが開く" }).toBe("モンゴル帝国");
  expect(await ui.sliderYearText()).toMatch(/^1[23]\d\d年$/);
  await ui.waitCameraStable();
  const lab = await page.evaluate(() => { const t = document.querySelector('[aria-label="モンゴル帝国の詳細を見る"] text'); const r = t.getBoundingClientRect(); return { y: r.y + r.height / 2, x: r.x + r.width / 2, op: +getComputedStyle(t).opacity }; });
  const sheetTop = await page.locator(".map-sheet").boundingBox();
  expect(lab.y < sheetTop.y && lab.x > 0 && lab.x < page.viewportSize().width && lab.op === 1, `勢力名がシートに隠れず最前面に出る（${JSON.stringify(lab)}）`).toBe(true);
  await ui.snapshot("warp-region.png");

  // 2. 都市：初期の倍率では出ない都市を、今の年代のまま強調する
  await ui.closeSheet();
  await pick(page, ui, "サマルカンド", "都市・拠点", "サマルカンド");
  await expect.poll(() => spot(page)).toMatch(/^[cs]:サマルカンド$/);
  if ((await spot(page)) === "c:サマルカンド") expect(await page.locator("[data-spotlight] .spot-ring").count(), "都市は脈打つ輪で示す").toBe(2);
  await ui.waitCameraStable();
  const city = await labelBox(page, "サマルカンド", false);
  expect(city?.in, `都市名が画面内に出る（${JSON.stringify(city)}）`).toBe(true);
  expect(city.groupOp, "強調中は倍率・重なりに関係なく不透明").toBe(1);
  expect(await ui.sheetTitle(), "都市ではシートを開かない").toBeNull();

  // 3. 遺跡（Tier 5）：5倍以上へ寄せてマーカーと名前を出す
  await pick(page, ui, "マチュ・ピチュ", "都市・拠点", "マチュ・ピチュ");
  await expect.poll(() => spot(page)).toBe("s:マチュ・ピチュ");
  await ui.waitCameraStable();
  const site = await labelBox(page, "マチュ・ピチュ", false);
  expect(site?.in && site.op > 0.5, `遺跡の名前が出る（${JSON.stringify(site)}）`).toBe(true);

  // 4. 河川：流路全体へ寄せて発光
  await pick(page, ui, "ナイル", "地理", "ナイル川");
  await expect.poll(() => spot(page)).toBe("v:ナイル川");
  await ui.waitCameraStable();
  const river = await labelBox(page, "ナイル川", false);
  expect(river?.in && river.op > 0.7, `河川名が最前面で出る（${JSON.stringify(river)}）`).toBe(true);
  expect(await page.locator("[data-spotlight] path.spot-glow").count()).toBeGreaterThan(0);

  // 5. カード：カードの年代へ移り、勢力を強調し、シートの先頭にそのカードを出す
  await pick(page, ui, "ハンムラビ法典", "問題カード", null);
  await expect.poll(() => page.evaluate(() => document.querySelector("[data-featured-card]")?.dataset.featuredCard ?? null)).toBe("c27");
  expect(await ui.sliderYearText()).toMatch(/^紀元前\d+年$/);
  expect(await spot(page)).toMatch(/^r:/);
  await expect(page.locator(".map-sheet button.spot-card")).toHaveCount(1);
  const featured = page.locator("[data-featured-card]");
  await ui.press(featured.getByRole("button", { name: /解答を見る/ }));
  await expect(featured).toContainText("ハンムラビ法典");
  await ui.press(featured.getByRole("button", { name: /このカードを解く/ }));
  await expect.poll(() => onMap(page), { message: "学習画面へ切り替わる" }).toBe(false);
  await expect(page.getByText("ハンムラビ王が定めた法典", { exact: false }).first()).toBeVisible();
});

test("学習画面から検索して地図へ移り、強調は時間で消え、地図を開き直しても繰り返さない", async ({ page, ui }) => {
  await ui.goto("/");
  await pick(page, ui, "ヴェルサイユ", "問題カード", null);
  await expect.poll(() => onMap(page)).toBe(true);
  await expect.poll(() => spot(page)).not.toBeNull();
  await expect.poll(() => page.evaluate(() => document.querySelector("[data-featured-card]")?.dataset.featuredCard ?? null)).not.toBeNull();
  await expect.poll(() => spot(page), { timeout: SPEC.spotlightMs + 3000, message: "強調は数秒で解除される" }).toBeNull();
  await ui.press(page.getByRole("button", { name: "学習", exact: true }));
  await ui.press(page.getByRole("button", { name: "地図", exact: true }));
  await expect(page.locator(".grid-bg svg[preserveAspectRatio]")).toBeVisible();
  await ui.sleep(1200);
  expect(await spot(page), "地図タブを開き直しても検索の移動を繰り返さない").toBeNull();
});
