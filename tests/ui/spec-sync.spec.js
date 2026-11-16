// テストの前提（helpers/spec.js）が src/App.jsx の現在の値と一致しているか。ブラウザを使わないので1回だけ流す。
// ここが落ちたら、アプリ側の仕様が変わったということ。変更が意図どおりか確かめてから spec.js を更新する
import { test, expect } from "@playwright/test";
import { APP_SOURCE, SPEC, SCALE_SEGMENTS } from "./helpers/spec.js";

const constant = (name) => {
  const m = APP_SOURCE.match(new RegExp(`^const ${name} = ([\\d.]+);`, "m"));
  return m ? Number(m[1]) : undefined;
};

// ブラウザを使わない検査なので PC の側だけで流す（playwright.config.js の mobile の testIgnore）
test.describe("仕様値の同期", () => {
  test("地図カメラと演出の定数", () => {
    expect(constant("MAP_ZOOM_FLOOR")).toBe(SPEC.zoomFloor);
    expect(constant("MAP_ZOOM_MAX")).toBe(SPEC.zoomMax);
    expect(constant("FOCUS_ZOOM_MIN")).toBe(SPEC.focusZoomMin);
    expect(constant("FOCUS_ZOOM_MAX")).toBe(SPEC.focusZoomMax);
    expect(constant("TERRITORY_FADE_MS")).toBe(SPEC.territoryFadeMs);
    expect(constant("SPOTLIGHT_MS")).toBe(SPEC.spotlightMs);
  });

  test("年代スライダーの範囲とキー操作の刻み", () => {
    const m = APP_SOURCE.match(/^const SCRUB_MIN = (-?\d+);/m), n = APP_SOURCE.match(/^const SCRUB_MAX = (-?\d+);/m);
    expect(Number(m?.[1])).toBe(SPEC.scrubMin);
    expect(Number(n?.[1])).toBe(SPEC.scrubMax);
    // つまみの onKeyDown：ArrowLeft で value - 刻み、ArrowRight で value + 刻み（範囲で止める）
    expect(APP_SOURCE).toContain(`if (e.key === "ArrowLeft") onChange(Math.max(SCRUB_MIN, value - ${SPEC.sliderKeyStep}));`);
    expect(APP_SOURCE).toContain(`if (e.key === "ArrowRight") onChange(Math.min(SCRUB_MAX, value + ${SPEC.sliderKeyStep}));`);
  });

  test("地域移動ボタンの行き先", () => {
    const block = APP_SOURCE.match(/const MAP_QUICK_REGIONS = \[([\s\S]*?)\];/)[1];
    const actual = Object.fromEntries([...block.matchAll(/label: "([^"]+)", bounds: lonLatBounds\((\[\[.*?\]\])\)/g)].map((m) => [m[1], JSON.parse(m[2])]));
    expect(actual).toEqual(SPEC.quickRegions);
  });

  test("スライダーの区間が読み取れる", () => {
    expect(SCALE_SEGMENTS.length).toBeGreaterThanOrEqual(2);
    expect(SCALE_SEGMENTS[0][2]).toBe(0);
    expect(SCALE_SEGMENTS.at(-1)[3]).toBe(100);
  });
});
