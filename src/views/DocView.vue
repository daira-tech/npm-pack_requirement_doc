<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { findDocument, getShowThemeToggle } from '../registryStore'
import { renderMarkdown } from '../lib/markdown'
import { useTheme } from '../lib/theme'

const route = useRoute()
const router = useRouter()
const { isDark, toggle } = useTheme()
const showThemeToggle = getShowThemeToggle()

const doc = computed(() => findDocument(String(route.params.name)))
const html = computed(() => (doc.value ? renderMarkdown(doc.value.content) : ''))

function openPdf() {
  const href = router.resolve(`/print/docs/${route.params.name}`).href
  window.open(href, '_blank')
}
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
      <h1 class="text-lg font-bold">{{ doc?.title ?? 'ドキュメント' }}</h1>
      <button
        v-if="doc"
        type="button"
        class="rounded-md border border-gray-300 px-3 py-1 text-xs font-bold text-gray-600 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        @click="openPdf"
      >
        PDF出力
      </button>
      <button
        v-if="showThemeToggle"
        type="button"
        class="ml-auto rounded-md border border-gray-300 px-3 py-1 text-xs font-bold text-gray-600 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        @click="toggle"
      >
        {{ isDark ? 'ライトモード' : 'ダークモード' }}
      </button>
    </header>

    <div
      v-if="doc"
      class="mx-auto max-w-3xl rounded-lg bg-gray-50 p-6 transition-colors dark:bg-gray-900"
    >
      <div class="req-md" v-html="html" />
    </div>
    <div v-else class="text-gray-500 dark:text-gray-400">ドキュメントが見つかりません。</div>
  </div>
</template>
