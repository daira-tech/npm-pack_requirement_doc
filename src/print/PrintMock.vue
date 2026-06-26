<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { Component } from 'vue'
import type { DeviceConfig } from '../lib/types'
import MockDeviceFrame from '../MockDeviceFrame.vue'

// 印刷用 mock。端末枠付きで実寸描画し、ページ幅に収まるよう縮尺する（拡大はしない）。
const props = defineProps<{
  view: string | Component
  device: DeviceConfig
  baseStyle: Record<string, string>
  maxWidth: number
}>()

const contentRef = ref<HTMLElement | null>(null)
const naturalW = ref(0)
const naturalH = ref(0)

function measure() {
  if (!contentRef.value) return
  naturalW.value = contentRef.value.offsetWidth
  naturalH.value = contentRef.value.offsetHeight
}

const scale = computed(() => (naturalW.value ? Math.min(1, props.maxWidth / naturalW.value) : 1))
// 縮尺で生じる余白を負マージンで回収する。高さは固定せず overflow も切らないので、
// 計測が未確定でもクリップされず常に全体が表示される。
const marginBottom = computed(() =>
  naturalH.value ? `${-naturalH.value * (1 - scale.value)}px` : '0px',
)
const marginRight = computed(() =>
  naturalW.value ? `${-naturalW.value * (1 - scale.value)}px` : '0px',
)

let observer: ResizeObserver | null = null
onMounted(() => {
  observer = new ResizeObserver(() => measure())
  if (contentRef.value) observer.observe(contentRef.value)
  nextTick(measure)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div
    ref="contentRef"
    class="origin-top-left w-fit"
    :style="{ transform: `scale(${scale})`, marginBottom, marginRight }"
  >
    <MockDeviceFrame :frame="device.frame" :screen-width="device.minWidth" :base-style="baseStyle">
      <div v-if="typeof view === 'string'" v-html="view" />
      <component :is="view" v-else />
    </MockDeviceFrame>
  </div>
</template>
