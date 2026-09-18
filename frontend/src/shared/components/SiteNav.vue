<script setup lang="ts">
import { useRoute } from 'vue-router'
import { MODULE_LABELS } from '@/app/labels'

const route = useRoute()

const links = [
  { to: '/', label: '首页' },
  { to: '/armarium', label: MODULE_LABELS.armarium },
  { to: '/turris', label: MODULE_LABELS.turris },
  { to: '/collegium', label: MODULE_LABELS.collegium },
  { to: '/director', label: MODULE_LABELS.director },
  { to: '/factions', label: '相关势力' },
  { to: '/settings', label: '设置' },
]

function isActive(to: string): boolean {
  if (to === '/') return route.path === '/'
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
