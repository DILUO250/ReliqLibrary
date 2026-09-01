<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

type ProjectOpenMode = 'tab' | 'spa'

interface ArmariumProject {
  id: string
  title: string
  latin: string
  repository: string
  summary: string
  status: string
  openMode: ProjectOpenMode
  path: string
  cover?: string
}

const projects: ArmariumProject[] = [
  {
    id: 'pvz',
    title: '植物大战僵尸百科',
    latin: 'Plants vs. Zombies Almanac',
    repository: '生命自然研究书库',
    summary: '对泡沫世界植物样本的系统化归档，记录其生态谱系、世界来源与战术特征。',
    status: '已收容 · 可访问',
    openMode: 'tab',
    path: '/armarium/project/pvz',
    cover: '/features/armarium/projects/pvzwiki/assets/pvzg_nav.webp',
  },
]

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
  <div class="armarium-overview">
    <header class="page-header">
      <div class="page-header__eyebrow latin">Armarium Absconditorum</div>
      <h1 class="page-header__title">藏书阁项目总览</h1>
      <p class="page-header__desc">
        研究司书的项目档案。大型项目以独立标签页展开，简单项目可在主站内以 SPA 形式继续浏览。
      </p>
    </header>

    <section class="project-register" aria-labelledby="project-register-title">
      <div class="project-register__heading">
        <div>
          <span class="project-register__eyebrow latin">Research Registry</span>
          <h2 id="project-register-title">研究项目</h2>
        </div>
        <span class="project-register__count">{{ projects.length }} 项目</span>
      </div>

      <div class="project-rail">
        <article v-for="project in projects" :key="project.id" class="project-card">
          <div class="project-card__cover" :class="{ 'project-card__cover--empty': !project.cover }">
            <img v-if="project.cover" :src="project.cover" :alt="`${project.title}封面`" />
            <span v-else class="latin">ARCHIVE</span>
            <span class="project-card__status">{{ project.status }}</span>
          </div>
          <div class="project-card__body">
            <div class="project-card__code latin">PROJECT // {{ project.id.toUpperCase() }}</div>
            <h3>{{ project.title }}</h3>
            <p class="project-card__latin latin">{{ project.latin }}</p>
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
    </section>
  </div>
</template>

<style scoped>
.armarium-overview {
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

.project-card__code,
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
