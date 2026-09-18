<script setup lang="ts">
import { onMounted, onUnmounted, reactive } from 'vue'
import { api } from '@/app/services/api'

// 写后自动备份提示：轮询 /api/backup/status，版本号变化（= 后台快照已落盘）时
// 在右上角短暂显示"数据已备份"。轮询开销极小（本地 JSON），后端未就绪时静默跳过。
const state = reactive({ visible: false })

const POLL_MS = 3000
const HIDE_MS = 2000

let hideTimer: ReturnType<typeof setTimeout> | undefined
let pollTimer: ReturnType<typeof setInterval> | undefined
let lastVersion = -1

async function check(): Promise<void> {
  try {
    const s = await api.backupStatus()
    if (lastVersion === -1) {
      lastVersion = s.version
      return
    }
    if (s.version !== lastVersion) {
      lastVersion = s.version
      state.visible = true
      if (hideTimer) clearTimeout(hideTimer)
      hideTimer = setTimeout(() => {
        state.visible = false
      }, HIDE_MS)
    }
  } catch {
    // 后端未启动/网络异常：静默，下一轮再试
  }
}

onMounted(() => {
  void check()
  pollTimer = setInterval(() => {
    void check()
  }, POLL_MS)
})
onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
  if (hideTimer) clearTimeout(hideTimer)
})
</script>

<template>
  <Transition name="backup-toast">
    <div v-if="state.visible" class="backup-toast" role="status">数据已备份</div>
  </Transition>
</template>

<style scoped>
.backup-toast {
  position: fixed;
  top: 1.25rem;
  right: 1.25rem;
  z-index: 9999;
  color: var(--color-ink);
  background: rgba(24, 19, 13, 0.94);
  border: var(--bd-w) var(--bd-style) var(--accent);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.28);
}

.backup-toast-enter-active,
.backup-toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.backup-toast-enter-from,
.backup-toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
