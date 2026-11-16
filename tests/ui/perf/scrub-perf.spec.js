// 年代スライダーの高速連続ドラッグ：フレーム間隔・長いタスク・入力への追従・着地後の状態を本番ビルドで測る。
// 復元テスト scrub-perf.mjs の移行。合否：カメラが動かないこと、着地後に演出の残りがないこと、コンソールのエラーがないこと。
// フレーム時間は UI_PERF_STRICT=1 のときだけ合否に含める（既定は記録のみ。端末の速さで変わるため）。
// スマホ相当は CPU を 4 倍遅くして測る
import { test, expect } from "../fixtures.js";

const STRICT = process.env.UI_PERF_STRICT === "1";

test("年代スライダーの高速ドラッグ", async ({ page, ui, cdp }, testInfo) => {
  test.setTimeout(240_000);
  await ui.openMap();
  await ui.moveToYear(1095);
  await ui.press(ui.mapButton("ヨーロッパへ移動"));
  await ui.waitCameraStable();
  const vb0 = await ui.camera();
  if (ui.mobile) await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  await page.evaluate(() => {
    window.__perf = { frames: [], long: [], on: true };
    let last = performance.now();
    const loop = (t) => { window.__perf.frames.push(t - last); last = t; if (window.__perf.on) requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    try { new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__perf.long.push(e.duration))).observe({ type: "longtask", buffered: false }); } catch { /* longtask 非対応 */ }
  });
  const box = await page.locator(".glass-thumb-gold[role=slider]").boundingBox();
  const track = await page.evaluate(() => document.querySelector(".glass-thumb-gold[role=slider]").parentElement.getBoundingClientRect().width);
  const [tx, ty] = [box.x + box.width / 2, box.y + box.height / 2];
  // 左右に3往復（およそ 1000〜1700 年を行き来）、約8ms ごとに動かす
  const xs = [];
  for (let k = 0; k < 3; k++) { for (let i = 0; i <= 60; i++) xs.push(tx + (i / 60) * track * 0.35); for (let i = 60; i >= 0; i--) xs.push(tx + (i / 60) * track * 0.35); }
  await page.mouse.move(tx, ty); await page.mouse.down();
  const t0 = Date.now();
  for (const x of xs) { await page.mouse.move(x, ty); await ui.sleep(8); }
  const dragMs = Date.now() - t0;
  await page.mouse.move(tx + track * 0.2, ty); await ui.sleep(30);
  await page.mouse.up();
  await ui.snapshot("landing.png");
  // 指を離した年へはクロスフェードで着地し、終われば演出の残りがない
  await expect.poll(() => page.evaluate(() => document.querySelectorAll(".territory-out, .territory-in").length), { timeout: 5000, message: "着地後に残像・フェードが残らない" }).toBe(0);
  const p = await page.evaluate(() => {
    window.__perf.on = false;
    const f = window.__perf.frames.slice(2); const s = [...f].sort((a, b) => a - b);
    return { n: f.length, avg: f.reduce((a, b) => a + b, 0) / f.length, p95: s[Math.floor(s.length * 0.95)], max: s.at(-1), long: window.__perf.long.length, longMax: Math.max(0, ...window.__perf.long) };
  });
  if (ui.mobile) await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  const summary = `drag ${dragMs}ms・moves ${xs.length}｜frames ${p.n} avg ${p.avg.toFixed(1)}ms p95 ${p.p95.toFixed(1)}ms max ${p.max.toFixed(0)}ms｜longtasks ${p.long} max ${p.longMax.toFixed(0)}ms`;
  testInfo.annotations.push({ type: "perf", description: summary });
  console.log(`[${testInfo.project.name}] ${summary}`);
  const vb1 = await ui.camera();
  expect(vb1.left).toBeCloseTo(vb0.left, 3);
  expect(vb1.w, "ドラッグ中も着地後もカメラは動かない").toBeCloseTo(vb0.w, 3);
  if (STRICT) {
    expect(p.p95, "フレーム間隔の95パーセンタイル").toBeLessThanOrEqual(ui.mobile ? 34 : 20);
    expect(p.longMax, "最長タスク").toBeLessThan(ui.mobile ? 120 : 60);
  }
});
