// 【仕様未確定の UX 課題の記録】通常の `npm run test:ui` には含めない（`npm run test:ui:ux-pending` で流す）。
// 課題：勢力の境界ぎわをタッチすると、近くの小さな勢力（引いた地図で 2px 程度）が開くことがある。Chromium がタッチ位置を
// 近くの押せる要素へ寄せる補正による。マウスでは押した点の勢力が開く（map-hit.spec.js で厳密に検査済み）。
// どちらに届けるべきか（大きい勢力を優先する／小さな勢力は寄るまで押せなくする／現状のまま）はユーザーの判断待ちのため、
// ここでは期待値を置かず、観測した結果を注記（annotations）に記録するだけにする。判断が出たら map-hit.spec.js に厳密な検査として移す。
// 記録（2026-11-16、390×844・1204年・引いた地図）：フランドルの中心から 2・4・6px の神聖ローマ帝国の点 → フランドル、
// 8・10・12px → 神聖ローマ帝国。およそ 6px 以内のタッチが小さな勢力へ寄せられる。
import { test, expect } from "../fixtures.js";

test("境界ぎわのタッチの到達先（記録のみ）", async ({ page, ui }) => {
  test.skip(!ui.mobile, "タッチ位置の補正はタッチ入力のときだけ起きる");
  await ui.openMap();
  await ui.moveToYear(1204);
  const [mx, my] = await ui.mapCenter();
  for (let i = 0; i < 6; i++) await ui.zoomGesture(mx, my, 0.4);
  const samples = await page.evaluate(() => {
    const f = document.querySelector('[aria-label="フランドルの詳細を見る"] path').getBoundingClientRect();
    const out = [];
    for (const r of [2, 4, 6, 8, 10, 12, 16, 20]) for (let a = 0; a < 8; a++) {
      const x = f.x + f.width / 2 + r * Math.cos((a * Math.PI) / 4), y = f.y + f.height / 2 + r * Math.sin((a * Math.PI) / 4);
      if (document.elementFromPoint(x, y)?.closest("[role=button]")?.getAttribute("aria-label") === "神聖ローマ帝国の詳細を見る") { out.push({ r, x, y }); break; }
    }
    return out;
  });
  expect(samples.length, "フランドルの周りに神聖ローマ帝国の点がある（記録の前提）").toBeGreaterThan(0);
  const observed = [];
  for (const s of samples) {
    await page.touchscreen.tap(s.x, s.y);
    await ui.sleep(500);
    observed.push(`${s.r}px → ${(await ui.sheetTitle()) ?? "（開かない）"}`);
    await ui.closeSheet();
  }
  test.info().annotations.push({ type: "observed", description: `フランドルの中心から離れた神聖ローマ帝国の点をタッチ：${observed.join("、")}` });
  console.log(`[境界ぎわのタッチ] ${observed.join("、")}`);
});
