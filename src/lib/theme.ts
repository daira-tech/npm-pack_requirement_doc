import { ref, watch } from 'vue'

// アプリ全体で共有するダーク/ライト状態。html に .dark を付け外しする。
const isDark = ref(false)

watch(
  isDark,
  (dark) => {
    document.documentElement.classList.toggle('dark', dark)
  },
  { immediate: true },
)

export function useTheme() {
  return {
    isDark,
    toggle: () => {
      isDark.value = !isDark.value
    },
  }
}
