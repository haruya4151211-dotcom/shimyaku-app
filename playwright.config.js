// UI テスト（Playwright）の設定。MacBook Air と Codespaces（Linux）で同じ設定を使う。
// ブラウザは @playwright/test が版を固定して配る Chromium（`npm run test:ui:install` で入れる）で、
// 普段使いの Chrome やそのプロフィールには触れない。テストごとに新しいブラウザコンテキスト（使い捨てのプロフィール）を作るので、
// localStorage・学習の記録もテスト間で混ざらず、利用者のデータも汚さない。
// 開発サーバーはテスト専用のポートで自動起動・自動終了する（普段の `npm run dev` の 5173 番や手元のサーバーとぶつからない）。
import { defineConfig } from "@playwright/test";

const PORT = Number(process.env.UI_TEST_PORT || 5299);
const BASE_URL = `http://localhost:${PORT}/`;
// 性能の計測は本番ビルドで別に行う（playwright.perf.config.js）。仕様未確定の UX 課題の記録（ux-pending/）は
// 合否を持たないので通常の実行から外し、`npm run test:ui:ux-pending`（UI_UX_PENDING=1）のときだけ流す
const IGNORE = ["perf/**", ...(process.env.UI_UX_PENDING ? [] : ["ux-pending/**"])];
// 追加の画面幅で流すのは、画面の幅で結果が変わるテスト（カメラ・初期表示・当たり判定・スライダー・シート・レイアウト）だけ。
// それらのテストには @viewport の印を付けている
const smallPhone = { viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const largePhone = { viewport: { width: 430, height: 900 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };

export default defineConfig({
  testDir: "tests/ui",
  testIgnore: IGNORE,
  // 開発サーバーの描画は React の開発用チェックで重いので、並列にせず1本ずつ流す（待ち時間の揺れを減らす）
  workers: 1,
  fullyParallel: false,
  retries: 0, // 不安定さは隠さない。落ちたら原因を直す
  forbidOnly: true,
  timeout: 120_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { outputFolder: "test-results/report", open: "never" }]],
  outputDir: "test-results/artifacts",
  use: {
    baseURL: BASE_URL,
    browserName: "chromium",
    locale: "ja-JP",
    timezoneId: "Asia/Tokyo",
    reducedMotion: "no-preference", // 年代切り替えの演出を検証するため、端末設定に左右されないよう明示する
    // 1つの操作（クリックなど）が押せないまま待ち続けたら 10 秒で失敗にし、どの操作で止まったかをすぐ分かるようにする
    actionTimeout: 10_000,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
    },
    {
      name: "mobile",
      // データの対応（map-taps）、ソースの検査（spec-sync）、データの基準との比較（data-baseline）は画面の大きさに左右されないので PC の側だけで流す
      testIgnore: [...IGNORE, "**/map-taps.spec.js", "**/spec-sync.spec.js", "**/data-baseline.spec.js"],
      use: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    },
    // 小さいスマホ（iPhone SE 相当）と大きいスマホ（Pro Max 相当）。@viewport の印のテストだけ
    { name: "mobile-375", grep: /@viewport/, testIgnore: IGNORE, use: smallPhone },
    { name: "mobile-430", grep: /@viewport/, testIgnore: IGNORE, use: largePhone },
  ],
  webServer: {
    // ファイル監視・HMR を止めた設定で起動する（tests/ui/vite.config.js）
    command: `npx vite --config tests/ui/vite.config.js --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
