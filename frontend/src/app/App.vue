<script setup lang="ts">
import SiteNav from '@/shared/components/SiteNav.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <SiteNav />
  <main class="site-main">
    <RouterView />
  </main>
</template>
