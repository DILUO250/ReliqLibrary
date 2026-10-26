<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { BattleReadyLibrarian, BattleState, Floor, Librarian, UnitSeed } from '@rtl/shared'
import { filterBattleReady, createBattle, initialDraw } from '@rtl/shared'
import { api } from '@/app/services/api'
import { battleNavHidden } from './navState'
import SelectView from './views/SelectView.vue'
import type { FloorGroup } from './views/SelectView.vue'
import BattleView from './views/BattleView.vue'
import ResultOverlay from './views/ResultOverlay.vue'

const router = useRouter()

/* ---------- 数据加载 ---------- */
const loading = ref(false)
const error = ref<string | null>(null)
const ready = ref<BattleReadyLibrarian[]>([])
const floorMap = ref<Map<number, Floor>>(new Map())

/* ---------- 选人状态 ---------- */
const phase = ref<'select' | 'battle' | 'result'>('select')
const allyPick = ref<number | null>(null)
const enemyPick = ref<number | null>(null)
const activeSlot = ref<'ally' | 'enemy'>('ally')
const pinned = ref(false)
const timerLeft = ref(60)
let timerId: ReturnType<typeof setInterval> | null = null

/* ---------- 战斗状态 ---------- */
const battleState = ref<BattleState | null>(null)
const result = ref<{ winner: 'ally' | 'enemy'; bothDead: boolean; turn: number } | null>(null)
const entering = ref(false)

const byId = computed(() => new Map(ready.value.map((r) => [r.id, r])))

/* ---------- 分组与排序（楼层 sortOrder → 司书 sortOrder） ---------- */
const groups = computed<FloorGroup[]>(() => {
  const floorOrder = new Map<number, number>()
  for (const f of floorMap.value.values()) floorOrder.set(f.id, f.sortOrder)
  const map = new Map<number, BattleReadyLibrarian[]>()
  for (const r of ready.value) {
    if (r.floorId == null) continue
    const arr = map.get(r.floorId) ?? []
    arr.push(r)
    map.set(r.floorId, arr)
  }
  const out: FloorGroup[] = []
  for (const [floorId, members] of map) {
    members.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
    const f = floorMap.value.get(floorId)
    out.push({ floorId, name: f?.name ?? `楼层 ${floorId}`, code: f?.code ?? '', members })
  }
  out.sort((a, b) => (floorOrder.get(b.floorId) ?? 0) - (floorOrder.get(a.floorId) ?? 0) || a.floorId - b.floorId)
  return out
})

/* ---------- 选人交互 ---------- */
function onPick(id: number): void {
  if (phase.value !== 'select') return
  // -1 / -2 表示点击上方槽位切换 activeSlot
  if (id === -1) {
    activeSlot.value = 'ally'
    pinned.value = true
    return
  }
  if (id === -2) {
    activeSlot.value = 'enemy'
    pinned.value = true
    return
  }
  // 再点一次已选中的司书 = 撤销
  if (allyPick.value === id) {
    allyPick.value = null
    activeSlot.value = 'ally'
    pinned.value = false
    return
  }
  if (enemyPick.value === id) {
    enemyPick.value = null
    activeSlot.value = 'enemy'
    pinned.value = false
    return
  }
  // 未 pinned 且当前槽已有选人，则切到另一槽
  const other: 'ally' | 'enemy' = activeSlot.value === 'ally' ? 'enemy' : 'ally'
  if (!pinned.value && (activeSlot.value === 'ally' ? allyPick.value : enemyPick.value) !== null) {
    activeSlot.value = other
  }
  if (activeSlot.value === 'ally') allyPick.value = id
  else enemyPick.value = id
  activeSlot.value = other
  pinned.value = false
}

function onRandom(): void {
  if (phase.value !== 'select') return
  const pool = ready.value.filter((r) => r.id !== allyPick.value && r.id !== enemyPick.value)
  if (allyPick.value == null && pool.length) {
    allyPick.value = pool[Math.floor(Math.random() * pool.length)]!.id
  }
  const pool2 = ready.value.filter((r) => r.id !== allyPick.value && r.id !== enemyPick.value)
  if (enemyPick.value == null && pool2.length) {
    enemyPick.value = pool2[Math.floor(Math.random() * pool2.length)]!.id
  }
}

/* ---------- 倒计时 ---------- */
function startTimer(): void {
  stopTimer()
  timerLeft.value = 60
  timerId = setInterval(() => {
    timerLeft.value--
    if (timerLeft.value <= 0) {
      stopTimer()
      onRandom()
      setTimeout(() => onStart(), 500)
    }
  }, 1000)
}
function stopTimer(): void {
  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }
}

/* ---------- 进入战斗 ---------- */
function toSeed(r: BattleReadyLibrarian): UnitSeed {
  return {
    id: r.id,
    name: r.name,
    title: r.title,
    portrait: r.portrait,
    floorId: r.floorId,
    hp: r.hp,
    stagger: r.stagger,
    speedMin: r.speedMin,
    speedMax: r.speedMax,
    resistPhysic: r.resistPhysic,
    resistChaos: r.resistChaos,
    cards: r.cards,
  }
}

function onStart(): void {
  if (allyPick.value == null || enemyPick.value == null) return
  const a = byId.value.get(allyPick.value)
  const e = byId.value.get(enemyPick.value)
  if (!a || !e) return
  stopTimer()
  // 入场动画：先亮起开场遮罩，短暂停顿后真正进入战斗，避免切换生硬。
  battleState.value = createBattle(toSeed(a), toSeed(e))
  initialDraw(battleState.value)
  result.value = null
  entering.value = true
  setTimeout(() => {
    entering.value = false
    phase.value = 'battle'
  }, 900)
}

function onBattleEnd(winner: 'ally' | 'enemy', bothDead: boolean, turn: number): void {
  result.value = { winner, bothDead, turn }
  phase.value = 'result'
}

/* ---------- 再来一局 / 返回 ---------- */
function onAgain(): void {
  // 保留双方上次所选，回到选人界面
  phase.value = 'select'
  battleState.value = null
  result.value = null
  startTimer()
}

function onBack(): void {
  router.push('/turris/invitations')
}

/* ---------- 加载 ---------- */
async function load(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const [fl, lib] = await Promise.all([api.list<Floor>('floors'), api.list<Librarian>('librarians')])
    floorMap.value = new Map(fl.map((f) => [f.id, f]))
    ready.value = filterBattleReady(lib)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await load()
  startTimer()
})

/* 战斗/结算阶段临时隐藏全站 SiteNav（舞台全屏会被 62px 导航遮挡），离开组件时恢复 */
watch(phase, (p) => {
  battleNavHidden.value = p !== 'select'
})
onBeforeUnmount(() => {
  stopTimer()
  battleNavHidden.value = false
})

const allyObj = computed(() => (allyPick.value != null ? byId.value.get(allyPick.value) ?? null : null))
const enemyObj = computed(() => (enemyPick.value != null ? byId.value.get(enemyPick.value) ?? null : null))
</script>

<template>
  <div class="simulator">
    <!-- 返回按钮（仅选人阶段显示；战斗中经投降 → 结算 → 返回迎书楼） -->
    <button v-if="phase === 'select'" class="back-btn" @click="onBack">← 返回迎书楼</button>

    <!-- 加载中 -->
    <div v-if="loading" class="loading">
      <div class="loading-text">正在调取迎书楼司书名册…</div>
    </div>

    <!-- 加载失败 -->
    <div v-else-if="error" class="loading">
      <div class="loading-text error">{{ error }}</div>
      <button class="btn" @click="load">重试</button>
    </div>

    <!-- 无可出战司书 -->
    <div v-else-if="ready.length === 0" class="loading">
      <div class="loading-text">当前没有可出战的迎书楼司书（需要常规司书 + 立绘 + 至少 1 张战斗卡）</div>
      <button class="btn" @click="onBack">返回迎书楼</button>
    </div>

    <!-- 选人 -->
    <SelectView
      v-else-if="phase === 'select'"
      :groups="groups"
      :ally-pick="allyPick"
      :enemy-pick="enemyPick"
      :ally-obj="allyObj"
      :enemy-obj="enemyObj"
      :active-slot="activeSlot"
      :timer-left="timerLeft"
      @pick="onPick"
      @random="onRandom"
      @start="onStart"
    />

    <!-- 战斗 -->
    <BattleView v-else-if="phase === 'battle' && battleState" :state="battleState" @battle-end="onBattleEnd" />

    <!-- 结算 -->
    <ResultOverlay
      v-if="phase === 'result' && result && battleState"
      :winner="result.winner"
      :both-dead="result.bothDead"
      :turn="result.turn"
      :ally="battleState.ally"
      :enemy="battleState.enemy"
      @again="onAgain"
      @back="onBack"
    />

    <!-- 入场过渡遮罩：选人 → 战斗的柔和切换 -->
    <Transition name="enter">
      <div v-if="entering" class="enter-veil">
        <div class="enter-word">RECEPTIO</div>
        <div class="enter-sub">接待 开 始</div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.simulator {
  position: fixed;
  inset: 0;
  background: var(--color-bg);
  color: var(--color-ink);
  overflow: hidden;
}
.back-btn {
  position: absolute;
  top: 62px;
  left: 16px;
  z-index: 200;
  font-family: var(--font-serif);
  font-size: 13px;
  letter-spacing: 0.15em;
  color: var(--color-ink-dim);
  background: var(--color-surface);
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: var(--radius);
  padding: 7px 14px;
  cursor: pointer;
  transition: all 0.15s;
}
.back-btn:hover {
  color: var(--color-ink);
  border-color: var(--accent);
}
.loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}
.loading-text {
  font-family: var(--font-serif);
  font-size: 15px;
  letter-spacing: 0.2em;
  color: var(--color-ink-dim);
}
.loading-text.error {
  color: var(--error);
}
.btn {
  font-family: var(--font-serif);
  cursor: pointer;
  letter-spacing: 0.3em;
  color: var(--color-gold);
  background: linear-gradient(180deg, rgba(224, 181, 100, 0.13), rgba(224, 181, 100, 0.05));
  border: 1px solid rgba(224, 181, 100, 0.45);
  border-radius: 6px;
  padding: 9px 30px;
  font-size: 14px;
}

/* ---------- 入场过渡 ---------- */
.enter-veil {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  background: radial-gradient(1000px 600px at 50% 45%, #241a0e, #0a0704 75%);
}
.enter-word {
  font-family: var(--font-display);
  font-size: 44px;
  letter-spacing: 0.5em;
  padding-left: 0.5em;
  color: var(--color-gold);
  text-shadow: 0 0 40px rgba(224, 181, 100, 0.55);
}
.enter-sub {
  font-size: 13px;
  letter-spacing: 0.6em;
  color: var(--color-ink-dim);
}
.enter-enter-active,
.enter-leave-active {
  transition: opacity 0.35s ease;
}
.enter-enter-from,
.enter-leave-to {
  opacity: 0;
}
</style>
