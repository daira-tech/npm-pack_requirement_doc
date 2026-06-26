# spec-viewer

要件書（仕様モック）ビューアのフレームワーク。
**部品（component）/ 画面（page）のモックと自然言語の要件を左右に並べて表示**し、端末（PC / Tablet / Phone）切替・縮尺プレビュー・ダーク/ライト・カラー一覧をまとめて提供します。

- ビューア本体は **Vue 3 + Vue Router** 製（利用側に `npm i vue vue-router` が必要）。
- ただし**モックの中身は素の HTML 文字列でOK**（Vue に依存させない）。動的にしたい部品だけ Vue コンポーネントにもできる。
- スタイルは **Tailwind CSS v4**。ユーティリティは「利用側の Tailwind」が生成する（後述）。

このリポジトリでは、利用側の実例が `../requirements` にあります。**迷ったら `requirements` を写経**すれば動きます。

---

## 全体像

```
npm_pack/        ← このパッケージ（ビューア本体）。基本さわらない
requirements/    ← 利用側。ここに「要件の中身」を書く
```

- **ビューア（npm_pack）**: 額縁・ルーティング・端末枠・プレビュー・カラーページなど共通の仕組み。
- **中身（requirements）**: `components` / `pages` / `colors` と、それらを `createSpecViewer()` に渡す `main.ts`。

中身は「部品」と「画面」に分かれ、画面は部品のマークアップを組み合わせて作る（パズルのイメージ）。
それぞれ **バージョン（v1, v2, …）単位**で管理する。

---

## クイックスタート（利用側を新規に作る場合）

### 1. 依存を入れる

```bash
npm i vue vue-router
npm i -D vite @vitejs/plugin-vue tailwindcss @tailwindcss/vite typescript vue-tsc
# spec-viewer はローカル参照（このリポジトリ構成の場合）
npm i spec-viewer@file:../npm_pack
```

`package.json`（利用側）の要点:

```json
{
  "type": "module",
  "scripts": { "dev": "vite", "build": "vue-tsc -b && vite build" },
  "dependencies": {
    "spec-viewer": "file:../npm_pack",
    "vue": "^3.5.34",
    "vue-router": "^4.6.4"
  }
}
```

> `spec-viewer` は **ビルド済み成果物（dist）**を読みます。npm_pack 側を編集したら `cd npm_pack && npm run build` が必要（中身=requirements 側の編集は HMR で即反映）。

### 2. Vite 設定（利用側 `vite.config.ts`）

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
```

### 3. CSS（利用側 `src/style.css`）

Tailwind は **利用側で 1 回だけ**走らせ、`@source` で spec-viewer のクラスも生成対象に含める（これでビューア本体＋自分のモック両方のクラスが出る／preflight も 1 回だけ）。

```css
@import "tailwindcss";

/* dark: を .dark クラス基準で効かせる（手動トグル用） */
@custom-variant dark (&:where(.dark, .dark *));

/* spec-viewer 本体が使う Tailwind クラスも生成対象にする */
@source "../node_modules/spec-viewer/dist";
```

### 4. エントリ（利用側 `src/main.ts`）

```ts
import { createSpecViewer } from 'spec-viewer'
import 'spec-viewer/style.css' // ビューアの独自 CSS（req-md など）
import './style.css'           // Tailwind ユーティリティ

import Input from './components/Input/meta'
import Button from './components/Button/meta'
import loginPage from './pages/loginPage/meta'
import { colors } from './colors/colors'

createSpecViewer({
  components: [Input, Button],
  pages: [loginPage],
  colors,
  options: {
    devices: [
      { id: 'pc', label: 'PC', frame: 'pc', minWidth: 1024, maxWidth: 1920 },
      { id: 'phone', label: 'Phone', frame: 'phone', minWidth: 320, maxWidth: 1023 },
    ],
    baseColors: {
      light: { bg: '#f5f6f8', font: '#1f2937' },
      dark: { bg: '#131313', font: '#f3f3f3' },
    },
  },
}).mount('#app')
```

`index.html` には `<div id="app"></div>` と `<script type="module" src="/src/main.ts">` を置く。

### 5. 起動

```bash
npm run dev     # 開発サーバ
npm run build   # 型チェック + 本番ビルド
```

`/catalog`（一覧）→ 各部品/画面、`/colors`（カラー一覧）へ遷移できる。

---

## 中身の書き方

### ディレクトリ構成

```
src/
  components/
    Input/
      meta.ts                 ← この部品のメタ（一覧/ルーティング用）
      v1/
        Input.demo.html       ← モック（素の HTML）
        Input.req.md          ← 要件（Markdown）
  pages/
    loginPage/
      meta.ts
      v1/
        LoginPage.mock.html
        LoginPage.req.md
  colors/
    colors.ts                 ← 色定義（任意の色トークン）
  main.ts
  style.css
```

### meta.ts（部品でも画面でも同じ形）

```ts
import type { ItemMeta } from 'spec-viewer'
import InputV1Demo from './v1/Input.demo.html?raw' // ← 素の HTML を文字列で読む
import InputV1Req from './v1/Input.req.md?raw'

const meta: ItemMeta = {
  name: 'Input',            // URL に使う識別子
  kind: 'component',        // 'component' | 'page'
  title: 'Input（入力欄）',  // 一覧/ヘッダの見出し
  description: 'メール・パスワード等で使う単一行入力',
  latest: 'v1',             // 既定で表示するバージョン
  versions: {
    v1: { view: InputV1Demo, requirements: InputV1Req },
  },
}
export default meta
```

- `view`: 単一 mock のとき。**HTML 文字列（`?raw`）** または Vue コンポーネント。
- `mocks`: 状態別 mock。**2 件以上**で切替タブが出る。`mocks` を使う場合 `view` は省略可。部品・画面どちらも同じ。
- `requirements`: 要件 Markdown。**1 mock = 1 md**。`view`（単一 mock）使用時は `VersionEntry` 側に、`mocks` 使用時は**各 mock 側**に書く。

**1 mock = 1 md。** mock を切り替えると、その mock の `requirements` が右ペインに表示される。

部品（`kind: 'component'`）の例:

```ts
const meta: ItemMeta = {
  name: 'Input',
  kind: 'component',
  title: 'Input（入力欄）',
  description: '…',
  latest: 'v1',
  versions: {
    v1: {
      mocks: [
        { id: 'normal',   label: '通常',   view: InputNormalDemo,   requirements: InputNormalReq },
        { id: 'error',    label: 'エラー', view: InputErrorDemo,    requirements: InputErrorReq },
        { id: 'disabled', label: '無効',   view: InputDisabledDemo, requirements: InputDisabledReq },
      ],
    },
  },
}
```

画面（`kind: 'page'`）の例:

```ts
const meta: ItemMeta = {
  name: 'CollageListPage',
  kind: 'page',
  title: 'コラージュ一覧',
  description: '…',
  latest: 'v1',
  versions: {
    v1: {
      mocks: [
        { id: 'empty', label: '0件',  view: CollageListEmptyMock, requirements: CollageEmptyReq },
        { id: 'full',  label: '10件', view: CollageListFullMock,  requirements: CollageFullReq },
      ],
    },
  },
}
```

単一 mock の従来形（`view` ＋ version 側 `requirements`）もそのまま使える。

```ts
versions: {
  v1: { view: InputV1Demo, requirements: InputV1Req },
}
```

作ったら `main.ts` の `components` / `pages` 配列に 1 行足す。

### モック（素の HTML）

Tailwind のクラスをそのまま書ける（利用側 Tailwind が拾う）。状態違いを並べて見せると要件が伝わりやすい。

```html
<!-- Input.demo.html -->
<div class="space-y-4">
  <label class="block">
    <span class="mb-1 block text-sm font-bold text-gray-700 dark:text-gray-200">通常</span>
    <input class="w-full rounded-md border px-3 py-2 border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
  </label>
</div>
```

> 素の HTML なので `v-model` 等の動的挙動はない（静的モック）。動的にしたい部品だけ、`view` に Vue コンポーネントを渡せる（`view: string | Component`）。

### 要件（Markdown）

`*.req.md` に自然言語で表示条件・活性条件などを書く。右ペインに描画される（GFM 対応：表・リスト・見出しなど）。

### バージョン運用

- 仕様を変えるときは `v2/` を足し、`meta.ts` の `versions` に `v2` を追加、`latest` を更新する。
- 画面が部品の特定版を使う場合は、その版のマークアップを画面側 HTML に取り込む形で「ピン留め」する（古い版の画面要件が将来の変更で崩れない）。
- ヘッダのドロップダウンでバージョンを切替表示できる。

### 色定義（colors.ts）

```ts
import type { ColorToken } from 'spec-viewer'

export const colors: ColorToken[] = [
  { name: 'accentColor', light: '#005AFF', dark: '#75AEFE', description: 'メインのアクセント色' },
  // baseBg / baseFont は options.baseColors から自動表示されるのでここには書かない
]
```

`/colors` でライト/ダーク両方の値をスウォッチ付きで一覧表示する。

---

## オプション（`createSpecViewer({ ..., options })`）

`showThemeToggle` 以外は**省略時デフォルトなし**。`devices` と `baseColors` は利用側で必ず指定する。

```ts
createSpecViewer({
  components, pages, colors,
  options: {
    showThemeToggle: true,   // ダーク/ライト切替ボタン（省略時 true）
    devices: [               // mock の端末タブ（必須）
      { id: 'pc',     label: 'PC',     frame: 'pc',     minWidth: 1024, maxWidth: 1920 },
      { id: 'tablet', label: 'Tablet', frame: 'tablet', minWidth: 768,  maxWidth: 1024 },
      { id: 'phone',  label: 'Phone',  frame: 'phone',  minWidth: 320,  maxWidth: 1023 },
    ],
    baseColors: {            // モック画面の基本色（必須）
      light: { bg: '#f5f6f8', font: '#1f2937' },
      dark:  { bg: '#131313', font: '#f3f3f3' },
    },
  },
})
```

### showThemeToggle

`false` にすると、全画面からダーク/ライト切替ボタンが消える。

### devices

mock 上部のタブに出る端末リスト。**タブごとに min〜max の範囲が独立**している（Phone の max を超えて PC 幅にはならない）。

| フィールド | 説明 |
| --- | --- |
| `id` | タブ識別子（例 `'pc'`） |
| `label` | タブ表示名（例 `'PC'`） |
| `frame` | 枠の見た目。`'pc'`=ブラウザ風 / `'phone'`=ノッチ付き / `'tablet'`=ノッチなしベゼル |
| `minWidth` | mock の **viewport 最小幅**（px）。端末枠・ノッチは含まない |
| `maxWidth` | mock の **viewport 最大幅**（px）。端末枠・ノッチは含まない |

- 配列を 1 件だけ（例: PC のみ）にすると端末タブ自体が消える。
- `minWidth === maxWidth` の端末は幅固定（リサイズハンドル非表示）。
- 表示幅は **mock が描画される viewport 幅**。Phone の黒ベゼル・ノッチはその外側の装飾として重ねる（mock の左右 padding は付けない）。
- 詳細画面: 右端ドラッグで **選択中タブの min〜max** の範囲内に変更。ペースに収まらなければ**端末枠込みで縮尺**（最大 1x）。
- タブ切替時は **minWidth から**表示し直す（前の端末の幅は引き継がない）。

### baseColors

モック画面（PC/Tablet/Phone の画面・プレビュー）の**背景色と基本文字色**を、ライト/ダークごとに指定する。
ここで指定した値は `/colors` の一覧に `baseBg` / `baseFont` として自動表示される（情報源が二重化しない）。

---

## プレビューモード

- ヘッダの「プレビュー」ボタンで、**要件パネルを隠して全画面表示**する。
- **詳細画面と同じ端末枠・同じ viewport 幅**で mock を **1:1** 表示する（縮尺なし。はみ出す場合はスクロール）。
- mock の viewport がブラウザより**狭い**ときだけ、外側に境界線（グレー背景 + ボーダー）を出す。**同幅なら枠なし**。
- 右端ドラッグで幅変更可能（詳細と同じく、**プレビュー前に選んだ端末タブの min〜max 内**）。
- 端末タブはプレビュー中は出ない（詳細で選んだ端末を引き継ぐ）。
- 退室は **`Esc`** または右上の「閉じる」ボタン。

---

## PDF出力

ブラウザの印刷機能（**印刷 → PDFとして保存**）を使う。追加ライブラリなし。文字は選択可能・ベクターのまま出力される。

- **各詳細ページ**: ヘッダの「**PDF出力**」ボタン → そのアイテムを印刷用レイアウトで新規タブに開く。
- **Topページ**: 「**全体をPDF出力**」ボタン → 全ページ・全コンポーネント（＋カラー一覧）をまとめて出力。
- 開いた印刷プレビューは表示後に自動で印刷ダイアログを開く（「印刷 / PDF保存」ボタンで再実行も可）。

レイアウト・仕様:

- **スマホと同じ縦積み**（mock を上、要件を下）で描画。
- mock が複数あるときは **全 mock を縦に並べ**、各 mock の下に**その mock の要件**を表示（1 mock = 1 md）。
- 各 mock は **`options.devices` の全端末（PC / Phone / Tablet …）**で出力する。
- 印刷プレビューのツールバーで**用紙の向き（縦／横）を切替**できる。横長 mock が切れる・崩れるときは「横」にする（横は mock の基準幅も広がる）。
- バージョンは **latest のみ**。
- 配色は **ライト固定**（画面がダークでも PDF はライト）。`baseColors.light` を使用。
- mock はページ幅に収まるよう自動縮尺（拡大はしない）。アイテムごとに改ページ。
- 印刷ルート: `/print/all`, `/print/pages/:name`, `/print/components/:name`。

---

## 仕組み（内部メモ）

- `createSpecViewer(config)` が `config` を `registryStore` に注入し、ルータ付き Vue アプリを返す。
- ルート: `/catalog`, `/components/:name/:ver?`, `/pages/:name/:ver?`, `/colors`, `/print/all`, `/print/pages/:name`, `/print/components/:name`。
- `ReqScreen.vue` が額縁（ヘッダ / 左 mock / 右要件）と端末枠・縮尺・プレビューを担当。端末枠は `MockDeviceFrame.vue`。
- 印刷は `print/PrintView.vue`（縦積み・ライト固定・自動印刷）/ `PrintItem.vue` / `PrintMock.vue` が担当。mock/要件の解決は `lib/resolve.ts` に共通化（詳細ページと共有）。`@media print` の体裁は `style.css`。
- Tailwind ユーティリティはパッケージに同梱せず、**利用側の `@source` 経由で生成**（`dist/index.js` 内のクラス文字列を走査）。パッケージ同梱の `style.css` は req-md 等の独自スタイルのみ。

### 公開 API / 型

```ts
import {
  createSpecViewer,
  type SpecViewerConfig,
  type SpecViewerOptions,
  type ItemMeta,
  type ItemKind,
  type VersionEntry,
  type Mock,
  type DeviceConfig,
  type ColorToken,
} from 'spec-viewer'
```

---

## よくある操作

| やりたいこと | 操作 |
| --- | --- |
| 部品/画面を追加 | `meta.ts` + `v1/*.html` + `v1/*.req.md` を作り、`main.ts` の配列に追加 |
| バージョンを増やす | `v2/` を足して `meta.ts` の `versions` と `latest` を更新 |
| 端末を変える | 詳細画面の mock 上部タブ、または `options.devices` を編集 |
| 端末の幅を変える | 詳細 / プレビューで右端ドラッグ（選択中タブの `minWidth`〜`maxWidth` 内） |
| ダーク切替を隠す | `options.showThemeToggle: false` |
| モックの基本色を変える | `options.baseColors`（`/colors` にも反映） |
| ビューア本体を直した | `cd npm_pack && npm run build` で再ビルド |
