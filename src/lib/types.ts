import type { Component } from 'vue'

export type ItemKind = 'component' | 'page'

/** 1 バージョン分の表示物（コンポーネントは demo、画面は mock）と要件 md */
export interface VersionEntry {
  /** 左ペインに描画する表示物。素の HTML 文字列（?raw）または Vue コンポーネント */
  view: string | Component
  /** 右ペインに描画する要件マークダウン（?raw で読み込んだ文字列） */
  req: string
}

/** 部品 or 画面 1 アイテムのメタ情報（registry / catalog / router で共有） */
export interface ItemMeta {
  /** URL に使う識別子（例: 'Input', 'loginPage'） */
  name: string
  kind: ItemKind
  /** 一覧やヘッダに表示する見出し */
  title: string
  /** 一覧に出す短い説明 */
  desc: string
  /** 既定で表示するバージョン */
  latest: string
  /** バージョン文字列 -> 表示物 */
  versions: Record<string, VersionEntry>
}

/** カラーページで一覧表示する色定義 */
export interface ColorToken {
  /** 定義名（例: accentColor, accentColorRight） */
  name: string
  /** ライトモードの値（hex / rgb / グラデーション等の CSS 値） */
  light: string
  /** ダークモードの値 */
  dark: string
  /** 用途メモ（任意） */
  desc?: string
}

/** mock に表示する端末（PC / Phone / Tablet など）の定義 */
export interface DeviceConfig {
  /** タブの識別子（例: 'pc', 'phone', 'tablet'） */
  id: string
  /** タブに表示するラベル（例: 'PC', 'Phone'） */
  label: string
  /** 枠の見た目。'pc' はブラウザ風、'phone' はノッチ付き、'tablet' はノッチなしベゼル */
  frame: 'pc' | 'phone' | 'tablet'
  /** 最小画面幅（px）。mock の viewport 幅 */
  minWidth: number
  /** 最大画面幅（px）。mock の viewport 幅。ノッチ・端末枠は含まない */
  maxWidth: number
}

/** モック画面の基本色（背景・文字） */
export interface BaseColorSet {
  /** 画面の背景色（CSS 値） */
  bg: string
  /** 基本の文字色（CSS 値） */
  font: string
}

/** 要件ビューア全体の表示オプション */
export interface SpecViewerOptions {
  /** ダーク/ライト切替ボタンを表示するか（既定 true） */
  showThemeToggle?: boolean
  /** mock に出す端末タブ */
  devices?: DeviceConfig[]
  /** モック画面のライト/ダーク基本色（背景・文字）。カラー一覧にも表示される */
  baseColors?: { light: BaseColorSet; dark: BaseColorSet }
}
