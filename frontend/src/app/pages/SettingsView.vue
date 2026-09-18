<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  COLOR_THEMES,
  DESIGN_THEMES,
  loadColorTheme,
  loadDesignTheme,
  applyColorTheme,
  applyDesignTheme,
} from '@/app/theme'
import type { ColorThemeId, DesignThemeId } from '@/app/theme'

const colorSelection = ref<ColorThemeId | null>(null)
const designSelection = ref<DesignThemeId | null>(null)

onMounted(() => {
  colorSelection.value = loadColorTheme()
  designSelection.value = loadDesignTheme()
})

function pickColor(id: ColorThemeId | null): void {
  if (id === colorSelection.value) return
  applyColorTheme(id)
}

function pickDesign(id: DesignThemeId | null): void {
  if (id === designSelection.value) return
  applyDesignTheme(id)
}
</script>

<template>
  <section class="settings">
    <header class="page-header">
      <div class="page-header__eyebrow latin">Tabula Rerum</div>
      <h1 class="page-header__title">设置</h1>
      <p class="page-header__desc">
        选择整站的主题色与主题设计，两者可自由组合。点选后立即保存并自动刷新一次页面；
        选择会长期记住，直到你做出新的选择。
      </p>
    </header>

    <section class="settings-group">
      <h2 class="settings-group__title">主题色</h2>
      <p class="settings-group__hint">
        决定底色、文字、强调色与部门色。第一张为默认的"暖色夜间 · 图书馆纸墨"。
      </p>
      <div class="settings-grid">
        <button
          type="button"
          class="theme-card"
          :class="{ 'is-active': colorSelection === null }"
          @click="pickColor(null)"
        >
          <span class="theme-card__swatch theme-card__swatch--default">
            <i class="sw sw--bg"></i>
            <i class="sw sw--surface"></i>
            <i class="sw sw--gold"></i>
            <i class="sw sw--accent"></i>
            <i class="sw sw--turris"></i>
            <i class="sw sw--armarium"></i>
            <i class="sw sw--collegium"></i>
          </span>
          <span class="theme-card__name">默认 · 暖色纸墨</span>
          <span class="theme-card__meta">暗 · 深棕底 + 米金字 + 鎏金（基线）</span>
        </button>
        <button
          v-for="theme in COLOR_THEMES"
          :key="theme.id"
          type="button"
          class="theme-card"
          :class="{ 'is-active': colorSelection === theme.id }"
          :data-color="theme.id"
          @click="pickColor(theme.id)"
        >
          <span class="theme-card__swatch" :data-color="theme.id">
            <i class="sw sw--bg"></i>
            <i class="sw sw--surface"></i>
            <i class="sw sw--gold"></i>
            <i class="sw sw--accent"></i>
            <i class="sw sw--turris"></i>
            <i class="sw sw--armarium"></i>
            <i class="sw sw--collegium"></i>
          </span>
          <span class="theme-card__name">{{ theme.name }}</span>
          <span class="theme-card__meta">{{ theme.mode }} · {{ theme.desc }}</span>
        </button>
      </div>
    </section>

    <section class="settings-group">
      <h2 class="settings-group__title">主题设计</h2>
      <p class="settings-group__hint">
        决定边框粗细、圆角、字体气质与卡片阴影。第一个为现有的极简基线。
      </p>
      <div class="settings-grid">
        <button
          type="button"
          class="theme-card"
          :class="{ 'is-active': designSelection === null }"
          @click="pickDesign(null)"
        >
          <span class="theme-card__demo theme-card__demo--baseline">
            <span class="demo-line demo-line--thin"></span>
            <span class="demo-pill">Aa</span>
          </span>
          <span class="theme-card__name">默认 · 图书馆纸墨</span>
          <span class="theme-card__meta">1px 细线 · 8px 圆角 · 衬线/楷体（基线）</span>
        </button>
        <button
          v-for="theme in DESIGN_THEMES"
          :key="theme.id"
          type="button"
          class="theme-card"
          :class="{ 'is-active': designSelection === theme.id }"
          :data-design="theme.id"
          @click="pickDesign(theme.id)"
        >
          <span class="theme-card__demo" :data-design="theme.id">
            <span class="demo-line" :data-design="theme.id"></span>
            <span class="demo-pill" :data-design="theme.id">Aa</span>
          </span>
          <span class="theme-card__name">{{ theme.name }}</span>
          <span class="theme-card__meta">{{ theme.desc }}</span>
        </button>
      </div>
    </section>
  </section>
</template>

<style scoped>
.settings-group {
  margin-bottom: 48px;
}

.settings-group__title {
  font-size: 20px;
  margin-bottom: 4px;
}

.settings-group__hint {
  color: var(--color-ink-dim);
  font-size: 14px;
  margin: 0 0 18px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 16px;
}

.theme-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  background: var(--color-surface);
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: var(--radius);
  color: var(--color-ink);
  box-shadow: var(--card-shadow);
  transition: border-color 0.15s ease;
}

.theme-card:hover {
  border-color: var(--accent);
}

.theme-card.is-active {
  border-color: var(--accent);
  box-shadow: var(--card-shadow), inset 0 0 0 1px var(--accent);
}

.theme-card.is-active::after {
  content: '✓ 当前';
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--accent);
  color: var(--on-accent);
}

.theme-card__name {
  font-weight: 700;
  font-size: 15px;
}

.theme-card__meta {
  font-size: 12px;
  color: var(--color-ink-dim);
  line-height: 1.6;
}

/* ---- 主题色色卡：每张用自身色板渲染 7 个色块 ---- */
.theme-card__swatch {
  display: flex;
  gap: 6px;
  padding: 10px;
  border-radius: var(--radius);
  background: var(--color-surface-2);
}

.theme-card__swatch .sw {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 1px solid rgba(128, 128, 128, 0.35);
}

.sw--bg {
  background: var(--color-bg);
}
.sw--surface {
  background: var(--color-surface);
}
.sw--gold {
  background: var(--color-gold);
}
.sw--accent {
  background: var(--accent);
}
.sw--turris {
  background: var(--turris);
}
.sw--armarium {
  background: var(--armarium);
}
.sw--collegium {
  background: var(--collegium);
}

/* 色卡预览区套用目标色板（html 级定义，作用域内即可生效） */
.theme-card__swatch[data-color='parchment'] {
  --color-bg: #f4edde;
  --color-surface: #ece2cc;
  --color-gold: #a5762c;
  --accent: #a5762c;
  --turris: #b3482f;
  --armarium: #3e6f9e;
  --collegium: #4f8a45;
}
.theme-card__swatch[data-color='jade'] {
  --color-bg: #0b110e;
  --color-surface: #121c17;
  --color-gold: #d3ad5c;
  --accent: #7bab6d;
  --turris: #c05a40;
  --armarium: #5d8fc4;
  --collegium: #7bab6d;
}
.theme-card__swatch[data-color='fir'] {
  --color-bg: #0d1016;
  --color-surface: #141a24;
  --color-gold: #c2b077;
  --accent: #8fa4d6;
  --turris: #c0604a;
  --armarium: #6d94cc;
  --collegium: #6fb07a;
}
.theme-card__swatch[data-color='celadon'] {
  --color-bg: #eae7db;
  --color-surface: #e1ddcf;
  --color-gold: #9a8b56;
  --accent: #5f8f7a;
  --turris: #b04a3a;
  --armarium: #5d82a8;
  --collegium: #5f8f7a;
}
.theme-card__swatch[data-color='charcoal'] {
  --color-bg: #121312;
  --color-surface: #1a1b1a;
  --color-gold: #d6b45e;
  --accent: #d6b45e;
  --turris: #b8503a;
  --armarium: #4f7fb8;
  --collegium: #58a05f;
}
.theme-card__swatch[data-color='sandstone'] {
  --color-bg: #f0e7d8;
  --color-surface: #e8dcc8;
  --color-gold: #b47a2e;
  --accent: #b0472e;
  --turris: #b0472e;
  --armarium: #3e6f9e;
  --collegium: #4f8a45;
}

/* ---- 主题设计演示卡：边框语言迷你 demo ---- */
.theme-card__demo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  min-height: 64px;
  border-radius: var(--radius);
  background: var(--color-surface-2);
}

.demo-line {
  flex: 1;
  height: 0;
  border-top: var(--bd-w) var(--bd-style) var(--bd-color);
}

.demo-pill {
  padding: 4px 14px;
  font-size: 14px;
  font-family: var(--font-serif);
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: 999px;
  color: var(--accent);
}

/* 演示区覆盖目标设计的边框/圆角/字体（预览与全站变量解耦） */
.theme-card__demo[data-design='woodcut'] {
  --bd-w: 2px;
  --bd-color: #1a1712;
  --radius: 2px;
  --font-serif: 'Songti SC', 'SimSun', 'Noto Serif SC', serif;
  --card-shadow: 0 0 0 1px var(--color-bg), 0 0 0 3px #1a1712;
}
.theme-card__demo[data-design='faceted'] {
  --bd-w: 1px;
  --bd-color: rgba(180, 165, 230, 0.5);
  --radius: 0px;
  --font-serif: 'Noto Serif SC', serif;
}
.theme-card__demo[data-design='copperplate'] {
  --bd-w: 1.5px;
  --bd-color: rgba(200, 180, 120, 0.6);
  --radius: 3px;
}
.theme-card__demo[data-design='shoji'] {
  --bd-w: 1.5px;
  --bd-color: rgba(176, 137, 104, 0.85);
  --radius: 2px;
  --font-serif: 'KaiTi', 'STKaiti', 'LXGW WenKai', serif;
}
.theme-card__demo[data-design='runic'] {
  --bd-w: 1.5px;
  --bd-color: rgba(110, 231, 216, 0.55);
  --radius: 14px;
  --font-serif: 'Noto Serif SC', serif;
}
.theme-card__demo[data-design='wrought'] {
  --bd-w: 3px;
  --bd-color: #3a3d42;
  --radius: 4px;
  --font-serif: 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
}
</style>
