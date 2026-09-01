import { reactive } from 'vue'

// Shared UI state for modal overlays, so keyboard shortcuts across
// components can coordinate without conflicting.
export const ui = reactive({
  dictionaryOpen: false,
  syncOpen: false,
})
