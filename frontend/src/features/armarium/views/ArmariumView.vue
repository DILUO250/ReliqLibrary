<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SectionPlaceholder from '@/shared/components/SectionPlaceholder.vue'
import { api } from '@/app/services/api'
import type { ArmariumProject } from '@rtl/shared'

// 藏书阁五 Tab（2026-09 Tab 重构）：Tab 导航由 ModuleLayout 的 module-tabs 渲染
// （路径前缀高亮），本组件只负责按当前路由渲染对应 Tab 的内容——
// 禁止在页面里再画一层 Tab（双层 Tab 事故）。
type TabId = 'overview' | 'entities' | 'spaces' | 'projects' | 'librarians'

const route = useRoute()
const router = useRouter()

const active = computed<TabId>(() => {
  const name = String(route.name ?? '')
  if (name.startsWith('armarium-')) {
    const id = name.replace('armarium-', '') as TabId
    if (['overview', 'entities', 'spaces', 'projects', 'librarians'].includes(id)) return id
  }
  return 'overview'
})

/* ---------- Tab4 研究项目：armarium_projects 表（DB 权威，禁止再硬编码项目数组） ---------- */

const projects = ref<ArmariumProject[]>([])
const loadingProjects = ref(false)

async function loadProjects(): Promise<void> {
  loadingProjects.value = true
  try {
    projects.value = await api.list<ArmariumProject>('armarium_projects')
  } finally {
    loadingProjects.value = false
  }
}

onMounted(() => {
  void loadProjects()
})

function openProject(project: ArmariumProject): void {
  const url = router.resolve(project.path).href
  if (project.openMode === 'tab') {
    window.open(url, '_blank', 'noopener,noreferrer')
    return
  }
  void router.push(project.path)
}
</script>

<template>
  <div class="armarium-page">
    <!-- Tab1 总览（UI 待规划） -->
    <SectionPlaceholder
      v-if="active === 'overview'"
      title="藏书阁总览"
      latin="Conspectus"
      desc="藏书阁的总体概览页。"
      note="总览页 UI 待规划"
    />

    <!-- Tab2 异常实体库（anomalies 表已就绪，UI 待建） -->
    <SectionPlaceholder
      v-else-if="active === 'entities'"
      title="异常实体档案"
      latin="Entitas Anomala"
      desc="藏书阁研究的主要异常对象之一。主要产物：知识，生木髓，情感书页，EGO书页。"
      note="异常实体档案数据待录入"
    />

    <!-- Tab3 超自然空间库（supernatural_spaces 表已就绪，UI 待建） -->
    <SectionPlaceholder
      v-else-if="active === 'spaces'"
      title="超自然空间"
      latin="Spatium Supernaturale"
      desc="遗迹图书馆研究的异常对象之一。主要产物：知识，丰富资源，异常实体。"
      note="超自然空间档案数据待录入"
    />

    <!-- Tab5 书库管理员（librarians 表 department='armarium' 子集，UI 待建） -->
    <SectionPlaceholder
      v-else-if="active === 'librarians'"
      title="书库管理员"
      latin="Librarii Repositoriorum"
      desc="藏书阁司书 · 书记官。展示 department 为 armarium 的司书档案。"
      note="书库管理员数据待录入"
    />

    <!-- Tab4 研究项目 -->
    <template v-else>
      <section class="project-register" aria-labelledby="project-register-title">
        <div class="project-register__heading">
          <div>
            <span class="project-register__eyebrow latin">Research Registry</span>
            <h2 id="project-register-title">研究项目</h2>
          </div>
          <span class="project-register__count">{{ projects.length }} 项目</span>
        </div>

        <p v-if="loadingProjects" class="project-loading">读取项目档案中…</p>
        <div v-else-if="projects.length" class="project-rail">
          <article v-for="project in projects" :key="project.id" class="project-card">
            <div class="project-card__cover" :class="{ 'project-card__cover--empty': !project.cover }">
              <img v-if="project.cover" :src="project.cover" :alt="`${project.title}封面`" />
              <span v-else class="latin">ARCHIVE</span>
              <span class="project-card__status">{{ project.status }}</span>
            </div>
            <div class="project-card__body">
              <div class="project-card__body-code latin">PROJECT // {{ project.id }}</div>
              <h3>{{ project.title }}</h3>
              <p class="project-card__latin latin">{{ project.latinName }}</p>
              <p class="project-card__summary">{{ project.summary }}</p>
              <div class="project-card__meta">
                <span>{{ project.repository }}</span>
                <span>{{ project.openMode === 'tab' ? '独立标签页' : '站内页面' }}</span>
              </div>
              <button type="button" class="project-card__open" @click="openProject(project)">
                <span>打开项目</span>
                <span aria-hidden="true">↗</span>
              </button>
            </div>
          </article>
        </div>
        <p v-else class="project-loading">暂无研究项目档案。</p>
      </section>
    </template>
  </div>
</template>

<style scoped>
.armarium-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}

.project-register {
  border-top: 1px solid var(--color-line);
  padding-top: 22px;
}

.project-register__heading {
  align-items: end;
  display: flex;
  justify-content: space-between;
  margin-bottom: 18px;
}

.project-register__eyebrow {
  color: var(--accent);
  display: block;
  font-size: 11px;
  letter-spacing: 0.16em;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.project-register h2 {
  font-size: 22px;
  margin: 0;
}

.project-register__count {
  color: var(--color-ink-faint);
  font-size: 13px;
}

.project-loading {
  color: var(--color-ink-faint);
  font-size: 13px;
}

.project-rail {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.project-card {
  background: linear-gradient(135deg, rgba(55, 45, 32, 0.9), rgba(34, 27, 20, 0.92));
  border: 1px solid var(--color-line);
  border-radius: calc(var(--radius) * 2);
  display: grid;
  grid-template-columns: minmax(130px, 0.72fr) minmax(0, 1.28fr);
  min-height: 245px;
  overflow: hidden;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.project-card:hover {
  border-color: color-mix(in srgb, var(--accent) 70%, var(--color-line));
  transform: translateY(-3px);
}

.project-card__cover {
  background: #24351f;
  min-height: 245px;
  overflow: hidden;
  position: relative;
}

.project-card__cover::after {
  background: linear-gradient(180deg, transparent 48%, rgba(10, 14, 9, 0.86));
  content: '';
  inset: 0;
  position: absolute;
}

.project-card__cover img {
  height: 100%;
  object-fit: cover;
  opacity: 0.86;
  width: 100%;
}

.project-card__cover--empty {
  align-items: center;
  color: var(--accent);
  display: flex;
  justify-content: center;
}

.project-card__status {
  bottom: 12px;
  color: #e9dfc8;
  font-family: var(--font-sans);
  font-size: 11px;
  left: 14px;
  position: absolute;
  z-index: 1;
}

.project-card__body {
  display: flex;
  flex-direction: column;
  padding: 22px 20px 18px;
}

.project-card__body-code,
.project-card__latin {
  color: var(--color-ink-faint);
  font-size: 10px;
  letter-spacing: 0.08em;
}

.project-card h3 {
  color: var(--color-ink);
  font-size: 21px;
  margin: 14px 0 2px;
}

.project-card__latin {
  color: var(--accent);
  margin: 0;
}

.project-card__summary {
  color: var(--color-ink-dim);
  font-family: var(--font-kai);
  font-size: 13px;
  line-height: 1.7;
  margin: 14px 0;
}

.project-card__meta {
  border-top: 1px solid var(--color-line);
  color: var(--color-ink-faint);
  display: flex;
  font-size: 11px;
  gap: 10px;
  justify-content: space-between;
  padding-top: 10px;
}

.project-card__open {
  align-items: center;
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--accent) 65%, transparent);
  border-radius: var(--radius);
  color: var(--color-ink);
  cursor: pointer;
  display: flex;
  font-family: var(--font-sans);
  font-size: 13px;
  justify-content: space-between;
  margin-top: auto;
  padding: 8px 10px;
  transition: background 0.2s ease, color 0.2s ease;
}

.project-card__open:hover {
  background: var(--accent);
  color: #1b1408;
}

@media (max-width: 600px) {
  .project-card {
    grid-template-columns: 112px minmax(0, 1fr);
  }

  .project-card__cover {
    min-height: 230px;
  }

  .project-card__body {
    padding: 17px 14px 14px;
  }

  .project-card h3 {
    font-size: 18px;
  }
}
</style>
