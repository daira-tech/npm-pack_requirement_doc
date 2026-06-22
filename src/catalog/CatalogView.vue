<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { getComponents, getPages, getShowThemeToggle, getDevices } from '../registryStore'
import { useTheme } from '../lib/theme'
import type { DeviceConfig } from '../lib/types'

const { isDark, toggle } = useTheme()

const showThemeToggle = getShowThemeToggle()
const devices = getDevices()
const components = getComponents()
const pages = getPages()

const cardClass =
  'block rounded-lg border border-gray-300 bg-white p-4 transition hover:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-400'

// 設定パネルに出す幅の表示（px 表記に整える）
function deviceWidth(d: DeviceConfig): string {
  return `${d.width}px`
}
</script>

<template>
  <div class="mx-auto min-h-screen max-w-3xl p-8">
    <div class="mb-8 flex items-center">
      <h1 class="text-2xl font-bold dark:text-gray-100">要件書カタログ</h1>
      <button
        v-if="showThemeToggle"
        type="button"
        class="ml-auto rounded-md border border-gray-300 px-3 py-1 text-xs font-bold text-gray-600 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        @click="toggle"
      >
        {{ isDark ? 'ライトモード' : 'ダークモード' }}
      </button>
    </div>

    <section class="mb-10">
      <h2 class="mb-3 text-lg font-bold text-gray-700 dark:text-gray-300">ページ</h2>
      <ul class="space-y-2">
        <li v-for="s in pages" :key="s.name">
          <RouterLink :to="`/pages/${s.name}`" :class="cardClass">
            <div class="font-bold dark:text-gray-100">
              {{ s.title }}
              <span class="ml-1 text-xs text-gray-400">({{ s.latest }})</span>
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">{{ s.desc }}</div>
          </RouterLink>
        </li>
      </ul>
    </section>

    <section class="mb-10">
      <h2 class="mb-3 text-lg font-bold text-gray-700 dark:text-gray-300">コンポーネント</h2>
      <ul class="space-y-2">
        <li v-for="c in components" :key="c.name">
          <RouterLink :to="`/components/${c.name}`" :class="cardClass">
            <div class="font-bold dark:text-gray-100">
              {{ c.title }}
              <span class="ml-1 text-xs text-gray-400">({{ c.latest }})</span>
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">{{ c.desc }}</div>
          </RouterLink>
        </li>
      </ul>
    </section>

    <section>
      <h2 class="mb-3 text-lg font-bold text-gray-700 dark:text-gray-300">デザイン</h2>

      <div
        class="mb-2 rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">表示設定</div>
        <dl class="space-y-2 text-sm">
          <div class="flex gap-3">
            <dt class="w-28 shrink-0 text-gray-500 dark:text-gray-400">ダークモード切替</dt>
            <dd class="font-bold dark:text-gray-100">{{ showThemeToggle ? '表示' : '非表示' }}</dd>
          </div>
          <div class="flex gap-3">
            <dt class="w-28 shrink-0 text-gray-500 dark:text-gray-400">端末</dt>
            <dd class="flex-1">
              <ul class="space-y-1">
                <li
                  v-for="d in devices"
                  :key="d.id"
                  class="font-mono text-xs text-gray-700 dark:text-gray-200"
                >
                  {{ d.label }}（{{ d.frame }}） / 幅: {{ deviceWidth(d) }}
                </li>
              </ul>
            </dd>
          </div>
        </dl>
      </div>

      <ul class="space-y-2">
        <li>
          <RouterLink to="/colors" :class="cardClass">
            <div class="font-bold dark:text-gray-100">カラー</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">accentColor 等の色定義一覧</div>
          </RouterLink>
        </li>
      </ul>
    </section>
  </div>
</template>
