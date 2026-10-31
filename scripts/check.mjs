// 史脈のデータ検査： npm run check
//   1. データ構造   … 勢力の存続期間と形の期間、生成済みの輪郭データ（geo/build.mjs の出力）が最新か、色・ラベルの定義漏れ
//   2. 答えの漏れ   … カードの答えが、自分の問題文・同じ時代のほかのカードの本文や画像の説明・その時代の地図の文字に出ていないか
//   3. 地図とカード … 全カードがその時代の地図の勢力から引けるか、地図の勢力にカードがあるか、都市の勢力・解説文があるか
//                    （輪郭が未作成でもラベルを定義済みの勢力は「地図への配置待ち」の注意。その勢力のラベル・都市・解説文も答えの漏れを検査する）
//   4. 位置         … 勢力名のラベルと都市が、その勢力の輪郭の内側にあるか
// エラーがあれば終了コード1で終わる（注意は表示のみ）。
import { ERAS_DATA, MAP_PERIODS_BY_ID } from "../src/data/historyData.js";
import { GEO_MEMBERS, GEO_PATHS } from "../src/data/generated/geoPaths.js";
import { ALL_SNAPSHOTS } from "../src/data/atlas/series.js";
import { PALETTES, BACKGROUND_FILLS, REGION_LABELS, BACKGROUND_LABELS, CITIES } from "../src/data/atlas/styles.js";
import { ENTITIES } from "../geo/regions.mjs";
import { WORLD_BLURB } from "../src/data/worldCards.js";

// 許可リスト：答えの語が、別の語の一部として含まれるだけのもの（伏せる必要がない）
const ALLOWED_CONTAINING_WORDS = [
  { answer: "民会", word: "平民会", reason: "ローマの平民会（c32）は、アテネの民会（c29 の答え）とは別の語" },
];
// 位置の許容範囲（viewBox 単位。1 ≒ 経度0.35°）
// 時代（ERAS_DATA）→ 地図のシリーズ（時代略号）。輪郭が未作成の勢力の解説文（WORLD_BLURB）を選ぶのに使う
const ERA_SERIES = {
  "ancient-mediterranean": ["anc"], "medieval-europe": ["med"], "renaissance-discovery": ["ren"], "absolutism": ["abs"],
  "french-revolution": ["rev"], "imperialism": ["imp"], "world-wars": ["ww"], "cold-war": ["cw"],
};
const COAST_TOLERANCE = 1.5; // 都市の点が海岸線のすぐ外（地図の縮尺で海上）に落ちる場合
const TINY_REGION_AREA = 40; // これより小さい勢力（外枠の面積）は、ラベルを輪郭の外に引き出して置いてよい
const CALLOUT_DISTANCE = 12;

const errors = [], warnings = [];
const err = (group, msg) => errors.push(`[${group}] ${msg}`);
const warn = (group, msg) => warnings.push(`[${group}] ${msg}`);
const inLife = (life, y) => life.some(([a, b]) => a <= y && y <= b);
const covers = (list, y) => (list ?? []).some((p) => p.from <= y && y <= p.to);

// ---------------------------------------------------------------------------
// 1. データ構造
// ---------------------------------------------------------------------------
const years = ALL_SNAPSHOTS.map((s) => s.year);
if (new Set(years).size !== years.length) err("構造", "地図の年代がシリーズをまたいで重複している（atlas/series.js）");
for (const { prefix, year, key } of ALL_SNAPSHOTS) {
  const expected = Object.entries(ENTITIES).filter(([, e]) => inLife(e.life, year)).map(([id]) => id);
  const built = GEO_MEMBERS[key];
  if (!built) { err("構造", `${key} の輪郭データがない（npm run geo を実行）`); continue; }
  if (JSON.stringify(expected) !== JSON.stringify(built)) err("構造", `${key} の輪郭データが勢力定義と一致しない（npm run geo を実行して生成し直す）`);
  for (const id of built) {
    if (!GEO_PATHS[`${key}/${id}`]) err("構造", `${key}/${id} の輪郭がない`);
    if (id.startsWith("bg:")) {
      const name = id.slice(3);
      if (!BACKGROUND_FILLS[prefix]?.[name]) err("構造", `${key} 背景「${name}」の色がない（atlas/styles.js の BACKGROUND_FILLS.${prefix}）`);
      if (!BACKGROUND_LABELS[name]) err("構造", `背景「${name}」のラベル位置がない（BACKGROUND_LABELS）`);
      else if (!covers(BACKGROUND_LABELS[name], year)) warn("構造", `${key} 背景「${name}」は最も近い期間のラベル位置を使っている`);
      continue;
    }
    if (!PALETTES[prefix]?.[id]) err("構造", `${key} 勢力「${id}」の色がない（atlas/styles.js の PALETTES.${prefix}）`);
    if (!REGION_LABELS[id]) err("構造", `勢力「${id}」のラベルがない（REGION_LABELS）`);
    else if (!covers(REGION_LABELS[id], year)) warn("構造", `${key} 勢力「${id}」は最も近い期間のラベルを使っている（形が変わるならラベルの期間を足す）`);
  }
}
for (const c of CITIES) if (!(c.from <= c.to)) err("構造", `都市「${c.name}」の期間 ${c.from}〜${c.to} が逆`);

// ---------------------------------------------------------------------------
// 時代ごとの地図（年代の範囲で、その時代が受け持つ年代だけを選ぶ）
// ---------------------------------------------------------------------------
const eraSnapshots = (era) => {
  const out = [];
  for (const pid of [].concat(era.mapPeriodId)) for (const map of MAP_PERIODS_BY_ID[pid] ?? []) for (const y of map.keyYears) {
    if (era.yearRange && (y < era.yearRange[0] || y > era.yearRange[1])) continue;
    out.push({ year: y, map, regions: map.regionsByYear(y), cities: map.capitalsByYear(y), background: map.backgroundByYear(y) });
  }
  return out;
};
const cardText = (c) => [c.front, c.back, c.cloze?.template.replace(/\{\{\d\}\}/g, "□"), ...(c.cloze?.points ?? []).map((p) => p.text), c.anecdote, ...(c.images ?? []).flatMap((i) => [i.caption, i.alt])].filter(Boolean).join("\n");

// SVG パス（M/L/C/l、z 区切り）→ リング、偶奇判定
const rings = (d) => d.split(/z/i).filter((x) => x.trim()).map((seg) => {
  const pts = []; let x = 0, y = 0;
  for (const [, cmd, args] of seg.matchAll(/([MLCl])([^MLCl]*)/g)) {
    const n = (args.match(/-?\d*\.?\d+/g) || []).map(Number);
    for (let i = 0; i + 1 < n.length; i += 2) { if (cmd === "l") { x += n[i]; y += n[i + 1]; } else { x = n[i]; y = n[i + 1]; } if (cmd !== "C" || i + 2 >= n.length - 1) pts.push([x, y]); }
  }
  return pts;
});
const segDist = ([px, py], [ax, ay], [bx, by]) => {
  const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
  const t = L ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L)) : 0;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
};
const distToEdge = (d, p) => { let m = Infinity; for (const r of rings(d)) for (let i = 0, j = r.length - 1; i < r.length; j = i++) m = Math.min(m, segDist(p, r[j], r[i])); return m; };
const bboxArea = (d) => { const pts = rings(d).flat(); const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]); return (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys)); };
const containsAnswer = (text, answer) => {
  let t = text;
  for (const a of ALLOWED_CONTAINING_WORDS) if (a.answer === answer) t = t.split(a.word).join("");
  return t.includes(answer);
};
const inside = (d, [px, py]) => { let c = false; for (const r of rings(d)) for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) c = !c; } return c; };

for (const [eraId, era] of Object.entries(ERAS_DATA)) {
  const snaps = eraSnapshots(era);
  if (!snaps.length) warn("地図", `${eraId}: 地図の年代がまだない（カードの検査のみ行う）`);
  const cards = era.cards;
  const answers = cards.flatMap((c) => (c.cloze?.slots ?? []).map((s) => ({ id: c.id, answer: s.answer })));
  // -------------------------------------------------------------------------
  // 2. 答えの漏れ
  // -------------------------------------------------------------------------
  for (const c of cards) {
    if (!c.cloze) continue;
    const outside = c.cloze.template.replace(/\{\{\d\}\}/g, "□");
    for (const s of c.cloze.slots) {
      if (outside.includes(s.answer)) err("答え", `${c.id}: 問題文の空欄の外に答え「${s.answer}」`);
      if (c.front?.includes(s.answer)) err("答え", `${c.id}: 表面の問いに答え「${s.answer}」`);
      // 画像の説明：答えと完全一致する部分は表面で伏せられる。伏せた後に答えの一部が残るものは注意
      for (const im of c.images ?? []) for (const t of [im.caption, im.alt]) {
        const rest = (t ?? "").split(s.answer).join("");
        const L = s.answer.length - 1;
        if (L >= 3 && [...Array(s.answer.length - L + 1).keys()].some((i) => rest.includes(s.answer.slice(i, i + L)))) warn("答え", `${c.id}: 画像の説明に答え「${s.answer}」の一部: ${t}`);
      }
    }
  }
  for (const { id, answer } of answers) {
    if (answer.length < 2) continue;
    for (const o of cards) if (o.id !== id && containsAnswer(cardText(o), answer)) err("答え", `${eraId}: ${o.id} の本文に ${id} の答え「${answer}」`);
  }
  // -------------------------------------------------------------------------
  // 3. 地図とカード、4. 位置
  // -------------------------------------------------------------------------
  const reachable = new Set();
  for (const { year, map, regions, cities, background } of snaps) {
    const label = `${eraId} ${year}年`;
    const ids = regions.map((r) => r.id);
    if (new Set(ids).size !== ids.length) err("地図", `${label}: 勢力IDが重複`);
    const names = cities.map((c) => c.name);
    if (new Set(names).size !== names.length) err("地図", `${label}: 都市名が重複`);
    const texts = [...regions.flatMap((r) => [...r.labelLines, ...(r.subLabels ?? []).map((s) => s.text)]), ...background.map((b) => b.name), ...cities.map((c) => c.name), ...map.seaLabels.map((s) => s.name)];
    for (const r of regions) {
      const n = cards.filter((c) => c.region === r.id).length;
      if (n === 0) warn("地図", `${label}: 勢力「${r.id}」から引けるカードがまだない`);
      if (!map.blurb[r.id]) err("地図", `${label}: 勢力「${r.id}」の解説文がない`);
      else texts.push(map.blurb[r.id]);
      const d = r.dByYear(year);
      if (!inside(d, [r.labelX, r.labelY])) {
        const dist = distToEdge(d, [r.labelX, r.labelY]);
        if (bboxArea(d) < TINY_REGION_AREA && dist <= CALLOUT_DISTANCE) warn("位置", `${label}: 小さい勢力「${r.id}」のラベルを輪郭の外に引き出している（${dist.toFixed(1)}）`);
        else err("位置", `${label}: 勢力「${r.id}」のラベルが輪郭の外（${dist.toFixed(1)}）`);
      }
      for (const s of r.subLabels ?? []) if (!inside(d, s.at)) warn("位置", `${label}: 勢力「${r.id}」の小区分「${s.text}」が輪郭の外`);
    }
    for (const b of background) if (!inside(b.d, [b.labelX, b.labelY])) warn("位置", `${label}: 背景「${b.name}」のラベルが輪郭の外`);
    for (const c of cities) {
      if (!c.region) continue;
      const r = regions.find((x) => x.id === c.region);
      if (!r) { err("地図", `${label}: 都市「${c.name}」の勢力「${c.region}」がこの年代の地図にない`); continue; }
      const rd = r.dByYear(year);
      if (!inside(rd, [c.x, c.y]) && distToEdge(rd, [c.x, c.y]) > COAST_TOLERANCE) err("位置", `${label}: 都市「${c.name}」が勢力「${c.region}」の輪郭の外（${distToEdge(rd, [c.x, c.y]).toFixed(1)}）`);
    }
    for (const t of texts) for (const { id, answer } of answers) if (answer.length >= 2 && containsAnswer(t, answer)) err("答え", `${label}: 地図の文字「${t.slice(0, 20)}${t.length > 20 ? "…" : ""}」に ${id} の答え「${answer}」`);
    for (const c of cards) if (ids.includes(c.region)) reachable.add(c.id);
  }
  // 輪郭が未作成の勢力（ステップ2で地図に置く）：ラベルがあれば注意にとどめ、そのラベル・都市・解説文に答えが出ていないかを先に検査する
  const span = era.yearRange ?? [Math.min(...cards.map((c) => c.year)), Math.max(...cards.map((c) => c.year))];
  const overlaps = (a, b) => a <= span[1] && b >= span[0];
  const onMap = new Set(snaps.flatMap((s) => s.regions.map((r) => r.id)));
  const planned = [...new Set(cards.filter((c) => !reachable.has(c.id)).map((c) => c.region))];
  for (const id of planned) {
    const n = cards.filter((c) => c.region === id).length;
    if (!REGION_LABELS[id]) { for (const c of cards) if (c.region === id) err("地図", `${eraId}: ${c.id}（勢力「${id}」）がこの時代の地図から引けず、ラベルの定義もない`); continue; }
    warn("地図への配置待ち（ステップ2）", `${eraId}: 勢力「${id}」（カード${n}問）の輪郭がまだない`);
    if (onMap.has(id)) continue;
    const texts = [
      ...REGION_LABELS[id].filter((l) => overlaps(l.from, l.to)).flatMap((l) => [...l.lines, ...(l.subLabels ?? []).map((x) => x.text)]),
      ...CITIES.filter((c) => c.region === id && overlaps(c.from, c.to)).map((c) => c.name),
      ...(ERA_SERIES[eraId] ?? []).map((p) => WORLD_BLURB[p]?.[id]).filter(Boolean),
    ];
    if (!(ERA_SERIES[eraId] ?? []).some((p) => WORLD_BLURB[p]?.[id])) warn("地図", `${eraId}: 勢力「${id}」の解説文（WORLD_BLURB）がない`);
    for (const t of texts) for (const { id: cid, answer } of answers) if (answer.length >= 2 && containsAnswer(t, answer)) err("答え", `${eraId}: 配置待ちの勢力「${id}」の地図の文字「${t.slice(0, 20)}${t.length > 20 ? "…" : ""}」に ${cid} の答え「${answer}」`);
  }
  console.log(`${era.title}：カード ${cards.length}問（地図から引ける ${reachable.size}問）・地図 ${snaps.length}年代`);
}

const uniq = (a) => [...new Set(a)];
if (warnings.length) console.log(`\n注意 ${uniq(warnings).length}件\n  ` + uniq(warnings).join("\n  "));
if (errors.length) { console.log(`\nエラー ${uniq(errors).length}件\n  ` + uniq(errors).join("\n  ")); process.exit(1); }
console.log("\nエラーなし");
