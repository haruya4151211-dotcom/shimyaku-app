// 性能の計測（年代スライダーの高速ドラッグなど）。開発サーバーは React の開発用チェックで重く実態と違うため、
// 本番ビルドを `vite preview` で配信して測る（CLAUDE.md「性能を測るときは本番ビルドで」）。
// 実行：npm run test:ui:perf（ビルドから行う）。フレーム時間の閾値は端末の速さに左右されるので、既定では記録のみ・
// UI_PERF_STRICT=1 のときだけ合否に含める（Mac で測った基準値は tests/ui/README.md）
import { defineConfig } from "@playwright/test";
import base from "./playwright.config.js";

const PORT = Number(process.env.UI_PERF_PORT || 5399);

export default defineConfig({
  ...base,
  testDir: "tests/ui/perf",
  testIgnore: [],
  // PC とスマホ（390 幅）の2つで測る。通常の設定の除外（perf/** など）は外す
  projects: base.projects.filter((p) => p.name === "desktop" || p.name === "mobile").map(({ testIgnore: _ignored, ...p }) => p),
  // channel "chromium"：Playwright 同梱の Chromium 本体を新しいヘッドレス方式で使う（既定の chrome-headless-shell は描画の仕組みが
  // 実際のブラウザと違い、フレーム間隔が実態より悪く出る。2026-11-15 の MacBook Air・PC 幅で、headless shell は p95 33.4ms、
  // 新方式は p95 16.7ms＝2026-11-03 に Chrome 本体で測った値と一致）
  use: { ...base.use, channel: process.env.UI_PERF_CHANNEL ?? "chromium", baseURL: `http://localhost:${PORT}/` },
  webServer: {
    command: `npx vite build --outDir node_modules/.uitest-dist --emptyOutDir && npx vite preview --outDir node_modules/.uitest-dist --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: false,
    timeout: 180_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
