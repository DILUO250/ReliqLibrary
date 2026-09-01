<script setup lang="ts">
import { RouterView } from 'vue-router'
import KeywordDictionary from '@pvzwiki/components/KeywordDictionary.vue'
import SyncPanel from '@pvzwiki/components/SyncPanel.vue'
import Toast from '@pvzwiki/components/Toast.vue'
</script>

<template>
  <div class="pvz-project-shell">
    <RouterView />
    <SyncPanel hide-trigger />
    <KeywordDictionary hide-trigger />
    <Toast />
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
}
</style>
