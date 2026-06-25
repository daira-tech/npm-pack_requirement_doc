import type {
  ItemKind,
  ItemMeta,
  ColorToken,
  DeviceConfig,
  SpecViewerOptions,
  BaseColorSet,
} from './lib/types'

// createSpecViewer() で注入された内容を保持する。マウント前に必ず set される前提。
let components: ItemMeta[] = []
let pages: ItemMeta[] = []
let colorTokens: ColorToken[] = []
let showThemeToggle = true
let devices: DeviceConfig[] = []
let baseColors: { light: BaseColorSet; dark: BaseColorSet } | undefined

export function setRegistry(config: {
  components: ItemMeta[]
  pages: ItemMeta[]
  colors: ColorToken[]
  options?: SpecViewerOptions
}): void {
  components = config.components
  pages = config.pages
  colorTokens = config.colors
  showThemeToggle = config.options?.showThemeToggle ?? true
  devices = config.options?.devices ?? []
  baseColors = config.options?.baseColors
}

export function getShowThemeToggle(): boolean {
  return showThemeToggle
}

export function getDevices(): DeviceConfig[] {
  return devices
}

export function getBaseColors(): { light: BaseColorSet; dark: BaseColorSet } | undefined {
  return baseColors
}

export function getComponents(): ItemMeta[] {
  return components
}

export function getPages(): ItemMeta[] {
  return pages
}

export function getColors(): ColorToken[] {
  return colorTokens
}

export function findItem(kind: ItemKind, name: string): ItemMeta | undefined {
  return [...components, ...pages].find((item) => item.kind === kind && item.name === name)
}
