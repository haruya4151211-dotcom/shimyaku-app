// 最小限の動作確認：アプリが開き、学習画面と地図タブが表示され、コンソールに警告・エラーが出ない
import { test, expect } from "./fixtures.js";
import { SPEC } from "./helpers/spec.js";

test("学習画面が開き、地図タブで初期年代の地図が出る", { tag: "@viewport" }, async ({ page, ui }) => {
  await ui.goto("/");
  await expect(page.getByRole("button", { name: "カードをタップして解答を確認" })).toBeVisible();
  await ui.openMap();
  const cam = await ui.camera();
  expect(cam.zoom).toBeGreaterThanOrEqual(SPEC.focusZoomMin - 0.01);
  expect(cam.zoom).toBeLessThanOrEqual(SPEC.focusZoomMax + 0.01);
  expect(await ui.regionIdsOnMap()).toContain("フランス王国");
});
