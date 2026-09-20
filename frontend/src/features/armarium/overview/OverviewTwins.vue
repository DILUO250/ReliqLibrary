<script setup lang="ts">
/**
 * 藏书阁总览 · 上部双子铭章（草稿 2.4 方案 D「双子铭章」落地）。
 *
 * 形式与内容逐项对齐草稿 05-方案D-双子铭章.html：
 * - 左铭章「异常实体之印」：内芯缝合裂面（圆头+红锯齿缝合线+双眼），双环铭文
 *   外环拉丁 ABNORMALITATES + S·C·L · SECURE · CONTAIN · LEARN，金环金点；
 * - 右铭章「超自然空间之印」：内芯双层嵌套立方体（外透明盒+内金色线框盒），
 *   外环拉丁 SPATIA SUPERNATURALIA，蓝环蓝点；
 * - 两章之间：中央鎏金纹章（菱形+书页十字）+ SCL 竖排。
 *
 * 与草稿唯一的刻意差异：SVG 硬编码色（#e0b564/#4a7fc4/#c0503a/#eee2cb）换为
 * 主题变量（--director/--armarium/--danger/--color-ink），默认主题下视觉一致，
 * 换肤时随主题自动适配（用户决议）。
 */
defineProps<{
  /** 异常实体已收容档案数（DB 实时统计）。 */
  entityCount: number
  /** 超自然空间已控制档案数（DB 实时统计，0 = 待录入诚实占位）。 */
  spaceCount: number
}>()

const emit = defineEmits<{
  (e: 'enter-entities'): void
  (e: 'enter-spaces'): void
}>()
</script>

<template>
  <div class="twins">
    <!-- 左铭章 · 异常实体 -->
    <section class="twin twin--left">
      <div class="seal">
        <svg class="seal__ring" viewBox="0 0 240 240" aria-hidden="true">
          <defs>
            <path id="ringL" d="M120,120 m-92,0 a92,92 0 1,1 184,0 a92,92 0 1,1 -184,0" />
          </defs>
          <circle cx="120" cy="120" r="104" fill="none" stroke="color-mix(in srgb, var(--director) 35%, transparent)" stroke-width="1.2" />
          <circle cx="120" cy="120" r="88" fill="none" stroke="color-mix(in srgb, var(--director) 80%, transparent)" stroke-width="2" />
          <circle cx="120" cy="120" r="62" fill="none" stroke="color-mix(in srgb, var(--director) 40%, transparent)" stroke-width="1" />
          <text>
            <textPath href="#ringL" startOffset="0">ABNORMALITATES · S·C·L · SECURE · CONTAIN · LEARN ·</textPath>
          </text>
          <circle cx="120" cy="30" r="2.2" fill="var(--director)" />
          <circle cx="120" cy="210" r="2.2" fill="var(--director)" />
          <circle cx="30" cy="120" r="2.2" fill="var(--director)" />
          <circle cx="210" cy="120" r="2.2" fill="var(--director)" />
          <!-- 内芯：缝合裂面 -->
          <circle cx="120" cy="120" r="51" stroke="var(--color-ink)" stroke-width="3.2" />
          <path d="M89 123.1 L98.3 116.9 L107.6 126.2 L116.9 116.9 L126.2 126.2 L135.5 116.9 L144.8 126.2 L154.1 120" stroke="var(--danger)" stroke-width="2.8" />
          <circle cx="107.6" cy="95.2" r="6.2" stroke="var(--director)" stroke-width="2.4" />
          <circle cx="107.6" cy="95.2" r="2.2" fill="var(--director)" />
          <circle cx="138.6" cy="95.2" r="6.2" stroke="var(--director)" stroke-width="2.4" />
          <circle cx="138.6" cy="95.2" r="2.2" fill="var(--director)" />
        </svg>
      </div>
      <header>
        <div class="twin__title">异常实体</div>
        <div class="twin__latin latin">Abnormalities</div>
      </header>
      <p class="twin__def">收容并记录<b>异常实体</b>——封存于书中世界，提取知识、生木髓与书页。</p>
      <div class="twin__yields">
        <span class="twin__yield twin__yield--blue">知识</span>
        <span class="twin__yield twin__yield--blue">生木髓</span>
        <span class="twin__yield twin__yield--gold">异常实体书页</span>
        <span class="twin__yield twin__yield--gold">EGO 卡牌</span>
      </div>
      <span class="twin__stat">{{ entityCount }}<small>已收容档案</small></span>
      <button type="button" class="twin__enter" @click="emit('enter-entities')">
        进入实体库 <span aria-hidden="true">↗</span>
      </button>
    </section>

    <!-- 中央徽记 -->
    <div class="twins__center">
      <div class="center-seal">
        <svg class="center-seal__ring" viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <circle cx="40" cy="40" r="37" stroke="var(--director)" stroke-width="1.6" />
          <circle cx="40" cy="40" r="30" stroke="color-mix(in srgb, var(--armarium) 75%, transparent)" stroke-width="1.4" />
          <path d="M40 12 L62 40 L40 68 L18 40 Z" stroke="var(--director)" stroke-width="1.3" fill="color-mix(in srgb, var(--director) 8%, transparent)" />
          <path d="M31 31 h18 v18 h-18 Z" stroke="var(--color-ink)" stroke-width="1.3" />
          <path d="M31 40 h18 M40 31 v18" stroke="var(--color-ink)" stroke-width="1" />
        </svg>
        <span class="center-seal__scl">SCL</span>
      </div>
    </div>

    <!-- 右铭章 · 超自然空间 -->
    <section class="twin twin--right">
      <div class="seal">
        <svg class="seal__ring" viewBox="0 0 240 240" aria-hidden="true">
          <defs>
            <path id="ringR" d="M120,120 m-92,0 a92,92 0 1,1 184,0 a92,92 0 1,1 -184,0" />
          </defs>
          <circle cx="120" cy="120" r="104" fill="none" stroke="color-mix(in srgb, var(--armarium) 35%, transparent)" stroke-width="1.2" />
          <circle cx="120" cy="120" r="88" fill="none" stroke="color-mix(in srgb, var(--armarium) 85%, transparent)" stroke-width="2" />
          <circle cx="120" cy="120" r="62" fill="none" stroke="color-mix(in srgb, var(--armarium) 40%, transparent)" stroke-width="1" />
          <text>
            <textPath href="#ringR" startOffset="0">SPATIA SUPERNATURALIA · S·C·L · SECURE · CONTAIN · LEARN ·</textPath>
          </text>
          <circle cx="120" cy="30" r="2.2" fill="var(--armarium)" />
          <circle cx="120" cy="210" r="2.2" fill="var(--armarium)" />
          <circle cx="30" cy="120" r="2.2" fill="var(--armarium)" />
          <circle cx="210" cy="120" r="2.2" fill="var(--armarium)" />
          <!-- 内芯：双层嵌套立方体 -->
          <path d="M120 60.6 L172.8 87 L120 113.4 L67.2 87 Z" stroke="var(--color-ink)" stroke-width="3.2" fill="color-mix(in srgb, var(--armarium) 10%, transparent)" />
          <path d="M67.2 87 L67.2 146.4 L120 176.1 L120 113.4 Z" stroke="var(--color-ink)" stroke-width="3.2" />
          <path d="M172.8 87 L172.8 146.4 L120 176.1" stroke="var(--color-ink)" stroke-width="3.2" />
          <path d="M120 87 L146.4 100.2 L120 113.4 L93.6 100.2 Z" stroke="var(--director)" stroke-width="2.4" />
          <path d="M93.6 100.2 L93.6 133.2 L120 149.7 L120 113.4 Z" stroke="var(--director)" stroke-width="2.4" />
          <path d="M146.4 100.2 L146.4 133.2 L120 149.7" stroke="var(--director)" stroke-width="2.4" />
        </svg>
      </div>
      <header>
        <div class="twin__title">超自然空间</div>
        <div class="twin__latin latin">Spatia Supernaturalia</div>
      </header>
      <p class="twin__def">探索并<b>控制超自然空间</b>——封锁锚点、垄断进出权，在不破坏空间的前提下持续采集资源。</p>
      <div class="twin__yields">
        <span class="twin__yield twin__yield--blue">知识</span>
        <span class="twin__yield twin__yield--blue">丰富资源</span>
        <span class="twin__yield twin__yield--gold">异常实体</span>
      </div>
      <span class="twin__stat" :class="{ 'is-pending': spaceCount === 0 }">
        {{ spaceCount }}<small>{{ spaceCount === 0 ? '已控制 · 待录入' : '已控制档案' }}</small>
      </span>
      <button
        type="button"
        class="twin__enter"
        :aria-disabled="spaceCount === 0"
        @click="spaceCount > 0 && emit('enter-spaces')"
      >
        进入空间库 <span aria-hidden="true">↗</span>
      </button>
    </section>
  </div>
</template>

<style scoped>
/* ============ 双子铭章（草稿 05-方案D 逐项复刻） ============ */
.twins {
  display: grid;
  grid-template-columns: 1fr 76px 1fr;
  align-items: stretch;
  gap: 0;
}

.twin {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
  padding: 10px 8px;
}

/* 铭章 */
.seal {
  position: relative;
  width: 228px;
  height: 228px;
  flex: none;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.5));
  transition: transform 0.35s ease;
}

.twin:hover .seal {
  transform: scale(1.035) rotate(-1.2deg);
}

.seal__ring {
  width: 100%;
  height: 100%;
}

.seal__ring text {
  font-family: var(--font-display);
  font-size: 13.5px;
  letter-spacing: 0.34em;
  fill: var(--color-ink-dim);
}

.twin--left .seal__ring text {
  fill: var(--director);
}

.twin--right .seal__ring text {
  fill: var(--armarium);
}

.seal__ring + .twin__title,
.twin header {
  pointer-events: none;
}

.twin__title {
  font-size: 22px;
  font-family: var(--font-serif);
  font-weight: 900;
  letter-spacing: 0.12em;
}

.twin__latin {
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--accent);
  margin-top: 3px;
}

.twin__def {
  font-family: var(--font-kai);
  font-size: 13.5px;
  color: var(--color-ink-dim);
  line-height: 1.8;
  max-width: 330px;
  margin: 6px 0 0;
}

.twin__def b {
  color: var(--color-ink);
}

.twin__yields {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  margin-top: 4px;
}

.twin__yield {
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--color-ink-faint) 45%, transparent);
  color: var(--color-ink-dim);
}

.twin__yield--blue {
  border-color: color-mix(in srgb, var(--armarium) 60%, transparent);
  color: var(--armarium);
  background: color-mix(in srgb, var(--armarium) 7%, transparent);
}

.twin__yield--gold {
  border-color: color-mix(in srgb, var(--director) 55%, transparent);
  color: var(--director);
  background: color-mix(in srgb, var(--director) 6%, transparent);
}

.twin__stat {
  margin-top: 10px;
  font-family: var(--font-display);
  font-size: 26px;
}

.twin__stat small {
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--color-ink-faint);
  margin-left: 6px;
  font-family: var(--font-kai);
}

.twin__stat.is-pending {
  color: var(--color-ink-faint);
}

.twin__enter {
  margin-top: 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 20px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--accent) 70%, transparent);
  color: var(--color-ink);
  background: color-mix(in srgb, var(--armarium) 6%, transparent);
  font-family: var(--font-sans);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.twin__enter:hover {
  background: var(--accent);
  color: var(--on-accent);
}

.twin__enter[aria-disabled='true'] {
  opacity: 0.4;
  border-style: dashed;
  pointer-events: none;
}

/* 中央徽记 */
.twins__center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.center-seal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  position: relative;
}

.center-seal__ring {
  width: 70px;
  height: 70px;
}

.center-seal__scl {
  font-family: var(--font-display);
  font-size: 10px;
  letter-spacing: 0.4em;
  color: var(--director);
  writing-mode: vertical-rl;
  text-indent: 0.4em;
}

@media (max-width: 860px) {
  .twins {
    grid-template-columns: 1fr;
    gap: 34px;
  }

  .twins__center {
    order: -1;
    margin: 0 auto;
  }

  .center-seal__scl {
    writing-mode: horizontal-tb;
  }
}
</style>
