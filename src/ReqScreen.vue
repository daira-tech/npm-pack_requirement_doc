<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { renderMarkdown } from './lib/markdown'
import { useTheme } from './lib/theme'
import { getBaseColors, getDevices, getShowThemeToggle } from './registryStore'
import MockDeviceFrame from './MockDeviceFrame.vue'

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
  if (!baseColors) return {}
  const c = isDark.value ? baseColors.dark : baseColors.light
  return { background: c.bg, color: c.font }
})

// mock は指定 px の実寸でレイアウトし、ペース幅に収まらなければ全体を縮小（縮尺）して表示する。
const areaRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const availableWidth = ref(0)
const contentHeight = ref(0)
const contentOuterWidth = ref(0)
const preview = ref(false)

// 選択中端末の minWidth / maxWidth の範囲で幅をドラッグ変更する。
const viewportWidth = ref<number | null>(null)

const widthBounds = computed(() => {
  const d = current.value
  if (!d) return { min: 0, max: 0 }
  return { min: d.minWidth, max: d.maxWidth }
})

function resolveWidth(): number {
  const d = current.value
  if (!d) return 0
  const chosen = viewportWidth.value ?? d.minWidth
  return Math.min(d.maxWidth, Math.max(d.minWidth, chosen))
}

const layoutWidth = computed(() => resolveWidth())
const canResize = computed(() => {
  const d = current.value
  return !!d && d.minWidth < d.maxWidth
})

// 詳細表示のみ縮尺。プレビューは 1:1 表示（縮小は詳細側で行う）。
const scale = computed(() => {
  if (preview.value) return 1
  const w = contentOuterWidth.value || layoutWidth.value
  if (!w || availableWidth.value === 0) return 1
  return Math.min(1, availableWidth.value / w)
})
const scaledWidth = computed(() => {
  const w = contentOuterWidth.value || layoutWidth.value
  return w ? w * scale.value : 0
})
const scaledHeight = computed(() => contentHeight.value * scale.value)

// プレビューでビュー幅がブラウザより狭いときだけ枠を出す（同幅なら枠なし）。
const showPreviewFrame = computed(
  () =>
    preview.value &&
    layoutWidth.value > 0 &&
    availableWidth.value > 0 &&
    layoutWidth.value < availableWidth.value,
)

const resizing = ref(false)
let resizeStartX = 0
let resizeStartWidth = 0
let resizeStartScale = 1

function setViewportWidth(w: number) {
  const d = current.value
  if (!d) return
  viewportWidth.value = Math.min(d.maxWidth, Math.max(d.minWidth, w))
}

function selectDevice(id: string) {
  const w = layoutWidth.value
  currentId.value = id
  setViewportWidth(w)
}

function onResizeStart(e: PointerEvent) {
  if (!current.value || !canResize.value) return
  e.preventDefault()
  e.stopPropagation()
  const handle = e.currentTarget as HTMLElement
  handle.setPointerCapture(e.pointerId)
  resizing.value = true
  resizeStartX = e.clientX
  resizeStartWidth = layoutWidth.value
  resizeStartScale = scale.value
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'ew-resize'

  function onMove(ev: PointerEvent) {
    if (!ev.isPrimary) return
    const delta = (ev.clientX - resizeStartX) / resizeStartScale
    setViewportWidth(resizeStartWidth + delta)
  }

  function onUp(ev: PointerEvent) {
    if (!ev.isPrimary) return
    handle.releasePointerCapture(ev.pointerId)
    resizing.value = false
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
    handle.removeEventListener('pointermove', onMove)
    handle.removeEventListener('pointerup', onUp)
    handle.removeEventListener('pointercancel', onUp)
    nextTick(measure)
  }

  handle.addEventListener('pointermove', onMove)
  handle.addEventListener('pointerup', onUp)
  handle.addEventListener('pointercancel', onUp)
}

let observer: ResizeObserver | null = null

function measure() {
  if (areaRef.value) availableWidth.value = areaRef.value.clientWidth
  if (contentRef.value) {
    contentHeight.value = contentRef.value.offsetHeight
    contentOuterWidth.value = contentRef.value.offsetWidth
  }
}

// 通常表示 / プレビューで計測対象の DOM が入れ替わるので observe を貼り直す
function observeTargets() {
  observer?.disconnect()
  if (areaRef.value) observer?.observe(areaRef.value)
  if (contentRef.value) observer?.observe(contentRef.value)
}

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

// 端末切替・プレビュー切替・幅変更で利用可能幅や高さ・計測対象が変わるため測り直す
watch([currentId, preview, layoutWidth], () =>
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
          <div class="flex items-center gap-3">
            <span v-if="current" class="font-mono text-xs text-gray-500 dark:text-gray-400">
              {{ layoutWidth }}px
              <span v-if="canResize" class="text-gray-400">
                （{{ widthBounds.min }}–{{ widthBounds.max }}）
              </span>
            </span>
            <div
              v-if="devices.length > 1"
              class="inline-flex overflow-hidden rounded-md border border-gray-300 text-xs font-bold dark:border-gray-600"
              :class="resizing ? 'pointer-events-none' : ''"
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
                @click="selectDevice(d.id)"
              >
                {{ d.label }}
              </button>
            </div>
          </div>
        </div>
        <!-- 指定 px で実寸レイアウトし、ペースに収まらなければ全体を縮小（縮尺）表示 -->
        <div class="rounded-md bg-white p-4 transition-colors dark:bg-gray-800">
          <div ref="areaRef">
            <!-- 縮小後のサイズ分だけ場所を確保する箱（中央寄せ） -->
            <div
              v-if="current"
              class="relative mx-auto overflow-hidden"
              :style="{
                width: scaledWidth ? `${scaledWidth}px` : '',
                height: contentHeight ? `${scaledHeight}px` : 'auto',
              }"
            >
              <!-- 実寸の中身。transform で左上基準に縮小する -->
              <div
                ref="contentRef"
                class="origin-top-left w-fit"
                :style="{ transform: `scale(${scale})` }"
              >
                <MockDeviceFrame
                  v-if="current"
                  :frame="current.frame"
                  :screen-width="layoutWidth"
                  :base-style="baseStyle"
                >
                  <slot name="mock" />
                </MockDeviceFrame>
              </div>
              <!-- 右端をドラッグして min〜max の範囲で幅を変更 -->
              <div
                v-if="canResize"
                class="absolute inset-y-0 -right-1 z-20 flex w-3 cursor-ew-resize touch-none items-center justify-center"
                :class="resizing ? 'opacity-100' : 'opacity-60 hover:opacity-100'"
                @pointerdown="onResizeStart"
              >
                <div
                  class="h-10 w-1 rounded-full bg-gray-400 dark:bg-gray-500"
                  :class="resizing ? 'bg-blue-500 dark:bg-blue-400' : ''"
                />
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

  <!-- 全画面プレビュー：1:1 表示。ブラウザ幅より狭いときだけ枠を出す -->
  <div v-else class="fixed inset-0 z-50 overflow-auto bg-[#e8eaed] dark:bg-[#141414]">
    <button
      type="button"
      class="fixed right-4 top-4 z-10 rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-bold text-gray-700 shadow-sm transition hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
      @click="preview = false"
    >
      閉じる（Esc）
    </button>
    <div ref="areaRef" class="flex min-h-full w-full justify-center">
      <div
        v-if="current"
        class="relative w-fit shrink-0"
        :class="
          showPreviewFrame
            ? 'border border-gray-300 shadow-lg dark:border-gray-600'
            : ''
        "
      >
        <div ref="contentRef" class="w-fit">
          <MockDeviceFrame
            v-if="current"
            :frame="current.frame"
            :screen-width="layoutWidth"
            :base-style="baseStyle"
          >
            <slot name="mock" />
          </MockDeviceFrame>
        </div>
        <div
          v-if="canResize"
          class="absolute inset-y-0 -right-1 z-20 flex w-3 cursor-ew-resize touch-none items-center justify-center opacity-60 hover:opacity-100"
          :class="resizing ? 'opacity-100' : ''"
          @pointerdown="onResizeStart"
        >
          <div
            class="h-10 w-1 rounded-full bg-gray-400 dark:bg-gray-500"
            :class="resizing ? 'bg-blue-500 dark:bg-blue-400' : ''"
          />
        </div>
      </div>
    </div>
  </div>
</template>
