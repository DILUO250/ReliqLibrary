<script setup lang="ts">
/**
 * 藏书阁总览 · 下部研究项目极简横条（草稿 2.4 方案 D「双子铭章」落地）。
 *
 * 与草稿 05-方案D-双子铭章.html 对齐：
 * - 横条行：罗马序号 + 项目名/拉丁名 + meta 行 + 「打开 ↗」按钮；
 * - 末尾常驻虚线占位条「更多项目待立项登记」（用户决议：常驻显示）。
 *
 * 与草稿的口径差异（用户决议）：
 * - meta 行 = 「N 株植物 · 立绘 / 卡图 / 云同步」，其中 N 与 pvz_plants 表
 *   实际条目数动态绑定（GET /api/armarium/overview/counts，不在前端硬编码）；
 * - 该风味文本目前是 PVZ 百科的专属后缀（metaSuffix），数据源仍是 DB 的
 *   armarium_projects 行本身——项目名/拉丁名/打开路径全部来自行字段，
 *   禁止把项目卡片硬编码进组件。
 */
import { computed, onMounted, ref } from 'vue'
import { api } from '@/app/services/api'
import type { ArmariumProject } from '@rtl/shared'

const props = defineProps<{
  projects: ArmariumProject[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'open', project: ArmariumProject): void
}>()

/* ---------- 植物图鉴条目数（轻量计数端点，失败时优雅降级为不显示数字） ---------- */

const plantCount = ref<number | null>(null)

onMounted(async () => {
  try {
    plantCount.value = await api.armariumOverviewCounts().then((c) => c.plants)
  } catch {
    plantCount.value = null
  }
})

/** 罗马数字序号（草稿样式 I, II, III…；项目数量级很小，手写映射足够）。 */
const ROMANS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'] as const

function roman(index: number): string {
  return ROMANS[index] ?? String(index + 1)
}

/** PVZ 百科的 meta 风味行：植物数动态绑定；其余项目回退 DB summary 首句。 */
function metaText(project: ArmariumProject): string {
  if (plantCount.value != null && project.path.startsWith('/armarium/project/pvz')) {
    return `${plantCount.value} 株植物 · 立绘 / 卡图 / 云同步`
  }
  const firstSentence = project.summary.split('。')[0]
  return firstSentence ? `${firstSentence}。` : project.repository
}

const countText = computed(() => `${props.projects.length} 项目`)
</script>

<template>
  <section class="projects" aria-labelledby="overview-projects-title">
    <div class="projects__heading">
      <div>
        <span class="projects__eyebrow latin">Research Registry</span>
        <h3 id="overview-projects-title">研究项目</h3>
      </div>
      <span class="projects__count">{{ countText }}</span>
    </div>

    <p v-if="loading" class="projects__loading">读取项目档案中…</p>
    <div v-else class="mini-row">
      <article v-for="(project, i) in projects" :key="project.id" class="mini">
        <span class="mini__no">{{ roman(i) }}</span>
        <div class="mini__body">
          <h4>{{ project.title }}</h4>
          <div class="mini__latin latin">{{ project.latinName }}</div>
          <div class="mini__meta">{{ metaText(project) }}</div>
        </div>
        <button type="button" class="mini__open" @click="emit('open', project)">打开 ↗</button>
      </article>
      <div class="mini mini--empty">更多项目待立项登记</div>
    </div>
  </section>
</template>

<style scoped>
/* ============ 研究项目横条（草稿 05-方案D 逐项复刻） ============ */
.projects {
  border-top: var(--bd-w) var(--bd-style) var(--bd-color);
  padding-top: 24px;
}

.projects__heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 18px;
}

.projects__eyebrow {
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.16em;
  color: var(--accent);
  text-transform: uppercase;
  display: block;
  margin-bottom: 4px;
}

.projects h3 {
  font-size: 22px;
  font-family: var(--font-serif);
  margin: 0;
}

.projects__count {
  color: var(--color-ink-faint);
  font-size: 13px;
}

.projects__loading {
  color: var(--color-ink-faint);
  font-size: 13px;
}

.mini-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 12px;
}

.mini {
  display: flex;
  align-items: center;
  gap: 14px;
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: 10px;
  padding: 14px 16px;
  background: rgba(32, 26, 20, 0.45);
  transition: border-color 0.2s;
}

.mini:hover {
  border-color: color-mix(in srgb, var(--accent) 60%, var(--bd-color));
}

.mini__no {
  font-family: var(--font-display);
  font-size: 12px;
  color: var(--accent);
  flex: none;
  letter-spacing: 0.1em;
}

.mini__body {
  flex: 1;
  min-width: 0;
}

.mini__body h4 {
  font-size: 15px;
  margin: 0;
}

.mini__latin {
  font-size: 9.5px;
  color: var(--accent);
  letter-spacing: 0.12em;
}

.mini__meta {
  font-size: 11px;
  color: var(--color-ink-faint);
  font-family: var(--font-kai);
}

.mini__open {
  flex: none;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--accent) 60%, transparent);
  color: var(--color-ink);
  background: transparent;
  font-family: var(--font-sans);
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.mini__open:hover {
  background: var(--accent);
  color: var(--on-accent);
}

.mini--empty {
  border-style: dashed;
  color: var(--color-ink-faint);
  justify-content: center;
  font-family: var(--font-kai);
  font-size: 13px;
  padding: 18px;
}
</style>
