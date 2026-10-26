<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SiteNav from '@/shared/components/SiteNav.vue'
import Toast from '@/shared/components/Toast.vue'
import BackupToast from '@/shared/components/BackupToast.vue'
import { RouterView } from 'vue-router'
import { battleNavHidden } from '@/features/turris/battle/navState'

// chromeless 路由（window.open 的编辑器窗口等）：不渲染全站顶栏、解除 site-main
// 的 1080px 容器约束——草稿式全窗口布局自带顶栏，不受通用壳层限制。
const route = useRoute()
const chromeless = computed(() => route.meta.chromeless === true)
const isHome = computed(() => route.name === 'home')
</script>

<template>
  <SiteNav v-if="!chromeless && !battleNavHidden" />
  <main class="site-main" :class="{ 'site-main--bleed': chromeless, 'site-main--home': isHome && !chromeless }">
    <RouterView />
  </main>
  <Toast />
  <BackupToast />
</template>
