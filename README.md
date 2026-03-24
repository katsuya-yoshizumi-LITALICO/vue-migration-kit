# Vue Migration Kit

Vue 2 → Vue 3 / Nuxt 2 → Nuxt 3 の移行影響範囲をブラウザから検出するローカル開発ツール。

プロジェクトのソースコードをスキャンし、廃止API・非推奨パターン・要修正箇所をレポートとして可視化します。

## 主な機能

- **30+ の検出ルール** — Vue 2 廃止API、グローバルAPI変更、Nuxt 2 固有パターン、Nuxt Config の非互換項目を検出
- **複数プロジェクト対応** — フォルダを複数選択してまとめてスキャン、結果をプロジェクト単位で切替表示
- **targets.json 一括スキャン** — 対象プロジェクト一覧を定義し、ワンクリックで全プロジェクトをスキャン
- **レポート表示** — ルール別・ファイル別のタブ切替、severity フィルター、行番号付きコードプレビュー
- **エクスポート** — Excel (.xlsx) / JSON 形式でレポートを出力。`exports/` ディレクトリへの一括保存にも対応
- **CLI バッチ処理** — `npm run batch-export` で targets.json の全プロジェクトをスキャン & Excel 出力

## 検出カテゴリ

| カテゴリ | 主なルール例 | Severity |
|---|---|---|
| Vue 2 廃止API | `filters`, `$listeners`, `$on/$off/$once`, `$set`, `slot-scope`, `.sync`, `.native` | error |
| Vue 2 廃止API | `$children`, `beforeDestroy/destroyed`, 旧非同期コンポーネント | warning |
| グローバルAPI変更 | `Vue.component()`, `Vue.mixin()`, `Vue.use()`, `functional: true` | warning |
| Nuxt 2 固有 | `fetch/asyncData`, `$nuxt`, Vuex Store, `inject` パターン | error / warning / info |
| Nuxt Config | `buildModules`, `publicRuntimeConfig`, `mode: 'spa'`, webpack 設定 | warning |

## セットアップ

### 前提条件

- Node.js >= 24 (`.nvmrc` 参照)

### インストール

```bash
git clone <repository-url>
cd vue-migration-kit
npm install
```

## 使い方

### Web UI

```bash
npm run dev
```

`http://localhost:5173` を開きます。

#### スキャン方法

| 方法 | 説明 |
|---|---|
| **フォルダを選択** | ブラウザのディレクトリピッカーでフォルダを追加。複数回クリックで複数プロジェクトをキューに追加し、「スキャン開始」でまとめて実行 |
| **targets.json** | `targets.json` に定義された全プロジェクトをサーバー側で直接スキャン（高速） |
| **ZIP** | プロジェクトの ZIP ファイルをアップロード |
| **レポート読込** | 過去にエクスポートした JSON レポートを再表示 |

#### エクスポート

- 各レポートの「Excel エクスポート」「JSON 保存」ボタンで個別ダウンロード
- 複数レポートがある場合:
  - 「全てダウンロード」— ブラウザから各 xlsx を順次ダウンロード
  - 「exports/ に保存」— サーバー側の `exports/` ディレクトリに一括保存

### targets.json

親ディレクトリ（`../`）にあるプロジェクトのディレクトリ名を列挙します。

```json
[
  "project-a",
  "project-b",
  "project-c"
]
```

Web UI の「targets.json」ボタン、または `npm run batch-export` から利用されます。

### CLI バッチ処理

```bash
npm run batch-export
```

`targets.json` を読み、親ディレクトリ配下の各プロジェクトをスキャンし、`exports/` に Excel ファイルを出力します。

## スクリプト

| コマンド | 説明 |
|---|---|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | TypeScript 型チェック + プロダクションビルド |
| `npm run test` | テスト実行 |
| `npm run test:watch` | テスト（ウォッチモード） |
| `npm run test:ui` | Vitest UI でテスト実行 |
| `npm run lint` | ESLint（警告 0 で通過必須） |
| `npm run format` | Prettier でフォーマット |
| `npm run spell` | cspell でスペルチェック |
| `npm run batch-export` | targets.json の全プロジェクトをスキャン & Excel 出力 |

## 技術スタック

| 領域 | 技術 |
|---|---|
| フロントエンド | React 19, TypeScript (strict), Tailwind CSS 4, shadcn/ui |
| バンドラー | Vite 8 |
| バックエンド | Vite dev server plugin (Express middleware) |
| テスト | Vitest, Testing Library |
| Lint / Format | ESLint 9 (flat config, strict), Prettier |
| その他 | ExcelJS (Excel export), tsx (CLI scripts), cspell |

## プロジェクト構成

```
vue-migration-kit/
├── server/                  # バックエンド（スキャンエンジン + API）
│   ├── types.ts             # 共有型定義
│   ├── rules.ts             # 検出ルール定義
│   ├── scanner.ts           # スキャンエンジン（純粋関数）
│   ├── scanner.test.ts      # scanner のテスト
│   ├── vitePlugin.ts        # Vite dev server API プラグイン
│   └── exportExcel.ts       # Excel エクスポート
├── scripts/
│   └── batch-export.ts      # CLI バッチスキャン & エクスポート
├── src/
│   ├── App.tsx              # メイン UI コンポーネント
│   ├── features/
│   │   ├── scanner/         # スキャン入力（フォーム, hooks）
│   │   └── report/          # レポート表示（タブ, フィルター, エクスポート）
│   ├── shared/              # 共有ユーティリティ・コンポーネント
│   └── styles/globals.css   # デザイントークン
├── targets.json             # バッチスキャン対象プロジェクト一覧
├── exports/                 # Excel 出力先（.gitignore 対象）
└── index.html
```

## 設計原則

- **純粋関数ファースト** — `scanner.ts` と `reportUtils.ts` は副作用なし
- **副作用はエッジへ** — ファイル I/O はサーバー側、fetch は `api.ts` に集約
- **Feature-based コロケーション** — コンポーネント・hooks・テストを同ディレクトリに配置
