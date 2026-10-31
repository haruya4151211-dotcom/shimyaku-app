// 歴史地図の輪郭を Natural Earth の行政区画（10m admin-1、パブリックドメイン）から合成するための共通処理。
// 1. 全世界の州・県を1つのトポロジー（境界線を共有するデータ構造）にまとめ、境界線ごとに簡略化する
//    → 隣り合う勢力の境界線は常に同じ線になり、すき間や重なりが生じない
// 2. 勢力ごとに州・県を結合し（topojson.merge）、必要な場所だけ経緯度の多角形で切り分ける（polygon-clipping）
// 3. src/data/mapProjection.js と同じメルカトル投影で viewBox 座標へ変換し、SVG パス文字列にする
// 陸地の下地（GEO_LAND_PATH）も同じトポロジーから作るため、勢力の海岸線は陸地と完全に一致する。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as topojsonServer from "topojson-server";
import * as topojsonSimplify from "topojson-simplify";
import * as topojsonClient from "topojson-client";
import polygonClipping from "polygon-clipping";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const SOURCE_URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces_lakes.geojson";
export const SOURCE_FILE = path.join(HERE, ".cache", "ne_10m_admin_1_states_provinces_lakes.geojson");

// 投影（src/data/mapProjection.js と同じ式。座標は 0.1 単位の整数で持ち、境界線の共有点を完全に一致させる）
const ORIGIN_X = 483.535, SCALE_X = 2.8448, ORIGIN_Y = 368.391, MERCATOR_K = 1024 / (2 * Math.PI);
const WRAP_LON = -170; // x = 0 に当たる経度。これより西は地図の右端（x > 1024 側）へ回す
const projectInt = ([lon, lat]) => {
  const la = Math.max(-85, Math.min(85, lat));
  const x = ORIGIN_X + SCALE_X * (lon < WRAP_LON ? lon + 360 : lon);
  const y = ORIGIN_Y - MERCATOR_K * Math.log(Math.tan(Math.PI / 4 + (la * Math.PI) / 360));
  return [Math.round(x * 10), Math.round(y * 10)];
};

export function loadWorld({ minWeight }) {
  if (!fs.existsSync(SOURCE_FILE)) throw new Error(`Natural Earth のデータがありません。次のURLから ${SOURCE_FILE} へ保存してください:\n${SOURCE_URL}`);
  const geo = JSON.parse(fs.readFileSync(SOURCE_FILE, "utf8"));
  const features = geo.features.filter((f) => f.geometry);
  features.forEach((f, i) => { f.id = i; });
  let topo = topojsonServer.topology({ provinces: { type: "FeatureCollection", features } }, 1e6);
  topo = topojsonSimplify.presimplify(topo, topojsonSimplify.planarTriangleArea);
  topo = topojsonSimplify.simplify(topo, minWeight);
  const geoms = topo.objects.provinces.geometries;
  const props = features.map((f) => f.properties);
  return { topo, geoms, props };
}

const norm = (s) => (s ?? "").normalize("NFC").toLowerCase();

// セレクター：
//   "FRA"                  … 国全体（adm0_a3）
//   "FRA[-10,35,20,60]"    … 国のうち、代表点がこの範囲（西経,南緯,東経,北緯）にある州・県
//   "FRA/Bas-Rhin"         … 州・県の名前（name / name_en / gn_name / woe_name のいずれか）
//   "ITA/region:Lombardia" … 地方名（region 列）
export function selectIndices(world, selector) {
  const m = selector.match(/^([A-Z0-9]{3})(?:\[([-\d.,]+)\])?(?:\/(.+))?$/);
  if (!m) throw new Error(`セレクターの形式が不正: ${selector}`);
  const [, a3, bboxStr, rest] = m;
  const bbox = bboxStr?.split(",").map(Number);
  const out = [];
  world.props.forEach((p, i) => {
    if (p.adm0_a3 !== a3) return;
    if (bbox && !(p.longitude >= bbox[0] && p.latitude >= bbox[1] && p.longitude <= bbox[2] && p.latitude <= bbox[3])) return;
    if (rest) {
      if (rest.startsWith("region:")) { if (norm(p.region) !== norm(rest.slice(7))) return; }
      else if (![p.name, p.name_en, p.gn_name, p.woe_name, p.name_local].some((n) => norm(n) === norm(rest))) return;
    }
    out.push(i);
  });
  if (out.length === 0) throw new Error(`該当する州・県がありません: ${selector}`);
  return out;
}

const mergeIndices = (world, idx) => {
  if (idx.length === 0) return [];
  const g = topojsonClient.merge(world.topo, idx.map((i) => world.geoms[i]));
  return g.coordinates; // MultiPolygon 座標（経度・緯度）
};

// 経緯度の多角形 [[lon,lat],...] を polygon-clipping の MultiPolygon 形式に
const polyToMulti = (ring) => [[[...ring, ring[0]]]];

// 勢力の定義 { add: [...], sub: [...] } から MultiPolygon（経緯度）を作る。add / sub の要素は
//   "セレクター"                         … 州・県（selectIndices）
//   { poly: [[lon,lat],...], of: [...] } … 多角形のうち、of に挙げた州・県に重なる部分（州・県の途中で国境を切るとき）
//   [[lon,lat],...]                      … 多角形のうち陸地に重なる部分
//   { add, sub }                         … 入れ子の定義
// 境界を多角形で切る場合は、両隣の勢力で同じ多角形を使う（片方で add、もう片方で sub）と境界線が一致する
export function buildShape(world, def, cache = new Map()) {
  const piece = (s) => {
    if (s.add) return buildShape(world, s, cache); // 入れ子の定義（例：イングランド＝イギリス−スコットランド−ウェールズ）
    if (Array.isArray(s)) return polygonClipping.intersection(polyToMulti(s), landNear(world, [s], cache));
    const key = JSON.stringify(s);
    if (!cache.has(key)) cache.set(key, polygonClipping.intersection(polyToMulti(s.poly), mergeSelectors(world, s.of)));
    return cache.get(key);
  };
  const strings = (list) => (list ?? []).filter((s) => typeof s === "string");
  const others = (list) => (list ?? []).filter((s) => typeof s !== "string");
  let shape = mergeSelectors(world, strings(def.add));
  for (const s of others(def.add)) shape = polygonClipping.union(shape, piece(s));
  const subStr = strings(def.sub);
  if (subStr.length) shape = polygonClipping.difference(shape, mergeSelectors(world, subStr));
  for (const s of others(def.sub)) shape = polygonClipping.difference(shape, piece(s));
  // post：引き算の後に足すもの（例：州ごと引いた中から一部だけを戻す）
  const postStr = strings(def.post);
  if (postStr.length) shape = polygonClipping.union(shape, mergeSelectors(world, postStr));
  for (const s of others(def.post)) shape = polygonClipping.union(shape, piece(s));
  return shape;
}

export function mergeSelectors(world, selectors) {
  const idx = new Set();
  for (const s of selectors) for (const i of selectIndices(world, s)) idx.add(i);
  return mergeIndices(world, [...idx]);
}

// 多角形の範囲にかかる州・県だけを結合した陸地（多角形を陸地に合わせて切り抜くのに使う）
function landNear(world, polys, cache) {
  const xs = polys.flat().map((p) => p[0]), ys = polys.flat().map((p) => p[1]);
  const key = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)].map((v) => Math.floor(v)).join(",");
  if (cache.has(key)) return cache.get(key);
  const [x0, y0, x1, y1] = key.split(",").map(Number);
  const idx = [];
  world.geoms.forEach((g, i) => {
    const bb = geomBBox(world, i);
    if (bb[2] >= x0 - 1 && bb[0] <= x1 + 2 && bb[3] >= y0 - 1 && bb[1] <= y1 + 2) idx.push(i);
  });
  const land = mergeIndices(world, idx);
  cache.set(key, land);
  return land;
}
const bboxCache = new WeakMap();
function geomBBox(world, i) {
  let m = bboxCache.get(world);
  if (!m) { m = new Map(); bboxCache.set(world, m); }
  if (m.has(i)) return m.get(i);
  const coords = topojsonClient.feature(world.topo, world.geoms[i]).geometry?.coordinates ?? [];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const walk = (a) => { if (typeof a[0] === "number") { x0 = Math.min(x0, a[0]); x1 = Math.max(x1, a[0]); y0 = Math.min(y0, a[1]); y1 = Math.max(y1, a[1]); } else a.forEach(walk); };
  walk(coords);
  const bb = [x0, y0, x1, y1];
  m.set(i, bb);
  return bb;
}

// 経度 -170° をまたぐ多角形は、西側を地図の右端へ回すために分割する
function splitAtWrap(multi) {
  const crosses = multi.some((poly) => poly[0].some((p) => p[0] < WRAP_LON) && poly[0].some((p) => p[0] >= WRAP_LON));
  if (!crosses) return multi;
  const west = polygonClipping.intersection(multi, [[[[-181, -90], [WRAP_LON, -90], [WRAP_LON, 90], [-181, 90], [-181, -90]]]]);
  const east = polygonClipping.intersection(multi, [[[[WRAP_LON, -90], [181, -90], [181, 90], [WRAP_LON, 90], [WRAP_LON, -90]]]]);
  // 境界ちょうどの点は west 側として扱われるよう、わずかに内側へずらす
  return [...west.map((poly) => poly.map((r) => r.map(([x, y]) => [x >= WRAP_LON ? WRAP_LON - 1e-9 : x, y]))), ...east];
}

// MultiPolygon（経緯度）→ SVG パス。座標は 0.1 単位の整数に丸め、最初の点だけ絶対座標・以降は相対座標で書く。
// minArea（0.1単位の2乗）より小さい島や穴は省く
export function toPath(multi, { minArea = 0 } = {}) {
  const parts = [];
  for (const poly of splitAtWrap(multi)) {
    poly.forEach((ring) => {
      const pts = [];
      for (const p of ring) {
        const q = projectInt(p);
        const last = pts[pts.length - 1];
        if (!last || last[0] !== q[0] || last[1] !== q[1]) pts.push(q);
      }
      if (pts.length > 1 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]) pts.pop();
      if (pts.length < 3) return;
      let area = 0;
      for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; area += a[0] * b[1] - b[0] * a[1]; }
      if (Math.abs(area) / 2 < minArea) return;
      let s = `M${fmt(pts[0][0])} ${fmt(pts[0][1])}`;
      for (let i = 1; i < pts.length; i++) s += `l${fmt(pts[i][0] - pts[i - 1][0])} ${fmt(pts[i][1] - pts[i - 1][1])}`;
      parts.push(s + "z");
    });
  }
  return parts.join("").replace(/ -/g, "-");
}
const fmt = (v) => (v / 10).toString().replace(/^(-?)0\./, "$1.");

export function landShape(world) {
  return mergeIndices(world, world.geoms.map((_, i) => i));
}
