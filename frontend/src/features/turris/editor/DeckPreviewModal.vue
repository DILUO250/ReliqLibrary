<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Librarian, Mechanism, BattleCard } from '@rtl/shared'
import {
  parseSheet,
  BATTLE_SYSTEMS,
  professionLabel,
  pkmAttributeDisplay,
} from '@rtl/shared'
import VisualCard from '@/features/turris/card/VisualCard.vue'
import RenderedText from '@/features/turris/terms/RenderedText.vue'
import { TAG_STYLES } from '@/features/turris/terms/tagStyles'
import type { TermFormat } from '@rtl/shared'
import { formatToCss } from '@/features/turris/terms/format'
import type { PrivateTerm } from '@/features/turris/terms/renderer'

function tagStyle(type: string): Record<string, string> {
  const f: TermFormat =
    TAG_STYLES[type] ?? { color: '#eee2cb', bold: false, italic: false, underline: 'none' }
  return formatToCss(f)
}

function mechNameStyle(m: Mechanism): Record<string, string> {
  return m.format ? formatToCss(m.format) : {}
}
function mindNameStyle(mind: { name: string; format?: TermFormat }): Record<string, string> {
  return mind.format ? formatToCss(mind.format) : {}
}

const props = defineProps<{ librarian: Librarian; roman: string }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const sheet = computed(() => parseSheet(props.librarian.sheet))
const system = computed(() => (sheet.value ? BATTLE_SYSTEMS[sheet.value.battleSystem] : undefined))
const resist = computed(() => sheet.value?.resist)

/** 草稿口径：抗性以 ×倍率 显示。 */
function resistValue(v: number | undefined): string {
  return `×${(v ?? 1).toFixed(1)}`
}

/* ---------- 被动 / 机制（左下能力区，新版渲染器：词条带小点） ---------- */
const passiveItems = computed(() => {
  const list = sheet.value?.passives ?? []
  return list.map((p, i) => ({
    num: i + 1,
    name: p.name,
    effect: p.effect,
  }))
})

/** 词条详情大窗：null = 关闭。 */
const detail = ref<null | { kicker: string; name: string; sub: string; style: Record<string, string>; text: string }>(null)
function openPassive(p: { num: number; name: string; effect: string }) {
  detail.value = {
    kicker: `PASSIVE ${String(p.num).padStart(2, '0')} / 被动能力`,
    name: p.name,
    sub: '',
    style: {},
    text: p.effect,
  }
}
function openMech(m: Mechanism, i: number) {
  const parts: string[] = []
  if (m.stack) parts.push(`${m.stack}层`)
  if (m.type) parts.push(m.type)
  detail.value = {
    kicker: `MECHANISM ${String(i + 1).padStart(2, '0')} / 特殊机制`,
    name: m.name,
    sub: parts.join(' · '),
    style: mechNameStyle(m),
    text: m.desc ?? '',
  }
}
function closeDetail() {
  detail.value = null
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (detail.value) closeDetail()
    else emit('close')
  }
}
/* 全屏覆盖期间锁定底层页面滚动。 */
watch(
  () => props.librarian,
  () => {
    document.body.style.overflow = 'hidden'
  },
  { immediate: true },
)
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})

/* ---------- 系统机制区（沿用现有逻辑：理智/EGO/心、RHD、PKM） ---------- */
const sd = computed(() => sheet.value?.systemData ?? null)
const sdHasSanity = computed(() => {
  const d = sd.value
  return !!d && (d.hasSanity ?? (d.sanityMax != null || d.sanityMin != null || !!d.sanityGainCond || !!d.sanityLossCond || !!d.panicType || !!d.panicLow || !!d.panicPanic))
})
const sdHasEgo = computed(() => {
  const d = sd.value
  return !!d && (d.hasEgo ?? (!!d.egoManifest || !!d.distortionName))
})
const sdHasMind = computed(() => {
  const d = sd.value
  return !!d && (d.hasMind ?? (!!d.mind?.name || !!d.mind?.effect))
})

const rhdElement = computed(() => (system.value?.id === 'rhd' ? sd.value?.elementDamage ?? null : null))
const rhdProfession = computed(() => {
  const name = sd.value?.profession ?? ''
  return name && system.value?.id === 'rhd' ? professionLabel(name) : ''
})

const pkmRealAttrs = computed(() => (system.value?.id === 'pkm' ? pkmAttributeDisplay(sd.value?.attributes) : []))

const privateTerms = computed<PrivateTerm[]>(() => {
  const s = sheet.value
  if (!s) return []
  const list: PrivateTerm[] = []
  for (const m of s.mechanisms) {
    if (m.name && m.format) list.push({ name: m.name, format: m.format })
  }
  const mind = s.systemData?.mind
  if (mind?.name && mind.format) list.push({ name: mind.name, format: mind.format })
  return list
})

/* ---------- 卡组区：按系统 deckZones 分区，每行固定三张，尺寸随根元素自适应 ---------- */
const zones = computed(() => system.value?.deckZones ?? [])
const zoneCards = computed(() =>
  zones.value.map((z) => ({
    zone: z,
    cards: (sheet.value?.cards?.[z.key] as BattleCard[] | undefined) ?? [],
  })),
)
const totalCards = computed(() => zoneCards.value.reduce((n, z) => n + z.cards.length, 0))

/* 大内容延迟渲染：先显示骨架占位，两帧后再挂载完整卡面，避免弹窗动画被阻塞。 */
const ready = ref(false)
let raf1 = 0
let raf2 = 0
onMounted(() => {
  raf1 = requestAnimationFrame(() => {
    raf2 = requestAnimationFrame(() => {
      ready.value = true
    })
  })
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf1)
  cancelAnimationFrame(raf2)
})

/* 卡组固定三列：列宽随容器自适应（1fr），卡内元素由 VisualCard 按自身宽度等比缩放。
   观察对象为整个卡组滚动容器（各卡区同宽，一份观察即可），预留滚动条宽度。 */
const DECK_GAP = 14
const SCROLLBAR_ALLOWANCE = 12
const deckEl = ref<HTMLElement | null>(null)
const deckWidth = ref(0)
let deckResize: ResizeObserver | null = null
const deckCardWidth = computed(() =>
  Math.max(150, Math.floor((deckWidth.value - SCROLLBAR_ALLOWANCE - DECK_GAP * 2) / 3)),
)
onMounted(() => {
  deckResize = new ResizeObserver((entries) => {
    deckWidth.value = Math.floor(entries[0]?.contentRect.width ?? 0)
  })
})
watch(deckEl, (el) => {
  if (el) deckResize?.observe(el)
})
onBeforeUnmount(() => {
  deckResize?.disconnect()
  deckResize = null
})
</script>

<template>
  <div class="pv-overlay" role="dialog" aria-label="司书预览">
    <div class="app">
      <!-- 顶栏 -->
      <header class="topbar">
        <div class="brand">
          <span class="tri"></span>
          <div>
            <b>迎书楼 · 司书预览</b>
            <small>CURATOR COMBAT ARCHIVE</small>
          </div>
        </div>
        <span class="crumb">司书预览 / {{ roman || '——' }} / {{ system?.zh ?? '—' }}</span>
        <div class="top-actions">
          <button class="exit-btn" type="button" @click="emit('close')">退出</button>
        </div>
      </header>

      <template v-if="sheet && ready">
        <div class="workspace">
          <!-- 中央信息区 -->
          <section class="center-pane">
            <div class="center-scroll">
              <div class="identity">
                <div class="eyebrow">ACTIVE CURATOR / {{ roman || '——' }}</div>
                <h1 class="name">{{ sheet.name }}</h1>
                <div class="title">{{ librarian.title }}</div>
                <div class="identity-chips">
                  <span class="chip chip--red">迎书楼</span>
                  <span class="chip">{{ system?.zh ?? '—' }}</span>
                </div>
                <div v-if="librarian.affiliation" class="affiliation">{{ librarian.affiliation }}</div>
              </div>

              <div class="stats">
                <div class="stat"><small>体力 / HP</small><b>{{ sheet.hp }}</b></div>
                <div class="stat"><small>混乱抗性</small><b>{{ sheet.stagger }}</b></div>
                <div class="stat"><small>速度区间</small><b>{{ sheet.speedMin }}–{{ sheet.speedMax }}</b></div>
              </div>

              <div v-if="resist" class="resists" aria-label="伤害抗性">
                <div class="resist-row">
                  <div class="resist-label">物理抗性</div>
                  <div class="r-cell"><small>斩击</small><b>{{ resistValue(resist.physic.slash) }}</b></div>
                  <div class="r-cell"><small>突刺</small><b>{{ resistValue(resist.physic.pierce) }}</b></div>
                  <div class="r-cell"><small>打击</small><b>{{ resistValue(resist.physic.strike) }}</b></div>
                </div>
                <div class="resist-row">
                  <div class="resist-label">混乱抗性</div>
                  <div class="r-cell"><small>斩击</small><b>{{ resistValue(resist.chaos.slash) }}</b></div>
                  <div class="r-cell"><small>突刺</small><b>{{ resistValue(resist.chaos.pierce) }}</b></div>
                  <div class="r-cell"><small>打击</small><b>{{ resistValue(resist.chaos.strike) }}</b></div>
                </div>
              </div>

              <!-- 系统机制 · 情感等级（理智 / EGO / 心） -->
              <section v-if="sd && (sdHasSanity || sdHasEgo || sdHasMind)" class="sysblock">
                <div class="sysblock-head">系统机制 · 情感等级</div>
                <div v-if="sdHasSanity" class="sysrow">
                  <div class="sysrow-title sanity-light">理智值机制</div>
                  <div class="sysmeta"><span class="sanity-deep">上限</span> <b>{{ sd!.sanityMax ?? '—' }}</b> · <span class="sanity-deep">下限</span> <b>{{ sd!.sanityMin ?? '—' }}</b></div>
                  <div v-if="sd!.sanityGainCond" class="systext">
                    <b class="sanity-light">理智值增加条件</b>：<RenderedText :text="sd!.sanityGainCond ?? ''" :private-terms="privateTerms" term-marker />
                  </div>
                  <div v-if="sd!.sanityLossCond" class="systext">
                    <b class="sanity-light">理智值减少条件</b>：<RenderedText :text="sd!.sanityLossCond ?? ''" :private-terms="privateTerms" term-marker />
                  </div>
                  <div v-if="sd!.panicType || sd!.panicLow || sd!.panicPanic" class="systext">
                    <div class="syssub"><span class="sanity-deep">恐慌类型</span> 〔<span class="panic-red">{{ sd!.panicType || '未命名' }}</span>〕</div>
                    <div v-if="sd!.panicLow"><b class="panic-red">士气低落</b>：<RenderedText :text="sd!.panicLow ?? ''" :private-terms="privateTerms" term-marker /></div>
                    <div v-if="sd!.panicPanic"><b class="panic-red">陷入恐慌</b>：<RenderedText :text="sd!.panicPanic ?? ''" :private-terms="privateTerms" term-marker /></div>
                  </div>
                </div>
                <div v-if="sdHasEgo" class="sysrow">
                  <div class="sysrow-title">扭曲 &amp; EGO 展现</div>
                  <div v-if="sd!.distortionName" class="systext"><b>扭曲展现</b>：{{ sd!.distortionName }}</div>
                  <div v-if="sd!.egoManifest" class="systext"><b>EGO 展现</b>：{{ sd!.egoManifest }}</div>
                </div>
                <div v-if="sdHasMind" class="sysrow">
                  <div class="sysrow-title">心 &amp; 望</div>
                  <div v-if="sd!.mind" class="systext">
                    <b :style="mindNameStyle(sd!.mind!)">{{ sd!.mind!.name }}</b>
                    <RenderedText v-if="sd!.mind!.effect" :text="sd!.mind!.effect ?? ''" :private-terms="privateTerms" term-marker />
                  </div>
                </div>
              </section>

              <!-- RHD 系统机制 -->
              <section v-if="system?.id === 'rhd' && sd && (rhdElement != null || rhdProfession)" class="sysblock">
                <div class="sysblock-head">系统机制 · 部署点数</div>
                <div v-if="rhdElement != null" class="systext"><b>元素损伤上限</b>：{{ rhdElement }} 点</div>
                <div v-if="rhdProfession" class="systext"><b>职业</b>：{{ rhdProfession }}</div>
              </section>

              <!-- PKM 系统机制 -->
              <section v-if="system?.id === 'pkm' && sd" class="sysblock">
                <div class="sysblock-head">系统机制 · 奇迹能量</div>
                <div v-if="pkmRealAttrs.length" class="systext">
                  <b>属性</b>：<span v-for="t in pkmRealAttrs" :key="t" class="pkmtag">{{ t }}</span>
                </div>
                <div v-else class="systext">训练师（无属性）</div>
                <div v-if="sd!.megaForm" class="systext"><b>MEGA 形态</b>：{{ sd!.megaForm }}</div>
                <div v-if="sd!.zMove" class="systext"><b>专属 Z 招式</b>：{{ sd!.zMove }}</div>
                <div v-if="sd!.gmaxForm" class="systext"><b>超极巨形态</b>：{{ sd!.gmaxForm }}</div>
                <div v-if="sd!.teraType && sd!.teraType !== '无属性'" class="systext"><b>太晶属性</b>：{{ sd!.teraType }}</div>
              </section>
            </div>

            <!-- 左下：被动能力与特殊机制区（新版渲染器 · 词条带小点） -->
            <section class="ability-panel">
              <div class="panel-head">
                <div class="panel-title">
                  <b>被动能力与特殊机制</b>
                  <span>{{ passiveItems.length }} 条被动 / {{ sheet.mechanisms.length }} 条机制</span>
                </div>
              </div>
              <div class="ability-scroll">
                <h3 class="group-label">▲ 被动能力 / PASSIVES</h3>
                <button
                  v-for="p in passiveItems"
                  :key="'p' + p.num"
                  type="button"
                  class="ability-row"
                  @click="openPassive(p)"
                >
                  <b>{{ String(p.num).padStart(2, '0') }}　{{ p.name }}</b>
                  <span><RenderedText :text="p.effect" :private-terms="privateTerms" term-marker /></span>
                </button>
                <template v-if="sheet.mechanisms.length">
                  <h3 class="group-label">▲ 特殊机制 / MECHANISMS</h3>
                  <button
                    v-for="(m, i) in sheet.mechanisms"
                    :key="'m' + i"
                    type="button"
                    class="ability-row ability-row--mech"
                    @click="openMech(m, i)"
                  >
                    <b :style="mechNameStyle(m)">{{ m.name }}<template v-if="m.stack">　{{ m.stack }}层</template><template v-if="m.type">　/ <span :style="tagStyle(m.type)">{{ m.type }}</span></template></b>
                    <span v-if="m.desc"><RenderedText :text="m.desc" :private-terms="privateTerms" term-marker /></span>
                  </button>
                </template>
              </div>
            </section>
          </section>


          <!-- 卡组区 -->
          <section class="deck-pane">
            <div class="deck-head">
              <div>
                <b>出战卡组</b>
                <small>按卡区独立组织 / 每行固定三张</small>
              </div>
              <div class="deck-total">{{ totalCards }} <small>张卡牌</small></div>
            </div>
            <div ref="deckEl" class="deck-scroll">
              <p v-if="totalCards === 0" class="deck-empty">该司书尚未配置卡牌。</p>
              <section v-for="zc in zoneCards" v-else :key="zc.zone.key" class="card-zone">
                <div class="zone-head">
                  <b>▲ {{ zc.zone.label }}</b>
                  <span>{{ zc.cards.length }} 张<template v-if="zc.zone.hint"> / {{ zc.zone.hint }}</template></span>
                </div>
                <div ref="deckEl" class="card-grid">
                  <VisualCard
                    v-for="(c, i) in zc.cards"
                    :key="zc.zone.key + '-c' + i"
                    :card="c"
                    :width="deckCardWidth"
                    :cost-label="system?.costLabel ?? '费用'"
                    render-terms
                    :private-terms="privateTerms"
                    class="card-grid__item"
                  />
                </div>
              </section>
            </div>
          </section>

          <!-- 立绘区 -->
          <section class="portrait-zone" aria-label="司书完整立绘">
            <img
              v-if="librarian.portrait"
              :src="librarian.portrait"
              :alt="`${librarian.name} 完整立绘`"
            />
            <span v-else class="portrait-ph">暂无立绘</span>
            <div class="portrait-note">
              <span>{{ librarian.name }}</span>
              <span>{{ system?.code ?? '' }}</span>
            </div>
          </section>


        </div>

        <!-- 页脚 -->
        <footer class="footer">
          <span>核心书页 / CORE PAGE · {{ system?.code ?? '—' }}　　数据原文来自馆藏数据库</span>
          <div class="legend">
            <span>被动与卡组视框独立滚动</span>
            <span>点击能力条目 · 大窗阅读</span>
          </div>
        </footer>
      </template>

      <template v-else-if="sheet">
        <div class="pv-skel" aria-hidden="true">
          <div class="skel-shimmer pv-skel__portrait"></div>
          <div class="pv-skel__mid">
            <div v-for="i in 3" :key="i" class="skel-shimmer pv-skel__block"></div>
          </div>
          <div class="skel-shimmer pv-skel__deck"></div>
        </div>
      </template>

      <p v-else class="pv-empty">该司书尚未填写核心书页数据。</p>
    </div>

    <!-- 词条详情大窗 -->
    <div v-if="detail" class="ability-detail" @click.self="closeDetail">
      <div class="detail-card">
        <div class="detail-top">
          <span class="detail-kicker">{{ detail.kicker }}</span>
          <button class="detail-close" type="button" @click="closeDetail">× 返回列表</button>
        </div>
        <h2 :style="detail.style">{{ detail.name }}</h2>
        <p v-if="detail.sub" class="detail-subtitle">{{ detail.sub }}</p>
        <div class="detail-full">
          <RenderedText :text="detail.text" :private-terms="privateTerms" term-marker />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ========== 主题跟随：全部消费 tokens/themes 变量，不再写死赤阵沙盘色板 ========== */
.pv-overlay {
  --pv-bg: var(--color-bg);
  --pv-panel: var(--color-surface);
  --pv-panel2: var(--color-surface-2);
  --pv-topbar: var(--color-surface);
  --pv-cream: var(--color-ink);
  --pv-muted: var(--color-ink-dim);
  --pv-faint: var(--color-ink-faint);
  --pv-red: var(--danger);
  --pv-red2: var(--turris);
  --pv-chipbg: var(--color-surface-2);
  --pv-chipbd: var(--color-line);
  --pv-chipink: var(--color-ink-dim);
  --pv-redchip-bg: var(--turris);
  --pv-redchip-bd: color-mix(in srgb, var(--turris) 65%, #fff 35%);
  --pv-redchip-ink: #fff4ea;
  --pv-line: var(--color-line);
  --pv-gold: var(--color-gold);

  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(8, 6, 4, 0.6);
  color: var(--pv-cream);
  font-family: 'Microsoft YaHei', 'PingFang SC', system-ui, sans-serif;
}

.app {
  height: 100%;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--pv-bg);
  position: relative;
  overflow: hidden;
}
.app::after {
  content: '';
  position: absolute;
  inset: 6px;
  border: 1px solid var(--color-line);
  pointer-events: none;
  z-index: 20;
}

/* ---------- 顶栏 ---------- */
.topbar {
  flex: 0 0 auto;
  min-height: 62px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 clamp(16px, 2vw, 24px);
  background: var(--pv-topbar);
  border-bottom: 1px solid var(--pv-line);
}
.brand {
  display: flex;
  gap: 12px;
  align-items: center;
}
.tri {
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 15px solid var(--pv-red2);
}
.brand b {
  font: 600 16px var(--font-serif);
  letter-spacing: 3px;
  color: var(--pv-cream);
}
.brand small {
  display: block;
  color: var(--color-ink-faint);
  font-size: 8px;
  letter-spacing: 2px;
  margin-top: 3px;
}
.crumb {
  font-size: 10px;
  color: var(--color-ink-dim);
  letter-spacing: 1px;
  flex: 1;
  text-align: center;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.exit-btn {
  padding: 7px 18px;
  border: 1px solid var(--pv-redchip-bd);
  background: var(--pv-redchip-bg);
  color: var(--pv-redchip-ink);
  font-size: 12px;
  letter-spacing: 2px;
  cursor: pointer;
  transition: background 0.15s ease;
}
.exit-btn:hover {
  background: color-mix(in srgb, var(--turris) 80%, #fff 20%);
}

/* ---------- 三栏工作区 ---------- */
.workspace {
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  grid-template-columns: clamp(320px, 26vw, 400px) minmax(560px, 1fr) clamp(240px, 22vw, 340px);
}

/* ---------- 立绘区 ---------- */
.portrait-zone {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 50% 70%, color-mix(in srgb, var(--turris) 22%, transparent), transparent 63%),
    linear-gradient(155deg, var(--color-surface), var(--color-bg));
  border-left: 1px solid var(--pv-line);
  min-width: 0;
}
.portrait-zone::before {
  content: '';
  position: absolute;
  width: 58%;
  aspect-ratio: 245 / 215;
  left: 10%;
  top: 22%;
  border: 1px solid color-mix(in srgb, var(--turris) 40%, transparent);
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
  background: color-mix(in srgb, var(--turris) 8%, transparent);
}
.portrait-zone::after {
  content: '';
  position: absolute;
  left: 22px;
  right: 22px;
  bottom: 46px;
  height: 1px;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-gold) 55%, transparent), transparent);
}
.portrait-zone img {
  position: absolute;
  z-index: 2;
  inset: 0 0 47px 0;
  width: 100%;
  height: calc(100% - 47px);
  object-fit: contain;
  object-position: center bottom;
  filter: drop-shadow(0 15px 20px rgba(0, 0, 0, 0.5));
}
.portrait-ph {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--pv-faint);
  font-size: 13px;
  letter-spacing: 2px;
}
.portrait-note {
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 17px;
  display: flex;
  justify-content: space-between;
  color: var(--pv-faint);
  font-size: 8px;
  letter-spacing: 1px;
  z-index: 3;
}

/* ---------- 中央信息区 ---------- */
.center-pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  border-right: 1px solid var(--pv-line);
  background: var(--pv-panel);
}
.center-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: clamp(14px, 1.6vh, 22px) clamp(14px, 1.4vw, 20px);
}
.identity {
  border-bottom: 1px solid var(--pv-line);
  padding-bottom: 15px;
}
.eyebrow {
  font-size: 9px;
  letter-spacing: 2px;
  color: var(--color-ink-dim);
}
.name {
  margin: 6px 0 0;
  font: 600 clamp(24px, 2.2vw, 34px) var(--font-serif);
  color: var(--pv-cream);
  line-height: 1.15;
}
.title {
  margin-top: 4px;
  font-size: 12px;
  color: var(--pv-muted);
}
.identity-chips {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chip {
  display: inline-block;
  padding: 5px 8px;
  border: 1px solid var(--pv-chipbd);
  background: var(--pv-chipbg);
  color: var(--pv-chipink);
  font-size: 9px;
}
.chip--red {
  background: var(--pv-redchip-bg);
  border-color: var(--pv-redchip-bd);
  color: var(--pv-redchip-ink);
}
.affiliation {
  margin-top: 10px;
  font-size: 11px;
  color: var(--pv-gold);
  letter-spacing: 1px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 14px;
}
.stat {
  border: 1px solid var(--pv-line);
  background: var(--pv-panel2);
  padding: 10px 12px;
}
.stat small {
  display: block;
  font-size: 9px;
  color: var(--pv-muted);
  letter-spacing: 1px;
}
.stat b {
  display: block;
  margin-top: 4px;
  font-size: clamp(18px, 1.6vw, 24px);
  color: var(--pv-cream);
}

.resists {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.resist-row {
  display: grid;
  grid-template-columns: minmax(64px, auto) repeat(3, 1fr);
  gap: 6px;
  align-items: center;
}
.resist-label {
  font-size: 10px;
  color: var(--pv-muted);
  letter-spacing: 1px;
}
.r-cell {
  border: 1px solid var(--pv-line);
  background: var(--pv-panel2);
  padding: 6px 8px;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.r-cell small {
  font-size: 9px;
  color: var(--pv-faint);
}
.r-cell b {
  font-size: 12px;
  color: var(--pv-cream);
}

/* 系统机制块（理智 / EGO / 心 / RHD / PKM） */
.sysblock {
  margin-top: 14px;
  border: 1px solid var(--pv-line);
  background: var(--pv-panel2);
  padding: 12px 14px;
}
.sysblock-head {
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--pv-gold);
  border-bottom: 1px solid var(--pv-line);
  padding-bottom: 8px;
  margin-bottom: 8px;
}
.sysrow + .sysrow {
  margin-top: 10px;
}
.sysrow-title {
  font-size: 10px;
  color: var(--color-ink-dim);
  letter-spacing: 1px;
  margin-bottom: 4px;
}
.sysmeta {
  font-size: 11px;
  color: var(--pv-muted);
}
.sysmeta b {
  color: var(--color-sanity);
}
/* 理智值相关硬编码配色（用户指定，不随主题；提高优先级以覆盖 .systext b 等规则） */
.sanity-light,
.systext b.sanity-light,
.sysrow-title.sanity-light {
  color: #00b0f0;
}
.sanity-deep,
.systext .sanity-deep {
  color: #0070c0;
}
.panic-red,
.systext b.panic-red {
  color: #ee0000;
}
.systext {
  font-size: 12px;
  line-height: 1.7;
  color: var(--pv-cream);
}
.systext + .systext {
  margin-top: 4px;
}
.systext b {
  color: var(--pv-gold);
}
.syssub {
  color: var(--pv-muted);
  margin-bottom: 2px;
}
.pkmtag {
  display: inline-block;
  margin-right: 6px;
  padding: 2px 6px;
  border: 1px solid var(--pv-chipbd);
  background: var(--pv-chipbg);
  color: var(--pv-chipink);
  font-size: 10px;
}

/* ---------- 左下能力面板 ---------- */
.ability-panel {
  flex: 0 0 42%;
  min-height: 30%;
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--pv-line);
  background: var(--pv-panel2);
}
.panel-head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px clamp(14px, 1.4vw, 20px);
  border-bottom: 1px solid var(--pv-line);
}
.panel-title b {
  font-size: 13px;
  letter-spacing: 2px;
  color: var(--pv-cream);
}
.panel-title span {
  margin-left: 10px;
  font-size: 9px;
  color: var(--pv-muted);
}
.ability-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 8px clamp(14px, 1.4vw, 20px) 14px;
}
.group-label {
  margin: 10px 0 6px;
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--pv-gold);
  font-weight: 600;
}
.ability-row {
  display: block;
  width: 100%;
  text-align: left;
  border: none;
  border-left: 2px solid var(--pv-line);
  background: transparent;
  padding: 7px 10px;
  cursor: pointer;
  transition: background 0.12s ease, border-color 0.12s ease;
  font: inherit;
  color: inherit;
}
.ability-row:hover {
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  border-left-color: var(--turris);
}
.ability-row + .ability-row {
  margin-top: 4px;
}
.ability-row b {
  display: block;
  font-size: 12px;
  color: var(--pv-cream);
}
.ability-row--mech b {
  color: var(--color-ink);
}
.ability-row span {
  display: block;
  margin-top: 3px;
  font-size: 11px;
  line-height: 1.75;
  color: var(--pv-muted);
  /* 保留效果原文中的换行符：缩略行也按草稿做多行排版渲染 */
  white-space: pre-line;
}

/* ---------- 卡组区 ---------- */
.deck-pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  background: var(--pv-bg);
}
.deck-head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px clamp(14px, 1.4vw, 20px);
  border-bottom: 1px solid var(--pv-line);
  background: var(--pv-topbar);
}
.deck-head b {
  display: block;
  font-size: 14px;
  letter-spacing: 2px;
  color: var(--pv-cream);
}
.deck-head small {
  display: block;
  margin-top: 2px;
  font-size: 9px;
  color: var(--pv-muted);
}
.deck-total {
  font-size: 22px;
  color: var(--pv-red2);
}
.deck-total small {
  font-size: 9px;
  color: var(--pv-muted);
  margin-left: 4px;
}
.deck-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 14px clamp(14px, 1.4vw, 20px) 20px;
}
.deck-empty {
  color: var(--pv-faint);
  font-size: 12px;
}
.card-zone + .card-zone {
  margin-top: 18px;
}
.zone-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
}
.zone-head b {
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--pv-gold);
}
.zone-head span {
  font-size: 9px;
  color: var(--pv-faint);
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}
.card-grid__item {
  min-width: 0;
}

/* ---------- 页脚 ---------- */
.footer {
  flex: 0 0 auto;
  min-height: 34px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px clamp(16px, 2vw, 24px);
  border-top: 1px solid var(--pv-line);
  background: var(--pv-topbar);
  font-size: 9px;
  letter-spacing: 1px;
  color: var(--pv-faint);
}
.legend {
  display: flex;
  gap: 16px;
}

/* ---------- 骨架占位 ---------- */
.pv-skel {
  flex: 1;
  display: grid;
  grid-template-columns: clamp(240px, 22vw, 340px) clamp(320px, 26vw, 400px) 1fr;
  gap: 0;
  min-height: 0;
}
.pv-skel__portrait,
.pv-skel__deck {
  margin: 16px;
}
.pv-skel__mid {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 16px;
}
.pv-skel__block {
  flex: 1;
}
.skel-shimmer {
  position: relative;
  background: var(--pv-panel2);
  overflow: hidden;
}
.skel-shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(233, 221, 198, 0.08), transparent);
  animation: skel-sweep 1.4s ease-in-out infinite;
}
@keyframes skel-sweep {
  100% {
    transform: translateX(100%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .skel-shimmer::after {
    animation: none;
  }
}
.pv-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--pv-faint);
  font-size: 13px;
}

/* ---------- 词条详情大窗 ---------- */
.ability-detail {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(10, 8, 9, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(20px, 5vw, 80px);
}
.detail-card {
  width: min(860px, 100%);
  max-height: 100%;
  overflow-y: auto;
  background: var(--pv-panel);
  border: 1px solid var(--pv-redchip-bd);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.6);
  padding: clamp(20px, 3vw, 36px);
}
.detail-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.detail-kicker {
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--pv-gold);
}
.detail-close {
  border: 1px solid var(--pv-chipbd);
  background: var(--pv-chipbg);
  color: var(--pv-chipink);
  font-size: 11px;
  padding: 5px 12px;
  cursor: pointer;
}
.detail-close:hover {
  background: color-mix(in srgb, var(--accent) 15%, var(--color-surface-2));
}
.detail-card h2 {
  margin: 0;
  font-family: 'Alibaba PuHuiTi 3.0', 'Alibaba PuHuiTi', 'Microsoft YaHei', 'PingFang SC', system-ui, sans-serif;
  font-size: clamp(20px, 2.4vw, 30px);
  font-weight: 600;
  color: var(--pv-cream);
}
.detail-subtitle {
  margin: 6px 0 0;
  font-size: 11px;
  color: var(--pv-muted);
  letter-spacing: 1px;
}
.detail-full {
  margin-top: 16px;
  border-top: 1px solid var(--pv-line);
  padding-top: 16px;
  font-size: 14px;
  line-height: 1.9;
  color: var(--pv-cream);
  white-space: pre-wrap;
}

/* 滚动条统一赤阵风格 */
.center-scroll::-webkit-scrollbar,
.ability-scroll::-webkit-scrollbar,
.deck-scroll::-webkit-scrollbar,
.detail-card::-webkit-scrollbar {
  width: 8px;
}
.center-scroll::-webkit-scrollbar-thumb,
.ability-scroll::-webkit-scrollbar-thumb,
.deck-scroll::-webkit-scrollbar-thumb,
.detail-card::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--color-ink-dim) 35%, transparent);
}
.center-scroll::-webkit-scrollbar-track,
.ability-scroll::-webkit-scrollbar-track,
.deck-scroll::-webkit-scrollbar-track,
.detail-card::-webkit-scrollbar-track {
  background: transparent;
}

/* 窄视窗降级：三栏改纵向堆叠 */
@media (max-width: 1100px) {
  .workspace {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(200px, 30vh) auto auto;
    overflow-y: auto;
  }
  .portrait-zone {
    min-height: 200px;
  }
  .portrait-zone img {
    position: static;
    height: 100%;
  }
  .center-pane,
  .deck-pane {
    border-right: none;
    border-top: 1px solid var(--pv-line);
  }
  .ability-panel {
    flex: 0 0 auto;
    max-height: 50vh;
  }
}
</style>
