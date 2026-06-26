<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import ReqScreen from '../ReqScreen.vue'
import { findItem } from '../registryStore'
import { resolveMocks } from '../lib/resolve'
import type { ItemKind } from '../lib/types'

// コンポーネント / 画面の要件ページ共通ビュー。
// registry からアイテムを引き、バージョン（指定 or latest）の表示物を ReqScreen に流す。
const props = defineProps<{
  kind: ItemKind
  name: string
  ver?: string
}>()

const router = useRouter()

const item = computed(() => findItem(props.kind, props.name))
const ver = computed(() => props.ver || item.value?.latest || '')
const entry = computed(() => item.value?.versions[ver.value])
const versionKeys = computed(() => (item.value ? Object.keys(item.value.versions) : []))

const mocks = computed(() => resolveMocks(entry.value))
const showMockTabs = computed(() => mocks.value.length > 1)
const currentMockId = ref('')

const activeMock = computed(
  () => mocks.value.find((x) => x.id === currentMockId.value) ?? mocks.value[0],
)
const activeView = computed(() => activeMock.value?.view)

// 1 mock = 1 md。選択中 mock の要件を表示する。
const doc = computed(() => activeMock.value?.requirements ?? '')

function openPdf() {
  const href = router.resolve(`/print/${props.kind}s/${props.name}`).href
  window.open(href, '_blank')
}

watch(
  () => [entry.value, ver.value] as const,
  () => {
    currentMockId.value = mocks.value[0]?.id ?? ''
  },
  { immediate: true },
)

function changeVer(e: Event) {
  const v = (e.target as HTMLSelectElement).value
  router.push(`/${props.kind}s/${props.name}/${v}`)
}
</script>

<template>
  <ReqScreen v-if="item && entry && activeView !== undefined" :title="item.title" :doc="doc">
    <template #toolbar>
      <label class="flex items-center gap-2 text-sm">
        <span class="text-gray-500 dark:text-gray-400">バージョン</span>
        <select
          :value="ver"
          class="rounded border border-gray-300 bg-white px-2 py-1 text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          @change="changeVer"
        >
          <option v-for="v in versionKeys" :key="v" :value="v">{{ v }}</option>
        </select>
      </label>
      <button
        type="button"
        class="rounded-md border border-gray-300 px-3 py-1 text-xs font-bold text-gray-600 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        @click="openPdf"
      >
        PDF出力
      </button>
    </template>
    <template #mock-controls>
      <div v-if="showMockTabs" class="flex flex-wrap items-center gap-2">
        <span class="text-xs font-bold uppercase tracking-wide text-gray-400">状態</span>
        <div
          class="inline-flex overflow-hidden rounded-md border border-gray-300 text-xs font-bold dark:border-gray-600"
        >
          <button
            v-for="m in mocks"
            :key="m.id"
            type="button"
            :class="[
              'px-3 py-1 transition',
              currentMockId === m.id
                ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
            ]"
            @click="currentMockId = m.id"
          >
            {{ m.label }}
          </button>
        </div>
      </div>
    </template>
    <template #mock>
      <div v-if="typeof activeView === 'string'" v-html="activeView" />
      <component :is="activeView" v-else />
    </template>
  </ReqScreen>

  <div v-else class="p-8">
    <p class="text-gray-600">該当するアイテムが見つかりません: {{ kind }} / {{ name }}</p>
    <RouterLink to="/catalog" class="text-blue-600 underline">← 一覧へ戻る</RouterLink>
  </div>
</template>
