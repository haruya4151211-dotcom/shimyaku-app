// 地図上の当たり判定（実際のタップ・クリック）。仕様がはっきりしている次の3点を厳密に確かめる。
// 1. 勢力の内側（押すと別の勢力が開く場所から 8px 以上離れた点）を押すと、その勢力が開く（初期表示とその半分の倍率）。
// 2. 小さな勢力も、寄れば押せる（その勢力を画面の中央へ動かし、押すとその勢力が開く点＝塗り・勢力名・その勢力の都市の印と名前の
//    周りに 8px の余白ができるまで寄ってから押す。上限まで寄っても押せる点ができなければ失敗＝小さすぎて押せない勢力がある）。
// 3. マウスでは、押した点にある勢力が開く（境界のすぐ脇でも、指のような位置の補正はない）。
// 経緯：復元テストで「A の塗りの上を押したのに隣の小さな B が開いた」3件（1204 神聖ローマ帝国→フランドル、1492 フランス王国→ミラノ公国、
// 1555 フランス王国→ジュネーヴ）は、タッチ位置の補正（Chromium がタッチの近くの押せる要素へ吸い寄せる）で境界ぎわの点を押していたため。
// 境界ぎわのタッチをどちらの勢力に届けるべきかは仕様が未確定なので、ここでは判定せず ux-pending/boundary-touch.spec.js に分けた
import { test, expect } from "./fixtures.js";
import { formatYear } from "./helpers/spec.js";

const CASES = [[1204, "神聖ローマ帝国", "フランドル"], [1492, "フランス王国", "ミラノ公国"], [1555, "フランス王国", "ジュネーヴ"]];
// 押す点の周りに求める余白（px）。タッチ位置の補正で隣の小さな勢力へ寄せられたのは、その勢力から 6px 以内のタッチまでだった
// （ux-pending/boundary-touch.spec.js の記録、2026-11-16）ので、それを超える 8px とする（それ以上離れた点のタッチは押した勢力に届く）。
// 地図上の国をどれだけの大きさで押せるべきか（CLAUDE.md の「タップ範囲 40px 目安」を地図にも当てるか）は未確定の UX 課題：
// 375×667 の 1555 年は、初期表示（2.22 倍）でもフランス王国の余白が 8px（パリ・周りの国名と接する）。
// 8px はテスト上の暫定基準で、UX 上の合格基準ではない。押した点からの距離（半径）で、「タップ範囲 40px 目安」（部品の直径）とは別の指標。
// map-camera.spec.js の 10px は押す勢力を選ぶ条件（大きな勢力を選ぶための余裕）で、当たり判定を厳密に見るここの基準とは目的が違う
const MIN_CLEARANCE = 8;

for (const [year, id, small] of CASES) {
  test(`${formatYear(year)} ${id}：内側を押せば ${id}、寄れば小さな ${small} も押せる`, { tag: "@viewport" }, async ({ ui }) => {
    await ui.openMap();
    await ui.moveToYear(year);
    await ui.scrollMapIntoView();
    await ui.resetView();
    const [mx, my] = await ui.mapCenter();
    // 1. 大きな勢力：初期表示とその半分の倍率
    for (const factor of [1, 0.5]) {
      if (factor !== 1) await ui.zoomGesture(mx, my, factor);
      const zoom = (await ui.camera()).zoom.toFixed(2);
      const pt = await ui.deepestRegionPoint(id);
      expect(pt, `${id} が画面に見えている（倍率 ${zoom}）`).not.toBeNull();
      expect(pt.clearance, `${id} の内側に、境界から ${MIN_CLEARANCE}px 以上離れた点がある（倍率 ${zoom}・${pt.clearance}px）`).toBeGreaterThanOrEqual(MIN_CLEARANCE);
      await ui.tapAt(pt.x, pt.y);
      await expect.poll(ui.sheetTitle, { message: `倍率 ${zoom} で ${id} の内側（境界から ${pt.clearance}px）を押す` }).toBe(id);
      await ui.closeSheet();
    }
    // 2. 小さな勢力：画面の中央へ動かして、押せる大きさになるまで寄る
    await ui.resetView();
    await ui.centerRegion(small);
    let pt = await ui.deepestRegionPoint(small);
    for (let i = 0; i < 8 && !(pt && pt.clearance >= MIN_CLEARANCE); i++) {
      const [cx, cy] = await ui.mapCenter();
      await ui.zoomGesture(cx, cy, 1.6);
      await ui.centerRegion(small);
      pt = await ui.deepestRegionPoint(small);
    }
    const zoom = (await ui.camera()).zoom.toFixed(2);
    expect(pt, `${small} が画面に見えている（倍率 ${zoom}）`).not.toBeNull();
    expect(pt.clearance, `寄れば ${small} の内側に ${MIN_CLEARANCE}px 以上の余白ができる（倍率 ${zoom}・${pt.clearance}px）`).toBeGreaterThanOrEqual(MIN_CLEARANCE);
    await ui.tapAt(pt.x, pt.y);
    await expect.poll(ui.sheetTitle, { message: `倍率 ${zoom} で ${small} の内側を押す` }).toBe(small);
  });
}

test("マウスでは、境界のすぐ脇でも押した点の勢力が開く（1204 年・引いた地図のフランドル周辺）", async ({ page, ui }) => {
  test.skip(ui.mobile, "マウス操作の確認。タッチの境界ぎわは仕様未確定（ux-pending）");
  await ui.openMap();
  await ui.moveToYear(1204);
  const [mx, my] = await ui.mapCenter();
  for (let i = 0; i < 6; i++) await ui.zoomGesture(mx, my, 0.4);
  // フランドル（引いた地図で数 px）のすぐ脇にある、神聖ローマ帝国の点
  const pt = await page.evaluate(() => {
    const f = document.querySelector('[aria-label="フランドルの詳細を見る"] path').getBoundingClientRect();
    for (let r = 2; r < 12; r++) for (let a = 0; a < 16; a++) {
      const x = f.x + f.width / 2 + r * Math.cos((a * Math.PI) / 8), y = f.y + f.height / 2 + r * Math.sin((a * Math.PI) / 8);
      if (document.elementFromPoint(x, y)?.closest("[role=button]")?.getAttribute("aria-label") === "神聖ローマ帝国の詳細を見る") return [x, y];
    }
    return null;
  });
  expect(pt, "引いた地図で、フランドルの脇に神聖ローマ帝国の点がある").not.toBeNull();
  await page.mouse.click(pt[0], pt[1]);
  await expect.poll(ui.sheetTitle).toBe("神聖ローマ帝国");
});
