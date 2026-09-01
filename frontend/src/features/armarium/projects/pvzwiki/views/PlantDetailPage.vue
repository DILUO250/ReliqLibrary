<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { WORLD_BG_MAP } from '@pvzwiki/types/plant'
import {
  getEffectiveDetail,
  getPlantByCodename,
  getPrevNext,
  getNeighbors,
} from '@pvzwiki/data/plant-details'
import { getKeyword } from '@pvzwiki/data/keywords'
import { getShowcaseCandidates } from '@pvzwiki/data/plant-images'
import { plants, getFamilies } from '@pvzwiki/data/plants'
import {
  customVersion,
  hasBackup,
  restoreImage,
  resolveBgUrl,
  resolveImageSrc,
  resolveCardSrc,
} from '@pvzwiki/store/plantImage'
import { removeCustomPlant, PLANT_PLACEHOLDER_IMAGE } from '@pvzwiki/store/customPlants'
import { ui } from '@pvzwiki/store/ui'
import { isEditableTarget } from '@pvzwiki/utils/keyboard'
import { pvzAsset } from '@pvzwiki/asset'
import PlantEditor from '@pvzwiki/components/PlantEditor.vue'
import PlantImageEditor from '@pvzwiki/components/PlantImageEditor.vue'
import PlantCreateDialog from '@pvzwiki/components/PlantCreateDialog.vue'
import { showToast } from '@pvzwiki/store/toast'

const route = useRoute()
const router = useRouter()

const codename = computed(() => String(route.params.codename ?? ''))
const plant = computed(() => getPlantByCodename(codename.value))
const detail = computed(() => getEffectiveDetail(codename.value))

const traitNames = computed(() =>
  (detail.value?.traits ?? []).map((id) => getKeyword(id)?.name ?? id),
)

const customBg = ref<string | null>(null)

async function loadCustomBg(): Promise<void> {
  customBg.value = await resolveBgUrl(codename.value)
}

watch(codename, () => {
  void loadCustomBg()
}, { immediate: true })

const worldBg = computed(() => {
  if (customBg.value) return customBg.value
  const code = WORLD_BG_MAP[plant.value?.world ?? ''] ?? 'default'
  return pvzAsset(`/assets/image/almanac/backgrounds/${code}.webp`)
})

const effectiveFamily = computed(() => {
  const familyName = detail.value?.family
  if (!familyName) return undefined
  return getFamilies(plants).find((f) => f.name === familyName)
})

const showcaseCandidates = computed(() =>
  plant.value ? getShowcaseCandidates(plant.value) : [],
)
const imgVersion = computed(() => (plant.value ? customVersion(plant.value.codename) : 0))
const showcaseIndex = ref(0)
watch([codename, imgVersion], () => {
  showcaseIndex.value = 0
})

// 上传立绘（高清大图）与生成卡片图：立绘优先，无立绘时用卡片图展出
const customShowcase = ref<string | null>(null)
const cardShowcase = ref<string | null>(null)

async function loadCustomShowcase(): Promise<void> {
  const [portrait, card] = await Promise.all([
    resolveImageSrc(codename.value),
    resolveCardSrc(codename.value),
  ])
  customShowcase.value = portrait
  cardShowcase.value = card
}

watch(codename, () => {
  void loadCustomShowcase()
}, { immediate: true })

const showcaseSrc = computed(() => {
  if (customShowcase.value) return customShowcase.value
  if (cardShowcase.value) return cardShowcase.value
  const list = showcaseCandidates.value
  const src = list[Math.min(showcaseIndex.value, list.length - 1)]
  return src || PLANT_PLACEHOLDER_IMAGE
})

function onShowcaseError(): void {
  if (showcaseIndex.value < showcaseCandidates.value.length - 1) {
    showcaseIndex.value++
  }
}

const canRestore = computed(() => hasBackup(codename.value))
const restoring = ref(false)

async function onRestore(): Promise<void> {
  restoring.value = true
  try {
    await restoreImage(codename.value)
  } finally {
    restoring.value = false
  }
}

const basicOpen = ref(false)
const deleting = ref(false)

async function onDeletePlant(): Promise<void> {
  if (!plant.value?.custom || deleting.value) return
  if (!window.confirm(`确定要删除「${plant.value.name}」的自制档案吗？此操作不可撤销。`)) return
  deleting.value = true
  try {
    removeCustomPlant(codename.value)
    showToast('档案已删除')
    await router.push('/armarium/project/pvz/plants')
  } finally {
    deleting.value = false
  }
}

interface StatRow {
  label: string
  icon: string
  value: string
}

const stats = computed<StatRow[]>(() => {
  const d = detail.value
  return [
    { label: '阳光消耗', icon: pvzAsset('/assets/wikicon/Sun_Cost2I.webp'), value: d?.sunCost != null ? String(d.sunCost) : '—' },
    { label: '冷却时间', icon: pvzAsset('/assets/wikicon/Recharge2I.webp'), value: d?.recharge != null ? String(d.recharge) : '—' },
    { label: '血量', icon: pvzAsset('/assets/wikicon/Toughness2I.webp'), value: d?.toughness != null ? String(d.toughness) : '—' },
    { label: '伤害', icon: pvzAsset('/assets/wikicon/Damage2I.webp'), value: d?.damage != null ? String(d.damage) : '—' },
    { label: '射程', icon: pvzAsset('/assets/wikicon/Range2I.webp'), value: d?.range != null ? String(d.range) : '—' },
    { label: '家族', icon: pvzAsset('/assets/wikicon/Family2I.webp'), value: d?.family ?? '—' },
  ]
})

const neighbors = computed(() => getNeighbors(codename.value, 5))
const prevNext = computed(() => getPrevNext(codename.value))
const editorRef = ref<InstanceType<typeof PlantEditor> | null>(null)
const imageEditorRef = ref<InstanceType<typeof PlantImageEditor> | null>(null)

function onKeydown(e: KeyboardEvent): void {
  if (e.altKey || e.ctrlKey || e.metaKey) return
  if (isEditableTarget(e.target)) return
  if (ui.dictionaryOpen) return
  if (editorRef.value?.isOpen()) return
  if (imageEditorRef.value?.isOpen()) return
  if (e.key === 'ArrowLeft') {
    if (prevNext.value.prev) {
      e.preventDefault()
      router.push(`/armarium/project/pvz/plants/${prevNext.value.prev.codename}`)
    }
  } else if (e.key === 'ArrowRight') {
    if (prevNext.value.next) {
      e.preventDefault()
      router.push(`/armarium/project/pvz/plants/${prevNext.value.next.codename}`)
    }
  } else if (e.key.toLowerCase() === 'e') {
    editorRef.value?.openEditor()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <article v-if="plant && detail" class="almanac-shell almanac-shell--plant">
    <header class="almanac-toolbar">
      <button type="button" class="back-link" @click="router.push('/armarium/project/pvz/plants')">
        ← 返回图鉴
      </button>
    </header>

    <section class="showcase" :aria-label="plant.name">
      <div class="entity-stage">
        <div class="entity-stage__visual" :style="{ backgroundImage: `url(${worldBg})` }">
          <Transition name="plant" mode="out-in">
            <img
              :key="codename"
              :src="showcaseSrc"
              :alt="plant.name"
              width="400"
              height="320"
              @error="onShowcaseError"
            />
          </Transition>
        </div>
        <header class="entity-identity">
          <div class="entity-identity__copy">
            <h1>
              {{ plant.name }}
              <span v-if="plant.custom" class="custom-badge">自制档案</span>
            </h1>
            <p class="entity-codename">{{ plant.codename.toUpperCase() }}</p>
            <p class="entity-summary">{{ plant.summary }}</p>
            <div v-if="plant.custom" class="custom-actions">
              <button type="button" class="custom-btn" @click="basicOpen = true">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
                <span>基础信息</span>
              </button>
              <button type="button" class="custom-btn custom-btn--danger" :disabled="deleting" @click="onDeletePlant">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                  <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                </svg>
                <span>删除档案</span>
              </button>
            </div>
            <PlantEditor ref="editorRef" :codename="codename" />
            <PlantImageEditor ref="imageEditorRef" :codename="codename" />
            <button
              v-if="canRestore"
              type="button"
              class="restore-image-btn"
              title="恢复原图"
              :disabled="restoring"
              @click="onRestore"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M17.65 6.35A7.95 7.95 0 0 0 12 4c-4.42 0-8 3.58-8 8s3.58 8 8 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
              </svg>
            </button>
          </div>
          <div v-if="effectiveFamily" class="family-mark">
            <img :src="effectiveFamily.icon" :alt="effectiveFamily.name" width="56" height="56" />
            <strong>{{ effectiveFamily.name }}</strong>
          </div>
        </header>
      </div>

      <div class="stat-panel">
        <h2>图鉴属性</h2>
        <dl>
          <div v-for="s in stats" :key="s.label" class="stat-row">
            <dt>
              <img :src="s.icon" alt="" width="38" height="38" />
              <span>{{ s.label }}</span>
            </dt>
            <dd>{{ s.value }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <div class="lore-stack">
      <section v-if="detail.chat" class="lore-panel">
        <h2>图鉴介绍</h2>
        <p>{{ detail.chat }}</p>
      </section>

      <section class="lore-panel">
        <h2>特性</h2>
        <div class="special-list">
          <div v-if="traitNames.length" class="special-group">
            <span class="special-group__label">特点</span>
            <div class="trait-keywords">
              <span v-for="(t, i) in traitNames" :key="i" class="trait-chip">{{ t }}</span>
            </div>
          </div>
          <div v-if="detail.ability.length" class="special-group">
            <span class="special-group__label">能力</span>
            <p v-for="(a, i) in detail.ability" :key="i" class="special-entry">{{ a }}</p>
          </div>
        </div>
      </section>
    </div>

    <nav class="sequence-nav" aria-label="继续浏览">
      <RouterLink v-if="prevNext.prev" :to="`/armarium/project/pvz/plants/${prevNext.prev.codename}`" rel="prev">
        <span>上一项</span>
        <strong>← {{ prevNext.prev.name }}</strong>
      </RouterLink>
      <RouterLink v-if="prevNext.next" :to="`/armarium/project/pvz/plants/${prevNext.next.codename}`" rel="next">
        <span>下一项</span>
        <strong>{{ prevNext.next.name }} →</strong>
      </RouterLink>
    </nav>

    <section v-if="neighbors.length" class="neighbor-section">
      <h2>继续浏览</h2>
      <div class="neighbor-rail">
        <RouterLink
          v-for="n in neighbors"
          :key="n.codename"
          :to="`/armarium/project/pvz/plants/${n.codename}`"
          class="neighbor-card"
        >
          <img :src="n.image" :alt="n.name" loading="lazy" />
          <span>{{ n.name }}</span>
        </RouterLink>
      </div>
    </section>

    <PlantCreateDialog
      :open="basicOpen"
      mode="edit"
      :plant="plant"
      @close="basicOpen = false"
      @saved="basicOpen = false"
    />
  </article>
  <p v-else class="almanac-shell almanac-shell--plant empty-state">该植物不存在。</p>
</template>

<style scoped>
.almanac-shell {
  --almanac-wood: #4b321f;
  --almanac-wood-dark: #281a11;
  --almanac-paper: #efe2b9;
  --almanac-paper-deep: #d9c38f;
  --almanac-ink: #2b241c;
  --almanac-muted: #6d5a45;
  --almanac-accent: #4f8a45;
  --almanac-accent-dark: #315a2c;
  --almanac-description: #865600;
  box-sizing: border-box;
  width: min(944px, 100vw - 2rem);
  color: var(--almanac-ink);
  margin-top: 0.75rem;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}

.almanac-toolbar {
  color: #fff8dc;
  border: 3px solid var(--almanac-wood-dark);
  background: var(--almanac-wood);
  min-height: 3.25rem;
  box-shadow: inset 0 2px 0 #ffffff1f, 0 4px 0 var(--almanac-wood-dark);
  border-radius: 12px;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.45rem 0.55rem 0.45rem 1rem;
  display: flex;
  margin-bottom: 1.15rem;
}

.back-link {
  color: #f2e7c4;
  cursor: pointer;
  background: none;
  border: none;
  align-items: center;
  min-height: 2.75rem;
  padding-inline: 0.25rem;
  font-family: inherit;
  font-size: 1.1rem;
  font-weight: 800;
  text-decoration: none;
  display: inline-flex;
}

.back-link:hover {
  color: #fff;
}

.showcase {
  grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
  align-items: start;
  gap: 1rem;
  margin-bottom: 1.15rem;
  display: grid;
}

.entity-stage {
  border: 4px solid var(--almanac-wood);
  background: var(--almanac-wood);
  min-height: 470px;
  box-shadow: inset 0 0 0 2px #ffffff33, 0 6px 0 var(--almanac-wood-dark);
  border-radius: 14px;
  grid-template-rows: minmax(300px, 1fr) auto;
  display: grid;
  overflow: hidden;
}

.entity-stage__visual {
  isolation: isolate;
  background-color: var(--color-bg);
  background-position: 50%;
  background-size: cover;
  place-items: center;
  min-height: 300px;
  display: grid;
  position: relative;
  overflow: hidden;
}

.entity-stage__visual > img {
  z-index: 1;
  object-fit: contain;
  filter: drop-shadow(0 13px 7px #261b126b);
  width: min(66%, 300px);
  height: 260px;
}

.plant-enter-active,
.plant-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.plant-enter-from {
  opacity: 0;
  transform: scale(0.94);
}

.plant-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

.entity-identity {
  z-index: 2;
  color: #fff8dc;
  border-top: 4px solid var(--almanac-wood-dark);
  background: linear-gradient(105deg, var(--almanac-wood) 0 72%, #392718 72% 100%);
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 1rem;
  padding: 1rem 1.1rem 1.1rem;
  display: grid;
  position: relative;
  box-shadow: inset 0 2px #ffffff1a;
}

.entity-identity__copy {
  min-width: 0;
}

.entity-identity h1 {
  color: #fff8dc;
  text-shadow: 0 2px #00000073;
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.02;
}

.custom-badge {
  color: #fff8dc;
  background: #b07838;
  border: 2px solid #7a4f1d;
  border-radius: 999px;
  vertical-align: middle;
  padding: 0.12rem 0.65rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  white-space: nowrap;
  box-shadow: inset 0 -2px 0 #00000033;
}

.custom-actions {
  flex-wrap: wrap;
  gap: 0.45rem;
  align-items: center;
  margin-top: 0.6rem;
  display: flex;
}

.custom-btn {
  color: #f2e7c4;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 6px;
  cursor: pointer;
  align-items: center;
  gap: 0.35rem;
  padding: 0.32rem 0.7rem;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  transition: background-color 0.15s, color 0.15s;
  display: inline-flex;
}

.custom-btn:hover {
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
}

.custom-btn--danger:hover {
  background: #a34b2a;
  border-color: #d0764f;
}

.custom-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.entity-codename {
  color: #f2e7c4;
  overflow-wrap: anywhere;
  margin: 0.35rem 0 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.88rem;
}

.entity-summary {
  color: #f0e3c2;
  margin: 0.65rem 0 0;
  font-size: 1.08rem;
  line-height: 1.4;
}

.restore-image-btn {
  color: #f2e7c4;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 6px;
  cursor: pointer;
  width: 1.7rem;
  height: 1.7rem;
  align-items: center;
  justify-content: center;
  display: inline-flex;
  margin-top: 0.6rem;
  margin-left: 0.5rem;
  vertical-align: top;
  transition: background-color 0.15s, color 0.15s;
}

.restore-image-btn:hover {
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
}

.restore-image-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.family-mark {
  border-left: 2px solid #efe2b940;
  grid-template-columns: 3.5rem minmax(0, 1fr);
  align-items: center;
  gap: 0.65rem;
  min-width: 10.5rem;
  padding-left: 0.95rem;
  display: grid;
}

.family-mark img {
  object-fit: contain;
  filter: drop-shadow(0 3px 2px #00000059);
  width: 3.5rem;
  height: 3.5rem;
}

.family-mark strong {
  color: #fff8dc;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.25;
}

.stat-panel {
  border: 4px solid var(--almanac-wood);
  background: var(--almanac-paper);
  box-shadow: 0 6px 0 var(--almanac-wood-dark);
  border-radius: 14px;
  overflow: hidden;
}

.stat-panel h2,
.neighbor-section h2,
.lore-panel h2 {
  color: #fff8dc;
  background: var(--almanac-wood);
  margin: 0;
  font-size: 1.3rem;
  line-height: 1.2;
}

.stat-panel h2 {
  border-bottom: 3px solid var(--almanac-wood-dark);
  padding: 0.85rem 1rem;
}

.stat-panel dl {
  gap: 0.45rem;
  margin: 0;
  padding: 0.75rem;
  display: grid;
}

.stat-row {
  border: 2px solid var(--almanac-accent-dark);
  background: var(--almanac-accent);
  border-radius: 8px;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.65rem;
  min-height: 3.2rem;
  padding: 0.4rem 0.55rem;
  display: grid;
  box-shadow: inset 0 -3px #1a2d173d;
}

.stat-row dt {
  color: #fff;
  text-shadow: 0 1px 1px #0000008c;
  align-items: center;
  gap: 0.55rem;
  min-width: 0;
  font-weight: 800;
  display: flex;
}

.stat-row dt img {
  object-fit: contain;
  flex: none;
}

.stat-row dd {
  color: #fff9cf;
  text-align: right;
  text-shadow: 0 1px 1px #0000008c;
  overflow-wrap: anywhere;
  max-width: 11rem;
  margin: 0;
  font-size: 1.08rem;
  font-weight: 800;
}

.sequence-nav {
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin: 1.2rem 0;
  display: grid;
}

.sequence-nav a {
  color: var(--almanac-ink);
  background: var(--almanac-paper);
  border: 2px solid #9d7a4e;
  border-radius: 9px;
  gap: 0.15rem;
  padding: 0.75rem 0.9rem;
  text-decoration: none;
  display: grid;
}

.sequence-nav a:last-child {
  text-align: right;
}

.sequence-nav span {
  color: var(--almanac-muted);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: 0.72rem;
  font-weight: 800;
}

.sequence-nav strong {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.neighbor-section,
.lore-panel {
  border: 3px solid var(--almanac-wood);
  background: var(--almanac-paper);
  border-radius: 11px;
  margin-bottom: 1.15rem;
  overflow: hidden;
  box-shadow: 0 5px #4b321f47;
}

.neighbor-section h2,
.lore-panel h2 {
  padding: 0.72rem 1rem;
}

.neighbor-rail {
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.65rem;
  padding: 0.8rem;
  display: grid;
}

.neighbor-card {
  min-width: 0;
  color: var(--almanac-ink);
  text-align: center;
  background: #fff5d4;
  border: 2px solid #9a7a4c;
  border-radius: 8px;
  text-decoration: none;
  display: grid;
  overflow: hidden;
}

.neighbor-card img {
  object-fit: contain;
  background: #4f8a4529;
  width: 100%;
  height: 72px;
}

.neighbor-card span {
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0.45rem 0.35rem;
  font-size: 0.78rem;
  font-weight: 700;
  overflow: hidden;
}

.lore-stack {
  gap: 0.2rem;
  display: grid;
}

.lore-panel > p,
.lore-panel blockquote,
.special-list {
  color: var(--almanac-description);
  margin: 0;
  padding: 1.1rem 1.2rem 1.25rem;
  font-size: clamp(1.18rem, 1rem + 0.7vw, 1.5rem);
  line-height: 1.45;
}

.special-list {
  gap: 0.9rem;
  display: grid;
}

.special-group {
  gap: 0.4rem;
  display: grid;
}

.special-group__label {
  color: var(--almanac-muted);
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.special-entry {
  line-height: inherit;
  margin: 0;
}

.trait-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.trait-chip {
  color: #fff;
  background: var(--almanac-accent);
  border-radius: 999px;
  padding: 0.2rem 0.65rem;
  font-size: 0.85rem;
  font-weight: 700;
  box-shadow: inset 0 -2px 0 var(--almanac-accent-dark);
}

.lore-panel blockquote {
  background: 0 0;
  border: 0;
  font-style: italic;
}

.lore-panel blockquote::before {
  color: var(--almanac-accent);
  content: "“";
  vertical-align: -0.38em;
  font-family: Georgia, serif;
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 0;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  font-weight: 700;
}

/* dark theme */
[data-theme='dark'] .almanac-shell {
  --almanac-paper: #342d20;
  --almanac-paper-deep: #463a29;
  --almanac-ink: #f2e5c4;
  --almanac-muted: #c8b795;
  --almanac-description: #e2b000;
}

[data-theme='dark'] .stat-panel,
[data-theme='dark'] .neighbor-section,
[data-theme='dark'] .lore-panel,
[data-theme='dark'] .sequence-nav a {
  border-color: #8a6949;
}

[data-theme='dark'] .neighbor-card {
  color: #f2e5c4;
  background: #211c16;
  border-color: #856747;
}

@media (max-width: 820px) {
  .showcase {
    grid-template-columns: 1fr;
  }
  .entity-stage {
    min-height: 0;
  }
  .entity-stage__visual {
    min-height: 320px;
  }
  .entity-stage__visual > img {
    height: 285px;
  }
}

@media (max-width: 600px) {
  .almanac-shell {
    width: calc(100vw - 1rem);
  }
  .entity-identity {
    grid-template-columns: 1fr;
    gap: 0.85rem;
    padding: 1rem;
  }
  .entity-stage__visual {
    min-height: 275px;
  }
  .entity-stage__visual > img {
    width: 70%;
    height: 220px;
  }
  .family-mark {
    border-top: 2px solid #efe2b940;
    border-left: 0;
    grid-template-columns: 3rem minmax(0, 1fr);
    min-width: 0;
    padding: 0.75rem 0 0;
  }
  .family-mark img {
    width: 3rem;
    height: 3rem;
  }
  .sequence-nav {
    grid-template-columns: 1fr;
  }
  .sequence-nav a:last-child {
    text-align: left;
  }
  .neighbor-rail {
    scroll-snap-type: x mandatory;
    display: flex;
    overflow-x: auto;
  }
  .neighbor-card {
    scroll-snap-align: start;
    min-width: 8.2rem;
  }
  .stat-row dd {
    max-width: 8.5rem;
  }
}
</style>
