import type {
  ItemKind,
  ItemMeta,
  ColorToken,
  DeviceConfig,
  SpecViewerOptions,
  BaseColorSet,
} from './lib/types'

// 端末未指定時の既定
const DEFAULT_DEVICES: DeviceConfig[] = [
  { id: 'pc', label: 'PC', frame: 'pc', width: 1024 },
  { id: 'phone', label: 'Phone', frame: 'phone', width: 360 },
]

// モック基本色の既定
const DEFAULT_BASE_COLORS: { light: BaseColorSet; dark: BaseColorSet } = {
  light: { bg: '#f5f6f8', font: '#1f2937' },
  dark: { bg: '#131313', font: '#f3f3f3' },
}

// createSpecViewer() で注入された内容を保持する。マウント前に必ず set される前提。
let components: ItemMeta[] = []
let pages: ItemMeta[] = []
let colorTokens: ColorToken[] = []
let showThemeToggle = true
let devices: DeviceConfig[] = DEFAULT_DEVICES
let baseColors: { light: BaseColorSet; dark: BaseColorSet } = DEFAULT_BASE_COLORS

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
  devices =
    config.options?.devices && config.options.devices.length > 0
      ? config.options.devices
      : DEFAULT_DEVICES
  baseColors = config.options?.baseColors ?? DEFAULT_BASE_COLORS
}

export function getShowThemeToggle(): boolean {
  return showThemeToggle
}

export function getDevices(): DeviceConfig[] {
  return devices
}

export function getBaseColors(): { light: BaseColorSet; dark: BaseColorSet } {
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
