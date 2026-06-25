<script setup lang="ts">
defineProps<{
  frame: 'pc' | 'phone' | 'tablet'
  /** mock の viewport 幅（px）。ノッチ・ベゼルはこの外側の装飾 */
  screenWidth: number
  baseStyle: Record<string, string>
}>()

function toPx(w: number): string {
  return `${w}px`
}
</script>

<template>
  <!-- Phone / Tablet: ベゼルは外側。画面幅 = screenWidth -->
  <div v-if="frame === 'phone' || frame === 'tablet'" class="inline-block">
    <div class="rounded-[2.5rem] bg-black p-3 shadow-xl">
      <div
        class="relative overflow-hidden rounded-[1.8rem]"
        :style="{ width: toPx(screenWidth), ...baseStyle }"
      >
        <!-- ノッチは重ね表示。viewport 幅・padding は食わない -->
        <div
          v-if="frame === 'phone'"
          class="pointer-events-none absolute left-1/2 top-0 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-black"
        />
        <slot />
        <div
          class="pointer-events-none absolute bottom-2 left-1/2 z-10 h-1 w-24 -translate-x-1/2 rounded-full bg-gray-300 dark:bg-gray-600"
        />
      </div>
    </div>
  </div>

  <!-- PC: ツールバー + 画面。画面幅 = screenWidth -->
  <div
    v-else
    class="inline-block overflow-hidden rounded-xl border-2 border-gray-300 shadow-sm dark:border-gray-700"
    :style="{ width: toPx(screenWidth) }"
  >
    <div
      class="flex items-center gap-2 border-b border-gray-300 bg-gray-800 px-3 py-2 dark:border-gray-700"
    >
      <span class="h-3 w-3 rounded-full bg-red-400" />
      <span class="h-3 w-3 rounded-full bg-yellow-400" />
      <span class="h-3 w-3 rounded-full bg-green-400" />
    </div>
    <div :style="baseStyle">
      <slot />
    </div>
  </div>
</template>
