# 史脈（shimyaku-app）

世界史のアクティブリコール学習アプリ。カードの学習と、年代ごとの勢力図（地図タブ）が連動する。

## よく使うコマンド

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバー |
| `npm run build` | 本番ビルド |
| `npm run check` | データ検査（答えの漏れ、地図とカードの整合、ラベル・都市の位置、データ構造）。エラーがあれば終了コード1 |
| `npm run geo` | 勢力の輪郭データを生成し直す（`src/data/generated/geoPaths.js`）。重なり・すき間・存続期間の矛盾があればエラー |

`npm run geo` には Natural Earth の元データが必要（`geo/lib.mjs` の `SOURCE_URL` から `geo/.cache/` に保存。リポジトリには含めない）。

## 地図データの構成（存続期間ベース）

| ファイル | 内容 |
|---|---|
| `src/data/atlas/series.js` | 地図の年代（シリーズごとのスナップショットの年） |
| `geo/regions.mjs` の `ENTITIES` | 勢力ごとの存続期間 `life` と、期間ごとの形 `shapes`（現代の国・州・県の組み合わせ） |
| `src/data/atlas/styles.js` | 勢力の色、ラベル（有効期間つき）、背景、都市（有効期間つき） |
| `src/data/historyData.js` の `buildMapPeriod` | 上の3つから、年代ごとの地図を組み立てる |

### 新しい年代を足す（例：三国時代の250年）

1. `atlas/series.js` の該当シリーズに年を加える
2. その年に存続する勢力が自動で地図に入る。形が変わる勢力は `ENTITIES` の `shapes` を分け、新しい勢力は `ENTITIES` に追加する
3. 新しい勢力の色（`PALETTES`）・ラベル（`REGION_LABELS`）・都市（`CITIES`）を `atlas/styles.js` に加える
4. `npm run geo` → `npm run check` で、重なり・すき間・定義漏れ・ラベルや都市の位置を確認する

---

## React + Vite（テンプレートの説明）

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
