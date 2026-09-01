<script setup lang="ts">
import LibraryTree from '@/shared/components/LibraryTree.vue'
</script>

<template>
  <main class="home">
    <aside class="home-side">
      <header class="home-header">
        <div class="home-eyebrow latin">Reliquiarum to Library</div>
        <h1 class="home-title">遗迹图书馆</h1>
      </header>

      <div class="home-intro">
        <p>一座藏身于金牛星系啮合域之内的超阈限实体，以追寻宇宙至高奥秘为目标。</p>
        <p>其内部是存放着记载无穷无尽知识的无限图书馆。</p>
        <p>三大部门各司其职，共同维护着图书馆的知识与秩序的边界。</p>
      </div>

      <p class="home-hint kai">悬停树区查看所属部门数据 · 点击前往对应页面</p>
    </aside>

    <section class="home-tree">
      <LibraryTree />
    </section>
  </main>
</template>

<style scoped>
.home {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 40px;
  align-items: center;
  min-height: calc(100vh - var(--header-h));
  width: 100vw;
  margin-inline: calc(50% - 50vw);
  padding: 40px 4vw 40px;
  box-sizing: border-box;
}

.home-side {
  display: flex;
  flex-direction: column;
  text-align: left;
  justify-self: center;
  align-self: center;
  width: 100%;
  max-width: 520px;
  padding: 44px 40px 38px;
  background: linear-gradient(180deg, rgba(46, 37, 26, 0.55), rgba(34, 27, 20, 0.28));
  border: 1px solid var(--color-line);
  border-radius: calc(var(--radius) * 2);
}

.home-header {
  margin-bottom: 16px;
}

.home-eyebrow {
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--color-gold);
  margin-bottom: 10px;
}

.home-title {
  font-size: 40px;
  font-weight: 700;
  margin: 0;
  line-height: 1.25;
  letter-spacing: 0.08em;
  color: var(--color-ink);
}

.home-intro {
  font-family: var(--font-kai);
  font-size: 15px;
  line-height: 2;
  color: var(--color-ink-dim);
  border-left: 2px solid var(--color-gold);
  padding-left: 16px;
  margin: 0 0 22px;
}

.home-intro p {
  margin: 0 0 10px;
}

.home-intro p:last-child {
  margin-bottom: 0;
}

.home-hint {
  margin: 0;
  font-size: 13px;
  color: var(--color-ink-faint);
}

.home-tree {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0;
}

@media (max-width: 860px) {
  .home {
    grid-template-columns: 1fr;
    gap: 0;
    padding: 24px 5vw 32px;
  }

  .home-side {
    text-align: center;
    justify-self: center;
    align-self: center;
    padding: 32px 24px 26px;
  }

  .home-title {
    font-size: 34px;
  }
}
</style>
