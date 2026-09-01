<script setup lang="ts">
import { computed } from 'vue'
import type { Librarian, Mechanism } from '@rtl/shared'
import { parseSheet, BATTLE_SYSTEMS } from '@rtl/shared'
import Modal from './Modal.vue'
import StsCard from './StsCard.vue'
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

function resistLabel(v: number | undefined): string {
  if (v === 0.5) return '耐性'
  if (v === 1.5) return '脆弱'
  return '一般'
}

const passiveItems = computed(() => {
  const list = sheet.value?.passives ?? []
  return list.map((p, i) => ({
    num: i + 1,
    name: p.name,
    effect: p.effect,
  }))
})

const combatCards = computed(() => sheet.value?.cards?.combat ?? [])
const specialCards = computed(() => sheet.value?.cards?.special ?? [])
const egoCards = computed(() => sheet.value?.cards?.ego ?? [])
const totalCards = computed(
  () => combatCards.value.length + specialCards.value.length + egoCards.value.length,
)

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
</script>

<template>
  <Modal :title="`司书预览 · ${librarian.name}`" wide @close="emit('close')">
    <template v-if="sheet">
      <div class="detail-layout">
        <aside class="detail-info">
          <section class="block banner">
            <div class="banner__roman">{{ roman }} · {{ system?.code ?? '' }}</div>
            <h3>{{ sheet.name }}</h3>
            <p class="title">{{ librarian.title }}</p>
            <p v-if="librarian.affiliation" class="affil">{{ librarian.affiliation }}</p>
            <div class="stats">
              <div><span class="k">体力</span><b>{{ sheet.hp }}</b></div>
              <div><span class="k">混乱抗性</span><b>{{ sheet.stagger }}</b></div>
              <div>
                <span class="k">速度</span>
                <b>{{ sheet.speedMin }}~{{ sheet.speedMax }}</b>
              </div>
              <div v-if="system"><span class="k">系统</span><b>{{ system.zh }}</b></div>
            </div>
          </section>

          <section v-if="resist" class="block">
            <h4>抗性</h4>
            <div class="resists">
              <div class="r-group">
                <span class="r-title">物理</span>
                <span>斩 {{ resistLabel(resist.physic.slash) }}</span>
                <span>突 {{ resistLabel(resist.physic.pierce) }}</span>
                <span>打 {{ resistLabel(resist.physic.strike) }}</span>
              </div>
              <div class="r-group">
                <span class="r-title">混乱</span>
                <span>斩 {{ resistLabel(resist.chaos.slash) }}</span>
                <span>突 {{ resistLabel(resist.chaos.pierce) }}</span>
                <span>打 {{ resistLabel(resist.chaos.strike) }}</span>
              </div>
            </div>
          </section>

          <section class="block">
            <h4>被动能力</h4>
            <div v-if="passiveItems.length" class="plist">
              <div v-for="p in passiveItems" :key="p.num" class="p-line">
                <span class="p-num">{{ p.num }}.</span>
                <span class="p-text p-text--indent">
                  <b>{{ p.name }}</b>：<RenderedText :text="p.effect" :private-terms="privateTerms" />
                </span>
              </div>
            </div>
            <p v-else class="empty">无被动能力</p>
          </section>

          <section v-if="sheet.mechanisms.length" class="block">
            <h4>特殊机制</h4>
            <div class="plist">
              <div v-for="(m, i) in sheet.mechanisms" :key="i" class="p-line">
                <span class="p-num">{{ i + 1 }}.</span>
                <span class="p-text">
                  <b :style="mechNameStyle(m)">{{ m.name }}</b><span v-if="m.stack">&nbsp;{{ m.stack }}层</span><span v-if="m.type"> · <span :style="tagStyle(m.type)">{{ m.type }}</span></span>
                  <span v-if="m.desc" class="mech-desc">
                    <RenderedText :text="m.desc" :private-terms="privateTerms" />
                  </span>
                </span>
              </div>
            </div>
          </section>

          <section v-if="sd && (sdHasSanity || sdHasEgo || sdHasMind)" class="block">
            <h4>系统机制 · 情感等级</h4>
            <div v-if="sdHasSanity" class="lobrow">
              <div class="lob-title sanityInfo">理智值机制</div>
              <div class="lobmeta">
                上限 <b class="stat-blue">{{ sd!.sanityMax ?? '—' }}</b> · 下限 <b class="stat-blue">{{ sd!.sanityMin ?? '—' }}</b>
              </div>
              <div v-if="sd!.sanityGainCond || sd!.sanityLossCond" class="lobtext">
                <div v-if="sd!.sanityGainCond">
                  <b class="sanityInfo">理智值增加条件</b>：<RenderedText :text="sd!.sanityGainCond ?? ''" :private-terms="privateTerms" />
                </div>
                <div v-if="sd!.sanityLossCond">
                  <b class="sanityInfo">理智值减少条件</b>：<RenderedText :text="sd!.sanityLossCond ?? ''" :private-terms="privateTerms" />
                </div>
              </div>
              <div v-if="sd!.panicType || sd!.panicLow || sd!.panicPanic" class="lobtext">
                <div class="lob-sub">恐慌类型 〔{{ sd!.panicType || '未命名' }}〕</div>
                <div>
                  <b class="lob-panic">士气低落</b> - [{{ sd!.panicType || '恐慌类型' }}]：
                  <RenderedText :text="sd!.panicLow ?? ''" :private-terms="privateTerms" />
                </div>
                <div>
                  <b class="lob-panic">陷入恐慌</b> - [{{ sd!.panicType || '恐慌类型' }}]：
                  <RenderedText :text="sd!.panicPanic ?? ''" :private-terms="privateTerms" />
                </div>
              </div>
            </div>
            <div v-if="sdHasEgo" class="lobrow">
              <div class="lob-title">扭曲 &amp; EGO 展现</div>
              <div v-if="sd!.distortionName" class="lobtext">
                <b>扭曲展现</b>：{{ sd!.distortionName }}
              </div>
              <div v-if="sd!.egoManifest" class="lobtext">
                <b>EGO 展现</b>：{{ sd!.egoManifest }}
              </div>
            </div>
            <div v-if="sdHasMind" class="lobrow">
              <div class="lob-title">心 &amp; 望</div>
              <div v-if="sd!.mind" class="lobtext">
                <b :style="mindNameStyle(sd!.mind!)">{{ sd!.mind!.name }}</b>：<RenderedText :text="sd!.mind!.effect ?? ''" :private-terms="privateTerms" />
              </div>
            </div>
          </section>

          <section class="block">
            <h4>卡组（{{ totalCards }} 张，{{ system?.code === 'LOB' ? '3×3' : '每行 3 张' }}）</h4>
            <p v-if="totalCards === 0" class="empty">无卡牌</p>
            <div v-else class="deck">
              <StsCard
                v-for="(c, i) in combatCards"
                :key="'c' + i"
                :card="c"
                :height="280"
                render-terms
                :private-terms="privateTerms"
                class="deck__item"
              />
              <StsCard
                v-for="(c, i) in specialCards"
                :key="'s' + i"
                :card="c"
                :height="280"
                render-terms
                :private-terms="privateTerms"
                class="deck__item"
              />
              <StsCard
                v-for="(c, i) in egoCards"
                :key="'e' + i"
                :card="c"
                :height="280"
                render-terms
                :private-terms="privateTerms"
                class="deck__item"
              />
            </div>
          </section>
        </aside>

        <div class="detail-portrait">
          <img v-if="librarian.portrait" :src="librarian.portrait" :alt="librarian.name" />
          <span v-else class="ph">暂无立绘</span>
        </div>
      </div>
    </template>
    <p v-else class="empty">该司书尚未填写核心书页数据。</p>
  </Modal>
</template>

<style scoped>
.detail-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}
.detail-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.detail-portrait {
  position: sticky;
  top: 0;
  flex: 0 0 34%;
  max-width: 360px;
  min-width: 240px;
  height: calc(100vh - 240px);
  min-height: 380px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}
.detail-portrait img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.ph {
  color: var(--color-ink-faint);
  font-size: 13px;
}
.banner {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.banner__roman {
  font-family: var(--font-display);
  color: var(--accent);
  letter-spacing: 0.06em;
  font-size: 13px;
}
.banner h3 {
  margin: 2px 0;
  font-size: 22px;
}
.title {
  margin: 0 0 2px;
  font-size: 14px;
  color: var(--color-ink-dim);
}
.affil {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--color-ink-faint);
}
.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  margin-top: 6px;
}
.stats .k {
  font-size: 14px;
  color: var(--color-ink-dim);
  margin-right: 4px;
}
.stats b {
  color: var(--color-ink);
  font-size: 14px;
}
.block {
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  padding: 14px;
}
.block h4 {
  margin: 0 0 10px;
  font-size: 14px;
  color: var(--accent);
}
.resists {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}
.r-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 15px;
  color: var(--color-ink-dim);
}
.r-title {
  color: var(--color-accent, var(--accent));
  font-weight: 600;
}
.plist {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.p-line {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.p-num {
  min-width: 24px;
  text-align: right;
  color: var(--accent);
  font-weight: 700;
  flex-shrink: 0;
  line-height: 1.8;
}
.p-text {
  flex: 1;
  min-width: 0;
  white-space: pre-wrap;
  line-height: 1.8;
  font-size: 15px;
  color: var(--color-ink-dim);
}
.p-text--indent {
  padding-left: 2em;
  text-indent: -2em;
}
.mech-desc {
  display: block;
  color: var(--color-ink-dim);
  font-size: 14px;
  line-height: 1.7;
  margin-top: 2px;
}
.lobrow {
  padding: 8px 0;
  border-bottom: 1px dashed var(--color-line);
}
.lobrow:last-child {
  border-bottom: none;
}
.lob-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 4px;
}
.sanityInfo {
  color: var(--color-sanity);
}
.lobmeta,
.lobtext {
  font-size: 15px;
  line-height: 1.7;
  color: var(--color-ink-dim);
}
.lob-sub {
  color: #00B0F0;
  margin: 4px 0 2px;
  font-weight: 700;
}
.stat-blue {
  color: #00b0f0;
}
.lob-panic {
  color: #ff0000;
}
.deck {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  justify-items: center;
}
.empty {
  color: var(--color-ink-faint);
  font-size: 13px;
}
@media (max-width: 960px) {
  .detail-layout {
    flex-direction: column;
  }
  .detail-portrait {
    position: static;
    width: 100%;
    flex: none;
    max-width: none;
    min-width: 0;
    height: auto;
    min-height: 360px;
  }
}
</style>
