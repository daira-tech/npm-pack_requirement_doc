<script setup lang="ts">
import { computed } from 'vue'
import type { DeviceConfig, ItemMeta } from '../lib/types'
import { resolveMocks } from '../lib/resolve'
import { renderMarkdown } from '../lib/markdown'
import PrintMock from './PrintMock.vue'

// 1 アイテム（latest 版）を印刷用に縦積みで描画する。
// 1 mock = 1 md。各 mock を全端末（PC/Phone…）で並べ、その下にその mock の要件を出す。
const props = defineProps<{
  item: ItemMeta
  devices: DeviceConfig[]
  baseStyle: Record<string, string>
  maxWidth: number
}>()

const ver = computed(() => props.item.latest)
const entry = computed(() => props.item.versions[ver.value])
const mocks = computed(() =>
  resolveMocks(entry.value).map((m) => ({ ...m, html: renderMarkdown(m.requirements) })),
)
</script>

<template>
  <article class="print-item">
    <header class="mb-4 border-b border-gray-300 pb-2">
      <h2 class="text-xl font-bold text-gray-900">
        {{ item.title }}
        <span class="ml-2 align-middle text-xs font-normal text-gray-400">
          {{ item.kind === 'page' ? '画面' : '部品' }} / {{ ver }}
        </span>
      </h2>
      <p v-if="item.description" class="mt-1 text-sm text-gray-500">{{ item.description }}</p>
    </header>

    <div class="space-y-8">
      <section v-for="m in mocks" :key="m.id">
        <div
          v-if="mocks.length > 1"
          class="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400"
        >
          {{ m.label }}
        </div>
        <div class="space-y-5">
          <div v-for="d in devices" :key="d.id" class="break-inside-avoid">
            <div v-if="devices.length > 1" class="mb-1 text-[11px] font-bold text-gray-400">
              {{ d.label }}
            </div>
            <PrintMock :view="m.view" :device="d" :base-style="baseStyle" :max-width="maxWidth" />
          </div>
        </div>
        <div v-if="m.requirements" class="mt-4 req-md" v-html="m.html" />
      </section>
    </div>
  </article>
</template>
