<script setup lang="ts">
import SectionPlaceholder from '@/shared/components/SectionPlaceholder.vue'
import BattleEntryCard from '@/features/turris/components/BattleEntryCard.vue'
</script>

<template>
  <div>
    <header class="page-header">
      <div class="page-header__eyebrow latin">Invitationes et Hospites</div>
      <h1 class="page-header__title">邀请函与来宾</h1>
      <p class="page-header__desc">
        遗迹图书馆按特定周期向全宇宙随机个体发送邀请函。通过邀请函参与试炼的个体统称来宾；不借助邀请函主动入侵图书馆的个体称为不速之客。
      </p>
    </header>

    <BattleEntryCard
      title="迎书楼战斗模拟器 v1"
      subtitle="调用迎书楼司书数据，按接待规则进行一对一模拟对局"
      to="/turris/battle"
    />

    <div class="placeholder-wrap">
      <SectionPlaceholder
        title="邀请函与来宾"
        latin="Invitationes et Hospites"
        desc="遗迹图书馆按特定周期向全宇宙随机个体发送邀请函。通过邀请函参与试炼的个体统称来宾；不借助邀请函主动入侵图书馆的个体称为不速之客。"
        note="邀请函与来宾记录待录入"
      />
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 20px;
}
.page-header__eyebrow {
  font-size: 12px;
  letter-spacing: 0.2em;
  color: var(--color-ink-faint);
}
.page-header__title {
  margin: 4px 0 6px;
  font-size: 24px;
}
.page-header__desc {
  margin: 0;
  font-size: 14px;
  color: var(--color-ink-dim);
  line-height: 1.7;
}
.placeholder-wrap {
  margin-top: 20px;
}
</style>
