<script setup lang="ts">
import { toast } from '@/app/stores/toast'
</script>

<template>
  <Transition name="toast">
    <div v-if="toast.visible" class="toast" role="status">{{ toast.message }}</div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  top: 1.25rem;
  left: 50%;
  z-index: 9999;
  color: var(--color-ink);
  background: rgba(24, 19, 13, 0.94);
  border: 1px solid var(--accent);
  border-radius: 8px;
  padding: 0.65rem 1.4rem;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.28);
  transform: translate(-50%, 0);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}
</style>
