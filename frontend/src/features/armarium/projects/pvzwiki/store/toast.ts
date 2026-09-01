import { reactive } from 'vue'

export const toast = reactive({
  visible: false,
  message: '',
})

let hideTimer: ReturnType<typeof setTimeout> | undefined

export function showToast(message: string, duration = 1500): void {
  toast.message = message
  toast.visible = true
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    toast.visible = false
  }, duration)
}
