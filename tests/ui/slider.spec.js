// 年代スライダーのキーボード操作（App.jsx の EraScrubber のつまみ：role="slider"・tabIndex=0、←→ で 10 年ずつ、
// 紀元前3000年〜2025年で止まる）。PC のキーボードで確かめる（スマホにはキーボード操作がない）
import { test, expect } from "./fixtures.js";
import { SPEC, formatYear } from "./helpers/spec.js";

const THUMB = ".glass-thumb-gold[role=slider]";
const isThumbFocused = (page) => page.evaluate((sel) => document.activeElement === document.querySelector(sel), THUMB);

test.describe("年代スライダーのキーボード操作", () => {
  test.skip(({ isMobile }) => isMobile, "キーボード操作は PC で確かめる");

  test("Tab でつまみにフォーカスでき、←→ で 10 年ずつ動き、地図も追従する", async ({ page, ui }) => {
    await ui.openMap();
    // 地図タブのボタンから Tab で順に進み、つまみに届く（キーボードだけで操作できる）
    await page.getByRole("button", { name: "地図", exact: true }).focus();
    let reached = false;
    for (let i = 0; i < 30 && !reached; i++) { await page.keyboard.press("Tab"); reached = await isThumbFocused(page); }
    expect(reached, "Tab でつまみにフォーカスが移る").toBe(true);
    expect(await page.locator(THUMB).getAttribute("tabindex")).toBe("0");

    const start = SPEC.initialYear;
    await page.keyboard.press("ArrowRight");
    await expect.poll(ui.sliderYearText).toBe(formatYear(start + SPEC.sliderKeyStep));
    await page.keyboard.press("ArrowRight");
    await expect.poll(ui.sliderYearText).toBe(formatYear(start + 2 * SPEC.sliderKeyStep));
    await page.keyboard.press("ArrowLeft");
    await expect.poll(ui.sliderYearText).toBe(formatYear(start + SPEC.sliderKeyStep));
    expect(await isThumbFocused(page), "操作の後もつまみにフォーカスが残る").toBe(true);
    // 地図も新しい年で描き直され、演出が終わって落ち着く（つまみ以外は変わらない：カメラは動かない）
    const cam = await ui.camera();
    await ui.waitMapSettled();
    expect((await ui.camera()).w).toBeCloseTo(cam.w, 3);
    expect(await ui.regionIdsOnMap(), "近世の地図のまま").toContain("フランス王国");
    // ←→ 以外のキー（上下）では年は変わらない
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowDown");
    await ui.sleep(300);
    expect(await ui.sliderYearText()).toBe(formatYear(start + SPEC.sliderKeyStep));
  });

  test("範囲の両端で止まる（2025年・紀元前3000年）", async ({ page, ui }) => {
    await ui.openMap();
    await ui.moveToYear(1991);
    await page.locator(THUMB).focus();
    const toMax = Math.ceil((SPEC.scrubMax - 1991) / SPEC.sliderKeyStep);
    for (let i = 0; i < toMax + 2; i++) await page.keyboard.press("ArrowRight");
    await expect.poll(ui.sliderYearText, { message: "上端（2025年）で止まる" }).toBe(formatYear(SPEC.scrubMax));

    await ui.moveToYear(-2500);
    await page.locator(THUMB).focus();
    const toMin = Math.ceil((-2500 - SPEC.scrubMin) / SPEC.sliderKeyStep);
    for (let i = 0; i < toMin + 2; i++) await page.keyboard.press("ArrowLeft");
    await expect.poll(ui.sliderYearText, { message: "下端（紀元前3000年）で止まる" }).toBe(formatYear(SPEC.scrubMin));
    await ui.waitMapSettled();
    expect(await isThumbFocused(page)).toBe(true);
  });
});
