<script setup lang="ts">
// 僵尸图鉴是空壳（无 pvz_zombies 表），2026-09 退役僵尸切换链接；
// 将来僵尸数据入库后在此恢复 kind 分支与切换导航。
defineProps<{
  kind: 'plant' | 'zombie'
}>()
</script>

<template>
  <header class="almanac-hero">
    <div>
      <p class="almanac-eyebrow">Gardendless 在线图鉴</p>
      <h1>植物图鉴</h1>
      <p class="almanac-hero__description">
        浏览植物卡包，查看属性、能力和角色资料。
      </p>
    </div>
  </header>
</template>

<style scoped>
.almanac-hero {
  color: #fff8dc;
  border: 4px solid var(--almanac-wood-dark);
  background-color: var(--almanac-wood);
  box-shadow: inset 0 2px 0 #ffffff21, 0 7px 0 var(--almanac-wood-dark);
  border-radius: 18px 18px 10px 10px;
  justify-content: space-between;
  align-items: end;
  gap: 2rem;
  padding: 1.45rem 1.6rem 1.25rem;
  display: flex;
  position: relative;
  overflow: hidden;
}

.almanac-hero::after {
  content: "";
  opacity: 0.65;
  pointer-events: none;
  border-inline: 1px solid #ffffff14;
  width: 34%;
  height: 100%;
  position: absolute;
  top: 0;
  right: 8%;
  transform: skew(-18deg);
}

.almanac-eyebrow {
  color: #e8c56a;
  letter-spacing: 0.08em;
  margin: 0 0 0.25rem;
  font-size: 0.82rem;
}

.almanac-hero h1 {
  color: #fff8dc;
  text-shadow: 0 3px 0 var(--almanac-wood-dark);
  margin: 0;
  font-size: clamp(2rem, 5vw, 3.75rem);
  line-height: 1;
}

.almanac-hero__description {
  color: #f2e7c4;
  max-width: 42rem;
  margin: 0.65rem 0 0;
  line-height: 1.55;
}

@media (max-width: 820px) {
  .almanac-hero {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
}

@media (max-width: 560px) {
  .almanac-hero {
    border-width: 3px;
    padding: 1.2rem 1rem 1rem;
  }
}
</style>
