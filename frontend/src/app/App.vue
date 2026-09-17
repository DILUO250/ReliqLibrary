<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SiteNav from '@/shared/components/SiteNav.vue'
import Toast from '@/shared/components/Toast.vue'
import BackupToast from '@/shared/components/BackupToast.vue'
import { RouterView } from 'vue-router'

// chromeless 路由（window.open 的编辑器窗口等）：不渲染全站顶栏、解除 site-main
// 的 1080px 容器约束——草稿式全窗口布局自带顶栏，不受通用壳层限制。
const route = useRoute()
const chromeless = computed(() => route.meta.chromeless === true)
</script>

<template>
  <SiteNav v-if="!chromeless" />
  <main class="site-main" :class="{ 'site-main--bleed': chromeless }">
    <RouterView />
  </main>
  <Toast />
  <BackupToast />
</template>
