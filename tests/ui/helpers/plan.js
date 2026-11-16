// 勢力・都市のタップ → カードの対応の検査計画を、いまのデータ（src/data）から組み立てる。
// 地図の各年代（スナップショット）について、その年の地図にあり、その年代の学習の時代にカードがある勢力と、その勢力の都市を並べる。
// 復元テストの asia/plan.json・world/plan.json（手で生成して保存していた）を置き換える。データを足せば自動で検査対象が増える
import { MAP_PERIODS_BY_ID, ERAS_DATA } from "../../../src/data/historyData.js";

export function buildTapPlan() {
  const plan = [];
  const seen = new Set();
  for (const [periodId, maps] of Object.entries(MAP_PERIODS_BY_ID)) {
    for (const map of maps) {
      for (const year of map.keyYears) {
        if (seen.has(year)) continue;
        // その年の学習の時代（App の syncEraToYear と同じく、地図の時代区分と年の範囲から決まる）
        const era = Object.values(ERAS_DATA).find((e) => [].concat(e.mapPeriodId ?? []).includes(periodId) && (!e.yearRange || (year >= e.yearRange[0] && year <= e.yearRange[1])));
        if (!era) continue;
        seen.add(year);
        const count = (id) => era.cards.filter((c) => c.region === id).length;
        const regions = map.regionsByYear(year).map((r) => [r.id, count(r.id), !!r.maritime]).filter(([, n]) => n > 0);
        const cities = map.capitalsByYear(year).filter((c) => c.region && count(c.region) > 0).map((c) => [c.name, c.region]);
        plan.push({ year, eraId: era.id, regions, cities });
      }
    }
  }
  return plan.sort((a, b) => a.year - b.year);
}
