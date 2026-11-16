// データの回帰検知の基準（tests/ui/baseline/data-baseline.json）を、いまのデータから作り直す。
// 実行：npm run test:ui:baseline
// カード・勢力・都市を意図して変えたときだけ使う。実行すると、前の基準からの違いを表示してから上書きする。
// 違いの内容が意図どおりか確かめ、基準のファイルもデータの変更と一緒にコミットする
import fs from "node:fs";
import { BASELINE_PATH, snapshotData, readBaseline, diffData } from "../helpers/baseline.js";

const now = snapshotData();
const before = readBaseline();
if (before) {
  const lines = diffData(before, now);
  if (!lines.length) { console.log("基準といまのデータに違いはありません（更新不要）。"); process.exit(0); }
  console.log(`前の基準からの違い（${lines.length} 件）：`);
  for (const l of lines.slice(0, 200)) console.log(`  - ${l}`);
  if (lines.length > 200) console.log(`  …ほか ${lines.length - 200} 件`);
} else {
  console.log("基準がまだないので作成します。");
}
fs.mkdirSync(new URL(".", BASELINE_PATH), { recursive: true });
fs.writeFileSync(BASELINE_PATH, JSON.stringify(now, null, 2) + "\n");
console.log(`基準を書き込みました：${BASELINE_PATH.pathname}（地図の年代 ${now.summary.mapYears}・時代 ${now.summary.eras}・カード ${now.summary.cards}）`);
