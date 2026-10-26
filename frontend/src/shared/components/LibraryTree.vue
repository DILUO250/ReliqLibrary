<script setup lang="ts">
import type { ModuleLabelKey } from '@/app/labels'

/**
 * 主页馆树：四分区线框树，点击区域只发出选择事件，路由与详情由 HomeView 统一管理。
 * 颜色全部使用全站部门 token；树的线条是纯展示层图形，不包含领域数据。
 */
defineProps<{
  selected: ModuleLabelKey | 'all'
}>()

const emit = defineEmits<{
  select: [dept: ModuleLabelKey]
}>()

function choose(dept: ModuleLabelKey): void {
  emit('select', dept)
}
</script>

<template>
  <div class="tree-wrap">
    <svg class="tree-orbit" viewBox="0 0 280 370" aria-hidden="true">
      <ellipse cx="140" cy="178" rx="127" ry="164" />
      <ellipse cx="140" cy="178" rx="104" ry="145" />
    </svg>
    <svg
      id="libraryTree"
      class="library-tree"
      viewBox="0 0 320 430"
      role="img"
      aria-label="馆树：树冠为馆长层，左干为迎书楼，右干为藏书阁，根系为寻书社"
    >
      <g
        class="tree-region tree-region--director"
        :class="{ 'is-active': selected === 'director', 'is-dim': selected !== 'all' && selected !== 'director' }"
        tabindex="0"
        role="button"
        aria-label="选择馆长层"
        @click="choose('director')"
        @keydown.enter="choose('director')"
        @keydown.space.prevent="choose('director')"
      >
        <rect class="hit" x="42" y="0" width="236" height="165" />
        <path class="limb" d="M160 235C157 186 143 151 112 122M160 230C169 180 190 145 218 117M151 188C127 159 92 151 67 134M174 183C200 155 235 149 257 128M160 181C160 142 158 108 163 72" />
        <path class="crown-line" d="M68 139C37 116 50 73 82 67C82 34 123 20 147 39C168 5 213 22 217 48C254 40 278 75 259 102C282 126 252 153 224 143C205 167 174 151 160 139C139 161 112 153 101 140C88 146 77 145 68 139Z" />
        <path class="crown-line" d="M90 112C73 93 88 68 110 72C119 48 147 50 158 66C179 41 210 56 208 79C234 77 246 101 229 118C205 112 190 124 177 139M103 132C122 116 140 114 160 139M145 39C142 62 150 82 160 99M217 48C201 69 189 83 174 96" />
        <circle class="crown-line" cx="84" cy="86" r="31" />
        <circle class="crown-line" cx="132" cy="62" r="36" />
        <circle class="crown-line" cx="190" cy="60" r="38" />
        <circle class="crown-line" cx="236" cy="96" r="31" />
      </g>
      <g
        class="tree-region tree-region--turris"
        :class="{ 'is-active': selected === 'turris', 'is-dim': selected !== 'all' && selected !== 'turris' }"
        tabindex="0"
        role="button"
        aria-label="选择迎书楼"
        @click="choose('turris')"
        @keydown.enter="choose('turris')"
        @keydown.space.prevent="choose('turris')"
      >
        <rect class="hit" x="68" y="145" width="94" height="160" />
        <path class="limb" d="M157 178C148 218 145 260 147 310L133 349M151 206C132 181 111 171 84 166M149 233C125 213 105 205 77 205M148 260C124 248 104 247 84 253M143 285C127 277 112 280 98 289" />
        <path class="limb" d="M153 187C151 225 153 270 155 316M146 309C143 327 139 339 133 349" />
        <path class="crown-line" d="M84 166C70 161 60 151 54 139M77 205C61 202 51 193 43 181M84 253C69 256 56 253 44 246" />
      </g>
      <g
        class="tree-region tree-region--armarium"
        :class="{ 'is-active': selected === 'armarium', 'is-dim': selected !== 'all' && selected !== 'armarium' }"
        tabindex="0"
        role="button"
        aria-label="选择藏书阁"
        @click="choose('armarium')"
        @keydown.enter="choose('armarium')"
        @keydown.space.prevent="choose('armarium')"
      >
        <rect class="hit" x="158" y="145" width="104" height="160" />
        <path class="limb" d="M164 176C174 217 178 260 173 310L187 349M169 204C188 181 213 170 239 161M173 232C197 211 220 202 246 201M174 260C199 246 220 245 241 251M178 285C197 275 214 278 228 289" />
        <path class="limb" d="M167 186C170 225 167 270 165 316M174 309C177 327 181 339 187 349" />
        <path class="crown-line" d="M239 161C254 155 264 145 270 132M246 201C260 198 272 189 279 177M241 251C256 254 268 250 279 242" />
      </g>
      <g
        class="tree-region tree-region--collegium"
        :class="{ 'is-active': selected === 'collegium', 'is-dim': selected !== 'all' && selected !== 'collegium' }"
        tabindex="0"
        role="button"
        aria-label="选择寻书社"
        @click="choose('collegium')"
        @keydown.enter="choose('collegium')"
        @keydown.space.prevent="choose('collegium')"
      >
        <rect class="hit" x="25" y="303" width="270" height="127" />
        <path class="limb" d="M133 335C113 348 93 356 59 358C87 365 106 369 122 385M187 335C207 348 228 356 261 358C234 365 214 370 198 385M150 329C143 354 139 378 121 407M170 329C177 354 181 378 199 407M160 333V420" />
        <path class="limb" d="M104 355C88 377 66 384 43 383M79 360C61 367 45 367 29 362M122 385C105 391 94 402 86 416M216 355C232 377 254 384 277 383M241 360C259 367 275 367 291 362M198 385C215 391 226 402 234 416M139 378C128 382 116 382 105 379M181 378C192 382 204 382 215 379" />
        <path class="crown-line" d="M65 353C104 323 216 323 256 353M84 366C120 346 200 346 236 366" />
        <path class="tree-door" d="M148 363V342C148 326 172 326 172 342V363M143 363H177" />
        <circle class="tree-heart" cx="160" cy="345" r="2.2" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.tree-wrap {
  position: relative;
  width: 330px;
  height: 450px;
  margin: 6px auto 0;
}
.tree-wrap::before {
  content: '';
  position: absolute;
  inset: 8% -12% 2%;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--collegium) 15%, transparent), transparent 67%);
  animation: tree-breathe 5s ease-in-out infinite;
}
.tree-orbit {
  position: absolute;
  inset: 8% -5% 5%;
  width: 110%;
  height: 87%;
  opacity: 0.42;
  pointer-events: none;
}
.tree-orbit ellipse {
  fill: none;
  stroke: var(--color-line);
  stroke-width: 1;
  stroke-dasharray: 2 8;
}
.library-tree {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: visible;
  filter: drop-shadow(0 0 14px color-mix(in srgb, var(--collegium) 15%, transparent));
}
.tree-region {
  cursor: pointer;
  transition: opacity 0.25s, filter 0.25s;
  color: var(--collegium);
}
.tree-region--director { color: var(--director); }
.tree-region--turris { color: var(--turris); }
.tree-region--armarium { color: var(--armarium); }
.tree-region--collegium { color: var(--collegium); }
.tree-region .limb,
.tree-region .crown-line {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.tree-region .limb { stroke-width: 1.35; }
.tree-region .crown-line { stroke-width: 0.9; opacity: 0.76; }
.tree-region .hit { fill: transparent; stroke: none; pointer-events: all; }
.tree-region:hover,
.tree-region.is-active { filter: drop-shadow(0 0 5px currentColor); }
.tree-region.is-dim { opacity: 0.16; }
.tree-door {
  fill: none;
  stroke: var(--color-gold);
  stroke-width: 1.4;
  filter: drop-shadow(0 0 6px var(--color-gold));
}
.tree-heart {
  fill: var(--color-gold);
  filter: drop-shadow(0 0 6px var(--color-gold));
  animation: tree-heart 3s ease-in-out infinite;
}
@keyframes tree-breathe {
  50% { transform: scale(1.06); opacity: 0.7; }
}
@keyframes tree-heart {
  50% { opacity: 0.45; }
}
@media (max-width: 1320px) {
  .tree-wrap { width: 290px; height: 410px; }
}
@media (max-height: 790px) and (min-width: 1081px) {
  .tree-wrap { width: 270px; height: 370px; }
}
@media (max-width: 650px) {
  .tree-wrap { width: min(330px, 100%); height: 450px; }
  .tree-wrap::before { inset: 8% 0 2%; }
  .tree-orbit { inset: 8% 0 5%; width: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .tree-wrap::before,
  .tree-heart { animation: none; }
}
</style>
