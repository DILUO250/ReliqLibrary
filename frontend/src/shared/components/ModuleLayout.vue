<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { ModuleId } from '@/app/router'

const route = useRoute()
const moduleId = computed(() => (route.meta.module as ModuleId | undefined) ?? 'armarium')

const meta = {
  armarium: {
    zh: '藏书阁',
    latin: 'Armarium Absconditorum',
    desc: '研究司书 · 专注于对馆藏书籍进行深度解析与知识挖掘。',
    tabs: [
      { to: '/armarium', label: '总览' },
      { to: '/armarium/entities', label: '异常实体' },
      { to: '/armarium/spaces', label: '超自然空间' },
      { to: '/armarium/books', label: '馆藏书库' },
      { to: '/armarium/repositories', label: '书库体系' },
    ],
  },
  turris: {
    zh: '迎书楼',
    latin: 'Turris Librorum Adventantium',
    desc: '战斗司书 · 驻守图书馆最前线，迎击挑战者与入侵者。',
    tabs: [
      { to: '/turris', label: '总览' },
      { to: '/turris/floors', label: '楼层与司书' },
      { to: '/turris/dictionary', label: '术语字典' },
      { to: '/turris/invitations', label: '邀请函与来宾' },
    ],
  },
  collegium: {
    zh: '寻书社',
    latin: 'Collegium Quaerendorum Librorum',
    desc: '探索司书 · 主动深入外界与底层，侦测并收集流散的情报、知识碎片与潜在威胁。',
    tabs: [
      { to: '/collegium', label: '总览' },
      { to: '/collegium/explorers', label: '求索者与墨工' },
      { to: '/collegium/packs', label: '书页卡册' },
      { to: '/collegium/railway', label: '折射轨道' },
    ],
  },
} as const

const current = computed(() => meta[moduleId.value])

function isActiveTab(to: string): boolean {
  if (to.endsWith(`/${moduleId.value}`)) return route.path === to
  return route.path.startsWith(to)
}
</script>

<template>
  <div class="module-shell" :data-theme="moduleId">
    <div class="module-shell__inner">
      <header class="page-header">
        <div class="page-header__eyebrow latin">{{ current.latin }}</div>
        <h1 class="page-header__title">{{ current.zh }}</h1>
        <p class="page-header__desc">{{ current.desc }}</p>
      </header>

      <nav class="module-tabs">
        <RouterLink
          v-for="tab in current.tabs"
          :key="tab.to"
          :to="tab.to"
          class="module-tabs__link"
          :class="{ 'is-active': isActiveTab(tab.to) }"
        >
          {{ tab.label }}
        </RouterLink>
      </nav>

      <RouterView />
    </div>
  </div>
</template>
