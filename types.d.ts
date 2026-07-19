import type { App, Component } from 'vue'

export type ItemKind = 'component' | 'page'

export interface Mock {
  id: string
  label: string
  view: string | Component
  requirements: string
}

export interface VersionEntry {
  view?: string | Component
  mocks?: Mock[]
  requirements?: string
}

export interface ItemMeta {
  name: string
  kind: ItemKind
  title: string
  description: string
  latest: string
  versions: Record<string, VersionEntry>
}

export interface DocMeta {
  name: string
  title: string
  description: string
  content: string
}

export interface ColorToken {
  name: string
  light: string
  dark: string
  description?: string
}

export interface DeviceConfig {
  id: string
  label: string
  frame: 'pc' | 'phone' | 'tablet'
  minWidth: number
  maxWidth: number
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
  documents?: DocMeta[]
  colors: ColorToken[]
  options?: SpecViewerOptions
}

export function createSpecViewer(config: SpecViewerConfig): App
