// データの回帰検知：地図の年代ごとの勢力・都市・カード数と、時代ごとのカードの所属が、保存した基準と一致するか。
// map-taps.spec.js（いまのデータどおりに画面が動くか＝動作の検査）とは役割を分け、ここでは「データそのものが意図せず変わっていないか」を見る。
// このテストは基準を書き換えない。意図してデータを変えたときは、違いを確かめてから `npm run test:ui:baseline` で基準を更新する。
// ブラウザを使わないので PC の側だけで流す（playwright.config.js の mobile の testIgnore）
import { test, expect } from "@playwright/test";
import { snapshotData, readBaseline, diffData } from "./helpers/baseline.js";

test("データが基準（tests/ui/baseline/data-baseline.json）と一致する", () => {
  const base = readBaseline();
  expect(base, "基準がない。npm run test:ui:baseline で作成する").not.toBeNull();
  const lines = diffData(base, snapshotData());
  const message = lines.length
    ? `データが基準と違います（${lines.length} 件）。意図した変更なら、内容を確かめてから npm run test:ui:baseline で基準を更新してください：\n` + lines.slice(0, 60).map((l) => `  - ${l}`).join("\n")
    : "";
  expect(lines, message).toEqual([]);
});
