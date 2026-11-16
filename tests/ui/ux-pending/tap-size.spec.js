// 【仕様未確定の UX 課題の記録】通常の `npm run test:ui` には含めない（`npm run test:ui:ux-pending` で流す）。
// 課題：地図上の国（勢力）を、どれだけの余白で押せるべきか。CLAUDE.md の「タップ範囲は 40px 目安」（半径 20px）を地図の国にも
// 当てるかは決まっていない。map-hit.spec.js は「タッチ位置の補正を超える 8px の余白があれば、内側を押せばその勢力が開く」までを検査している。
// ここでは、各画面幅の初期表示で、主な勢力の押せる点の余白（押すと別の勢力が開く場所までの距離）を記録するだけにする。
// 記録（2026-11-16）：375×667 の 1555 年の初期表示（2.22 倍）で、フランス王国の余白は 8px。
import { test, expect } from "../fixtures.js";

const CASES = [[1555, ["フランス王国", "神聖ローマ帝国", "スペイン王国", "オスマン帝国"]], [1204, ["神聖ローマ帝国", "フランス王国"]]];

for (const [year, ids] of CASES) {
  test(`${year}年の初期表示で、主な勢力の押せる点の余白（記録のみ） @viewport`, async ({ ui }) => {
    test.skip(!ui.mobile, "指で押す大きさの記録");
    await ui.openMap();
    await ui.moveToYear(year);
    await ui.scrollMapIntoView();
    await ui.resetView();
    const zoom = (await ui.camera()).zoom.toFixed(2);
    const rows = [];
    for (const id of ids) {
      const pt = await ui.deepestRegionPoint(id);
      rows.push(`${id} ${pt ? `${pt.clearance}px` : "画面外"}`);
    }
    expect(rows.length).toBe(ids.length);
    const line = `${test.info().project.name}・${year}年・倍率 ${zoom}：${rows.join("、")}`;
    test.info().annotations.push({ type: "observed", description: line });
    console.log(`[押せる余白] ${line}`);
  });
}
