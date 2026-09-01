<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const links = [
  { to: '/', label: '首页' },
  { to: '/armarium', label: '藏书阁' },
  { to: '/turris', label: '迎书楼' },
  { to: '/collegium', label: '寻书社' },
  { to: '/director', label: '馆长层' },
  { to: '/factions', label: '相关势力' },
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
