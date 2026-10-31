// =====================================================================
// 地図の座標系（全時代・全地域で共通）
// 世界全体を1枚のメルカトル図（viewBox 1024×620）に載せ、陸地パス（WORLD_LAND_PATH）・勢力・都市・河川・
// 海の名前はすべてこの座標で持つ。ヨーロッパ以外（東アジア・南アジア・米州など）の勢力や都市も、
// 経度・緯度を lonLatToXY で変換するだけで同じ地図に重なり、カメラ（App.jsx の useMapPanZoom）側の変更は要らない。
// 投影式は陸地パスの海岸線（ジブラルタル海峡・ボスポラス海峡・ペルシア湾奥など）との照合で求めた：
//   x = 483.535 + 2.8448 × 経度、 y = 368.391 − (1024 / 2π) × ln(tan(π/4 + 緯度/2))
// 横方向は x = 0〜1024 で地球1周分（経度 −170°付近で継ぎ目）。地図タブでは横にラップして一周できる。
// =====================================================================
export const MAP_VIEWBOX_W = 1024;
export const MAP_VIEWBOX_H = 620;

const ORIGIN_X = 483.535;
const SCALE_X = 2.8448;
const ORIGIN_Y = 368.391;
const MERCATOR_K = MAP_VIEWBOX_W / (2 * Math.PI);

// 経度・緯度 → viewBox 座標（小数第1位に丸める）
export function lonLatToXY(lon, lat) {
  const x = ORIGIN_X + SCALE_X * lon;
  const y = ORIGIN_Y - MERCATOR_K * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}

// viewBox 座標 → 経度・緯度（検証やデバッグ用）
export function xyToLonLat(x, y) {
  const lon = (x - ORIGIN_X) / SCALE_X;
  const lat = (2 * Math.atan(Math.exp((ORIGIN_Y - y) / MERCATOR_K)) - Math.PI / 2) * (180 / Math.PI);
  return [lon, lat];
}

// 経度・緯度の矩形 [[西経, 南緯], [東経, 北緯]] → viewBox 座標の矩形 { x0, y0, x1, y1 }。
// 地図の初期表示範囲を明示したいとき（ERA_PERIODS の focusBounds）に使う
export function lonLatBounds([[lonW, latS], [lonE, latN]]) {
  const [x0, y1] = lonLatToXY(lonW, latS);
  const [x1, y0] = lonLatToXY(lonE, latN);
  return { x0, y0, x1, y1 };
}
