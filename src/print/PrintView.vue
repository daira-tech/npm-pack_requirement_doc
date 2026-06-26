<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ColorToken, DeviceConfig, ItemKind, ItemMeta } from '../lib/types'
import {
  findItem,
  getBaseColors,
  getColors,
  getComponents,
  getDevices,
  getPages,
} from '../registryStore'
import PrintItem from './PrintItem.vue'

// 印刷専用ビュー。操作 UI なし・ライト固定・縦積みで描画し、表示後に印刷ダイアログを開く。
const props = defineProps<{
  scope: 'all' | 'item'
  kind?: ItemKind
  name?: string
}>()

// 用紙の向き。横長 mock が切れる/崩れるとき用に横にも切り替えられる。
const orientation = ref<'portrait' | 'landscape'>('portrait')
// 向きに応じて mock の最大幅（縮尺の基準）を変える（A4・余白 12mm の概算）
const MAX_WIDTH = computed(() => (orientation.value === 'landscape' ? 1000 : 680))

const fallbackDevice: DeviceConfig = {
  id: 'default',
  label: '',
  frame: 'pc',
  minWidth: 480,
  maxWidth: 480,
}
// 全端末（PC / Phone / Tablet …）を出力対象にする
const devices = computed<DeviceConfig[]>(() => {
  const ds = getDevices()
  return ds.length ? ds : [fallbackDevice]
})

// PDF はライト固定。baseColors のライト値だけを使う。
const baseColors = getBaseColors()
const baseStyle = computed<Record<string, string>>(() => {
  const s: Record<string, string> = {}
  if (baseColors) {
    s.background = baseColors.light.bg
    s.color = baseColors.light.font
  }
  return s
})

const items = computed<ItemMeta[]>(() => {
  if (props.scope === 'item') {
    const it = props.kind && props.name ? findItem(props.kind, props.name) : undefined
    return it ? [it] : []
  }
  return [...getPages(), ...getComponents()]
})

// カラー一覧（全体出力時のみ）。base 値を先頭に、ライト値で表示。
const colors = computed<ColorToken[]>(() => {
  if (props.scope !== 'all') return []
  const base = getBaseColors()
  const baseTokens: ColorToken[] = base
    ? [
        { name: 'baseBg', light: base.light.bg, dark: base.dark.bg, description: 'モック画面の背景' },
        { name: 'baseFont', light: base.light.font, dark: base.dark.font, description: 'モックの基本文字色' },
      ]
    : []
  return [...baseTokens, ...getColors()]
})

const title = computed(() => (props.scope === 'all' ? '要件書（全体）' : items.value[0]?.title ?? '要件書'))

function print() {
  window.print()
}

function close() {
  window.close()
}

// @page の向きは CSS クラスで切り替えられないため、style 要素を動的に書き換える。
let pageStyle: HTMLStyleElement | null = null
function applyPageSize() {
  if (!pageStyle) {
    pageStyle = document.createElement('style')
    document.head.appendChild(pageStyle)
  }
  pageStyle.textContent = `@page { size: A4 ${orientation.value}; margin: 12mm; }`
}
watch(orientation, applyPageSize)

onMounted(() => {
  applyPageSize()
  // mock の縮尺計測が落ち着いてから印刷ダイアログを開く（端末数が増える分やや長めに待つ）
  nextTick(() => {
    if (items.value.length) setTimeout(print, 800)
  })
})

onBeforeUnmount(() => pageStyle?.remove())
</script>

<template>
  <div class="print-root min-h-screen bg-gray-100">
    <!-- 画面表示時のみのツールバー（印刷には出さない） -->
    <div
      class="print-hide sticky top-0 z-10 flex items-center gap-3 border-b border-gray-300 bg-white px-5 py-3"
    >
      <h1 class="text-sm font-bold text-gray-700">{{ title }}（印刷プレビュー）</h1>
      <div class="ml-auto flex items-center gap-2">
        <div class="inline-flex overflow-hidden rounded-md border border-gray-300 text-xs font-bold">
          <button
            type="button"
            :class="[
              'px-3 py-1 transition',
              orientation === 'portrait' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100',
            ]"
            @click="orientation = 'portrait'"
          >
            縦
          </button>
          <button
            type="button"
            :class="[
              'px-3 py-1 transition',
              orientation === 'landscape' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100',
            ]"
            @click="orientation = 'landscape'"
          >
            横
          </button>
        </div>
        <button
          type="button"
          class="rounded-md bg-blue-600 px-3 py-1 text-xs font-bold text-white transition hover:bg-blue-700"
          @click="print"
        >
          印刷 / PDF保存
        </button>
        <button
          type="button"
          class="rounded-md border border-gray-300 px-3 py-1 text-xs font-bold text-gray-600 transition hover:bg-gray-100"
          @click="close"
        >
          閉じる
        </button>
      </div>
    </div>

    <!-- 印刷される本体（画面プレビューの幅は向きに合わせる。印刷時は CSS でリセット） -->
    <div
      class="print-page mx-auto bg-white px-10 py-10 text-gray-900"
      :style="{ maxWidth: orientation === 'landscape' ? '1120px' : '760px' }"
    >
      <div v-if="!items.length" class="text-gray-500">出力対象がありません。</div>

      <template v-else>
        <template v-for="(it, idx) in items" :key="it.kind + '/' + it.name">
          <div :class="idx > 0 ? 'print-break pt-10' : ''">
            <PrintItem
              :item="it"
              :devices="devices"
              :base-style="baseStyle"
              :max-width="MAX_WIDTH"
            />
          </div>
        </template>

        <!-- カラー一覧（全体出力時） -->
        <div v-if="colors.length" class="print-break pt-10">
          <h2 class="mb-4 border-b border-gray-300 pb-2 text-xl font-bold text-gray-900">カラー</h2>
          <div class="grid grid-cols-3 gap-4">
            <div
              v-for="c in colors"
              :key="c.name"
              class="break-inside-avoid overflow-hidden rounded-lg border border-gray-300"
            >
              <div class="h-16 w-full border-b border-gray-200" :style="{ background: c.light }" />
              <div class="p-2">
                <div class="font-mono text-xs font-bold text-gray-900">{{ c.name }}</div>
                <div class="mt-1 font-mono text-[11px] text-gray-600">light: {{ c.light }}</div>
                <div class="font-mono text-[11px] text-gray-500">dark: {{ c.dark }}</div>
                <div v-if="c.description" class="mt-1 text-[11px] text-gray-600">
                  {{ c.description }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
