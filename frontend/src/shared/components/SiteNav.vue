<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { MODULE_LABELS } from '@/app/labels'
import { loadUiVersion } from '@/app/theme'

const route = useRoute()

// 首页链接感知界面版本：旧版去 /home-v1，新版去 /。
const homeTo = computed(() => (loadUiVersion() === 'legacy' ? '/home-v1' : '/'))

const links = computed(() => [
  { to: homeTo.value, label: '首页' },
  { to: '/armarium', label: MODULE_LABELS.armarium },
  { to: '/turris', label: MODULE_LABELS.turris },
  { to: '/collegium', label: MODULE_LABELS.collegium },
  { to: '/director', label: MODULE_LABELS.director },
  { to: '/factions', label: '相关势力' },
  { to: '/settings', label: '设置' },
])

function isActive(to: string): boolean {
  // 首页在旧版/新版下各有归属路径，active 判断需覆盖两者。
  if (to === homeTo.value) return route.path === '/' || route.path === '/home-v1'
  return route.path.startsWith(to)
}
</script>

<template>
  <header class="site-nav">
    <div class="site-nav__brand">
      <span class="site-nav__brand-main latin">RELIQUIARUM</span>
      <span class="site-nav__brand-sub latin">TO LIBRARY</span>
    </div>
    <RouterLink
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      class="site-nav__link"
      :class="{ 'is-active': isActive(link.to) }"
    >
      {{ link.label }}
    </RouterLink>
  </header>
</template>
