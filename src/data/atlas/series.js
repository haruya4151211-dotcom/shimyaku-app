// =====================================================================
// 地図の年代（スナップショット）の一覧
// 地図はシリーズ（時代略号）ごとに、ここに挙げた年代の勢力図を持つ。各年代の勢力・背景・都市は、
// 勢力ごとの存続期間（geo/regions.mjs の ENTITIES）とラベル・都市の有効期間（atlas/styles.js）から自動で組み立てる。
// 新しい年代（三国時代の250年、戦間期の1922年など）を足すときは、ここに年を加え、node geo/build.mjs を実行する。
// その年に存続している勢力に形やラベルが足りなければ、ビルドと npm run check がエラーで知らせる。
//   シリーズのキーは時代略号（anc：古代、med：中世、ren：大航海時代・ルネサンス、abs：絶対王政、rev：市民革命、imp：帝国主義、ww：戦間期と第二次世界大戦、cw：冷戦と現代世界）。
//   年はシリーズをまたいで重複させない（年だけで勢力の存続期間を判定するため）。
// =====================================================================
export const MAP_SERIES = {
  anc: [-2500, -1750, -1250, -950, -660, -600, -480, -323, -218, -44, 117, 250, 395],
  med: [550, 650, 800, 962, 1095, 1204, 1300, 1360, 1400],
  ren: [1492, 1517, 1555],
  abs: [1648, 1715, 1772],
  rev: [1812, 1815, 1871],
  imp: [1885, 1900, 1914],
  ww: [1922, 1939, 1942],
  cw: [1950, 1962, 1975, 1991],
};

export const snapshotKey = (prefix, year) => `${prefix}${year}`;

// 全シリーズの年代を古い順に並べた一覧 [{ prefix, year, key }]
export const ALL_SNAPSHOTS = Object.entries(MAP_SERIES)
  .flatMap(([prefix, years]) => years.map((year) => ({ prefix, year, key: snapshotKey(prefix, year) })))
  .sort((a, b) => a.year - b.year);

// シリーズのうち、年が [from, to) の範囲にある年代（地図の時代区分ごとに受け持つ年代を選ぶ）
export const seriesYears = (prefix, from = -Infinity, to = Infinity) => MAP_SERIES[prefix].filter((y) => y >= from && y < to);
