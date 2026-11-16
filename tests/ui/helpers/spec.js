// テストが前提にするアプリの仕様値。src/App.jsx の定数と一致しているかを spec-sync.spec.js で毎回確かめるので、
// アプリ側の値を変えたらここも見直す（＝仕様の変更を意識して反映する）。値の由来はコメントの行と開発ログの決定事項。
import fs from "node:fs";

export const APP_SOURCE = fs.readFileSync(new URL("../../../src/App.jsx", import.meta.url), "utf8");

export const SPEC = {
  // 地図カメラ（App.jsx の MAP_ZOOM_FLOOR / MAP_ZOOM_MAX / FOCUS_ZOOM_MIN / FOCUS_ZOOM_MAX）
  zoomFloor: 0.3, // 引きの下限。ただし全世界の横幅が収まる倍率の方が大きければそちら（mapMinZoom）
  zoomMax: 14, // 2026-11-01 に 8 → 14 へ変更（小さな勢力・都市まで寄れるように）
  focusZoomMin: 2, // 各時代の初期表示の倍率の範囲（都市マーカーが不透明になる 1.9 以上）
  focusZoomMax: 4.5,
  viewBoxW: 1024,
  viewBoxH: 620,
  // 地図を開いたときの年（ERAS_DATA の絶対王政 defaultMapYear）
  initialYear: 1648,
  // 年代スライダーの範囲（App.jsx の SCRUB_MIN / SCRUB_MAX）と、つまみにフォーカスして ←→ を押したときの刻み（10 年）
  scrubMin: -3000,
  scrubMax: 2025,
  sliderKeyStep: 10,
  // 年代の切り替えの演出（2026-11-03 に 0.7 秒 → 0.45 秒へ短縮）
  territoryFadeMs: 450,
  // 検索結果の強調の表示時間
  spotlightMs: 7000,
  // 地域移動ボタンの行き先（[[西経, 南緯], [東経, 北緯]]）。オセアニアは 2026-11-02 にポリネシアまで広げた
  quickRegions: {
    ヨーロッパ: [[-11, 35], [42, 61]],
    中東: [[24, 12], [63, 42]],
    東アジア: [[96, 18], [146, 50]],
    南アジア: [[60, 5], [97, 37]],
    東南アジア: [[92, -11], [141, 24]],
    アフリカ: [[-18, -35], [52, 37]],
    アメリカ: [[-125, -56], [-34, 55]],
    オセアニア: [[110, -48], [235, 23]],
  },
};

// スライダーの年 ⇔ 位置（%）の区間。テストで年代を動かすときに使う実装上の値なので、仕様として固定せず App.jsx から読む
export const SCALE_SEGMENTS = (() => {
  const block = APP_SOURCE.match(/const SCALE_SEGMENTS = \[([\s\S]*?)\];/);
  if (!block) throw new Error("App.jsx の SCALE_SEGMENTS が見つからない（スライダーの実装が変わった？）");
  return [...block[1].matchAll(/vFrom:\s*(-?\d+),\s*vTo:\s*(-?\d+),\s*pFrom:\s*(\d+),\s*pTo:\s*(\d+)/g)].map((m) => m.slice(1).map(Number));
})();

export const yearToPct = (year) => {
  const seg = SCALE_SEGMENTS.find(([, vTo]) => year <= vTo) ?? SCALE_SEGMENTS[SCALE_SEGMENTS.length - 1];
  const [vFrom, vTo, pFrom, pTo] = seg;
  return pFrom + ((Math.max(vFrom, Math.min(vTo, year)) - vFrom) / (vTo - vFrom)) * (pTo - pFrom);
};

export const formatYear = (y) => (y < 0 ? `紀元前${-y}年` : `${y}年`);

// 引きの下限（App.jsx の mapMinZoom と同じ式）
export const minZoomFor = ({ w, h }) => Math.min(1, Math.max(SPEC.zoomFloor, w / (SPEC.viewBoxW * Math.max(w / SPEC.viewBoxW, h / SPEC.viewBoxH))));
