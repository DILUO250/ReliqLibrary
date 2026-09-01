<script setup lang="ts">
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
    <nav class="species-switch" aria-label="Gardendless 在线图鉴">
      <a
        href="/armarium/project/pvz/plants"
        class="active"
        :aria-current="kind === 'plant' ? 'page' : undefined"
      >
        植物
      </a>
      <a href="/armarium/project/pvz/zombies">僵尸</a>
    </nav>
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

.species-switch {
  z-index: 1;
  border: 2px solid var(--almanac-wood-dark);
  background: #2f2219;
  border-radius: 12px;
  flex: none;
  gap: 0.35rem;
  padding: 0.35rem;
  display: inline-flex;
}

.species-switch a {
  color: #d9ccb0;
  text-align: center;
  border-radius: 8px;
  min-width: 5rem;
  padding: 0.55rem 0.85rem;
  font-weight: 700;
  text-decoration: none;
}

.species-switch a.active {
  color: #fff;
  background: var(--almanac-accent);
  box-shadow: inset 0 -3px 0 var(--almanac-accent-dark);
}

.species-switch a:focus-visible {
  outline-offset: 3px;
  outline: 3px solid #e1a83a;
}

@media (max-width: 820px) {
  .almanac-hero {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  .species-switch {
    align-self: flex-start;
  }
}

@media (max-width: 560px) {
  .almanac-hero {
    border-width: 3px;
    padding: 1.2rem 1rem 1rem;
  }
  .species-switch {
    box-sizing: border-box;
    width: 100%;
  }
  .species-switch a {
    flex: 1;
  }
}
</style>
