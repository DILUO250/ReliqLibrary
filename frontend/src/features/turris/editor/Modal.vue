<script setup lang="ts">
defineProps<{ title: string; wide?: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <div class="modal-overlay">
    <div class="modal" :class="{ 'modal--wide': wide }" role="dialog">
      <header class="modal__head">
        <h2>{{ title }}</h2>
        <button class="modal__close" @click="emit('close')">✕</button>
      </header>
      <div class="modal__body">
        <slot />
      </div>
      <footer v-if="$slots.footer" class="modal__foot">
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(16, 13, 9, 0.78);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
}
.modal {
  width: 720px;
  max-width: 100%;
  max-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: 1px solid var(--color-line);
  border-radius: calc(var(--radius) * 2);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}
.modal--wide {
  width: 1080px;
}
.modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-line);
  flex-shrink: 0;
}
.modal__head h2 {
  margin: 0;
  font-size: 19px;
  color: var(--accent);
}
.modal__close {
  background: none;
  border: none;
  color: var(--color-ink-faint);
  font-size: 20px;
  cursor: pointer;
}
.modal__body {
  padding: 20px;
  overflow-y: auto;
}
.modal__foot {
  padding: 14px 20px;
  border-top: 1px solid var(--color-line);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-shrink: 0;
}
</style>
