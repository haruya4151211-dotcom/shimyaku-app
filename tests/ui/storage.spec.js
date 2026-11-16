// 学習の記録の保存（appStorage：window.storage → localStorage → メモリ）。
// 復元テスト storage-test.mjs の移行。テストごとに新しいブラウザコンテキスト（空の localStorage）で動くので、
// 以前のように localStorage を消す必要はなく、利用者の記録にも触れない
import { test, expect } from "./fixtures.js";

const answerOne = async (page, ui) => {
  await ui.press(page.getByRole("button", { name: "カードをタップして解答を確認" }));
  const good = page.getByRole("button", { name: /3日後/ });
  await expect(good).toBeVisible();
  await ui.press(good);
  // 次のカードの表面に戻る
  await expect(page.getByRole("button", { name: "カードをタップして解答を確認" })).toBeVisible();
};

test("カードの回答が localStorage に保存され、再読み込み後も残る", async ({ page, ui }) => {
  await ui.goto("/");
  expect(await page.evaluate(() => localStorage.length), "テストは空の保存領域から始まる").toBe(0);
  await answerOne(page, ui);
  await answerOne(page, ui);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("shimyaku:progress") || "{}"));
  const entries = Object.values(saved);
  expect(entries.length).toBe(2);
  expect(entries.every((v) => v.box === 2), `「3日後」で回答した記録（box ${entries.map((v) => v.box).join(",")}）`).toBe(true);
  await page.reload();
  await expect(page.getByRole("button", { name: "カードをタップして解答を確認" })).toBeVisible();
  const after = await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("shimyaku:progress") || "{}")).length);
  expect(after).toBe(2);
});

test("localStorage が使えない環境でも学習を続けられる（メモリに保持）", async ({ page, ui }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get() { throw new DOMException("blocked", "SecurityError"); } });
  });
  await ui.goto("/");
  await answerOne(page, ui);
  await answerOne(page, ui);
});
