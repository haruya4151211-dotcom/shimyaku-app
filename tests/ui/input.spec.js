// 入力イベントの扱い：トラックパッドのピンチ（ctrl+ホイール）、年代スライダーのつまみのタッチ操作、地図のタッチでのパン。
// どれもブラウザの警告（passive リスナーでの preventDefault、取り消せない touchmove の取り消しなど）を出さないこと。
// 警告は fixtures.js がブラウザの Log（介入メッセージ）まで含めて監視している。復元テスト passive-test.mjs の移行（判定を追加）
import { test, expect } from "./fixtures.js";

test("ctrl+ホイール（トラックパッドのピンチ）で地図が拡大し、ページ全体は拡大しない", async ({ page, ui }) => {
  test.skip(ui.mobile, "トラックパッドのピンチは PC の操作");
  await ui.openMap();
  const before = await ui.camera();
  const [mx, my] = await ui.mapCenter();
  for (let i = 0; i < 6; i++) { await ui.ctrlWheel(mx, my, Math.exp(40 * 0.012)); await ui.sleep(60); }
  await ui.waitCameraStable();
  const after = await ui.camera();
  expect(after.zoom).toBeCloseTo(Math.min(before.zoom * Math.exp(6 * 40 * 0.012), 14), 1);
  // ブラウザ全体のズームが止められている（地図の外の文字の大きさが変わらない）
  expect(await page.evaluate(() => window.visualViewport.scale)).toBe(1);
});

test("年代スライダーのつまみを指でドラッグすると年が変わる", { tag: "@viewport" }, async ({ page, ui }) => {
  test.skip(!ui.mobile, "タッチ操作の確認");
  await ui.openMap();
  const box = await page.locator(".glass-thumb-gold[role=slider]").boundingBox();
  const [x, y] = [box.x + box.width / 2, box.y + box.height / 2];
  const y0 = await ui.sliderYearText();
  await ui.touch("touchStart", [{ x, y, id: 1 }]);
  for (let i = 1; i <= 8; i++) { await ui.touch("touchMove", [{ x: x - i * 10, y, id: 1 }]); await ui.sleep(30); }
  await ui.touch("touchEnd", []);
  await ui.waitMapSettled();
  const y1 = await ui.sliderYearText();
  expect(y1, `つまみを左へ 80px 動かすと年が戻る（${y0} → ${y1}）`).not.toBe(y0);
  expect(parseInt(y1.replace("紀元前", "-"), 10)).toBeLessThan(parseInt(y0, 10));
  // スライダーを触ってもページが横にずれない
  expect(await page.evaluate(() => window.scrollX)).toBe(0);
});

test("地図を指で横にパンでき、ページは縦にスクロールしない", { tag: "@viewport" }, async ({ page, ui }) => {
  test.skip(!ui.mobile, "タッチ操作の確認");
  await ui.openMap();
  const before = await ui.camera();
  const scrollY = await page.evaluate(() => window.scrollY);
  const [mx, my] = await ui.mapCenter();
  await ui.drag(mx, my, 72, 0);
  await ui.waitCameraStable();
  const after = await ui.camera();
  expect(Math.abs(after.cx - before.cx) * (before.size.w / before.w)).toBeCloseTo(72, 0);
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
});
