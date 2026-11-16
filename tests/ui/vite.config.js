// UI テスト専用の開発サーバー設定。アプリの vite.config.js をそのまま使い、ファイル監視と HMR だけを止める。
// テストの途中で画面が描き直される（HMR）と、操作中の要素が付け替わって原因の分かりにくい失敗になるため
// （2026-11-15 に、テスト中の `[vite] hot updated: /src/index.css` による失敗を確認した）。
// テスト実行中にエディタでファイルを保存しても、テストには影響しない
import { mergeConfig } from "vite";
import base from "../../vite.config.js";

// 依存の事前バンドルのキャッシュも分ける（普段の `npm run dev` のキャッシュを、設定の違いで作り直させない）
export default mergeConfig(base, {
  cacheDir: "node_modules/.vite-uitest",
  server: { hmr: false, watch: null },
});
