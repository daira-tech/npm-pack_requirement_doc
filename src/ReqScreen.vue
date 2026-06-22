<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { renderMarkdown } from './lib/markdown'
import { useTheme } from './lib/theme'
import { getBaseColors, getDevices, getShowThemeToggle } from './registryStore'

// 図の額縁（画面名ヘッダ / 左モック / 右マークダウン）を 1 か所に固定する。
// 各ページはこれをラップし、mock スロットと doc(md 文字列) を渡すだけ。
const props = defineProps<{
  title: string
  doc: string
}>()

const html = computed(() => renderMarkdown(props.doc))

// アプリ全体共通のダーク/ライト切替
const { isDark, toggle } = useTheme()

// 表示オプション（注入された端末構成 / ダークボタンの有無）
const showThemeToggle = getShowThemeToggle()
const devices = getDevices()

// mock の表示端末切替
const currentId = ref(devices[0]?.id ?? '')
const current = computed(() => devices.find((d) => d.id === currentId.value) ?? devices[0])

function toPx(w: number): string {
  return `${w}px`
}

// モック画面の基本色（ライト/ダーク）。テーマに応じて背景・文字色を切り替える。
const baseColors = getBaseColors()
const baseStyle = computed(() => {
  const c = isDark.value ? baseColors.dark : baseColors.light
  return { background: c.bg, color: c.font }
})

// mock は指定 px の実寸でレイアウトし、ペース幅に収まらなければ全体を縮小（縮尺）して表示する。
const areaRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const availableWidth = ref(0)
const contentHeight = ref(0)

// 拡大はせず（最大 1x）、はみ出すときだけ縮小する
const scale = computed(() => {
  const w = current.value?.width ?? 0
  if (!w || availableWidth.value === 0) return 1
  return Math.min(1, availableWidth.value / w)
})
const scaledWidth = computed(() => (current.value ? current.value.width * scale.value : 0))
const scaledHeight = computed(() => contentHeight.value * scale.value)

let observer: ResizeObserver | null = null

function measure() {
  if (areaRef.value) availableWidth.value = areaRef.value.clientWidth
  if (contentRef.value) contentHeight.value = contentRef.value.offsetHeight
}

// 通常表示 / プレビューで計測対象の DOM が入れ替わるので observe を貼り直す
function observeTargets() {
  observer?.disconnect()
  if (areaRef.value) observer?.observe(areaRef.value)
  if (contentRef.value) observer?.observe(contentRef.value)
}

// 余計なものを出さず、画面そのものだけを全画面で見せるプレビューモード
const preview = ref(false)

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') preview.value = false
}

onMounted(() => {
  observer = new ResizeObserver(() => measure())
  observeTargets()
  measure()
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('keydown', onKeydown)
})

// 端末切替・プレビュー切替で利用可能幅や高さ・計測対象が変わるため測り直す
watch([currentId, preview], () =>
  nextTick(() => {
    observeTargets()
    measure()
  }),
)
</script>

<template>
  <!-- 通常表示（ヘッダ / 左 mock / 右 要件） -->
  <div v-if="!preview" class="min-h-screen p-6">
    <header
      class="mb-5 flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-5 py-3 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
    >
      <RouterLink
        to="/catalog"
        class="text-sm text-gray-500 underline hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
      >
        ← 一覧
      </RouterLink>
      <h1 class="text-lg font-bold">{{ title }}</h1>
      <div class="ml-auto flex items-center gap-3">
        <slot name="toolbar" />
        <button
          type="button"
          class="rounded-md border border-gray-300 px-3 py-1 text-xs font-bold text-gray-600 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="preview = !preview"
        >
          {{ preview ? '要件を表示' : 'プレビュー' }}
        </button>
        <button
          v-if="showThemeToggle"
          type="button"
          class="rounded-md border border-gray-300 px-3 py-1 text-xs font-bold text-gray-600 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          @click="toggle"
        >
          {{ isDark ? 'ライトモード' : 'ダークモード' }}
        </button>
      </div>
    </header>

    <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6">
      <!-- 左: 画面 mock -->
      <section
        class="rounded-lg border border-gray-300 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="mb-3 flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wide text-gray-400">
            画面 mock
          </span>
          <div
            v-if="devices.length > 1"
            class="inline-flex overflow-hidden rounded-md border border-gray-300 text-xs font-bold dark:border-gray-600"
          >
            <button
              v-for="d in devices"
              :key="d.id"
              type="button"
              :class="[
                'px-3 py-1 transition',
                currentId === d.id
                  ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
              ]"
              @click="currentId = d.id"
            >
              {{ d.label }}
            </button>
          </div>
        </div>
        <!-- 指定 px で実寸レイアウトし、ペースに収まらなければ全体を縮小（縮尺）表示 -->
        <div class="rounded-md bg-white p-4 transition-colors dark:bg-gray-800">
          <div ref="areaRef">
            <!-- 縮小後のサイズ分だけ場所を確保する箱（中央寄せ） -->
            <div
              v-if="current"
              class="mx-auto overflow-hidden"
              :style="{
                width: scaledWidth ? `${scaledWidth}px` : '',
                height: contentHeight ? `${scaledHeight}px` : 'auto',
              }"
            >
              <!-- 実寸の中身。transform で左上基準に縮小する -->
              <div
                ref="contentRef"
                class="origin-top-left"
                :style="{ width: toPx(current.width), transform: `scale(${scale})` }"
              >
                <!-- Phone / Tablet: ベゼル付き端末風フレーム（phone はノッチあり） -->
                <div
                  v-if="current.frame === 'phone' || current.frame === 'tablet'"
                  class="w-full"
                >
                  <div class="rounded-[2.5rem] bg-black p-3 shadow-xl">
                    <div class="relative overflow-hidden rounded-[1.8rem]">
                      <!-- ノッチ（phone のみ） -->
                      <div
                        v-if="current.frame === 'phone'"
                        class="pointer-events-none absolute left-1/2 top-0 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-black"
                      />
                      <!-- 画面（基本色は options.baseColors） -->
                      <div
                        class="px-4 pb-6"
                        :class="current.frame === 'phone' ? 'pt-9' : 'pt-6'"
                        :style="baseStyle"
                      >
                        <slot name="mock" />
                        <!-- ホームインジケータ -->
                        <div
                          class="mx-auto mt-6 h-1 w-24 rounded-full bg-gray-300 dark:bg-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- PC: ブラウザ/モニター風フレーム＋画面 -->
                <div
                  v-else
                  class="w-full overflow-hidden rounded-xl border-2 border-gray-300 shadow-sm dark:border-gray-700"
                >
                  <!-- ツールバー -->
                  <div
                    class="flex items-center gap-2 border-b border-gray-300 bg-gray-800 px-3 py-2 dark:border-gray-700"
                  >
                    <span class="h-3 w-3 rounded-full bg-red-400" />
                    <span class="h-3 w-3 rounded-full bg-yellow-400" />
                    <span class="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <!-- 画面（基本色は options.baseColors） -->
                  <div class="p-4" :style="baseStyle">
                    <slot name="mock" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 右: 要件（マークダウン） -->
      <section
        class="rounded-lg border border-gray-300 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">
          要件
        </div>
        <div class="req-md" v-html="html" />
      </section>
    </div>
  </div>

  <!-- 全画面プレビュー：画面そのものだけを縮尺表示（枠・ヘッダ・ラベルなし） -->
  <div v-else class="fixed inset-0 z-50 overflow-auto" :style="baseStyle">
    <button
      type="button"
      class="fixed right-4 top-4 z-10 rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-bold text-gray-700 shadow-sm transition hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
      @click="preview = false"
    >
      閉じる（Esc）
    </button>
    <div ref="areaRef" class="min-h-full">
      <div
        v-if="current"
        class="mx-auto overflow-hidden"
        :style="{
          width: scaledWidth ? `${scaledWidth}px` : '',
          height: contentHeight ? `${scaledHeight}px` : 'auto',
        }"
      >
        <div
          ref="contentRef"
          class="origin-top-left"
          :style="{ width: toPx(current.width), transform: `scale(${scale})` }"
        >
          <slot name="mock" />
        </div>
      </div>
    </div>
  </div>
</template>
