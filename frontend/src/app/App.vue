<script setup lang="ts">
import SiteNav from '@/shared/components/SiteNav.vue'
import Toast from '@/shared/components/Toast.vue'
import BackupToast from '@/shared/components/BackupToast.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <SiteNav />
  <main class="site-main">
    <RouterView />
  </main>
  <Toast />
  <BackupToast />
</template>
