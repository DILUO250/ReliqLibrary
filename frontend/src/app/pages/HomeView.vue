<script setup lang="ts">
import LibraryTree from '@/shared/components/LibraryTree.vue'
import RecentRail from '@/shared/components/RecentRail.vue'
import OuterShelf from '@/features/director/components/OuterShelf.vue'

/**
 * 主页 / 馆务面板（草稿 4.1 落地）：面板头横贯页首（标题 + 副标同行基线），
 * 下方 1240px 居中容器——左馆树（视觉主体，虚线框）+ 右 400px 窄栏连续纸面。
 * 结构与 dashboard-mockup.html 一一对应，颜色全部走 token。
 */
</script>

<template>
  <main class="home">
    <header class="panel-head">
      <div class="panel-eyebrow latin">Reliquiarum to Library</div>
      <div class="panel-title-row">
        <h1 class="panel-title">馆务面板</h1>
        <p class="panel-sub kai">一座藏身于金牛星系啮合域之内的超阈限实体，以追寻宇宙至高奥秘为目标。</p>
      </div>
    </header>

    <div class="layout">
      <section class="tree-slot">
        <LibraryTree />
      </section>

      <aside class="rail">
        <section class="rail-section">
          <div class="rail-title">
            <span class="zh">域外书架</span>
            <span class="latin">Outer Shelf</span>
            <span class="rule"></span>
          </div>
          <OuterShelf />
        </section>

        <section class="rail-section">
          <div class="rail-title">
            <span class="zh">最近足迹</span>
            <span class="latin">Recent Pages</span>
            <span class="rule"></span>
          </div>
          <RecentRail />
        </section>
      </aside>
    </div>
  </main>
</template>

<style scoped>
.home {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 0 60px;
}

/* ---- 面板头：横贯页首，标题 + 副标同行基线 ---- */
.panel-head {
  margin: 0 auto 26px;
}

.panel-eyebrow {
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--color-gold);
  margin-bottom: 2px;
}

.panel-title-row {
  display: flex;
  align-items: baseline;
  gap: 20px;
  flex-wrap: wrap;
}

.panel-title {
  font-size: 26px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.1em;
  color: var(--color-ink);
}

.panel-sub {
  margin: 0;
  font-size: 13px;
  color: var(--color-ink-faint);
}

/* ---- 主区：左馆树 + 右 400px 窄栏 ---- */
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 400px;
  gap: 48px;
  align-items: start;
}

.tree-slot {
  min-height: 620px;
  border: 1px dashed var(--color-line);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  min-width: 0;
}

/* ---- 右栏：连续纸面，无卡片 ---- */
.rail-section {
  padding: 4px 0 22px;
}

.rail-section + .rail-section {
  border-top: 1px solid var(--color-line);
  padding-top: 20px;
}

.rail-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 18px;
}

.rail-title .zh {
  font-family: var(--font-serif);
  font-size: 16px;
  letter-spacing: 0.18em;
  color: var(--color-ink);
}

.rail-title .latin {
  font-family: var(--font-serif);
  font-size: 10px;
  letter-spacing: 0.2em;
  color: var(--color-ink-faint);
  text-transform: uppercase;
}

.rail-title .rule {
  flex: 1;
  height: 1px;
  background: var(--color-line);
}

@media (max-width: 1020px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .rail {
    max-width: 480px;
    margin: 0 auto;
    width: 100%;
  }
}
</style>
