<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ensureTermIndex, termIndexReady, renderTermText, type PrivateTerm } from './renderer'
import { formatToCss } from './format'

const props = defineProps<{ text: string; privateTerms?: PrivateTerm[]; onLight?: boolean }>()

const ready = ref(termIndexReady())

// ready 必须作为响应式依赖参与求值：renderTermText 内部读取模块级 INDEX（非响应式），
// 若不显式依赖 ready，INDEX 填充后 computed 缓存不会失效，词条会永远停留在降级样式。
const segs = computed(() => {
  void ready.value
  return renderTermText(props.text, props.privateTerms ?? [])
})

let retryTimer = 0

onMounted(async () => {
  if (ready.value) return
  await ensureTermIndex()
  if (termIndexReady()) {
    ready.value = true
    return
  }
  // 加载失败（如后端尚未启动）：保持降级渲染，延迟后重试。
  retryTimer = window.setTimeout(async () => {
    await ensureTermIndex()
    if (termIndexReady()) ready.value = true
  }, 3000)
})

onUnmounted(() => window.clearTimeout(retryTimer))
</script>

<template>
  <span class="rt">
    <template v-for="(s, i) in segs" :key="i">
      <span v-if="s.type === 'term'" class="rt-term" :style="formatToCss(s.format, onLight)">{{ s.text }}</span>
      <span v-else-if="s.type === 'unknown'" class="rt-unknown" :title="ready ? '未收录于词典' : ''">{{ s.text }}</span>
      <template v-else>{{ s.text }}</template>
    </template>
  </span>
</template>

<style scoped>
.rt-term {
  color: var(--color-ink);
}
.rt-unknown {
  color: var(--color-ink-faint);
  text-decoration: underline dotted;
  text-underline-offset: 2px;
}
</style>
