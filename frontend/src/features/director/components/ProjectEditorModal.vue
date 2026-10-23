<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { api } from '@/app/services/api'
import { showToast } from '@/app/stores/toast'
import type { ExternalProject } from '@rtl/shared'

/**
 * 域外之书收录 / 编辑弹窗（草稿 4.1）。
 * 形态遵循全站 Modal 约定（居中、遮罩内滚动）；不 import features/turris 的
 * Modal.vue——feature 之间禁止互相 import（CONVENTIONS §5.1），这里按同一
 * 形态自持一份结构，样式全部走 token 保证主题换肤生效。
 */
const props = defineProps<{ open: boolean; project: ExternalProject | null; nextOrder: number }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

const form = reactive({
  name: '',
  description: '',
  launchPath: '',
  url: '',
  spineColor: '',
  enabled: 1,
})

const saving = ref(false)
const pathState = ref<'' | 'checking' | 'ok' | 'missing'>('')

// 预设皮革色（材质色，非主题色——书脊是实体书的外观，与主题色板解耦，
// 同 StsCard 卡面机制："哪层的背景是写死的，哪层的文字就跟着那层走"）。
const PRESET_SPINES = ['#6b4432', '#3c4a58', '#4c3f5e', '#55603a', '#5e3f3f']

watch(
  () => props.open,
  (open) => {
    if (!open) return
    pathState.value = ''
    if (props.project) {
      form.name = props.project.name
      form.description = props.project.description
      form.launchPath = props.project.launchPath
      form.url = props.project.url
      form.spineColor = props.project.spineColor
      form.enabled = props.project.enabled
    } else {
      form.name = ''
      form.description = ''
      form.launchPath = ''
      form.url = ''
      form.spineColor = ''
      form.enabled = 1
    }
  },
)

const isEdit = computed(() => props.project != null)
const canSave = computed(
  () => form.name.trim() !== '' && (form.launchPath.trim() !== '' || form.url.trim() !== ''),
)

async function validatePath(): Promise<void> {
  if (form.launchPath.trim() === '') {
    pathState.value = 'missing'
    return
  }
  pathState.value = 'checking'
  try {
    const res = await api.launcherValidate(form.launchPath.trim())
    pathState.value = res.exists ? 'ok' : 'missing'
  } catch {
    pathState.value = 'missing'
  }
  setTimeout(() => {
    pathState.value = ''
  }, 2500)
}

function tryOpen(): void {
  if (form.url.trim() !== '') window.open(form.url.trim(), '_blank')
}

function pickSpine(color: string): void {
  form.spineColor = form.spineColor === color ? '' : color
}

async function save(): Promise<void> {
  if (!canSave.value || saving.value) return
  saving.value = true
  const body = {
    name: form.name.trim(),
    description: form.description.trim(),
    launchPath: form.launchPath.trim(),
    url: form.url.trim(),
    spineColor: form.spineColor,
    enabled: form.enabled,
    sortOrder: props.project?.sortOrder ?? props.nextOrder,
  }
  try {
    if (props.project) {
      await api.update('external_projects', props.project.id, body)
      showToast('已更新')
    } else {
      await api.create('external_projects', body)
      showToast('已收录上架')
    }
    emit('saved')
    emit('close')
  } catch (e) {
    showToast(e instanceof Error ? e.message : '保存失败')
  } finally {
    saving.value = false
  }
}

async function remove(): Promise<void> {
  if (!props.project) return
  if (!window.confirm(`确定取下「${props.project.name}」吗？记录将被删除。`)) return
  try {
    await api.remove('external_projects', props.project.id)
    showToast('已取下')
    emit('saved')
    emit('close')
  } catch (e) {
    showToast(e instanceof Error ? e.message : '删除失败')
  }
}
</script>

<template>
  <div v-if="open" class="editor-overlay" @click.self="emit('close')">
    <div class="editor" role="dialog" aria-modal="true">
      <header class="editor__head">
        <h2>{{ isEdit ? '编辑域外之书' : '收录新书' }}</h2>
        <span class="editor__subtitle">域外之书登记簿</span>
        <button class="editor__close" @click="emit('close')">✕</button>
      </header>

      <div class="editor__body">
        <p class="editor__intro">
          登记一本放在馆外架上的书。启动脚本与访问地址至少填一项：填了启动脚本才能「开馆」，填了访问地址才能「入馆」和显示在馆状态。
        </p>

        <div class="field">
          <label>书名 <span class="req">*</span><span class="opt">（显示在书脊上）</span></label>
          <input v-model="form.name" type="text" placeholder="例如：SillyTavern" />
        </div>

        <div class="field">
          <label>一句备注<span class="opt">（悬停纸条上显示）</span></label>
          <input v-model="form.description" type="text" placeholder="这本书是做什么的" />
        </div>

        <div class="field">
          <label>启动脚本路径<span class="opt">（可选 · 用于「开馆」）</span></label>
          <div class="field-row">
            <input
              v-model="form.launchPath"
              type="text"
              placeholder="例如：D:\ReliqLibrary\SillyTavern\Start.bat"
            />
            <button class="mini-btn" :class="pathState" @click="validatePath">
              {{ pathState === 'checking' ? '校验中…' : pathState === 'ok' ? '✓ 文件存在' : pathState === 'missing' ? '✕ 不存在' : '校验路径' }}
            </button>
          </div>
          <p class="hint">填绝对路径。校验由后端确认文件存在；不会替你浏览磁盘。</p>
        </div>

        <div class="field">
          <label>访问地址<span class="opt">（可选 · 用于「入馆」与在馆探测）</span></label>
          <div class="field-row">
            <input v-model="form.url" type="text" placeholder="例如：http://localhost:8000" />
            <button class="mini-btn" @click="tryOpen">试开</button>
          </div>
          <p class="hint">项目跑起来之后的本机或局域网地址。</p>
        </div>

        <div class="field">
          <label>书脊底色</label>
          <div class="swatches">
            <button
              v-for="color in PRESET_SPINES"
              :key="color"
              type="button"
              class="swatch"
              :class="{ 'is-selected': form.spineColor === color }"
              :style="{ background: color }"
              :title="color"
              @click="pickSpine(color)"
            ></button>
            <label class="swatch swatch--custom" title="自定义底色">
              自定
              <input
                v-model="form.spineColor"
                type="color"
                class="swatch__picker"
                @click.stop
              />
            </label>
          </div>
          <p class="hint">不选则按收录顺序从预设皮革色里循环分配。</p>
        </div>

        <div class="field">
          <button type="button" class="toggle" :class="{ 'is-on': form.enabled === 1 }" @click="form.enabled = form.enabled === 1 ? 0 : 1">
            <span class="toggle__knob"></span>
          </button>
          <span class="toggle-label">上架中<span class="opt">（下架 = 书脊从架上取走，记录保留）</span></span>
        </div>
      </div>

      <footer class="editor__foot">
        <button class="btn" @click="emit('close')">取消</button>
        <button class="btn btn--primary" :disabled="!canSave || saving" @click="save">
          {{ isEdit ? '保存' : '收录' }}
        </button>
        <button v-if="isEdit" class="btn btn--danger" @click="remove">取下这本书</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.editor-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(16, 13, 9, 0.78);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
}
.editor {
  width: 560px;
  max-width: 100%;
  max-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: calc(var(--radius) * 2);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}
.editor__head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: var(--bd-w) var(--bd-style) var(--bd-color);
  flex-shrink: 0;
}
.editor__head h2 {
  margin: 0;
  font-size: 18px;
  color: var(--accent);
}
.editor__subtitle {
  font-family: var(--font-kai);
  font-size: 11px;
  color: var(--color-ink-faint);
}
.editor__close {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--color-ink-faint);
  font-size: 18px;
  cursor: pointer;
}
.editor__close:hover {
  color: var(--color-ink);
}
.editor__body {
  padding: 18px 20px;
  overflow-y: auto;
}
.editor__intro {
  font-family: var(--font-kai);
  font-size: 12px;
  line-height: 1.9;
  color: var(--color-ink-dim);
  border-left: 2px solid var(--color-gold);
  padding-left: 12px;
  margin: 0 0 18px;
}
.field {
  margin-bottom: 15px;
}
.field label {
  display: block;
  font-family: var(--font-kai);
  font-size: 12px;
  color: var(--color-ink-dim);
  letter-spacing: 0.1em;
  margin-bottom: 6px;
}
.req {
  color: var(--color-gold);
}
.opt {
  color: var(--color-ink-faint);
  font-size: 11px;
  margin-left: 4px;
}
.field input[type='text'] {
  width: 100%;
  background: var(--color-bg);
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: var(--radius);
  color: var(--color-ink);
  font-family: var(--font-kai);
  font-size: 13px;
  padding: 9px 12px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.18s;
}
.field input[type='text']:focus {
  border-color: var(--color-gold);
}
.field-row {
  display: flex;
  gap: 10px;
  align-items: center;
}
.field-row input {
  flex: 1;
}
.hint {
  font-family: var(--font-kai);
  font-size: 11px;
  color: var(--color-ink-faint);
  margin: 5px 0 0;
  line-height: 1.7;
}
.mini-btn {
  font-family: var(--font-kai);
  font-size: 12px;
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  border-radius: var(--radius);
  background: transparent;
  color: var(--color-ink-dim);
  padding: 8px 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.18s, color 0.18s;
}
.mini-btn:hover {
  border-color: var(--color-gold);
  color: var(--color-gold);
}
.mini-btn.ok {
  border-color: var(--collegium);
  color: var(--collegium);
}
.mini-btn.missing {
  border-color: var(--danger);
  color: var(--danger);
}
.swatches {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.swatch {
  width: 26px;
  height: 40px;
  border-radius: 2px 5px 5px 2px;
  cursor: pointer;
  border: 1px solid transparent;
  padding: 0;
  transition: border-color 0.15s, transform 0.15s;
  box-shadow: inset 2px 0 3px rgba(255, 255, 255, 0.1), inset -3px 0 5px rgba(0, 0, 0, 0.45);
}
.swatch:hover {
  transform: translateY(-2px);
}
.swatch.is-selected {
  border-color: var(--color-gold);
  box-shadow: 0 0 8px var(--glow-1);
}
.swatch--custom {
  background: var(--color-surface-2);
  border: var(--bd-w) dashed var(--bd-color);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-ink-faint);
  font-family: var(--font-kai);
  font-size: 11px;
  position: relative;
  overflow: hidden;
}
.swatch--custom:hover {
  color: var(--color-gold);
}
.swatch__picker {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}
.toggle {
  width: 34px;
  height: 18px;
  border-radius: 999px;
  background: var(--color-bg);
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  position: relative;
  cursor: pointer;
  padding: 0;
  transition: background 0.18s, border-color 0.18s;
  vertical-align: middle;
}
.toggle__knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-ink-faint);
  transition: left 0.18s, background 0.18s;
}
.toggle.is-on {
  background: var(--glow-1);
  border-color: var(--color-gold);
}
.toggle.is-on .toggle__knob {
  left: 18px;
  background: var(--color-gold);
}
.toggle-label {
  font-family: var(--font-kai);
  font-size: 13px;
  color: var(--color-ink-dim);
  margin-left: 10px;
}
.editor__foot {
  padding: 14px 20px;
  border-top: var(--bd-w) var(--bd-style) var(--bd-color);
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.btn {
  font-family: var(--font-serif);
  font-size: 13px;
  letter-spacing: 0.14em;
  padding: 9px 22px;
  border-radius: var(--radius);
  border: var(--bd-w) var(--bd-style) var(--bd-color);
  background: transparent;
  color: var(--color-ink-dim);
  cursor: pointer;
  transition: border-color 0.18s, color 0.18s;
}
.btn:hover {
  border-color: var(--color-gold);
  color: var(--color-gold);
}
.btn--primary {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--on-accent);
  font-weight: 700;
}
.btn--primary:hover {
  filter: brightness(1.1);
  color: var(--on-accent);
}
.btn--primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.btn--danger {
  margin-left: auto;
  color: var(--color-ink-faint);
  border-color: transparent;
  font-size: 12px;
}
.btn--danger:hover {
  color: var(--danger);
  border-color: var(--danger);
}
</style>
