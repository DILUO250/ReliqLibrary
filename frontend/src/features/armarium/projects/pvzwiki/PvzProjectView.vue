<script setup lang="ts">
import { RouterView } from 'vue-router'
import KeywordDictionary from '@pvzwiki/components/KeywordDictionary.vue'
import SyncPanel from '@pvzwiki/components/SyncPanel.vue'
</script>

<template>
  <div class="pvz-project-shell">
    <RouterView />
    <SyncPanel hide-trigger />
    <KeywordDictionary hide-trigger />
  </div>
</template>

<style>
@font-face {
  font-family: pvzgeFontEN;
  src: url('/features/armarium/projects/pvzwiki/fonts/FBU-ENGRU.woff2') format('woff2');
  font-weight: 400;
}

@font-face {
  font-family: pvzgFont;
  src: url('/features/armarium/projects/pvzwiki/fonts/FBUSV8C5EI.woff2') format('woff2');
  font-weight: 400;
}

.pvz-project-shell {
  color: #3c3c43;
  font-family: pvzgeFontEN, pvzgFont, 'Noto Sans SC', sans-serif;
  min-height: calc(100vh - var(--header-h));
  /* 藏书阁主题色联动（模块内全局 token 随 armarium 蓝色系走） */
  --accent: var(--armarium);
  --color-accent: var(--armarium);
  --color-gold: var(--armarium);
}
</style>
