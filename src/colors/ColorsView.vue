<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { getBaseColors, getColors, getShowThemeToggle } from '../registryStore'
import { useTheme } from '../lib/theme'
import type { ColorToken } from '../lib/types'

// アプリ全体共通のダーク/ライト切替（選択中の値をスウォッチに表示）
const { isDark, toggle } = useTheme()

const showThemeToggle = getShowThemeToggle()

// モック基本色（options.baseColors）をカラー一覧の先頭に出す
const base = getBaseColors()
const baseTokens: ColorToken[] = base
  ? [
      { name: 'baseBg', light: base.light.bg, dark: base.dark.bg, desc: 'モック画面の背景' },
      { name: 'baseFont', light: base.light.font, dark: base.dark.font, desc: 'モックの基本文字色' },
    ]
  : []
const colors: ColorToken[] = [...baseTokens, ...getColors()]
</script>

<template>
  <div class="min-h-screen p-6">
    <header
      class="mb-5 flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-5 py-3 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
    >
      <RouterLink
        to="/catalog"
        class="text-sm text-gray-500 underline hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
      >
        ← 一覧
      </RouterLink>
      <h1 class="text-lg font-bold">カラー</h1>
      <button
        v-if="showThemeToggle"
        type="button"
        class="ml-auto rounded-md border border-gray-300 px-3 py-1 text-xs font-bold text-gray-600 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        @click="toggle"
      >
        {{ isDark ? 'ライトモード' : 'ダークモード' }}
      </button>
    </header>

    <div class="rounded-lg bg-gray-50 p-5 transition-colors dark:bg-gray-900">
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <div
          v-for="c in colors"
          :key="c.name"
          class="overflow-hidden rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800"
        >
          <div
            class="h-24 w-full border-b border-gray-200 dark:border-gray-700"
            :style="{ background: isDark ? c.dark : c.light }"
          />
          <div class="p-3">
            <div class="font-mono text-sm font-bold dark:text-gray-100">{{ c.name }}</div>
            <div class="mt-1 space-y-0.5 font-mono text-xs">
              <div :class="isDark ? 'text-gray-500' : 'font-bold text-gray-700'">
                light: {{ c.light }}
              </div>
              <div :class="isDark ? 'font-bold text-gray-200' : 'text-gray-500'">
                dark: {{ c.dark }}
              </div>
            </div>
            <div v-if="c.desc" class="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {{ c.desc }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
