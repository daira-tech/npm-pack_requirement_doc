<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import ReqScreen from '../ReqScreen.vue'
import { findItem } from '../registryStore'
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

function changeVer(e: Event) {
  const v = (e.target as HTMLSelectElement).value
  router.push(`/${props.kind}s/${props.name}/${v}`)
}
</script>

<template>
  <ReqScreen v-if="item && entry" :title="item.title" :doc="entry.req">
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
    </template>
    <template #mock>
      <!-- view が文字列なら素の HTML、コンポーネントならそのまま描画 -->
      <div v-if="typeof entry.view === 'string'" v-html="entry.view" />
      <component :is="entry.view" v-else />
    </template>
  </ReqScreen>

  <div v-else class="p-8">
    <p class="text-gray-600">該当するアイテムが見つかりません: {{ kind }} / {{ name }}</p>
    <RouterLink to="/catalog" class="text-blue-600 underline">← 一覧へ戻る</RouterLink>
  </div>
</template>
