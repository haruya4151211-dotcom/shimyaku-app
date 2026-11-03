// 横断検索のインデックスと検索エンジン。
// 全時代の地図（勢力・都市・地理）と全カードを1つの索引にまとめ、入力のたびに部分一致で引く。
// 表記ゆれ（カタカナ／ひらがな、全角／半角、ヴァ／バ、中黒・＝・空白の有無、旧字体の一部）は normalize で吸収する。
// 地図の要素は「どの年の地図に出てくるか」（years）も持たせ、ステップ2の時代移動・ハイライトに使う
import { ERAS_DATA, MAP_PERIODS_BY_ID } from "../data/historyData.js";
import { GEO_RIVERS, WATER_KINDS } from "../data/atlas/geography.js";

// ---- 表記ゆれの吸収 ----
// ヴ＋小書き母音はバ行に寄せる（ヴェネツィア／ベネツィア、ヴァイキング／バイキング）
const VU = { "ぁ": "ば", "ぃ": "び", "ぅ": "ぶ", "ぇ": "べ", "ぉ": "ぼ" };
const KANA_FOLD = { "ゐ": "い", "ゑ": "え", "ぢ": "じ", "づ": "ず", "ゕ": "か", "ゖ": "け" };
const KANJI_FOLD = { "齋": "斉", "齊": "斉", "斎": "斉", "邊": "辺", "邉": "辺", "澤": "沢", "國": "国", "髙": "高", "﨑": "崎", "嶋": "島", "驒": "騨", "龍": "竜" };
// 区切りとして無視する文字（空白・中黒・＝・ハイフン類・句読点・括弧）
const SEPARATOR = /[\s・･＝=\-‐‑–—―·.,、。，．「」『』（）()〔〕［］[\]【】〈〉《》"'“”‘’]/;

// 文字列を検索用に正規化し、正規化後の各文字が元の何文字目から来たか（map）も返す（ハイライト位置の逆算に使う）
export function normalizeWithMap(str) {
  let norm = "";
  const map = [];
  const s = String(str ?? "");
  for (let i = 0; i < s.length; i++) {
    let ch = s[i].normalize("NFKC").toLowerCase();
    if (ch.length !== 1) { // NFKC で複数文字になるもの（㍿ など）はそのまま並べる
      for (const c of ch) if (!SEPARATOR.test(c)) { norm += c; map.push(i); }
      continue;
    }
    if (SEPARATOR.test(ch)) continue;
    const code = ch.charCodeAt(0);
    if (code >= 0x30a1 && code <= 0x30f6) ch = String.fromCharCode(code - 0x60); // カタカナ→ひらがな
    if (ch === "ヴ" || ch === "ゔ") {
      const next = s[i + 1] ? s[i + 1].normalize("NFKC") : "";
      const nextHira = next && next.charCodeAt(0) >= 0x30a1 && next.charCodeAt(0) <= 0x30f6 ? String.fromCharCode(next.charCodeAt(0) - 0x60) : next;
      if (VU[nextHira]) { norm += VU[nextHira]; map.push(i); i++; continue; }
      ch = "ぶ";
    }
    ch = KANA_FOLD[ch] ?? KANJI_FOLD[ch] ?? ch;
    norm += ch;
    map.push(i);
  }
  return { norm, map };
}
export const normalize = (str) => normalizeWithMap(str).norm;

// 入力を空白で区切った語の配列（どの語も含むものだけを結果に出す AND 検索）
export const tokenize = (query) => String(query ?? "").split(/[\s　]+/).map(normalize).filter(Boolean);

// 元の文字列のうち、語に一致した範囲（[開始, 終了) の配列）。重なりはまとめる
export function matchRanges(text, tokens) {
  const { norm, map } = normalizeWithMap(text);
  const ranges = [];
  for (const t of tokens) {
    let from = 0, at;
    while ((at = norm.indexOf(t, from)) !== -1) {
      ranges.push([map[at], map[at + t.length - 1] + 1]);
      from = at + t.length;
    }
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([...r]);
  }
  return merged;
}

// ショートカットの表記（Mac は ⌘K、それ以外は Ctrl+K）を切り替えるための判定
export const isMacLike = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.userAgentData?.platform || navigator.platform || navigator.userAgent);

// ---- 年・時代の表記 ----
export const formatYear = (y) => (y < 0 ? `前${-y}年` : `${y}年`);
export function formatYearSpan(years) {
  if (!years.length) return "";
  const min = Math.min(...years), max = Math.max(...years);
  return min === max ? formatYear(min) : `${formatYear(min)}〜${formatYear(max)}`;
}
// 地図の時代区分と年 → 学習の時代（ERAS_DATA）の題名
function eraTitleFor(periodId, year) {
  const era = Object.values(ERAS_DATA).find((e) => [].concat(e.mapPeriodId).includes(periodId) && (!e.yearRange || (year >= e.yearRange[0] && year <= e.yearRange[1])));
  return era?.title ?? null;
}

export const GEO_KIND_LABEL = {
  ocean: "大洋", sea: "海", gulf: "湾", strait: "海峡", lake: "湖", island: "島", cape: "岬", mountain: "山脈", desert: "砂漠",
  plateau: "高原", basin: "盆地", plain: "平原", peninsula: "半島", region: "地域", site: "遺跡", oasis: "オアシス", river: "河川",
};
export const SEARCH_CATEGORIES = [
  { id: "region", label: "勢力" },
  { id: "city", label: "都市・拠点" },
  { id: "geo", label: "地理" },
  { id: "card", label: "問題カード" },
];

// ---- 索引の組み立て（初回の検索時に一度だけ） ----
const fillTemplate = (cloze) => cloze.template.replace(/\{\{(\d+)\}\}/g, (_, id) => cloze.slots.find((s) => String(s.id) === id)?.answer ?? "");

function buildIndex() {
  const entities = new Map(); // key → 地図の要素
  const touch = (key, make, periodId, year) => {
    let e = entities.get(key);
    if (!e) { e = make(); e.years = new Set(); e.eras = new Set(); e.occurrences = []; entities.set(key, e); }
    if (!e.years.has(year)) { e.years.add(year); e.occurrences.push({ periodId, year }); }
    const era = eraTitleFor(periodId, year);
    if (era) e.eras.add(era);
    return e;
  };
  const seenMaps = new Set();
  for (const [periodId, maps] of Object.entries(MAP_PERIODS_BY_ID)) {
    for (const m of maps) {
      if (seenMaps.has(m)) continue;
      seenMaps.add(m);
      for (const year of m.keyYears) {
        for (const r of m.regionsByYear(year)) {
          const display = r.labelLines?.join("") || r.id;
          const e = touch(`region:${r.id}`, () => ({ type: "region", id: r.id, name: display, aliases: new Set(), kindLabel: r.maritime ? "海の勢力" : "勢力" }), periodId, year);
          e.aliases.add(r.id).add(display); // 年代で表示名が変わる勢力は、どの名前でも引けるようにする
        }
        for (const c of m.capitalsByYear(year)) {
          const e = touch(`city:${c.name}`, () => ({ type: "city", id: c.name, name: c.name, aliases: new Set(), owners: new Set(), kindLabel: "都市" }), periodId, year);
          if (c.region) e.owners.add(c.region);
        }
        for (const g of m.seaLabels) {
          if (g.from !== undefined && (year < g.from || year > g.to)) continue;
          const site = g.kind === "site" || g.kind === "oasis";
          touch(`${site ? "city" : "geo"}:${g.name}`, () => ({ type: site ? "city" : "geo", id: g.name, name: g.name, aliases: new Set(), kind: g.kind, kindLabel: GEO_KIND_LABEL[g.kind] ?? "地理", water: WATER_KINDS.includes(g.kind) }), periodId, year);
        }
        for (const rv of m.rivers) touch(`geo:${rv.name}`, () => ({ type: "geo", id: rv.name, name: rv.name, aliases: new Set(), kind: "river", kindLabel: "河川", water: true }), periodId, year);
      }
    }
  }
  // 河川は全時代共通の一覧にもあるもの（hideIn で一部時代から外したもの）を漏らさない
  for (const r of GEO_RIVERS) if (!entities.has(`geo:${r.name}`)) entities.set(`geo:${r.name}`, { type: "geo", id: r.name, name: r.name, aliases: new Set(), kind: "river", kindLabel: "河川", water: true, years: new Set(), eras: new Set(), occurrences: [] });

  const items = [];
  for (const e of entities.values()) {
    const years = [...e.years].sort((a, b) => a - b);
    e.aliases = new Set([...e.aliases].filter((a) => normalize(a) !== normalize(e.name)));
    const names = [e.name, ...e.aliases];
    const owners = e.owners ? [...e.owners] : [];
    items.push({
      ...e,
      key: `${e.type}:${e.id}`,
      aliases: [...e.aliases],
      owners,
      years,
      eras: [...e.eras],
      occurrences: e.occurrences.sort((a, b) => a.year - b.year),
      subtitle: [e.kindLabel, formatYearSpan(years), owners.length ? `（${owners.slice(0, 2).join("・")}${owners.length > 2 ? " ほか" : ""}）` : ""].filter(Boolean).join("　"),
      fields: [
        ...names.map((n) => ({ text: n, norm: normalize(n), weight: 100, name: true })),
        ...owners.map((o) => ({ text: o, norm: normalize(o), weight: 25, meta: true })), // 所属勢力は副題に出すため抜粋にはしない
      ],
    });
  }

  for (const era of Object.values(ERAS_DATA)) {
    for (const c of era.cards) {
      const answers = c.cloze ? c.cloze.slots.map((s) => s.answer) : [];
      const body = [c.cloze ? fillTemplate(c.cloze) : null, c.back, ...(c.cloze ? c.cloze.points.map((p) => `${p.label}：${p.text}`) : []), c.anecdote].filter(Boolean);
      items.push({
        type: "card",
        key: `card:${c.id}`,
        id: c.id,
        name: c.front,
        year: c.year,
        eraId: era.id,
        eraTitle: era.title,
        region: c.region,
        answers,
        subtitle: [era.title, formatYear(c.year), c.region].filter(Boolean).join("　"),
        fields: [
          ...answers.map((a) => ({ text: a, norm: normalize(a), weight: 90, answer: true })),
          { text: c.front, norm: normalize(c.front), weight: 60, title: true },
          { text: c.region, norm: normalize(c.region), weight: 40 },
          ...c.theme.map((t) => ({ text: t, norm: normalize(t), weight: 35 })),
          ...(c.cloze ? c.cloze.slots.map((s) => ({ text: s.category, norm: normalize(s.category), weight: 10 })) : []),
          ...body.map((b) => ({ text: b, norm: normalize(b), weight: 20, body: true })),
        ],
      });
    }
  }
  return items;
}

let INDEX = null;
export const getSearchIndex = () => (INDEX ??= buildIndex());

// ---- 検索 ----
// 語ごとに、一致した欄の重み（完全一致・前方一致ほど高い）を足し合わせた点数で並べる。
// どれか1語でも一致しない項目は外す（AND 検索）
function scoreItem(item, tokens) {
  let total = 0;
  for (const t of tokens) {
    let best = 0;
    for (const f of item.fields) {
      const at = f.norm.indexOf(t);
      if (at === -1) continue;
      const exact = f.norm === t ? 1.6 : at === 0 ? 1.25 : 1;
      const s = f.weight * exact;
      if (s > best) best = s;
    }
    if (!best) return 0;
    total += best;
  }
  // 地図に長く出てくる要素・短い名前をわずかに優先
  if (item.type !== "card") total += Math.min(item.years.length, 10) * 0.5 - item.name.length * 0.05;
  return total;
}

// 抜粋：一致した本文のうち、最初の一致の前後を切り出し、ハイライト範囲も返す（名前・設問文で一致したときは null）
function snippetFor(item, tokens) {
  for (const f of item.fields) {
    if (f.name || f.title) { if (tokens.every((t) => normalize(item.name).includes(t))) return null; }
  }
  const field = item.fields.find((f) => !f.name && !f.title && !f.meta && tokens.some((t) => f.norm.includes(t)));
  if (!field) return null;
  const ranges = matchRanges(field.text, tokens);
  if (!ranges.length) return null;
  const RADIUS = 26;
  const start = Math.max(0, ranges[0][0] - RADIUS), end = Math.min(field.text.length, ranges[0][1] + RADIUS * 2);
  const text = (start > 0 ? "…" : "") + field.text.slice(start, end) + (end < field.text.length ? "…" : "");
  const shift = start > 0 ? 1 - start : 0;
  return { text, ranges: ranges.filter(([a, b]) => a >= start && b <= end).map(([a, b]) => [a + shift, b + shift]), answer: !!field.answer };
}

// query を検索し、カテゴリ別（勢力 / 都市・拠点 / 地理 / 問題カード）に点数順の結果を返す
export function search(query, { limitPerCategory = 50 } = {}) {
  const tokens = tokenize(query);
  if (!tokens.length) return { tokens, groups: Object.fromEntries(SEARCH_CATEGORIES.map((c) => [c.id, { count: 0, results: [] }])), total: 0 };
  const groups = Object.fromEntries(SEARCH_CATEGORIES.map((c) => [c.id, []]));
  for (const item of getSearchIndex()) {
    const score = scoreItem(item, tokens);
    if (score > 0) groups[item.type].push({ item, score });
  }
  let total = 0;
  for (const id of Object.keys(groups)) {
    const list = groups[id].sort((a, b) => b.score - a.score || a.item.name.length - b.item.name.length);
    total += list.length;
    groups[id] = { count: list.length, results: list.slice(0, limitPerCategory).map(({ item, score }) => ({ item, score, snippet: snippetFor(item, tokens) })) };
  }
  return { tokens, groups, total };
}
