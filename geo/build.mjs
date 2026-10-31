// 歴史地図の輪郭データを生成する： node geo/build.mjs
// 入力：geo/.cache の Natural Earth 10m admin-1（lib.mjs の SOURCE_URL から取得）と geo/regions.mjs の定義
// 出力：src/data/generated/geoPaths.js（陸地の下地 GEO_LAND_PATH、勢力の輪郭 GEO_PATHS、外枠 GEO_BBOX）
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import polygonClipping from "polygon-clipping";
import * as topojsonServer from "topojson-server";
import { loadWorld, buildShape, landShape, toPath } from "./lib.mjs";
import { REGIONS } from "./regions.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "..", "src", "data", "generated", "geoPaths.js");
const MIN_WEIGHT = 0.005; // 簡略化の強さ（経緯度での三角形面積）。小さいほど海岸線が細かくなり、データが大きくなる
const MIN_AREA = 3; // これより小さい島（0.1単位の2乗）は省く

const t0 = Date.now();
const world = loadWorld({ minWeight: MIN_WEIGHT });
const land = toPath(landShape(world), { minArea: MIN_AREA });

const cache = new Map();
const paths = [];
const pathIndex = new Map();
const entries = [];
const errors = [];
const shapes = new Map();
for (const [key, def] of Object.entries(REGIONS)) {
  try {
    const shape = buildShape(world, def, cache);
    shapes.set(key, shape);
    const d = toPath(shape, { minArea: MIN_AREA });
    if (!d) throw new Error("形が空です");
    if (!pathIndex.has(d)) { pathIndex.set(d, paths.length); paths.push(d); }
    entries.push([key, pathIndex.get(d), bboxOf(d)]);
  } catch (e) {
    errors.push(`${key}: ${e.message}`);
  }
}
// 同じ年代の勢力・背景どうしが重なっていないか（重なるとタップ先があいまいになり、色も濁る）
const OVERLAP_TOLERANCE = 0.02; // 経緯度の2乗。これ未満は境界線の簡略化による誤差として許容する
const areaOf = (multi) => multi.reduce((sum, poly) => sum + poly.reduce((s2, ring, i) => {
  let a = 0;
  for (let j = 0; j < ring.length - 1; j++) a += ring[j][0] * ring[j + 1][1] - ring[j + 1][0] * ring[j][1];
  return s2 + (i === 0 ? 1 : -1) * Math.abs(a) / 2;
}, 0), 0);
const bboxLL = (multi) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const poly of multi) for (const [x, y] of poly[0]) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return [x0, y0, x1, y1];
};
const bySnapshot = new Map();
for (const key of shapes.keys()) {
  const snap = key.split("/")[0];
  if (!bySnapshot.has(snap)) bySnapshot.set(snap, []);
  bySnapshot.get(snap).push(key);
}
for (const keys of bySnapshot.values()) {
  const bbs = keys.map((k) => bboxLL(shapes.get(k)));
  for (let i = 0; i < keys.length; i++) for (let j = i + 1; j < keys.length; j++) {
    const a = bbs[i], b = bbs[j];
    if (a[2] < b[0] || b[2] < a[0] || a[3] < b[1] || b[3] < a[1]) continue;
    const area = areaOf(polygonClipping.intersection(shapes.get(keys[i]), shapes.get(keys[j])));
    if (area > OVERLAP_TOLERANCE) errors.push(`重なり ${keys[i]} × ${keys[j].split("/")[1]}: ${area.toFixed(2)}`);
  }
}
// 勢力に四方を囲まれた空白（すき間）を報告する。意図した空白（教皇領の飛び地など）は ALLOWED_HOLES に挙げる
const ALLOWED_HOLES = new Set([
  ...["abs1648", "abs1715", "abs1772"].map((s) => `${s}@5.1,44.1`), // アヴィニョン周辺の教皇領（フランス国内の飛び地）
  "rev1871@8.3,46.8", // スイス
  ...["imp1885", "imp1900", "imp1914"].flatMap((s) => [`${s}@84.2,28.2`, `${s}@90.4,27.4`]), // ネパール・ブータン
  "imp1885@29.2,-17.4", // 分割前の中央・南部アフリカ内陸
  "imp1900@31.4,-26.5", // スワジランド（1903年まで英領ではない）
  ...["imp1900", "imp1914"].flatMap((s) => [`${s}@33.0,-1.2`, `${s}@34.5,-12.1`]), // 湖（ヴィクトリア湖・マラウイ湖）の中の島
]);
const holes = [];
for (const [snap, keys] of bySnapshot) {
  const union = polygonClipping.union(...keys.map((k) => shapes.get(k)));
  for (const poly of union) for (const ring of poly.slice(1)) {
    const a = Math.abs(areaOf([[ring]]));
    if (a < 0.05) continue;
    const cx = ring.reduce((s2, q) => s2 + q[0], 0) / ring.length, cy = ring.reduce((s2, q) => s2 + q[1], 0) / ring.length;
    // 湖（州・県を含まない空白）は除き、中に州・県の代表点がある空白だけを報告する
    const inside = world.props.filter((q) => pointInRing([q.longitude, q.latitude], ring)).map((q) => `${q.adm0_a3}/${q.name}`);
    if (!inside.length) continue;
    const id = `${snap}@${cx.toFixed(1)},${cy.toFixed(1)}`;
    if (!ALLOWED_HOLES.has(id)) holes.push(`${id}（${a.toFixed(2)}）: ${inside.slice(0, 6).join(", ")}${inside.length > 6 ? " …" : ""}`);
  }
}
if (holes.length) errors.push("勢力に囲まれた空白（意図したものなら ALLOWED_HOLES へ）:\n  " + holes.join("\n  "));
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

function pointInRing([x, y], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function bboxOf(d) {
  let x = 0, y = 0, x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const m of d.matchAll(/([Ml])(-?[\d.]+) ?(-?[\d.]+)|z/g)) {
    if (m[0] === "z") continue;
    const a = parseFloat(m[2]), b = parseFloat(m[3]);
    if (m[1] === "M") { x = a; y = b; } else { x += a; y += b; }
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  }
  return [x0, y0, x1, y1].map((v) => Math.round(v * 10) / 10);
}

// ---------------------------------------------------------------------------
// 書き出し：年代をまたいで同じ海岸線・国境が何度も現れるため、境界線（アーク）を1回だけ持つ形式にする。
// 各パスは「リングごとのアーク番号の列」で表し、読み込み時に元の SVG パス文字列へ戻す（下の DECODER と同じ処理）
// ---------------------------------------------------------------------------
const parseRings = (d) => d.split("z").filter(Boolean).map((seg) => {
  const pts = [];
  let x = 0, y = 0;
  for (const m of seg.matchAll(/([Ml])(-?[\d.]+) ?(-?[\d.]+)/g)) {
    const a = Math.round(parseFloat(m[2]) * 10), b = Math.round(parseFloat(m[3]) * 10);
    if (m[1] === "M") { x = a; y = b; } else { x += a; y += b; }
    pts.push([x, y]);
  }
  pts.push(pts[0]);
  return pts;
});
const allPaths = [land, ...paths];
const topo = topojsonServer.topology(Object.fromEntries(allPaths.map((d, i) => [
  `p${i}`, { type: "Feature", geometry: { type: "MultiPolygon", coordinates: parseRings(d).map((r) => [r]) } },
])));
const arcsEncoded = topo.arcs.map((arc) => {
  let px = 0, py = 0;
  return arc.map(([x, y]) => { const s2 = `${x - px},${y - py}`; px = x; py = y; return s2; }).join(",");
}).join(";");
const ringsEncoded = allPaths.map((_, i) => topo.objects[`p${i}`].arcs.map((poly) => poly[0].join(",")).join("|"));
const DECODER = `const fmt = (v) => (v / 10).toString().replace(/^(-?)0\\./, "$1.");
const ARCS = A.split(";").map((s) => {
  const n = s.split(",").map(Number), pts = [];
  let x = 0, y = 0;
  for (let i = 0; i < n.length; i += 2) { x += n[i]; y += n[i + 1]; pts.push([x, y]); }
  return pts;
});
function decode(rings) {
  let out = "";
  for (const ring of rings.split("|")) {
    const pts = [];
    for (const a of ring.split(",").map(Number)) {
      const arc = a >= 0 ? ARCS[a] : ARCS[~a].slice().reverse();
      for (let i = pts.length ? 1 : 0; i < arc.length; i++) pts.push(arc[i]);
    }
    pts.pop();
    out += "M" + fmt(pts[0][0]) + " " + fmt(pts[0][1]);
    for (let i = 1; i < pts.length; i++) out += "l" + fmt(pts[i][0] - pts[i - 1][0]) + " " + fmt(pts[i][1] - pts[i - 1][1]);
    out += "z";
  }
  return out.replace(/ -/g, "-");
}`;
// 書き出す前に、元の文字列へ完全に戻ることを確かめる
{
  const A = arcsEncoded;
  const check = new Function("A", "R", `${DECODER}\nreturn R.map(decode);`)(A, ringsEncoded);
  // リングの書き始めの点はアークの切れ目に合わせてずれることがあるため、点の並び（巡回）として比べる
  const sameRing = (a, b) => {
    if (a.length !== b.length) return false;
    const n = a.length - 1, key = (p) => `${p[0]},${p[1]}`;
    const start = b.findIndex((p) => key(p) === key(a[0]));
    if (start < 0) return false;
    for (let i = 0; i < n; i++) if (key(a[i]) !== key(b[(start + i) % n])) return false;
    return true;
  };
  const bad = check.findIndex((d, i) => {
    const ra = parseRings(allPaths[i]), rb = parseRings(d);
    return ra.length !== rb.length || ra.some((r, j) => !sameRing(r, rb[j]));
  });
  if (bad >= 0) { console.error(`符号化した輪郭が元に戻りません（${bad}番目）`); process.exit(1); }
}

const out = `// AUTO-GENERATED by geo/build.mjs — 手編集しないこと（定義は geo/regions.mjs）
// 出典：Natural Earth 10m admin-1 states/provinces（パブリックドメイン）を州・県の境界線ごとに簡略化し、
// 勢力ごとに結合して src/data/mapProjection.js と同じメルカトル投影で viewBox 座標に変換したもの。
// 境界線（アーク）は差分符号化して1回だけ持ち、各輪郭はアーク番号の列から SVG パス文字列へ戻す。
/* eslint-disable */
const A = ${JSON.stringify(arcsEncoded)};
const R = ${JSON.stringify(ringsEncoded)};
const E = ${JSON.stringify(entries)};
${DECODER}
export const GEO_LAND_PATH = decode(R[0]);
export const GEO_PATHS = {};
export const GEO_BBOX = {};
for (const [k, i, b] of E) { GEO_PATHS[k] = decode(R[i + 1]); GEO_BBOX[k] = b; }
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, out);
console.log(`${entries.length} regions (${paths.length} unique paths), land ${land.length} chars, total ${(out.length / 1024).toFixed(0)} KB, ${((Date.now() - t0) / 1000).toFixed(1)}s`);
