// 年代の切り替えの勢力図クロスフェード（約0.45秒）：カメラは動かず、変わる勢力だけが残像とフェードインで入れ替わり、
// 終われば通常の表示に戻る。勢力図が変わらなければ演出しない。演出中も勢力を押せる。復元テスト territory-fade-test.mjs の移行
import { test, expect } from "./fixtures.js";
import { SPEC, formatYear } from "./helpers/spec.js";

const fadeState = (page) => page.evaluate(() => {
  const out = document.querySelector(".territory-out"), inn = document.querySelector(".territory-in");
  return {
    out: document.querySelectorAll(".territory-out").length,
    ghosts: document.querySelectorAll(".territory-out path, .territory-out polygon").length,
    inn: document.querySelectorAll(".territory-in").length,
    outOp: out ? +getComputedStyle(out).opacity : null,
    inOp: inn ? +getComputedStyle(inn).opacity : null,
  };
});

for (const [label, from, to, region] of [["フランク王国の分裂", 800, 962, "ヨーロッパ"], ["モンゴル帝国の拡大", 1204, 1300, "東アジア"]]) {
  test(`${label}（${formatYear(from)} → ${formatYear(to)}）`, async ({ page, ui }) => {
    await ui.openMap();
    await ui.moveToYear(from);
    await ui.press(ui.mapButton(`${region}へ移動`));
    await ui.waitCameraStable();
    // 利用者が手で少しずらしたカメラを想定してパンする
    const [mx, my] = await ui.mapCenter();
    await ui.drag(mx, my, 60, 24);
    await ui.waitCameraStable();
    const before = await ui.camera();
    // 移る先の年は、スライダー下の年号チップ（なければ目盛りの点）を実際に押す
    await ui.pressYear(to);
    // 地図がその年を描き終えて演出が始まるのを待ってから、途中の様子を見る
    await expect.poll(async () => (await fadeState(page)).out, { timeout: 2000, intervals: [15] }).toBeGreaterThan(0);
    await ui.sleep(SPEC.territoryFadeMs / 3);
    const mid = await fadeState(page);
    await ui.snapshot(`fade-${from}-${to}-mid.png`);
    expect(mid.ghosts, "前の年の勢力の残像を描く").toBeGreaterThan(0);
    expect(mid.inn, "現れる・形が変わる勢力をフェードインする").toBeGreaterThan(0);
    expect(mid.outOp > 0.05 && mid.outOp < 1 && mid.inOp > 0 && mid.inOp < 1, `途中は両方が半透明（残像 ${mid.outOp}・新 ${mid.inOp}）`).toBe(true);
    await expect.poll(async () => { const s = await fadeState(page); return s.out + s.inn; }, { timeout: SPEC.territoryFadeMs + 1500, message: "演出が終わると通常の表示に戻る" }).toBe(0);
    const after = await ui.camera();
    expect(after.left).toBeCloseTo(before.left, 3);
    expect(after.top).toBeCloseTo(before.top, 3);
    expect(after.w, "カメラ（表示位置・倍率）は動かない").toBeCloseTo(before.w, 3);
  });
}

test("勢力図が変わらなければ演出しない／演出中も勢力を押せる", async ({ page, ui }) => {
  await ui.openMap();
  await ui.moveToYear(1300);
  await ui.pressYear(1300);
  await ui.sleep(200);
  expect((await fadeState(page)).out, "同じ年を選び直しても演出しない").toBe(0);

  await ui.press(ui.mapButton("東アジアへ移動"));
  await ui.waitCameraStable();
  await ui.pressYear(1204);
  await expect.poll(async () => (await fadeState(page)).out, { timeout: 2000, intervals: [15] }).toBeGreaterThan(0);
  const pt = await ui.regionPoint("モンゴル帝国", { margin: 12 });
  expect(pt).not.toBeNull();
  await ui.tapAt(pt[0], pt[1]);
  await expect.poll(ui.sheetTitle, { message: "演出中も勢力を押して詳細を開ける" }).toBe("モンゴル帝国");
});
