// 地域移動ボタン：その地域の中央へ寄り、地域が画面に収まる。リセットの戻り先は変えない。年代を変えても表示範囲は保つ。
// 復元テスト quickfocus-test.mjs の移行（オセアニアの範囲は 2026-11-02 にポリネシアまで広げた現在の値）
import { test, expect } from "./fixtures.js";
import { SPEC } from "./helpers/spec.js";
import { lonLatToXY } from "../../src/data/mapProjection.js";

const wrapDist = (a, b) => { const d = Math.abs(a - b) % SPEC.viewBoxW; return Math.min(d, SPEC.viewBoxW - d); };

test("地域移動ボタンで各地域へ寄る", { tag: "@viewport" }, async ({ ui }) => {
  await ui.openMap();
  for (const [name, [[w, s], [e, n]]] of Object.entries(SPEC.quickRegions)) {
    await ui.press(ui.mapButton(`${name}へ移動`));
    await ui.waitCameraStable();
    const v = await ui.camera();
    const [x0, y1] = lonLatToXY(w, s), [x1, y0] = lonLatToXY(e, n);
    const cx = (x0 + x1) / 2;
    expect(wrapDist(v.cx, cx), `${name}：地域の中央へ（中心x ${v.cx.toFixed(1)} / ${cx.toFixed(1)}）`).toBeLessThan(3);
    // 横幅か高さのどちらかが地域にぴったり合い、もう一方は地域より広い（＝地域全体が収まる）。
    // ただし地域が広すぎるときは引きの下限で止まる
    const fitsW = v.w >= Math.min(x1 - x0, SPEC.viewBoxW) * 0.98, fitsH = v.h >= (y1 - y0) * 0.98;
    expect(fitsW || fitsH, `${name}：地域が画面に収まる（表示 ${v.w.toFixed(0)}×${v.h.toFixed(0)}／地域 ${(x1 - x0).toFixed(0)}×${(y1 - y0).toFixed(0)}）`).toBe(true);
  }
  await ui.snapshot("oceania.png");
});

test("地域移動はリセットの戻り先を変えず、年代を変えても表示範囲を保つ", { tag: "@viewport" }, async ({ ui }) => {
  await ui.openMap();
  const home = await ui.camera();
  await ui.press(ui.mapButton("東アジアへ移動"));
  await ui.waitCameraStable();
  const ea = await ui.camera();
  await ui.moveToYear(800);
  const v800 = await ui.camera();
  expect(v800.cx).toBeCloseTo(ea.cx, 1);
  expect(v800.w).toBeCloseTo(ea.w, 1);
  await ui.moveToYear(1648);
  await ui.resetView();
  const back = await ui.camera();
  expect(Math.abs(back.cx - home.cx)).toBeLessThan(2);
  expect(Math.abs(back.w - home.w)).toBeLessThan(2);
});

test("地域移動ボタンの列を横にスワイプしても地図はパンしない", { tag: "@viewport" }, async ({ page, ui }) => {
  test.skip(!ui.mobile, "スマホでボタンの列を指で横に送る操作の確認");
  await ui.openMap();
  const before = await ui.camera();
  const box = await page.getByRole("group", { name: "地域へ移動" }).boundingBox();
  const [x, y] = [box.x + box.width * 0.7, box.y + box.height / 2];
  await ui.touch("touchStart", [{ x, y, id: 1 }]);
  for (let i = 1; i <= 8; i++) { await ui.touch("touchMove", [{ x: x - i * 20, y, id: 1 }]); await ui.sleep(16); }
  await ui.touch("touchEnd", []);
  await ui.sleep(500);
  const after = await ui.camera();
  expect(after.cx).toBeCloseTo(before.cx, 1);
});
