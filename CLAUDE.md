# CLAUDE.md — 史脈（shimyaku-app）

新しい Claude Code セッションが最初に読む資料です。開発の経緯・設計判断・現在の状況の詳細は
[docs/DEVELOPMENT_LOG.md](docs/DEVELOPMENT_LOG.md) にあります。作業を始める前に両方を読んでください。

## 1. アプリの目的と概要

- 世界史の**アクティブリコール学習アプリ**（キャッチコピー「覚えるのではなく、思い出す。」）。
- 2つの体験を連動させるのが核心です。
  - **学習タブ**：問題カード（主に穴埋め＝cloze 形式）を解く。裏面に解説（原因・経過・意義）・豆知識・資料画像。
  - **地図タブ**：年代スライダーで古代〜現代の勢力図を切り替え、勢力・都市をタップするとその勢力のカードが引ける。
- ユーザー（開発者）が重視している学習目的：
  - 歴史の変遷だけでなく**地理そのものにも詳しくなる**こと（大河・山脈・海峡などが拡大に応じて段階的に見える）。
  - 「見ているだけで歴史のダイナミズムが体感できる」地図（年代切り替え時の勢力の膨張・分裂の演出）。
- 現状の規模（2026-11-03 時点、コミット `c3db76b`）：8時代・319問、勢力・背景の定義185件、都市252件、
  地理要素210件（河川41・海/地形/地域名/遺跡169）、地図の年代（スナップショット）41。

## 2. 技術構成

| 項目 | 内容 |
|---|---|
| フレームワーク | React 19 + Vite 8（JavaScript。TypeScript は未使用） |
| スタイル | Tailwind CSS 4（`@tailwindcss/vite`）＋ App.jsx 内の `<style>`（`FontStyles`）に独自 CSS |
| アイコン | lucide-react |
| Lint | oxlint（`.oxlintrc.json`）。**警告26件が現在の基準値**（増やさないこと）。`tests/recovered/` は Mac の `.git/info/exclude` で除外しているので数えない（除外がない環境に置くと +2 件の 28 件） |
| 地図データ生成 | Node スクリプト（`geo/`）。Natural Earth 10m（admin-1 と河川）＋ topojson / polygon-clipping |
| 保存 | `appStorage` アダプター：`window.storage` → `localStorage` → メモリの順にフォールバック（キー `shimyaku:progress` / `shimyaku:favorites` / `shimyaku:presets`） |
| Node | 26 系（`.nvmrc`、`package.json` の `engines` は >=22）。Mac は v26.10.0、Codespaces は `.devcontainer` で 26 系 |
| UI テスト | Playwright（`@playwright/test` 1.64.1 固定、同梱の Chromium）。詳細は [tests/ui/README.md](tests/ui/README.md) |

### コマンド

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバー |
| `npm run build` | 本番ビルド |
| `npm run lint` | oxlint |
| `npm run check` | データ検査（`scripts/check.mjs`）。エラーがあれば終了コード1。**変更のたびに必ず実行** |
| `npm run geo` | 勢力の輪郭（`geo/build.mjs`）と河川（`geo/rivers.mjs`）を生成し直す |
| `npm run test:ui` | UI テスト（PC 幅・スマホ 3 幅、Mac で約 30〜32 分）。失敗があれば終了コード1。初回は `npm run test:ui:install` |
| `npm run test:ui:perf` | 性能の計測（本番ビルド） |

`npm run geo` には Natural Earth の元データが必要です（`geo/.cache/` に保存、gitignore 済み・約80MB）。
URL は `geo/lib.mjs` の `SOURCE_URL` と `geo/rivers.mjs` の `RIVERS_URL`。生成物（`src/data/generated/`）はコミット済みなので、
輪郭や河川を変えない限り `npm run geo` は不要です。

## 3. ディレクトリ構成

```
src/
  App.jsx              アプリ本体（約4,900行の単一ファイル）。主な部品：
                       Header（検索ボタン）／StudyStage・ClozeFront・ClozeBack・CardImages（学習）／FilterPanel／
                       FavoritesView／MapView（地図・カメラ・文字の重なり判定・演出）／EraScrubber（年代スライダー）／
                       RegionDetailSheet（勢力の詳細シート）／ERA_PERIODS（地図の時代区分）
  search/
    searchIndex.js     横断検索の索引・表記ゆれ正規化・検索・年代選択（pickSearchYear）
    SearchModal.jsx    検索モーダル（Cmd/Ctrl+K、スマホ全画面）
  data/
    historyData.js     カード（ヨーロッパ・中東中心の各時代）、ERAS_DATA（時代定義）、buildMapPeriod（地図の組み立て）、解説文
    asiaCards.js / asiaImages.js           東アジア・南アジアのカード（c97〜c157）と画像
    worldCards.js / worldImages.js         優先度1の全世界カード（c158〜c252）
    worldCards2.js / worldImages2.js       優先度2（c253〜c307）
    worldCards3.js / worldImages3.js       優先度3（c308〜c326）
    mapProjection.js   経緯度→地図座標（メルカトル）、viewBox
    atlas/
      series.js        地図の年代（シリーズ anc/med/ren/abs/rev/imp/ww/cw ごとのスナップショット年）
      styles.js        勢力の色・ラベル（有効期間つき）・背景・都市（有効期間つき）・海上航路
      geography.js     地理要素（河川・海・地形・歴史的地域名・遺跡/オアシス）と Tier 1〜5
    generated/         ← npm run geo の出力（手で編集しない）
      geoPaths.js      陸地・勢力の輪郭
      riverPaths.js    河川の流路
geo/
  regions.mjs          ENTITIES：勢力・背景ごとの存続期間 life と、期間ごとの形 shapes（現代の州・県の組み合わせ）
  build.mjs / lib.mjs  輪郭の生成（重なり・すき間・存続期間の矛盾を検査）
  rivers.mjs           河川の生成
scripts/check.mjs      npm run check の本体
tests/ui/              UI テスト（Playwright）。使い方・テストの足し方は tests/ui/README.md
playwright.config.js   UI テストの設定。プロジェクトは desktop（1280×900）／mobile（390×844）／mobile-375（375×667）／
                       mobile-430（430×900）の 4 つ（後ろ 2 つは @viewport の印のテストだけ）。開発サーバーの自動起動。
                       性能用は playwright.perf.config.js
.devcontainer/         Codespaces の環境（Node 26 系・Chromium）
README.md              コマンドと「新しい年代を足す手順」
```

## 4. 重要な設計方針

- **地図は「存続期間ベース」**：勢力ごとに存続期間と期間ごとの形を持ち、`series.js` の各年の地図は自動で組み立てる。
  年を1つ足せば、その年に存続する勢力が自動で入る（手順は README）。
- **輪郭は現代の州・県（Natural Earth admin-1）の組み合わせ**：隣り合う勢力が同じ境界線を共有するため、すき間・はみ出しが出ない。
  手描きの多角形には戻さない（過去に品質問題で全面作り直しをした。経緯は開発ログ）。
- **カードと地図は region ID でつながる**：カードの `region` と地図の勢力 ID が一致することで、勢力タップ → カードが引ける。
- **答えの漏れを出さない**（最重要のデータ規則）：カードの答えが、自分の問題文・同じ時代の他カードの本文や画像説明・
  その時代の地図の文字（勢力名・都市名・背景・海・地理名・解説文）に出てはいけない。`npm run check` が検査する。
  地理名と答えが重なったときは**カードの答えの言い換えを優先**し、どうしても無理な場合だけその時代の地図で地理名を隠す（`hideIn`）。
- **カメラは勝手に動かさない**：年代を変えても表示位置・倍率は保つ（日本の変遷を追う、などの使い方のため）。
  カメラが自動で動くのは、地図タブを最初に開いたとき・地域移動ボタン・リセット・検索結果の選択のときだけ。
- **文字は2層で重なりを判定**：政治の文字（選択中の勢力 > 勢力名 > 都市 > 背景の国名）と地理の文字（海 > 地形 > 地域名 > 河川 > 遺跡）。
  地理の文字は勢力名と重なっても消さず半透明にする。
- **ズームの5段階（Tier）**：`GEO_TIER_ZOOM = {1:1.0, 2:1.6, 3:2.2, 4:3.5, 5:5.0}`。勢力名も面積に応じてこの段階で出す。最大ズーム14。
- **年代切り替えの演出**：変化する勢力だけを約0.45秒でクロスフェード。演出は1つずつ順番に再生し、途中で届いた年は次の演出まで待たせる。
  地図の描画は `useDeferredValue` で遅延させ、スライダーのつまみの追従を優先する。

## 5. UI/UX・実装の開発ルール

- **スマホ（タッチ）と PC（マウス・キーボード）の両方で快適に**。タップ範囲は40px目安、スマホ幅で横スクロールを出さない。
- 地図の配色は暗い地色。文字の縁取りは白ではなく地色に近い濃紺（明るい文字が読みにくくなるため）。
- 画像は Wikimedia Commons の**960px サムネイル URL**、パブリックドメインか CC ライセンスで credit 必須。
  外国語表記・高密度の地図は使わず、資料集に載るような象徴的な絵画・肖像画・写真を優先（historyData.js 冒頭の方針コメント）。
- カード作成の基準（historyData.js 冒頭の「データ生成ガイドライン」）：試験に出る超重要語・条約・名言は問題カード、
  背景や記憶のフックは豆知識・解説。カードは `images: [{ url, caption, alt, credit }]`、原因・経過・意義の points、
  anecdote（豆知識）、anecdoteLink（日本語版 Wikipedia）をそろえる。
- 1勢力あたりカード2問以上が目安（タップしたときにスカスカにしない）。
- ブラウザのコンソールに警告・エラーを出さない（passive イベントの preventDefault、描画中の setState などは過去に修正済み）。
- アニメーションは `prefers-reduced-motion` に配慮する。
- コードは周囲の書き方に合わせる。App.jsx のコメントは日本語で「なぜそうしているか」を書く密度が高い。

## 6. ユーザーが Claude Code に求めている開発スタイル

- **やり取りはすべて日本語**。
- 依頼は多くが「ステップ1（データ・カード）→ ステップ2（地図・描画・連動）」の2段階で来る。
  WHY と WHAT が示され、HOW（実装手法・数値）は「良きに計らって」任されることが多い。任された部分は自分で判断して実装し、判断の理由を報告する。
- 完了時の流れ：**検証（`npm run check`・ビルド・lint・UI テスト `npm run test:ui`・スクリーンショットでの目視）→ 日本語で結果を報告 → Git コミット → main へ Push**。
  コミットメッセージは依頼文の例に合わせ、末尾に `Co-Authored-By:` 行を付ける。
  **ただし依頼でコミット・Push を求められていないときはしない**（例：分析だけの依頼、今回のドキュメント作成）。
- 報告では、うまくいかなかったこと・再現しなかった失敗・仕様の解釈の違いも隠さずに書く。
- 迷う判断（答えとの重なり、存続期間の解釈など）は報告で提案し、ユーザーの判断を待つ。ユーザーが判断を示したらそれに従う。

## 7. 開発時の注意事項

- 変更後は必ず `npm run check`（エラー0）、`npm run build`、`npx oxlint`（警告26件を超えない）を通す。
- **UI テストは `npm run test:ui`**（Mac・Codespaces 共通）。地図・検索・シートなど画面に関わる変更では必ず流す。
  入力は実際の入力イベントで送り、時間ではなく状態を待つ。失敗を skip や期待値の緩和で隠さない（tests/ui/README.md）。
  テストは使い捨てのブラウザ環境で動き、利用者の localStorage や普段の Chrome には触れない。
- **カード・勢力・都市を変えると、UI テストの data-baseline（データの回帰検知）が「基準との違い」で失敗する**。違いが意図どおりかを
  確かめてから `npm run test:ui:baseline` で基準（`tests/ui/baseline/data-baseline.json`）を更新し、データの変更と一緒にコミットする。
- 以前の CDP 方式の画面テストの復元版が `tests/recovered/`（未追跡）にある。移行済みで参考用（扱いはユーザーの判断待ち）。
  Mac の `.git/info/exclude`（手元だけの設定）で除外しているので、git status・lint に出ない。Git に追加しないこと。
- `src/data/generated/` は手で編集しない（`npm run geo` で生成）。
- 開発サーバーでの描画は React の開発用チェックで重い。性能を測るときは `npm run build` → `vite preview` の本番ビルドで測る。
- App.jsx は巨大な単一ファイル。編集前に該当箇所を grep で特定し、近くのコメントを読んでから変える。
- `git push` が認証待ちで止まったことがある。`GIT_TERMINAL_PROMPT=0` とタイムアウトを付けて実行するとよい。
- 秘密情報（API キー等）はこのプロジェクトでは使っていない。

## 8. 詳細な資料

- [docs/DEVELOPMENT_LOG.md](docs/DEVELOPMENT_LOG.md) — 実装した機能、設計判断の理由、過去の問題と解決、現在の状況、未解決の課題、次のタスク
- [README.md](README.md) — コマンド、地図データの構成、新しい年代の足し方
- `src/data/historyData.js` 冒頭 — 画像の選定方針、データ生成ガイドライン
- `scripts/check.mjs` 冒頭 — 検査項目の一覧
- `src/data/atlas/geography.js` 冒頭 — 地理要素の種類と Tier の定義
