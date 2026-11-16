// すべての UI テストが使う共通の土台。
// - console：ブラウザのコンソールの警告・エラー、例外、ブラウザの介入メッセージ（passive イベントの警告など）を集め、
//   1件でもあればそのテストを失敗にする（CLAUDE.md「ブラウザのコンソールに警告・エラーを出さない」）。
//   外部サイト（画像の Wikimedia Commons など）の読み込み失敗だけは通信の都合で揺れるため失敗にはせず、記録だけ添付する
//   （アプリ自身の資源の読み込み失敗は失敗にする）。
// - cdp：タッチのドラッグ・ピンチ、修飾キー付きのホイールなど、Playwright の標準 API にない入力を送るための CDP セッション。
// - ui：tests/ui/helpers/app.js の操作関数を、このテストのページに結びつけたもの。
import { test as base, expect } from "@playwright/test";
import { createUi } from "./helpers/app.js";

export const test = base.extend({
  cdp: async ({ page }, provide) => {
    const session = await page.context().newCDPSession(page);
    await provide(session);
    await session.detach().catch(() => {});
  },

  consoleIssues: [
    async ({ page, cdp }, provide, testInfo) => {
      const issues = [];
      const network = [];
      const appOrigin = new URL(testInfo.project.use.baseURL).origin;
      const isExternal = (url) => { try { return new URL(url).origin !== appOrigin; } catch { return false; } };
      page.on("console", (m) => {
        // テスト中にファイルが変わると開発サーバーが画面を描き直し（HMR）、操作中の要素が付け替わって原因の分かりにくい失敗になる。
        // 起きたら環境要因として明示して失敗にする（テスト中は src/・tests/ などを編集しないこと）
        if (m.type() === "debug" && /^\[vite\] (hot updated|page reload)/.test(m.text())) {
          issues.push(`[環境] テスト中に開発サーバーの再読み込みが起きた：${m.text()}（実行中にファイルを変更しないこと）`);
          return;
        }
        if (m.type() !== "error" && m.type() !== "warning") return;
        const url = m.location()?.url ?? "";
        const line = `[console.${m.type()}] ${m.text()}${url ? ` (${url})` : ""}`;
        // 外部サイト（Wikimedia Commons の画像など）の読み込み失敗だけは通信の都合で揺れるので記録のみにする。
        // アプリ自身（開発サーバー）の資源の読み込み失敗や、それ以外のエラー・警告はすべて失敗にする
        if (/^Failed to load resource/.test(m.text()) && isExternal(url)) network.push(line);
        else issues.push(line);
      });
      page.on("requestfailed", (r) => { if (isExternal(r.url())) network.push(`[requestfailed] ${r.failure()?.errorText} ${r.url()}`); });
      page.on("pageerror", (e) => issues.push(`[exception] ${e.message}`));
      // Log ドメイン：passive リスナーでの preventDefault などブラウザの介入はここにだけ出る
      cdp.on("Log.entryAdded", ({ entry }) => {
        if (entry.level !== "warning" && entry.level !== "error") return;
        const line = `[log.${entry.source}.${entry.level}] ${entry.text}${entry.url ? ` (${entry.url})` : ""}`;
        (entry.source === "network" && isExternal(entry.url) ? network : issues).push(line);
      });
      await cdp.send("Log.enable");
      // テストによっては、意図して出す既知のメッセージを除外できる（除外したものも添付には残す）
      const allowed = [];
      await provide({ allow: (re) => allowed.push(re) });
      const fatal = issues.filter((l) => !allowed.some((re) => re.test(l)));
      if (issues.length || network.length) {
        await testInfo.attach("console.txt", { body: [...issues, ...network.map((l) => `(記録のみ) ${l}`)].join("\n"), contentType: "text/plain" });
      }
      expect(fatal, "ブラウザのコンソールに警告・エラーが出ていない").toEqual([]);
    },
    { auto: true },
  ],

  ui: async ({ page, cdp }, provide, testInfo) => {
    await provide(createUi(page, cdp, testInfo));
  },
});

export { expect };
