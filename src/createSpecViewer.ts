import { createApp, type App } from 'vue'
import RootApp from './App.vue'
import { createAppRouter } from './router'
import { setRegistry } from './registryStore'
import type { ItemMeta, ColorToken, SpecViewerOptions } from './lib/types'

export interface SpecViewerConfig {
  components: ItemMeta[]
  pages: ItemMeta[]
  colors: ColorToken[]
  /** 表示オプション（端末構成・ダークモードボタンの有無など） */
  options?: SpecViewerOptions
}

// 利用側から components / pages / colors を注入し、要件ビューアの Vue アプリを生成する。
export function createSpecViewer(config: SpecViewerConfig): App {
  setRegistry(config)
  const app = createApp(RootApp)
  app.use(createAppRouter())
  return app
}
