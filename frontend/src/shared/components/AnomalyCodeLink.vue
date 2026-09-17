<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/app/services/api'
import type { Anomaly } from '@rtl/shared'

/**
 * 跨模块的 SCL 编号链接（如 FloorDeck 情感实体 → 藏书阁异常实体报告单）。
 * 仅当编号数字能匹配到库内 anomalies 记录时渲染为可点击链接，
 * 点击在新标签页打开 /armarium/entities/:id 报告预览；否则保持纯文本。
 */
const props = defineProps<{ code: string }>()

const router = useRouter()
const anomalies = ref<Anomaly[]>([])

/* 模块级缓存（30s TTL）：FloorDeck 一页渲染多行只发一次请求，又不至于整个会话过期。 */
const TTL_MS = 30_000
let cache: { at: number; list: Anomaly[] } | null = null
let inflight: Promise<Anomaly[]> | null = null

async function loadAnomalies(): Promise<Anomaly[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.list
  if (!inflight) {
    inflight = api
      .list<Anomaly>('anomalies')
      .then((list) => {
        cache = { at: Date.now(), list }
        return list
      })
      .catch(() => [] as Anomaly[])
      .finally(() => {
        inflight = null
      })
  }
  return inflight
}

onMounted(() => {
  void loadAnomalies().then((list) => {
    anomalies.value = list
  })
})

function digitsOf(s: string): string {
  return (s || '').replace(/\D/g, '')
}

const match = computed(() => {
  const d = digitsOf(props.code)
  if (!d) return null
  return anomalies.value.find((a) => digitsOf(a.code) === d) ?? null
})

function openReport(): void {
  if (!match.value) return
  // 新标签页打开报告预览（与编辑器窗口策略一致：FloorDeck 的展开状态不丢失）
  window.open(router.resolve(`/armarium/entities/${match.value.id}`).href, '_blank')
}
</script>

<template>
  <span
    v-if="match"
    class="entity-code anomaly-code-link"
    :title="`查看异常实体报告：${match.name || '未命名实体'}`"
    @click.stop="openReport"
  >{{ code }}</span>
  <span v-else class="entity-code">{{ code }}</span>
</template>

<style scoped>
.anomaly-code-link {
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, currentColor 55%, transparent);
  text-underline-offset: 3px;
  transition: color 0.15s ease;
}

/* 提升 specificity：覆盖宿主页面对 .entity-code 的同权重 color 规则 */
.entity-code.anomaly-code-link:hover {
  color: var(--accent, #c04a32);
}
</style>
