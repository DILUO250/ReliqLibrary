<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const projectId = computed(() => String(route.params.projectId ?? ''))
</script>

<template>
  <section class="project-placeholder">
    <p class="project-placeholder__eyebrow latin">Armarium Project // {{ projectId }}</p>
    <h1>项目入口已预留</h1>
    <p>该项目可以在这里以 SPA 形式运行，也可以切换为独立标签页入口。</p>
    <button type="button" @click="router.push('/armarium')">返回藏书阁</button>
  </section>
</template>

<style scoped>
.project-placeholder {
  border: 1px dashed var(--color-line);
  border-radius: calc(var(--radius) * 2);
  padding: 48px 24px;
  text-align: center;
}

.project-placeholder__eyebrow {
  color: var(--accent);
  font-size: 12px;
}

.project-placeholder p {
  color: var(--color-ink-dim);
}

.project-placeholder button {
  background: var(--accent);
  border: 0;
  border-radius: var(--radius);
  color: #1b1408;
  cursor: pointer;
  font: inherit;
  padding: 8px 14px;
}
</style>
