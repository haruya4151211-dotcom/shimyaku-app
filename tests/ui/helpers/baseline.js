// データの回帰検知：いまのデータ（src/data）から「地図の年代ごとの勢力・都市・カード数」と「時代ごとのカードの所属」を取り出し、
// 保存した基準（tests/ui/baseline/data-baseline.json）と比べる。基準の作成・更新は tools/update-baseline.mjs だけが行い、
// テストは比べるだけで書き込まない（意図しない変化を、基準の自動更新で見逃さないため）
import fs from "node:fs";
import { ERAS_DATA } from "../../../src/data/historyData.js";
import { buildTapPlan } from "./plan.js";

export const BASELINE_PATH = new URL("../baseline/data-baseline.json", import.meta.url);

// 基準として残す内容（並び順を固定して、差分が安定するようにする）
export function snapshotData() {
  const tapPlan = buildTapPlan().map(({ year, eraId, regions, cities }) => ({
    year,
    eraId,
    regions: Object.fromEntries([...regions].sort((a, b) => a[0].localeCompare(b[0], "ja")).map(([id, n, maritime]) => [id, maritime ? `${n}（海）` : n])),
    cities: cities.map(([name, region]) => `${name}（${region}）`).sort((a, b) => a.localeCompare(b, "ja")),
  }));
  const cards = Object.fromEntries(Object.values(ERAS_DATA).map((era) => {
    const byRegion = {};
    for (const c of era.cards) (byRegion[c.region ?? "（勢力なし）"] ??= []).push(c.id);
    const sorted = Object.fromEntries(Object.keys(byRegion).sort((a, b) => a.localeCompare(b, "ja")).map((r) => [r, byRegion[r].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))]));
    return [era.id, { total: era.cards.length, byRegion: sorted }];
  }));
  return { summary: { eras: Object.keys(cards).length, cards: Object.values(cards).reduce((s, e) => s + e.total, 0), mapYears: tapPlan.length }, tapPlan, cards };
}

export const readBaseline = () => (fs.existsSync(BASELINE_PATH) ? JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8")) : null);

// 基準といまのデータの違いを、人が読める行の一覧にする（違いがなければ空）
export function diffData(base, now) {
  const out = [];
  const fmtYear = (y) => (y < 0 ? `紀元前${-y}年` : `${y}年`);
  if (JSON.stringify(base.summary) !== JSON.stringify(now.summary)) out.push(`概要：${JSON.stringify(base.summary)} → ${JSON.stringify(now.summary)}`);
  const baseYears = new Map(base.tapPlan.map((s) => [s.year, s]));
  const nowYears = new Map(now.tapPlan.map((s) => [s.year, s]));
  for (const y of new Set([...baseYears.keys(), ...nowYears.keys()])) {
    const a = baseYears.get(y), b = nowYears.get(y);
    if (!a) { out.push(`地図の年代 ${fmtYear(y)} が増えた`); continue; }
    if (!b) { out.push(`地図の年代 ${fmtYear(y)} がなくなった`); continue; }
    if (a.eraId !== b.eraId) out.push(`${fmtYear(y)}：学習の時代 ${a.eraId} → ${b.eraId}`);
    for (const id of new Set([...Object.keys(a.regions), ...Object.keys(b.regions)])) {
      if (a.regions[id] !== b.regions[id]) out.push(`${fmtYear(y)} 勢力「${id}」のカード：${a.regions[id] ?? "なし"} → ${b.regions[id] ?? "なし"}`);
    }
    const ca = new Set(a.cities), cb = new Set(b.cities);
    for (const c of ca) if (!cb.has(c)) out.push(`${fmtYear(y)} 都市 ${c} がなくなった`);
    for (const c of cb) if (!ca.has(c)) out.push(`${fmtYear(y)} 都市 ${c} が増えた`);
  }
  for (const eraId of new Set([...Object.keys(base.cards), ...Object.keys(now.cards)])) {
    const a = base.cards[eraId], b = now.cards[eraId];
    if (!a || !b) { out.push(`時代 ${eraId} が${a ? "なくなった" : "増えた"}`); continue; }
    if (a.total !== b.total) out.push(`時代 ${eraId} のカード数：${a.total} → ${b.total}`);
    const where = (m) => new Map(Object.entries(m.byRegion).flatMap(([r, ids]) => ids.map((id) => [id, r])));
    const wa = where(a), wb = where(b);
    for (const [id, r] of wa) if (!wb.has(id)) out.push(`時代 ${eraId}：カード ${id}（${r}）がなくなった`); else if (wb.get(id) !== r) out.push(`時代 ${eraId}：カード ${id} の勢力 ${r} → ${wb.get(id)}`);
    for (const [id, r] of wb) if (!wa.has(id)) out.push(`時代 ${eraId}：カード ${id}（${r}）が増えた`);
  }
  return out;
}
