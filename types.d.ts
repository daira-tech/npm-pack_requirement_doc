import type { App, Component } from 'vue'

export type ItemKind = 'component' | 'page'

export interface VersionEntry {
  view: string | Component
  req: string
}

export interface ItemMeta {
  name: string
  kind: ItemKind
  title: string
  desc: string
  latest: string
  versions: Record<string, VersionEntry>
}

export interface ColorToken {
  name: string
  light: string
  dark: string
  desc?: string
}

export interface DeviceConfig {
  id: string
  label: string
  frame: 'pc' | 'phone' | 'tablet'
  width: number
}

export interface BaseColorSet {
  bg: string
  font: string
}

export interface SpecViewerOptions {
  showThemeToggle?: boolean
  devices?: DeviceConfig[]
  baseColors?: { light: BaseColorSet; dark: BaseColorSet }
}

export interface SpecViewerConfig {
  components: ItemMeta[]
  pages: ItemMeta[]
  colors: ColorToken[]
  options?: SpecViewerOptions
}

export function createSpecViewer(config: SpecViewerConfig): App
