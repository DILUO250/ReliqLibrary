<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import './molten.css'

const route = useRoute()
const tabs = [
  { to: '/turris', label: '总览', index: '01' },
  { to: '/turris/floors', label: '楼层', index: '02' },
  { to: '/turris/dictionary', label: '术语字典', index: '03' },
  { to: '/turris/systems', label: '战斗系统', index: '04' },
  { to: '/turris/invitations', label: '邀请函与来宾', index: '05' },
]
const activePath = computed(() => route.path)
function isActive(to: string): boolean {
  return to === '/turris' ? activePath.value === to : activePath.value.startsWith(to)
}
</script>

<template>
  <div class="molten-shell" data-theme="turris">
    <div class="molten-shell__inner">
      <header class="molten-hero">
        <div class="molten-hero__copy">
          <p class="molten-eyebrow">TURRIS LIBRORUM ADVENTANTIUM <span>/ 03</span></p>
          <h1>迎书楼 <small>/ 01</small></h1>
          <p>战斗司书驻守最前线，以接待与试炼扩充馆藏。</p>
        </div>
        <div class="molten-hero__sigil" aria-label="最坚硬的树干">
          <div><strong>最坚硬的树干</strong><span>THE UNYIELDING TRUNK / 01</span></div>
          <svg viewBox="0 0 90 78" aria-hidden="true">
            <path d="M45 4 84 72H6Z" fill="none" stroke="currentColor" stroke-width="1.4" />
            <path d="M45 18 70 62H20Z" fill="currentColor" opacity=".1" stroke="currentColor" />
            <path d="M45 32v23M34 61h22" fill="none" stroke="currentColor" />
            <circle cx="45" cy="4" r="2" fill="currentColor" />
          </svg>
        </div>
      </header>

      <nav class="molten-tabs" aria-label="迎书楼页面">
        <RouterLink v-for="tab in tabs" :key="tab.to" :to="tab.to" :class="{ 'is-active': isActive(tab.to) }">
          <span>{{ tab.index }}</span>{{ tab.label }}
        </RouterLink>
        <span class="molten-tabs__path">/turris</span>
      </nav>
      <RouterView />
    </div>
  </div>
</template>
