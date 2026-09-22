<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Floor, Librarian, EmotionEntity } from '@rtl/shared'
import { api } from '@/app/services/api'
import { useTermsStore } from '@/features/turris/store/terms'

/* ============================================================
 * 迎书楼总览 · 方案 B「塔楼剖面」（草稿 2.6，2026-09-22 用户选定）
 * 视觉母题：剖面塔楼（楼层实景横带叠塔）+ 以战养藏锐角三角徽记。
 * 计数一律来自 DB（诚实口径），禁止硬编码。
 * ========================================================== */

const router = useRouter()
const terms = useTermsStore()

const floors = ref<Floor[]>([])
const librarians = ref<Librarian[]>([])
const emotions = ref<EmotionEntity[]>([])
const invitations = ref<unknown[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    const [fl, lib, ent, inv] = await Promise.all([
      api.list<Floor>('floors'),
      api.list<Librarian>('librarians'),
      api.list<EmotionEntity>('emotion_entities'),
      api.list<unknown>('invitations'),
    ])
    floors.value = fl
    librarians.value = lib
    emotions.value = ent
    invitations.value = inv
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
  // 术语计数走既有 Pinia 缓存（load 幂等，不重复请求）
  void terms.load()
})

/* ---- 计数（全部实时，空表如实显示 0 / 待录入） ---- */
const librarianCount = computed(() => librarians.value.filter((l) => l.department === 'turris').length)
const emotionCount = computed(() => emotions.value.length)
const floorCount = computed(() => floors.value.length)

const termCount = computed(() =>
  terms.sections.reduce((n, s) => n + s.groups.reduce((m, g) => m + g.entries.length, 0), 0),
)
const sectionCount = computed(() => terms.sections.length)
const invitationCount = computed(() => invitations.value.length)

/* ---- 楼层数据 ---- */
const libCountByFloor = computed<Map<number, number>>(() => {
  const map = new Map<number, number>()
  for (const l of librarians.value) {
    if (l.floorId == null) continue
    map.set(l.floorId, (map.get(l.floorId) ?? 0) + 1)
  }
  return map
})

function libCountOf(f: Floor): number {
  return libCountByFloor.value.get(f.id) ?? 0
}

/** 主题展示：库内顿号/逗号 → 「 · 」分隔（纯展示层转换）。 */
function themeOf(f: Floor): string {
  return f.theme.replace(/[、，]/g, ' · ').trim()
}

const sysLabel = (s: string): string => s.toUpperCase()

/** 塔楼剖面：最近编辑优先（updatedAt 降序，空串 = 从未编辑沉底按 sortOrder），取前 5 层。 */
const towerFloors = computed<Floor[]>(() => {
  const edited = floors.value
    .filter((f) => f.updatedAt)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.sortOrder - b.sortOrder)
  const untouched = floors.value
    .filter((f) => !f.updatedAt)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
  return [...edited, ...untouched].slice(0, 5)
})

/** 未入塔楼的层数（>0 时显示"其余 N 层"提示）。 */
const restCount = computed(() => floors.value.length - towerFloors.value.length)

function enterFloor(f: Floor): void {
  void router.push({ path: '/turris/floors', query: { floor: String(f.id) } })
}
</script>

<template>
  <div class="ov">
    <div v-if="error" class="ov-error">{{ error }}</div>

    <!-- 上部：塔楼剖面 + 以战养藏循环 -->
    <div class="tower-wrap">
      <section class="tower">
        <div class="tower-top">
          <div class="tower-top__spire"></div>
          <span class="tower-top__flag">TURRIS</span>
        </div>
        <div class="tower__head">
          <h2>迎书楼剖面</h2>
          <span class="latin latin-head">Contignationes Turris</span>
        </div>
        <div class="tower-stack">
          <div
            v-for="f in towerFloors"
            :key="f.id"
            class="tfloor"
            :title="`进入${f.name}`"
            @click="enterFloor(f)"
          >
            <div class="tfloor__bg"><img :src="f.artwork" :alt="f.name" /></div>
            <div class="tfloor__shade"></div>
            <div class="tfloor__body">
              <span class="tfloor__code">{{ f.code }}</span>
              <span class="tfloor__name">{{ f.name }}</span>
              <span v-if="themeOf(f)" class="tfloor__theme">{{ themeOf(f) }}</span>
              <span v-else class="tfloor__theme tfloor__theme--empty">主题待补</span>
              <span class="tfloor__sys">{{ sysLabel(f.battleSystem) }}</span>
              <span class="tfloor__count"><b>{{ libCountByFloor.get(f.id) ?? 0 }}</b> 司书</span>
              <span class="tfloor__arrow">›</span>
            </div>
          </div>
          <div v-if="loading && floors.length === 0" class="tfloor tfloor--skel">
            <div class="tfloor__shade"></div>
          </div>
          <RouterLink v-if="restCount > 0" class="tower-rest" to="/turris/floors">
            其余 {{ restCount }} 层 · 见「楼层」Tab <span aria-hidden="true">↗</span>
          </RouterLink>
        </div>
      </section>

      <!-- 右侧：以战养藏循环 -->
      <section class="cycle">
        <div class="cycle__head">
          <h2>以战养藏</h2>
          <span class="latin latin-head">Ex Bello Liberi</span>
        </div>
        <p class="cycle__intro">
          迎书楼的使命是<b>将每一个挑战图书馆的存在转化为新的书籍</b>，扩充馆藏；部分馆藏将被藏书阁加工提取为新的核心书页，补充图书馆的人力资源。
        </p>
        <div class="tri">
          <svg class="tri__svg" viewBox="0 0 204 196">
            <!-- 外三角：锐利轮廓 -->
            <polygon points="102,12 173,156 31,156" fill="rgba(192,74,50,.08)" stroke="rgba(192,74,50,.8)" stroke-width="2.4" stroke-linejoin="round"/>
            <!-- 内三角：鎏金细线 -->
            <polygon points="102,46 143,140 61,140" fill="none" stroke="rgba(224,181,100,.55)" stroke-width="1.1" stroke-linejoin="round"/>
            <!-- 顶点铆点 -->
            <circle cx="102" cy="12" r="3.6" fill="#c04a32"/>
            <circle cx="31" cy="156" r="3.6" fill="#c04a32"/>
            <circle cx="173" cy="156" r="3.6" fill="#c04a32"/>
            <!-- 中心 -->
            <text x="102" y="88" text-anchor="middle" font-family="'EB Garamond','Noto Serif SC',serif" font-size="21" letter-spacing=".16em" fill="#eee2cb">战斗·成书</text>
            <text x="102" y="108" text-anchor="middle" font-family="'LXGW WenKai','Noto Serif SC',serif" font-size="10.5" letter-spacing=".04em" fill="#c04a32">Challengers → Books</text>
            <!-- 铭文：三角底边下方横排（正立可读） -->
            <text x="102" y="181" text-anchor="middle" font-family="'Cinzel','EB Garamond',serif" font-size="9.5" letter-spacing=".24em" fill="#8d8172">RECEPTIO · VICTORIA · LIBER · COLLECTIO</text>
          </svg>
        </div>
        <div class="cycle__stats">
          <div class="cstat">
            <span class="cstat__num">{{ librarianCount }}<small>人</small></span>
            <span class="cstat__label">迎书楼司书</span>
          </div>
          <div class="cstat">
            <span class="cstat__num">{{ emotionCount }}<small>体</small></span>
            <span class="cstat__label">情感实体</span>
          </div>
          <div class="cstat">
            <span class="cstat__num">{{ floorCount }}<small>层</small></span>
            <span class="cstat__label">战斗楼层</span>
          </div>
        </div>
        <RouterLink class="btn" to="/turris/floors">进入楼层 <span aria-hidden="true">↗</span></RouterLink>
        <RouterLink class="btn btn--ghost" to="/turris/systems">战斗系统详解 <span aria-hidden="true">↗</span></RouterLink>
      </section>
    </div>

    <!-- 下部：接待流程 + 词典规模 -->
    <div class="bottom">
      <section class="panel">
        <div class="panel__head">
          <h2>接待的五个环节</h2>
          <span class="latin latin-head">Ordo Receptionis</span>
        </div>
        <div class="steps">
          <div class="step">
            <div class="step__dot">I</div>
            <div class="step__label">寄出<br />邀请函</div>
          </div>
          <div class="step">
            <div class="step__dot">II</div>
            <div class="step__label">签下姓名<br />传送抵达</div>
          </div>
          <div class="step">
            <div class="step__dot">III</div>
            <div class="step__label">选择楼层<br />接受接待</div>
          </div>
          <div class="step">
            <div class="step__dot">IV</div>
            <div class="step__label">通过试炼<br />取走奖励</div>
          </div>
          <div class="step">
            <div class="step__dot">V</div>
            <div class="step__label">陨落者<br />化为书籍</div>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel__head">
          <h2>术语与词典</h2>
          <span class="latin latin-head">Thesaurus Verborum</span>
        </div>
        <div class="terms-row">
          <span class="terms-row__num">{{ termCount }}<small>词条</small></span>
          <span class="terms-row__label">术语词典 · 十二分区</span>
          <span class="terms-row__latin latin">Termini</span>
        </div>
        <div class="terms-row">
          <span class="terms-row__num">{{ sectionCount }}<small>区</small></span>
          <span class="terms-row__label">战斗机制 / 基本数值 / 异常状态…</span>
          <span class="terms-row__latin latin">Sections</span>
        </div>
        <div class="terms-row terms-row--dim">
          <span class="terms-row__num terms-row__num--dim">{{ invitationCount }}<small>封</small></span>
          <span class="terms-row__label">邀请函 · 待录入</span>
          <span class="terms-row__latin latin">Invitationes</span>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================
 * 移植自 草稿\2.6-迎书楼总览页\03-方案B-塔楼剖面.html（样式对齐版）
 * 设计变量沿用全站 tokens.css（module-shell[data-theme='turris'] 已把
 * --accent/--color-gold 指向 --turris）；草稿硬编码的塔楼红色细节原样保留。
 * ============================================================ */
.ov {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.ov-error {
  border: 1px solid var(--error);
  border-radius: var(--radius);
  padding: 10px 14px;
  color: var(--error);
  font-size: 13px;
}

.latin-head {
  font-size: 10px;
  letter-spacing: 0.18em;
  color: var(--color-ink-faint);
  text-transform: uppercase;
  margin-left: auto;
}

/* ---- 上部：塔楼全景 ---- */
.tower-wrap {
  display: grid;
  grid-template-columns: 1.25fr 0.75fr;
  gap: 20px;
  align-items: stretch;
}
@media (max-width: 920px) {
  .tower-wrap {
    grid-template-columns: 1fr;
  }
}

/* 塔楼本体：剖面叠加 */
.tower {
  position: relative;
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: calc(var(--radius) + 2px);
  background: var(--color-surface);
  padding: 20px 22px 18px;
  overflow: hidden;
}
.tower::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(90deg, rgba(192, 74, 50, 0.05) 0 1px, transparent 1px 34px),
    repeating-linear-gradient(0deg, rgba(192, 74, 50, 0.04) 0 1px, transparent 1px 30px);
  pointer-events: none;
}
.tower__head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 16px;
  position: relative;
}
.tower__head h2 {
  font-size: 19px;
  font-family: var(--font-serif);
  font-weight: 600;
  margin: 0;
}

/* 楼层剖面格：每层 = 背景图横条 + 信息覆层 */
.tower-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
}
.tfloor {
  position: relative;
  height: 104px;
  border-radius: calc(var(--radius) + 2px);
  overflow: hidden;
  border: var(--bd-w) var(--bd-style) rgba(192, 74, 50, 0.35);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.tfloor:hover {
  transform: translateX(4px);
  box-shadow:
    0 0 0 1px rgba(192, 74, 50, 0.55),
    0 8px 22px rgba(0, 0, 0, 0.4);
}
.tfloor__bg {
  position: absolute;
  inset: 0;
}
.tfloor__bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: saturate(0.82) brightness(0.72);
}
.tfloor__shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(12, 9, 6, 0.92) 0%,
    rgba(12, 9, 6, 0.55) 46%,
    rgba(12, 9, 6, 0.28) 78%,
    rgba(12, 9, 6, 0.55) 100%
  );
}
.tfloor__body {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 16px;
}
.tfloor__code {
  font-family: var(--font-display);
  font-size: 13px;
  letter-spacing: 0.12em;
  color: var(--turris);
  min-width: 52px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}
.tfloor__name {
  font-family: var(--font-serif);
  font-size: 19px;
  font-weight: 700;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}
.tfloor__theme {
  font-size: 12px;
  color: var(--color-ink-dim);
  font-family: var(--font-kai);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}
.tfloor__theme--empty {
  color: var(--color-ink-faint);
}
.tfloor__sys {
  font-family: var(--font-display);
  font-size: 10px;
  letter-spacing: 0.12em;
  color: #f0c75e;
  border: 1px solid rgba(240, 199, 94, 0.4);
  background: rgba(10, 8, 5, 0.55);
  border-radius: 999px;
  padding: 1px 8px;
}
.tfloor__count {
  margin-left: auto;
  font-family: var(--font-kai);
  font-size: 12px;
  color: var(--color-ink-dim);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}
.tfloor__count b {
  font-family: var(--font-display);
  font-size: 16px;
  color: var(--color-ink);
}
.tfloor__arrow {
  color: var(--color-ink-faint);
  font-size: 14px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}
/* 加载占位横条（形状与楼层横带一致） */
.tfloor--skel {
  height: 104px;
  background: rgba(32, 26, 20, 0.6);
}
/* 最近编辑之外的余层提示行 */
.tower-rest {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px dashed rgba(192, 74, 50, 0.4);
  border-radius: var(--radius);
  font-size: 12px;
  font-family: var(--font-kai);
  color: var(--color-ink-dim);
  text-decoration: none;
  transition:
    border-color 0.2s,
    color 0.2s;
}
.tower-rest:hover {
  border-color: var(--turris);
  color: var(--color-ink);
  text-decoration: none;
}

/* 塔尖装饰 */
.tower-top {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}
.tower-top__spire {
  width: 0;
  height: 0;
  border-left: 14px solid transparent;
  border-right: 14px solid transparent;
  border-bottom: 22px solid rgba(192, 74, 50, 0.85);
}
.tower-top__flag {
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.34em;
  color: var(--turris);
}

/* ---- 右侧：以战养藏 · 循环 ---- */
.cycle {
  display: flex;
  flex-direction: column;
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: calc(var(--radius) + 2px);
  background: var(--color-surface);
  padding: 20px;
  gap: 16px;
}
.cycle__head {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.cycle__head h2 {
  font-size: 19px;
  font-family: var(--font-serif);
  font-weight: 600;
  margin: 0;
}
.cycle__intro {
  font-family: var(--font-kai);
  font-size: 13.5px;
  color: var(--color-ink-dim);
  line-height: 1.9;
  margin: 0;
}
.cycle__intro b {
  color: var(--color-ink);
}
/* 三角徽记（2026-09-22 用户决议：由圆形改为锐角三角形——三角代表攻击性，象征迎书楼的战斗强度） */
.tri {
  position: relative;
  width: 204px;
  height: 196px;
  margin: 2px auto 0;
  filter: drop-shadow(0 10px 22px rgba(0, 0, 0, 0.45));
}
.tri__svg {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}
.tri:hover .tri__svg {
  transform: rotate(-2.5deg) scale(1.045);
}
.tri__core {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  text-align: center;
  pointer-events: none;
}
.cycle__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  border-top: var(--bd-w) dashed rgba(233, 221, 198, 0.2);
  padding-top: 14px;
}
.cstat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  text-align: center;
}
.cstat__num {
  font-family: var(--font-display);
  font-size: 22px;
  color: var(--color-ink);
  font-variant-numeric: tabular-nums;
}
.cstat__num small {
  font-size: 11px;
  color: var(--turris);
  font-family: var(--font-kai);
}
.cstat__label {
  font-size: 11px;
  color: var(--color-ink-faint);
  font-family: var(--font-kai);
}
.cycle__cta {
  margin-top: auto;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--accent) 65%, transparent);
  background: color-mix(in srgb, var(--turris) 8%, transparent);
  color: var(--color-ink);
  font-family: var(--font-sans);
  font-size: 13px;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
  text-decoration: none;
  width: 100%;
  justify-content: center;
}
.btn:hover {
  background: var(--accent);
  color: var(--on-accent);
  text-decoration: none;
}
.btn--ghost {
  background: transparent;
  border-color: var(--color-line);
}

/* ---- 下部：接待与规模 ---- */
.bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}
@media (max-width: 920px) {
  .bottom {
    grid-template-columns: 1fr;
  }
}
.panel {
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: calc(var(--radius) + 2px);
  background: var(--color-surface);
  padding: 18px 20px;
}
.panel__head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 14px;
}
.panel__head h2 {
  font-size: 17px;
  font-family: var(--font-serif);
  font-weight: 600;
  margin: 0;
}
.steps {
  display: flex;
  gap: 0;
  align-items: stretch;
}
.step {
  flex: 1;
  text-align: center;
  position: relative;
  padding: 0 6px;
}
.step::after {
  content: '';
  position: absolute;
  top: 15px;
  left: calc(50% + 14px);
  right: calc(-50% + 14px);
  height: 1px;
  background: rgba(192, 74, 50, 0.4);
}
.step:last-child::after {
  display: none;
}
.step__dot {
  width: 30px;
  height: 30px;
  margin: 0 auto 8px;
  border-radius: 50%;
  border: 1px solid rgba(192, 74, 50, 0.55);
  background: rgba(192, 74, 50, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 11px;
  color: var(--turris);
  position: relative;
  z-index: 1;
}
.step__label {
  font-family: var(--font-kai);
  font-size: 12px;
  color: var(--color-ink-dim);
  line-height: 1.5;
}
.terms-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: var(--radius);
  background: rgba(20, 16, 11, 0.5);
  margin-bottom: 8px;
}
.terms-row:last-child {
  margin-bottom: 0;
}
.terms-row__num {
  font-family: var(--font-display);
  font-size: 22px;
  color: var(--color-ink);
  font-variant-numeric: tabular-nums;
  min-width: 64px;
}
.terms-row__num small {
  font-size: 12px;
  color: var(--turris);
  font-family: var(--font-kai);
}
.terms-row__label {
  font-family: var(--font-kai);
  font-size: 13px;
  color: var(--color-ink-dim);
}
.terms-row__latin {
  margin-left: auto;
  font-size: 10px;
  letter-spacing: 0.14em;
  color: var(--color-ink-faint);
  text-transform: uppercase;
}
/* 待录入行（诚实口径：邀请函空表） */
.terms-row--dim .terms-row__label {
  color: var(--color-ink-faint);
}
.terms-row--dim {
  margin-top: 10px;
}
.terms-row__num--dim {
  font-size: 14px;
  color: var(--color-ink-faint);
}
.terms-row__num--dim small {
  color: var(--color-ink-faint);
}

/* 窄屏：塔楼横带信息换行不溢出 */
@media (max-width: 620px) {
  .tfloor__body {
    flex-wrap: wrap;
    gap: 4px 12px;
    padding: 10px 14px;
  }
  .tfloor__count {
    margin-left: auto;
  }
}
</style>
