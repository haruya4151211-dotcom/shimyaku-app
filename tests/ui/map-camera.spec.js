// 地図のカメラ：初期表示・リセット・年代変更時の維持・拡大縮小の上限下限・ワールドラップ・ドラッグ後の誤タップ防止。
// 復元テスト viewport-regression.mjs と camera-stay-test.mjs を、現在の仕様（年代を変えてもカメラは動かない：App.jsx の
// focusOn / 初期表示の effect）に合わせて組み直したもの。PC（マウス・ホイール）とスマホ（タッチ・ピンチ）の両方で流す。
import { test, expect } from "./fixtures.js";
import { SPEC, minZoomFor, formatYear } from "./helpers/spec.js";

// 各時代区分から1年ずつ（地図の時代区分 ERA_PERIODS の8区分＋近世の中の年代違い）
const ERAS = [1648, -2500, -323, 800, 1204, 1492, 1555, 1715, 1815, 1914, 1939, 1962];
const near = (a, b, tol) => Math.abs(a - b) <= tol;

test.describe("各時代の初期表示とリセット", () => {
  for (const year of ERAS) {
    test(`${formatYear(year)}：初期表示の倍率・都市と勢力のタップ・拡大縮小・リセット`, { tag: "@viewport" }, async ({ ui }) => {
      await ui.openMap();
      if (year !== SPEC.initialYear) {
        const before = await ui.camera();
        await ui.moveToYear(year);
        const after = await ui.camera();
        // 年代を変えてもカメラは動かない（2026-10-31 の決定。リセットの戻り先だけがその時代の範囲に変わる）
        expect(after.cx).toBeCloseTo(before.cx, 1);
        expect(after.w).toBeCloseTo(before.w, 1);
        await ui.resetView();
      }
      const home = await ui.camera();
      expect(home.zoom, "初期表示の倍率は都市が見える範囲").toBeGreaterThanOrEqual(SPEC.focusZoomMin - 0.01);
      expect(home.zoom).toBeLessThanOrEqual(SPEC.focusZoomMax + 0.01);

      // 都市：画面に見えている都市を最大3つ、実際のタップ（クリック）で押す
      const cities = await ui.visibleCities();
      expect(cities.length, "初期表示でタップできる都市がある").toBeGreaterThanOrEqual(2);
      for (const c of cities.slice(0, 3)) {
        const region = c.label.match(/（(.+)）の詳細を見る/)[1];
        await ui.tapAt(c.x, c.y);
        await expect.poll(ui.sheetTitle, { message: `都市 ${c.label} → ${region}` }).toBe(region);
        await ui.closeSheet();
      }

      // 勢力：押すとその勢力が開く点（塗り・勢力名・その勢力の都市）のうち、別の勢力が開く場所から 10px 以上離れた点を押す
      // （押せる点の定義は map-hit.spec.js と同じで、余白は map-hit の 8px より厳しい 10px。初期表示で 3 つまで押せればよいので、
      //  十分に大きい勢力が選ばれる。10px は合否の基準ではなく選び方の条件で、map-hit の 8px と同じくテスト上の暫定値。
      //  「タップ範囲 40px 目安」（部品の直径）とは別の指標。勢力名の文字も押せばその勢力が開くので候補に含める。375×667 の紀元前2500年のように、
      //  細い塗りの上を名前が覆う勢力もあるため）。見えている面積の大きい勢力から試す（勢力の多い年に全勢力を調べると遅すぎる）
      let tapped = 0;
      for (const id of await ui.regionIdsOnMap({ largestFirst: true })) {
        if (tapped >= 3) break;
        const deep = await ui.deepestRegionPoint(id);
        if (!deep || deep.clearance < 10) continue;
        const pt = [deep.x, deep.y];
        await ui.tapAt(pt[0], pt[1]);
        await expect.poll(ui.sheetTitle, { message: `勢力 ${id} をタップ` }).toBe(id);
        await ui.closeSheet();
        tapped++;
      }
      expect(tapped, "初期表示でタップできる勢力がある").toBeGreaterThanOrEqual(1);

      // 拡大 → 縮小 → リセット（リセットはピンチ・ホイールの直後に押しても効くこと）
      const [mx, my] = await ui.mapCenter();
      await ui.zoomGesture(mx, my, 1.8);
      const zIn = await ui.camera();
      expect(zIn.zoom).toBeGreaterThan(home.zoom * 1.5);
      await ui.zoomGesture(mx, my, 1 / 3);
      const zOut = await ui.camera();
      expect(zOut.zoom).toBeLessThan(zIn.zoom / 2.5);
      await ui.resetView();
      const back = await ui.camera();
      expect(back.zoom).toBeCloseTo(home.zoom, 2);
      expect(near(back.cx, home.cx, 1) && near(back.cy, home.cy, 1), `リセットで初期表示へ戻る（${back.cx},${back.cy} / ${home.cx},${home.cy}）`).toBe(true);
    });
  }
});

test("年代を変えても表示範囲はそのまま（日本付近を見ながら時代を移る）", { tag: "@viewport" }, async ({ ui }) => {
  await ui.openMap();
  const initial = await ui.camera();
  // 日本（東京付近：viewBox 座標 x≈881, y≈273）が中央に来るまでドラッグする。
  // 1回のドラッグは見えている地図の幅の 40% まで（指を画面の外へ出さない）。地図は指に 1:1 で追従するので、毎回その量だけ動くことも確かめる
  const r = await ui.mapRect();
  const maxStep = (r.r - r.x) * 0.4;
  for (let k = 0; k < 20; k++) {
    const v = await ui.camera();
    const s = v.size.w / v.w; // viewBox 1単位あたりの画面px
    let dx = (v.cx - 881) * s, dy = (v.cy - 273) * s;
    if (Math.abs(dx) < 4 && Math.abs(dy) < 4) break;
    dx = Math.max(-maxStep, Math.min(maxStep, dx)); dy = Math.max(-maxStep, Math.min(maxStep, dy));
    const [mx, my] = await ui.mapCenter();
    await ui.drag(mx - dx / 2, my - dy / 2, dx, dy);
    await ui.waitCameraStable();
    const a = await ui.camera();
    const movedX = ((((v.cx - a.cx) % SPEC.viewBoxW) + SPEC.viewBoxW * 1.5) % SPEC.viewBoxW - SPEC.viewBoxW / 2) * s;
    expect(Math.abs(movedX - dx), `パンは指の移動量に 1:1 で追従する（指 ${dx.toFixed(1)}px・地図 ${movedX.toFixed(1)}px）`).toBeLessThan(1);
  }
  const japan = await ui.camera();
  expect(near(japan.cx, 881, 15) && near(japan.cy, 273, 15), `日本付近に移動（${japan.cx}, ${japan.cy}）`).toBe(true);
  for (const y of [-218, 117, 800, 1204, 1555, 1815, 1914, 1950, 1648]) {
    await ui.moveToYear(y);
    const v = await ui.camera();
    expect(near(v.cx, japan.cx, 0.5) && near(v.cy, japan.cy, 0.5) && near(v.w, japan.w, 0.5), `${formatYear(y)}に移っても表示範囲はそのまま`).toBe(true);
  }
  await ui.resetView();
  const reset = await ui.camera();
  expect(near(reset.cx, initial.cx, 2) && near(reset.w, initial.w, 2), "リセットで1648年の初期表示へ戻る").toBe(true);
});

test("倍率の上限・下限", { tag: "@viewport" }, async ({ ui }) => {
  await ui.openMap();
  const [mx, my] = await ui.mapCenter();
  for (let i = 0; i < 6; i++) await ui.zoomGesture(mx, my, 2.2);
  expect((await ui.camera()).zoom, "上限で止まる").toBeCloseTo(SPEC.zoomMax, 2);
  for (let i = 0; i < 10; i++) await ui.zoomGesture(mx, my, 0.4);
  const zmin = await ui.camera();
  expect(zmin.zoom, "下限で止まる").toBeCloseTo(minZoomFor(zmin.size), 2);
  // 下限では全世界の横幅（1024）が見えている
  expect(zmin.w).toBeGreaterThanOrEqual(SPEC.viewBoxW - 0.5);
});

test("横に一周パンしても地図がつながる（ワールドラップ）", { tag: "@viewport" }, async ({ ui }) => {
  await ui.openMap();
  const r = await ui.mapRect();
  const my = (r.y + r.b) / 2;
  const start = await ui.camera();
  let travelled = 0, prev = start.cx, maxTiles = 0;
  for (let i = 0; i < 40 && travelled < SPEC.viewBoxW + 50; i++) {
    await ui.drag(r.r - 30, my, -(r.r - r.x - 60), 0);
    await ui.waitCameraStable();
    const v = await ui.camera();
    // 横の位置は世界1周分（0〜1024）にラップされ続ける（App.jsx の wrapWorldX）
    expect(v.left, "viewBox の左端は 0〜1024 にラップされる").toBeGreaterThanOrEqual(0);
    expect(v.left).toBeLessThan(SPEC.viewBoxW);
    travelled += ((v.cx - prev + SPEC.viewBoxW) % SPEC.viewBoxW);
    prev = v.cx;
    maxTiles = Math.max(maxTiles, v.tiles);
  }
  expect(travelled, "東へ一周以上パンできた").toBeGreaterThan(SPEC.viewBoxW);
  expect(maxTiles, "日付変更線をまたぐときは地図タイルを2枚並べて継ぎ目なく描く").toBeGreaterThanOrEqual(2);
});

test("地図をドラッグした直後に勢力の詳細が開かない", { tag: "@viewport" }, async ({ ui }) => {
  await ui.openMap();
  const pt = await ui.regionPoint("フランス王国", { margin: 12 });
  expect(pt).not.toBeNull();
  await ui.drag(pt[0], pt[1], 40, 25);
  await ui.sleep(500);
  expect(await ui.sheetTitle()).toBeNull();
  // 動かさずに押せば開く（判定が厳しすぎないこと）
  const pt2 = await ui.regionPoint("フランス王国", { margin: 12 });
  await ui.tapAt(pt2[0], pt2[1]);
  await expect.poll(ui.sheetTitle).toBe("フランス王国");
});

test("ダブルクリックでその点を中心に2倍へ寄り、十分寄っているときは初期表示へ戻る", async ({ page, ui }) => {
  test.skip(ui.mobile, "ダブルタップの拡大はスマホのブラウザ自体の操作と重なるため、PC のダブルクリックで確かめる");
  await ui.openMap();
  const home = await ui.camera();
  // 勢力を押してシートが開かないよう、海の上（地図の左上寄り）で操作する
  const r = await ui.mapRect();
  const [x, y] = [r.x + 30, r.y + 70];
  await page.mouse.dblclick(x, y);
  await ui.waitCameraStable();
  const z2 = await ui.camera();
  expect(z2.zoom).toBeCloseTo(home.zoom * 2, 1);
  await page.mouse.dblclick(x, y);
  await ui.waitCameraStable();
  const back = await ui.camera();
  expect(back.zoom).toBeCloseTo(home.zoom, 2);
  await ui.closeSheet();
});
