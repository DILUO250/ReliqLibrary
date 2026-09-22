<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { api } from '@/app/services/api'
import { showToast } from '@/app/stores/toast'
import { useSpacesStore } from '@/features/armarium/store/spaces'
import SpacePaper from '@/features/armarium/spaces/SpacePaper.vue'
import { usePrintPageStyle } from '@/shared/paper/printPageStyle'
import './paper.css'
import {
  SPACE_WARNING_MAX,
  anomalyFileIndexLabel,
  parseSpaceReport,
  spaceExportFilename,
  spaceLevelText,
  spaceWarningAnchors,
  type SpaceLevel,
  type SpaceReport,
  type SpaceWarningAnchor,
  type SupernaturalSpace,
} from '@rtl/shared'

const route = useRoute()
const router = useRouter()
const store = useSpacesStore()

usePrintPageStyle()

/** 编辑器内的图片：在 AnomalyFigure 之上叠加待上传文件（保存时才真正落盘）。 */
interface DraftFigure {
  caption: string
  url: string
  _pending?: { file: File; objectUrl: string }
  _oldUrl?: string
}

const isNew = computed(() => String(route.params.id) === 'new')

/** 编辑期报告单形态：figures 带待上传/待回收标记，其余与落库结构一致。 */
type DraftReport = Omit<SpaceReport, 'figures'> & { figures: DraftFigure[] }

const form = reactive({
  code: '',
  name: '',
  level: 'safe' as SpaceLevel,
  subLevel: 'safe-logos' as SupernaturalSpace['subLevel'],
  status: 'discovered' as SupernaturalSpace['status'],
  report: {
    warnings: [],
    description: [],
    entry: [],
    exit: [],
    phenomena: [],
    entityDistribution: [],
    containment: [],
    appendices: [],
    files: [],
    figures: [],
    attachments: [],
  } as DraftReport,
})

const loading = ref(true)
const missing = ref(false)
const saving = ref(false)

// 未保存守卫：首载完成后任何表单改动都算 dirty，离开前确认（保存成功后清零）
const dirty = ref(false)

// 编辑中删图/换图延后回收：URL 先记账，写库成功后才真正移进回收站——
// 放弃编辑或写库失败时库里引用依然有效（防破图）。
const removedUrls: string[] = []

const mode = ref<'split' | 'preview'>('split')

async function load(): Promise<void> {
  loading.value = true
  missing.value = false
  try {
    if (isNew.value) return
    const s = await api.get<SupernaturalSpace>('supernatural_spaces', String(route.params.id))
    applySpace(s)
  } catch {
    missing.value = true
  } finally {
    loading.value = false
  }
}

function applySpace(s: SupernaturalSpace): void {
  const report = parseSpaceReport(s.report)
  // 旧列软迁移：report 为空而旧文本列有值时，把旧文本带进编辑器当初始段落（一次性，无脚本）
  if (!report.description.length && s.rules) report.description = [s.rules]
  if (!report.containment.length && s.resources) report.containment = [s.resources]
  form.code = s.code
  form.name = s.name
  form.level = s.level
  form.subLevel = s.subLevel
  form.status = s.status
  form.report.warnings = report.warnings.map((w) => ({ ...w }))
  form.report.description = [...report.description]
  form.report.entry = [...report.entry]
  form.report.exit = [...report.exit]
  form.report.phenomena = report.phenomena.map((x) => ({ ...x }))
  form.report.entityDistribution = report.entityDistribution.map((x) => ({ ...x }))
  form.report.containment = [...report.containment]
  form.report.appendices = report.appendices.map((x) => ({ source: x.source, body: [...x.body] }))
  form.report.files = report.files.map((x) => ({ source: x.source, body: [...x.body], quoted: x.quoted }))
  form.report.figures = report.figures.map((x) => ({ caption: x.caption, url: x.url }))
  form.report.attachments = report.attachments.map((x) => ({ body: [...x.body] }))
  dirty.value = false
}

// 表单任何改动都标脏（首载/重置时由 applySpace 重置回 false）。
// ⚠️ saving 期间必须豁免：save() 会回填响应式字段（figures[].url/_pending/_oldUrl），
// 这些变更把本 watcher 排进微任务队列；watcher 的 flush 先于 router.replace 的
// 路由守卫执行，若此时把 dirty 置回 true，路由守卫会弹"尚未保存"确认框拦下导航，
// 用户重按保存 → 新建场景第二次 POST = 重复档案（青色膝盖 ×2 实锤事故）。
watch(
  () => [form.code, form.name, form.level, form.subLevel, form.status, form.report],
  () => {
    if (!loading.value && !saving.value) dirty.value = true
  },
  { deep: true },
)

onMounted(() => {
  void load()
  window.addEventListener('beforeunload', onBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', onBeforeUnload)
  for (const f of form.report.figures) {
    if (f._pending) URL.revokeObjectURL(f._pending.objectUrl)
  }
})

onBeforeRouteLeave((to, _from) => {
  if (!dirty.value || saving.value) return true
  if (to.name === 'armarium-space-report' && String(to.params.id ?? '') === String(route.params.id)) return true
  return window.confirm('报告单尚未保存，离开将丢失本次修改。确定离开？')
})

// 编辑器是 window.open 开的独立窗口：窗口级"未保存"守卫（关闭/刷新前浏览器原生确认）
function onBeforeUnload(e: BeforeUnloadEvent): void {
  if (!dirty.value || saving.value) return
  e.preventDefault()
  e.returnValue = ''
}

/* ---------- 实时预览 ---------- */

const previewSpace = computed<SupernaturalSpace>(() => ({
  id: 0,
  code: form.code,
  name: form.name,
  level: form.level,
  subLevel: form.subLevel,
  status: form.status,
  rules: '',
  resources: '',
  anchorStatus: '',
  note: '',
  report: '',
}))

const previewReport = computed<SpaceReport>(() => ({
  ...form.report,
  figures: form.report.figures.map((f) => ({
    caption: f.caption,
    url: f._pending?.objectUrl ?? f.url,
  })),
}))

/* ---------- 展示层常量 ---------- */

const SUB_LEVELS = [
  'safe-logos',
  'safe-neutralized',
  'safe-soma',
  'euclid-nexus',
  'euclid-thaumiel',
  'keter-naama',
  'keter-tg',
  'keter-golach',
  'keter-exe',
  'keter-samael',
] as const

// 子等级跟随主等级（safe-* 只在 Safe 下出现等），避免存出 Safe-TG 这类矛盾组合
const subLevelOptions = computed(() =>
  SUB_LEVELS.filter((s) => s.startsWith(form.level === 'keter' ? 'keter' : form.level)),
)

const STATUS_OPTIONS: Array<[SupernaturalSpace['status'], string]> = [
  ['discovered', '已发现'],
  ['assessing', '评估中'],
  ['controlled', '已控制'],
  ['harvesting', '资源采集中'],
  ['breached', '已突破'],
]

/**
 * 警告线插入点（动态）：随附录/文件/图片/附件条目增减自动更新，
 * 与渲染器（reportRender 的 landmark 表）共用 shared 的同一份插入点列表。
 */
const warnAnchorOptions = computed(() => spaceWarningAnchors(form.report))

/* ---------- 通用行操作 ---------- */

function move<T>(arr: T[], i: number, d: number): void {
  const j = i + d
  if (j < 0 || j >= arr.length) return
  const [x] = arr.splice(i, 1)
  if (x !== undefined) arr.splice(j, 0, x)
}

/** 主等级切换时，把子等级重置回该等级下的第一档（避免跨档组合）。 */
function onLevelChange(level: SpaceLevel): void {
  form.level = level
  if (!subLevelOptions.value.some((s) => s === form.subLevel)) {
    form.subLevel = subLevelOptions.value[0] ?? 'safe-logos'
  }
}

/* ---------- 图片块（延迟上传；替换/删除只记账，写库成功后才回收旧文件） ---------- */

function onFigurePicked(fig: DraftFigure, event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (fig._pending) URL.revokeObjectURL(fig._pending.objectUrl)
  fig._pending = { file, objectUrl: URL.createObjectURL(file) }
  // 库里已指向当前 url：换新图后旧文件要在写库成功后回收
  if (fig.url.startsWith('/art/') && !fig._oldUrl) fig._oldUrl = fig.url
}

function addFigure(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  form.report.figures.push({
    caption: '',
    url: '',
    _pending: { file, objectUrl: URL.createObjectURL(file) },
  })
}

function removeFigure(i: number): void {
  const f = form.report.figures[i]
  if (!f) return
  if (f._pending) URL.revokeObjectURL(f._pending.objectUrl)
  const saved = f._oldUrl ?? f.url
  if (saved.startsWith('/art/')) removedUrls.push(saved)
  form.report.figures.splice(i, 1)
}

function figureSrc(f: DraftFigure): string {
  return f._pending?.objectUrl ?? f.url
}

/* ---------- 段落放大编辑（双击输入框 → 遮罩 + 居中大输入框，保存后写回） ---------- */

const zoom = reactive({
  open: false,
  text: '',
  apply: null as null | ((v: string) => void),
})
const zoomBox = ref<HTMLTextAreaElement | null>(null)

function openZoom(get: () => string, set: (v: string) => void): void {
  zoom.text = get()
  zoom.apply = set
  zoom.open = true
  void nextTick(() => {
    zoomBox.value?.focus()
  })
}

function closeZoom(commit: boolean): void {
  if (commit && zoom.apply) zoom.apply(zoom.text)
  zoom.open = false
  zoom.apply = null
}

/* ---------- 保存（先上传暂存图片，再写库；成功后才回收旧图） ---------- */

async function save(): Promise<void> {
  if (saving.value) return
  const digits = form.code.replace(/\D/g, '')
  if (!digits) {
    showToast('请先填写 SCL 数字编号')
    return
  }
  if (!form.name.trim()) {
    showToast('请先填写空间名称')
    return
  }
  saving.value = true
  const uploadedUrls: string[] = []
  try {
    const full = `SCL-${digits}`
    // ① 上传暂存图（此刻才落盘）；失败时已上传的部分要在 catch 里回收防孤儿
    for (const f of form.report.figures) {
      if (!f._pending) continue
      const res = await api.uploadSpaceImage(f._pending.file, full)
      f.url = res.url
      uploadedUrls.push(res.url)
      URL.revokeObjectURL(f._pending.objectUrl)
      f._pending = undefined
    }
    // ② 写库（旧图仍在原位，此刻库里引用全部有效）
    const payload = {
      code: digits,
      name: form.name,
      level: form.level,
      subLevel: form.subLevel,
      status: form.status,
      report: JSON.stringify({
        warnings: form.report.warnings.map((w) => ({
          sl: Math.min(99, Math.max(1, Math.trunc(Number(w.sl)) || 1)),
          anchor: w.anchor,
        })),
        description: form.report.description,
        entry: form.report.entry,
        exit: form.report.exit,
        phenomena: form.report.phenomena,
        entityDistribution: form.report.entityDistribution,
        containment: form.report.containment,
        appendices: form.report.appendices,
        files: form.report.files,
        figures: form.report.figures.map((f) => ({ caption: f.caption, url: f.url })),
        attachments: form.report.attachments,
      }),
    }
    let id: number
    if (isNew.value) {
      const created = await api.create<{ id: number }>('supernatural_spaces', payload)
      id = Number(created.id)
    } else {
      await api.update('supernatural_spaces', String(route.params.id), payload)
      id = Number(route.params.id)
    }
    // ③ 写库成功后统一回收：被替换/被删除的旧图
    const trashUrls = [...removedUrls]
    for (const f of form.report.figures) {
      if (f._oldUrl && f._oldUrl !== f.url) trashUrls.push(f._oldUrl)
      f._oldUrl = undefined
    }
    removedUrls.length = 0
    for (const url of trashUrls) {
      api.removeSpaceImage(url).catch(() => {})
    }
    dirty.value = false
    showToast('保存成功')
    // 本窗口是独立编辑窗口：通知原列表页刷新（数据更新、浏览位置不动）
    window.opener?.postMessage('rtl:spaces-updated', window.location.origin)
    store.reload().catch(() => {})
    // 先 flush 掉保存期间排队进微任务的 dirty watcher（此刻 saving 仍为 true，
    // watcher 被豁免不会置脏）——否则该 watcher 会在路由守卫之后、saving=false
    // 之前 flush，把 dirty 置回 true 触发"尚未保存"确认框拦下导航
    //（青色膝盖 ×2 实锤事故的根因）。
    await nextTick()
    // replace 而非 push：把本窗口历史里的"编辑页"条目替换成预览页，
    // 之后预览页的"返回"不会再 back 回编辑页
    void router.replace(`/armarium/spaces/${id}`)
  } catch (e) {
    // 写库失败：回收本次已上传的文件（库里从未引用过它们）
    for (const url of uploadedUrls) {
      api.removeSpaceImage(url).catch(() => {})
    }
    showToast(`保存失败：${e instanceof Error ? e.message : String(e)}`)
  } finally {
    saving.value = false
  }
}

function printReport(): void {
  const prevTitle = document.title
  if (form.code || form.name) {
    document.title = spaceExportFilename({ code: form.code, name: form.name })
  }
  // 只靠 afterprint 还原标题（print() 非阻塞的浏览器里同步还原会让文件名失效）
  window.addEventListener('afterprint', () => {
    document.title = prevTitle
  }, { once: true })
  window.print()
}

function goBack(): void {
  // 独立窗口：直接关窗回原列表（原窗口滚动位置天然不动）；
  // 直接粘贴 URL 打开的窗口没有 opener，退回应用内导航。
  if (window.opener && !window.opener.closed) {
    window.close()
    return
  }
  if (window.history.state?.back) void router.back()
  else void router.push('/armarium/spaces')
}
</script>

<template>
  <div class="spc-edit" :class="{ 'mode-preview': mode === 'preview' }">
    <header class="topbar">
      <button type="button" class="back" @click="goBack">← 返回</button>
      <h1>{{ isNew ? '新建超自然空间报告单' : '编辑超自然空间报告单' }}</h1>
      <span v-if="form.code" class="tag">SCL-{{ form.code }}</span>
      <div class="spacer"></div>
      <nav class="modebar">
        <button type="button" :class="{ 'is-active': mode === 'split' }" @click="mode = 'split'">编辑模式</button>
        <button type="button" :class="{ 'is-active': mode === 'preview' }" @click="mode = 'preview'">预览模式</button>
        <button type="button" @click="printReport">打印 / 导出 PDF</button>
        <button type="button" class="save" :disabled="saving" @click="save">{{ saving ? '保存中…' : '保存' }}</button>
      </nav>
    </header>

    <p v-if="loading" class="edit-hint">读取档案中…</p>
    <p v-else-if="missing" class="edit-hint">未找到该超自然空间档案，可能已被删除。</p>

    <div v-else class="workbench">
      <aside class="editor-pane">
        <!-- 基础信息 -->
        <details class="sec" open>
          <summary>基础信息</summary>
          <div class="sec-body">
            <div class="field-row">
              <div class="field">
                <label>项目编号</label>
                <div class="code-input">
                  <span class="prefix">SCL-</span>
                  <input v-model.trim="form.code" type="text" placeholder="位数不限" @input="form.code = form.code.replace(/\D/g, '')" />
                </div>
              </div>
              <div class="field grow">
                <label>名称</label>
                <input v-model.trim="form.name" type="text" placeholder="空间名称" />
              </div>
              <div class="field">
                <label>主等级</label>
                <select :value="form.level" @change="onLevelChange(($event.target as HTMLSelectElement).value as SpaceLevel)">
                  <option value="safe">Safe</option>
                  <option value="euclid">Euclid</option>
                  <option value="keter">Keter</option>
                </select>
              </div>
              <div class="field">
                <label>子等级</label>
                <select :value="form.subLevel" @change="form.subLevel = ($event.target as HTMLSelectElement).value as SupernaturalSpace['subLevel']">
                  <option v-for="sub in subLevelOptions" :key="sub" :value="sub">{{ spaceLevelText(form.level, sub) }}</option>
                </select>
              </div>
              <div class="field">
                <label>控制状态</label>
                <select :value="form.status" @change="form.status = ($event.target as HTMLSelectElement).value as SupernaturalSpace['status']">
                  <option v-for="[v, t] in STATUS_OPTIONS" :key="v" :value="v">{{ t }}</option>
                </select>
              </div>
            </div>
          </div>
        </details>

        <!-- 描述 -->
        <details class="sec" open>
          <summary>描述</summary>
          <div class="sec-body">
            <div v-for="(_, i) in form.report.description" :key="i" class="para-item">
              <textarea
                v-model="form.report.description[i]"
                title="双击可放大编辑"
                placeholder="该空间的形态特征、特性以及个性……"
                @dblclick="openZoom(() => form.report.description[i] ?? '', v => { form.report.description[i] = v })"
              ></textarea>
              <button type="button" class="iconbtn" title="上移" @click="move(form.report.description, i, -1)">↑</button>
              <button type="button" class="iconbtn" title="下移" @click="move(form.report.description, i, 1)">▾</button>
              <button type="button" class="iconbtn danger" title="删除" @click="form.report.description.splice(i, 1)">✕</button>
            </div>
            <button type="button" class="addbtn" @click="form.report.description.push('')">＋ 添加段落</button>
          </div>
        </details>

        <!-- 入口与出口 -->
        <details class="sec" open>
          <summary>入口与出口</summary>
          <div class="sec-body">
            <p class="para-hint">入口 = 进入方式；出口 = 离开方式。各可写多段，渲染为固定两行「* 入口：…」「* 出口：…」。</p>
            <div class="field"><label>入口</label></div>
            <div v-for="(_, i) in form.report.entry" :key="`entry-${i}`" class="para-item">
              <textarea
                v-model="form.report.entry[i]"
                title="双击可放大编辑"
                placeholder="该空间的进入方式……"
                @dblclick="openZoom(() => form.report.entry[i] ?? '', v => { form.report.entry[i] = v })"
              ></textarea>
              <button type="button" class="iconbtn" title="上移" @click="move(form.report.entry, i, -1)">↑</button>
              <button type="button" class="iconbtn" title="下移" @click="move(form.report.entry, i, 1)">▾</button>
              <button type="button" class="iconbtn danger" title="删除" @click="form.report.entry.splice(i, 1)">✕</button>
            </div>
            <button type="button" class="addbtn" @click="form.report.entry.push('')">＋ 添加入口段落</button>
            <div class="field" style="margin-top:10px"><label>出口</label></div>
            <div v-for="(_, i) in form.report.exit" :key="`exit-${i}`" class="para-item">
              <textarea
                v-model="form.report.exit[i]"
                title="双击可放大编辑"
                placeholder="该空间的离开方式……"
                @dblclick="openZoom(() => form.report.exit[i] ?? '', v => { form.report.exit[i] = v })"
              ></textarea>
              <button type="button" class="iconbtn" title="上移" @click="move(form.report.exit, i, -1)">↑</button>
              <button type="button" class="iconbtn" title="下移" @click="move(form.report.exit, i, 1)">▾</button>
              <button type="button" class="iconbtn danger" title="删除" @click="form.report.exit.splice(i, 1)">✕</button>
            </div>
            <button type="button" class="addbtn" @click="form.report.exit.push('')">＋ 添加出口段落</button>
          </div>
        </details>

        <!-- 超自然现象分布 -->
        <details class="sec" open>
          <summary>超自然现象分布</summary>
          <div class="sec-body">
            <div v-for="(item, i) in form.report.phenomena" :key="i" class="subcard">
              <div class="subcard-head">
                <span class="badge">{{ i + 1 }}.</span>
                <input v-model.trim="item.name" type="text" placeholder="现象名（如 无限延伸）" />
                <button type="button" class="iconbtn" title="上移" @click="move(form.report.phenomena, i, -1)">↑</button>
                <button type="button" class="iconbtn" title="下移" @click="move(form.report.phenomena, i, 1)">▾</button>
                <button type="button" class="iconbtn danger" title="删除条目" @click="form.report.phenomena.splice(i, 1)">✕</button>
              </div>
              <textarea
                v-model="item.desc"
                title="双击可放大编辑"
                placeholder="现象描述……"
                @dblclick="openZoom(() => item.desc, v => { item.desc = v })"
              ></textarea>
            </div>
            <button type="button" class="addbtn" @click="form.report.phenomena.push({ name: '', desc: '' })">＋ 添加现象</button>
          </div>
        </details>

        <!-- 异常实体分布 -->
        <details class="sec" open>
          <summary>异常实体分布</summary>
          <div class="sec-body">
            <div v-for="(item, i) in form.report.entityDistribution" :key="i" class="subcard">
              <div class="subcard-head">
                <span class="badge">{{ i + 1 }}.</span>
                <input v-model.trim="item.name" type="text" placeholder="实体名（如 SCL-1100056-A 巨人洋娃娃）" />
                <button type="button" class="iconbtn" title="上移" @click="move(form.report.entityDistribution, i, -1)">↑</button>
                <button type="button" class="iconbtn" title="下移" @click="move(form.report.entityDistribution, i, 1)">▾</button>
                <button type="button" class="iconbtn danger" title="删除条目" @click="form.report.entityDistribution.splice(i, 1)">✕</button>
              </div>
              <textarea
                v-model="item.desc"
                title="双击可放大编辑"
                placeholder="该实体的分布与行为描述……"
                @dblclick="openZoom(() => item.desc, v => { item.desc = v })"
              ></textarea>
            </div>
            <button type="button" class="addbtn" @click="form.report.entityDistribution.push({ name: '', desc: '' })">＋ 添加实体</button>
          </div>
        </details>

        <!-- 特殊控制措施 -->
        <details class="sec" open>
          <summary>特殊控制措施</summary>
          <div class="sec-body">
            <div v-for="(_, i) in form.report.containment" :key="i" class="para-item">
              <textarea
                v-model="form.report.containment[i]"
                title="双击可放大编辑"
                placeholder="采用常规【书中世界】方案：……"
                @dblclick="openZoom(() => form.report.containment[i] ?? '', v => { form.report.containment[i] = v })"
              ></textarea>
              <button type="button" class="iconbtn" title="上移" @click="move(form.report.containment, i, -1)">↑</button>
              <button type="button" class="iconbtn" title="下移" @click="move(form.report.containment, i, 1)">▾</button>
              <button type="button" class="iconbtn danger" title="删除" @click="form.report.containment.splice(i, 1)">✕</button>
            </div>
            <button type="button" class="addbtn" @click="form.report.containment.push('')">＋ 添加段落</button>
          </div>
        </details>

        <!-- 附录 -->
        <details class="sec" open>
          <summary>附录</summary>
          <div class="sec-body">
            <div v-for="(item, i) in form.report.appendices" :key="i" class="subcard">
              <div class="subcard-head">
                <span class="badge">附录#{{ form.code || 'XXXX' }}-{{ i + 1 }}</span>
                <input v-model.trim="item.source" type="text" placeholder="附录来源（选填）" />
                <button type="button" class="iconbtn danger" title="删除条目" @click="form.report.appendices.splice(i, 1)">✕</button>
              </div>
              <div v-for="(_, j) in item.body" :key="j" class="para-item">
                <textarea
                  v-model="item.body[j]"
                  title="双击可放大编辑"
                  placeholder="对空间的文字补充……"
                  @dblclick="openZoom(() => item.body[j] ?? '', v => { item.body[j] = v })"
                ></textarea>
                <button type="button" class="iconbtn" title="上移" @click="move(item.body, j, -1)">↑</button>
                <button type="button" class="iconbtn" title="下移" @click="move(item.body, j, 1)">▾</button>
                <button type="button" class="iconbtn danger" title="删除" @click="item.body.splice(j, 1)">✕</button>
              </div>
              <button type="button" class="addbtn" @click="item.body.push('')">＋ 添加段落</button>
            </div>
            <button type="button" class="addbtn" @click="form.report.appendices.push({ source: '', body: [''] })">＋ 添加附录</button>
          </div>
        </details>

        <!-- 文件 -->
        <details class="sec" open>
          <summary>文件</summary>
          <div class="sec-body">
            <div v-for="(item, i) in form.report.files" :key="i" class="subcard">
              <div class="subcard-head">
                <span class="badge">文件#{{ form.code || 'XXXX' }}-{{ anomalyFileIndexLabel(i) }}</span>
                <input v-model.trim="item.source" type="text" placeholder="文件来源（选填）" />
                <button type="button" class="iconbtn danger" title="删除条目" @click="form.report.files.splice(i, 1)">✕</button>
              </div>
              <div v-for="(_, j) in item.body" :key="j" class="para-item">
                <textarea
                  v-model="item.body[j]"
                  title="双击可放大编辑"
                  placeholder="从别处引用的补充……"
                  @dblclick="openZoom(() => item.body[j] ?? '', v => { item.body[j] = v })"
                ></textarea>
                <button type="button" class="iconbtn" title="上移" @click="move(item.body, j, -1)">↑</button>
                <button type="button" class="iconbtn" title="下移" @click="move(item.body, j, 1)">▾</button>
                <button type="button" class="iconbtn danger" title="删除" @click="item.body.splice(j, 1)">✕</button>
              </div>
              <label class="checkline">
                <input v-model="item.quoted" type="checkbox" />
                <span>直接引用（渲染为带边框引用框）</span>
              </label>
              <button type="button" class="addbtn" @click="item.body.push('')">＋ 添加段落</button>
            </div>
            <button type="button" class="addbtn" @click="form.report.files.push({ source: '', body: [''], quoted: false })">＋ 添加文件</button>
          </div>
        </details>

        <!-- 图片 -->
        <details class="sec" open>
          <summary>图片（实体影像资料 + 插图块）</summary>
          <div class="sec-body">
            <div v-for="(fig, i) in form.report.figures" :key="i" class="figure-item">
              <div class="fig-main">
                <img :src="figureSrc(fig)" alt="" />
                <div class="fig-fields">
                  <span v-if="i === 0" class="mainfig-label">实体影像资料（图片1）</span>
                  <span v-else class="mainfig-label mainfig-label--plain">图片{{ i + 1 }}</span>
                  <input v-model.trim="fig.caption" type="text" placeholder="图注：描述图片内容" />
                  <div class="fig-ops">
                    <label class="addbtn">
                      替换
                      <input type="file" accept="image/*" hidden @change="onFigurePicked(fig, $event)" />
                    </label>
                    <button type="button" class="addbtn" :disabled="i === 0" @click="move(form.report.figures, i, -1)">上移</button>
                    <button type="button" class="addbtn" :disabled="i === form.report.figures.length - 1" @click="move(form.report.figures, i, 1)">下移</button>
                    <button type="button" class="addbtn danger-zone" @click="removeFigure(i)">删除</button>
                  </div>
                </div>
              </div>
            </div>
            <label class="addbtn">＋ 添加图片（本地选择，保存时才上传）
              <input type="file" accept="image/*" hidden @change="addFigure($event)" />
            </label>
          </div>
        </details>

        <!-- 附件 -->
        <details class="sec">
          <summary>附件</summary>
          <div class="sec-body">
            <div v-for="(item, i) in form.report.attachments" :key="i" class="subcard">
              <div class="subcard-head">
                <span class="badge">附件#{{ form.code || 'XXXX' }}-{{ i + 1 }}</span>
                <button type="button" class="iconbtn danger" title="删除条目" @click="form.report.attachments.splice(i, 1)">✕</button>
              </div>
              <div v-for="(_, j) in item.body" :key="j" class="para-item">
                <textarea
                  v-model="item.body[j]"
                  title="双击可放大编辑"
                  placeholder="过长或过于复杂的文件补充……"
                  @dblclick="openZoom(() => item.body[j] ?? '', v => { item.body[j] = v })"
                ></textarea>
                <button type="button" class="iconbtn" title="上移" @click="move(item.body, j, -1)">↑</button>
                <button type="button" class="iconbtn" title="下移" @click="move(item.body, j, 1)">▾</button>
                <button type="button" class="iconbtn danger" title="删除" @click="item.body.splice(j, 1)">✕</button>
              </div>
              <button type="button" class="addbtn" @click="item.body.push('')">＋ 添加段落</button>
            </div>
            <button type="button" class="addbtn" @click="form.report.attachments.push({ body: [''] })">＋ 添加附件</button>
          </div>
        </details>

        <!-- 权限警告线 -->
        <details class="sec" open>
          <summary>权限警告线 <span class="count">{{ form.report.warnings.length }}/{{ SPACE_WARNING_MAX }}</span></summary>
          <div class="sec-body">
            <p class="para-hint">每条警告线开启一段受限区间：该线之下、直到下一条警告线或报告结尾的内容需其标注的 SL 等级；新警告线出现后，旧标签被最新权限覆盖。</p>
            <div class="warn-list">
              <div v-for="(w, i) in form.report.warnings" :key="i" class="warn-row">
                <span class="idx">{{ i + 1 }}</span>
                <input v-model.number="w.sl" type="number" min="1" max="99" title="安全权限等级（如 6 → SL-06）" />
                <select :value="w.anchor" @change="w.anchor = ($event.target as HTMLSelectElement).value as SpaceWarningAnchor">
                  <option v-for="opt in warnAnchorOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>
                <button type="button" class="iconbtn danger" title="删除警告线" @click="form.report.warnings.splice(i, 1)">✕</button>
              </div>
            </div>
            <button
              v-if="form.report.warnings.length < SPACE_WARNING_MAX"
              type="button"
              class="addbtn"
              @click="form.report.warnings.push({ sl: 1, anchor: 'block:figure-main' })"
            >＋ 添加警告线（最多 {{ SPACE_WARNING_MAX }} 条）</button>
          </div>
        </details>
      </aside>

      <main class="preview-pane">
        <SpacePaper :space="previewSpace" :report="previewReport" />
      </main>
    </div>

    <!-- 段落放大编辑：遮罩 + 居中大输入框（点保存才写回原段落） -->
    <div v-if="zoom.open" class="zoom-overlay" @click.self="closeZoom(false)">
      <div class="zoom-card" role="dialog" aria-modal="true">
        <header class="zoom-head">
          <span>段落放大编辑</span>
          <button type="button" class="iconbtn" title="取消" @click="closeZoom(false)">✕</button>
        </header>
        <textarea
          ref="zoomBox"
          v-model="zoom.text"
          class="zoom-textarea"
          placeholder="在此编辑完整段落……"
          @keydown.esc="closeZoom(false)"
        ></textarea>
        <footer class="zoom-foot">
          <span class="zoom-count">{{ zoom.text.length }} 字</span>
          <button type="button" class="addbtn" @click="closeZoom(false)">取消</button>
          <button type="button" class="zoom-save" @click="closeZoom(true)">保存</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 编辑器独立窗口（chromeless）：严格对齐草稿 02-H5 原型的布局与尺寸。
   草稿 token → 站点 token 映射：surface→--color-surface，surface2→--color-surface-2，
   ink*→--color-ink*，line→--color-line，armarium→--armarium。 */
.spc-edit {
  background: var(--color-bg);
  color: var(--color-ink);
  font-family: var(--font-serif);
  min-height: 100vh;
  min-width: 0;
  --topbar-h: 56px;
}

.topbar {
  align-items: center;
  background: var(--color-surface);
  border-bottom: var(--bd-w) var(--bd-style) var(--bd-color);
  box-sizing: border-box;
  display: flex;
  gap: 14px;
  height: var(--topbar-h);
  padding: 8px 18px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.topbar h1 {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.06em;
  margin: 0;
}

.topbar .tag {
  border: var(--bd-w) var(--bd-style) color-mix(in srgb, var(--armarium) 45%, transparent);
  border-radius: 999px;
  color: var(--armarium);
  font-size: 11px;
  letter-spacing: 0.1em;
  padding: 2px 10px;
}

.topbar .spacer {
  flex: 1;
}

.modebar {
  display: flex;
  gap: 8px;
}

.modebar button {
  background: var(--color-surface-2, var(--color-surface));
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: var(--radius);
  color: var(--color-ink-dim);
  cursor: pointer;
  font-size: 13px;
  letter-spacing: 0.08em;
  padding: 5px 16px;
  transition: all 0.15s ease;
}

.modebar button:hover {
  border-color: var(--armarium);
  color: var(--color-ink);
}

.modebar button.is-active {
  background: color-mix(in srgb, var(--armarium) 16%, var(--color-surface-2, var(--color-surface)));
  border-color: var(--armarium);
  box-shadow: inset 0 0 0 1px var(--armarium);
  color: var(--color-ink);
}

.modebar button.save {
  border-color: var(--armarium);
  color: var(--color-ink);
}

.modebar button.save:hover:not(:disabled) {
  background: var(--armarium);
  color: #10151c;
}

.modebar button.save:disabled {
  cursor: wait;
  opacity: 0.6;
}

.topbar .back {
  background: transparent;
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: var(--radius);
  color: var(--color-ink-dim);
  cursor: pointer;
  flex: none;
  font-size: 13px;
  letter-spacing: 0.08em;
  padding: 5px 16px;
  transition: all 0.15s ease;
}

.topbar .back:hover {
  border-color: var(--armarium);
  color: var(--color-ink);
}

.edit-hint {
  color: var(--color-ink-faint);
  font-size: 13px;
  padding: 20px;
}

/* 草稿：.workbench{display:flex;align-items:flex-start;padding:0 0 60px}——
   不定死窗口高度：预览纸面自然延伸撑开整页，页面级滚动。 */
.workbench {
  align-items: flex-start;
  display: flex;
  padding: 0 0 60px;
}

.spc-edit.mode-preview .workbench {
  display: block;
}

/* 草稿：编辑栏 580px / padding 20px / 视口高内滚动；
   sticky 定位：预览区把页面撑长后编辑栏常驻视口（top = topbar 高度，单处定义）。 */
.editor-pane {
  border-right: var(--bd-w) var(--bd-style) var(--bd-color);
  flex: none;
  max-height: calc(100vh - var(--topbar-h));
  overflow-y: auto;
  padding: 20px 30px 20px 60px;
  position: sticky;
  scrollbar-width: thin;
  top: var(--topbar-h);
  width: 600px;
}

.spc-edit.mode-preview .editor-pane {
  display: none;
}

.preview-pane {
  display: flex;
  flex: 1;
  justify-content: center;
  min-width: 0;
  overflow: auto;
  padding: 22px 40px 60px;
}

.spc-edit.mode-preview .preview-pane {
  padding-top: 30px;
}

/* 草稿：区块卡 */
.sec {
  background: var(--color-surface);
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: calc(var(--radius) + 2px);
  margin-bottom: 14px;
  overflow: hidden;
}

.sec > summary {
  align-items: center;
  border-left: 3px solid var(--armarium);
  color: var(--armarium);
  cursor: pointer;
  display: flex;
  font-size: 15px;
  gap: 8px;
  letter-spacing: 0.08em;
  list-style: none;
  padding: 11px 14px;
  user-select: none;
}

.sec > summary::before {
  color: var(--color-ink-faint);
  content: '▸';
  font-size: 11px;
  transition: transform 0.15s;
}

.sec[open] > summary::before {
  transform: rotate(90deg);
}

.sec > summary .count {
  color: var(--color-ink-faint);
  font-size: 11px;
  margin-left: auto;
}

.sec-body {
  border-top: var(--bd-w) var(--bd-style) var(--bd-color);
  padding: 14px;
}

.field-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.field > label {
  color: var(--color-ink-faint);
  font-size: 12px;
  letter-spacing: 0.08em;
}

.field.grow {
  flex: 1;
}

/* 草稿：裸选择器统一编辑器内全部输入控件（14px / padding 8 10 / textarea 76px） */
input[type='text'],
input[type='number'],
select,
textarea {
  background: var(--color-surface-2, var(--color-surface));
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: 6px;
  color: var(--color-ink);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  padding: 8px 10px;
  width: 100%;
}

input:focus,
select:focus,
textarea:focus {
  border-color: var(--armarium);
}

textarea {
  line-height: 1.8;
  min-height: 96px;
  resize: vertical;
}

/* 段落框自适应增高：随内容自动增高（上限 320px），旧浏览器不支持时回退为固定 120px */
.para-item textarea {
  field-sizing: content;
  max-height: 320px;
  min-height: 120px;
}

.code-input {
  align-items: center;
  display: flex;
  gap: 0;
}

.code-input .prefix {
  background: var(--color-surface-2, var(--color-surface));
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: 6px 0 0 6px;
  border-right: none;
  color: var(--color-gold);
  font-size: 13px;
  letter-spacing: 0.05em;
  padding: 7px 0 7px 9px;
}

.code-input input {
  border-radius: 0 6px 6px 0;
  width: 130px;
}

.para-item {
  align-items: flex-start;
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.iconbtn {
  background: var(--color-surface-2, var(--color-surface));
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: 6px;
  color: var(--color-ink-faint);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  font-size: 13px;
  height: 34px;
  line-height: 1;
  padding: 0;
  width: 28px;
}

.iconbtn:hover {
  border-color: var(--armarium);
  color: var(--color-ink);
}

.iconbtn.danger:hover {
  background: color-mix(in srgb, #c04a32 35%, var(--color-surface-2, var(--color-surface)));
  border-color: #c04a32;
  color: #fff;
}

.addbtn {
  background: transparent;
  border: var(--bd-w) dashed var(--bd-color);
  border-radius: 6px;
  color: var(--color-ink-dim);
  cursor: pointer;
  font-size: 13px;
  letter-spacing: 0.08em;
  padding: 7px 14px;
}

.addbtn:hover {
  border-color: var(--armarium);
  color: var(--armarium);
}

.addbtn.danger-zone {
  border-color: color-mix(in srgb, #c04a32 40%, transparent);
  color: color-mix(in srgb, #c04a32 80%, var(--color-ink-dim));
}

.para-hint {
  color: var(--color-ink-faint);
  font-size: 11px;
  margin: 4px 0 8px;
}

.subcard {
  background: var(--color-surface-2, var(--color-surface));
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: 8px;
  margin-bottom: 10px;
  padding: 10px 10px 8px;
}

.subcard-head {
  align-items: center;
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.subcard-head .badge {
  color: var(--color-gold);
  flex: none;
  font-size: 13px;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.subcard-head input[type='text'] {
  flex: 1;
  min-width: 0;
}

.checkline {
  align-items: center;
  color: var(--color-ink-dim);
  display: flex;
  font-size: 13px;
  gap: 6px;
  margin-top: 6px;
}

.checkline input {
  accent-color: var(--armarium);
  width: auto;
}

.warn-list {
  margin-bottom: 10px;
}

.warn-row {
  align-items: center;
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.warn-row .idx {
  color: var(--color-ink-faint);
  flex: none;
  font-size: 12px;
  text-align: right;
  width: 14px;
}

.warn-row input[type='number'] {
  flex: none;
  width: 80px;
}

.warn-row select {
  flex: 1;
  min-width: 0;
}

.page-slots {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.page-slot {
  align-items: center;
  display: flex;
  gap: 6px;
}

.page-slot .idx {
  color: var(--color-ink-faint);
  flex: none;
  font-size: 11px;
  text-align: right;
  width: 14px;
}

.slot-count {
  color: var(--color-ink-faint);
  font-size: 11px;
}

.slot-count.warn {
  color: #c04a32;
}

.slots-head {
  align-items: center;
  color: var(--color-ink-faint);
  display: flex;
  font-size: 11px;
  gap: 10px;
  letter-spacing: 0.08em;
  margin-top: 12px;
}

.figure-item {
  background: var(--color-surface-2, var(--color-surface));
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: 8px;
  margin-bottom: 10px;
  padding: 8px;
}

.figure-item .fig-main {
  display: flex;
  gap: 10px;
}

.figure-item img {
  background: #000;
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: 6px;
  flex: none;
  height: 84px;
  object-fit: cover;
  width: 120px;
}

.figure-item .fig-fields {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.figure-item .fig-ops {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.figure-item .fig-ops .addbtn {
  font-size: 11px;
  padding: 4px 10px;
}

.mainfig-label {
  background: var(--armarium);
  border-radius: 4px;
  color: #fff;
  display: inline-block;
  font-size: 10px;
  letter-spacing: 0.1em;
  margin-bottom: 4px;
  padding: 1px 6px;
  width: fit-content;
}

.mainfig-label--plain {
  background: transparent;
  color: var(--color-ink-faint);
  padding: 1px 0;
}

.out-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr 1fr;
}

/* 段落放大编辑遮罩（居中，参照全站弹窗约定：遮罩可滚、内容居中） */
.zoom-overlay {
  align-items: center;
  background: rgba(16, 13, 9, 0.78);
  display: flex;
  inset: 0;
  justify-content: center;
  overflow-y: auto;
  padding: 20px;
  position: fixed;
  z-index: 200;
}

.zoom-card {
  background: var(--color-surface);
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: calc(var(--radius) * 2);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 80px);
  width: min(760px, 94vw);
}

.zoom-head {
  align-items: center;
  border-bottom: var(--bd-w) var(--bd-style) var(--bd-color);
  color: var(--armarium);
  display: flex;
  flex: none;
  font-size: 14px;
  justify-content: space-between;
  letter-spacing: 0.08em;
  padding: 12px 16px;
}

.zoom-textarea {
  background: var(--color-surface-2, var(--color-surface));
  border: none;
  border-bottom: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: 0;
  color: var(--color-ink);
  flex: 1;
  font-family: inherit;
  font-size: 14px;
  height: 56vh;
  line-height: 1.8;
  min-height: 280px;
  outline: none;
  padding: 14px 16px;
  resize: none;
  width: 100%;
}

.zoom-foot {
  align-items: center;
  display: flex;
  flex: none;
  gap: 10px;
  justify-content: flex-end;
  padding: 12px 16px;
}

.zoom-count {
  color: var(--color-ink-faint);
  font-size: 11px;
  letter-spacing: 0.08em;
  margin-right: auto;
}

.zoom-save {
  background: var(--armarium);
  border: var(--bd-w) var(--bd-style) var(--armarium);
  border-radius: var(--radius);
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  letter-spacing: 0.08em;
  padding: 7px 22px;
  transition: filter 0.15s ease;
}

.zoom-save:hover {
  filter: brightness(1.12);
}

/* 草稿：≤900px 双栏堆叠，编辑栏取消定高 */
@media screen and (max-width: 900px) {
  .workbench {
    flex-direction: column;
  }

  .editor-pane {
    border-bottom: var(--bd-w) var(--bd-style) var(--bd-color);
    border-right: none;
    max-height: none;
    position: static;
    width: 100%;
  }
}
</style>

