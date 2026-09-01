<script setup lang="ts">
defineProps<{
  title: string
  latin?: string
  desc?: string
  note?: string
}>()
</script>

<template>
  <div>
    <header class="page-header">
      <div v-if="latin" class="page-header__eyebrow latin">{{ latin }}</div>
      <h1 class="page-header__title">{{ title }}</h1>
      <p v-if="desc" class="page-header__desc">{{ desc }}</p>
    </header>

    <div class="empty-state">
      <div class="empty-state__title">{{ note ?? '设定数据待录入' }}</div>
      <p class="kai" style="margin: 0; font-size: 13px">此模块的框架已就绪，具体设定内容将由你补充。</p>
    </div>
  </div>
</template>
