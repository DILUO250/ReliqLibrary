<script setup lang="ts">
import type { TermFormat } from '@rtl/shared'

const props = defineProps<{ format: TermFormat }>()

function setColor(e: Event): void {
  props.format.color = (e.target as HTMLInputElement).value
}
function setBold(e: Event): void {
  props.format.bold = (e.target as HTMLInputElement).checked
}
function setItalic(e: Event): void {
  props.format.italic = (e.target as HTMLInputElement).checked
}
function setUnderline(e: Event): void {
  props.format.underline = (e.target as HTMLSelectElement).value as TermFormat['underline']
}
function setBgColor(e: Event): void {
  props.format.bgColor = (e.target as HTMLInputElement).value
}
function toggleBgColor(e: Event): void {
  if ((e.target as HTMLInputElement).checked) {
    if (!props.format.bgColor) props.format.bgColor = '#33281c'
  } else {
    props.format.bgColor = undefined
  }
}
</script>

<template>
  <div class="fe">
    <label class="fe-item fe-color">
      <span class="fe-label">字色</span>
      <input type="color" :value="format.color" @input="setColor" />
      <code class="fe-hex">{{ format.color }}</code>
    </label>
    <label class="fe-item">
      <input type="checkbox" :checked="format.bold" @change="setBold" /> 粗体
    </label>
    <label class="fe-item">
      <input type="checkbox" :checked="format.italic" @change="setItalic" /> 斜体
    </label>
    <label class="fe-item">
      <select :value="format.underline" @change="setUnderline">
        <option value="none">无下划线</option>
        <option value="thin">细下划线</option>
        <option value="thick">粗下划线</option>
        <option value="double">双下划线</option>
      </select>
    </label>
    <label class="fe-item">
      <input type="checkbox" :checked="!!format.bgColor" @change="toggleBgColor" /> 背景色
    </label>
    <label v-if="format.bgColor" class="fe-item fe-color">
      <input type="color" :value="format.bgColor" @input="setBgColor" />
      <code class="fe-hex">{{ format.bgColor }}</code>
    </label>
  </div>
</template>

<style scoped>
.fe {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--color-ink-dim);
}
.fe-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}
.fe-color {
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  padding: 4px 8px;
}
.fe-color input[type='color'] {
  width: 28px;
  height: 22px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
}
.fe-hex {
  font-size: 11px;
  color: var(--color-ink-dim);
  font-family: var(--font-latin);
}
.fe-item select {
  padding: 3px 8px;
  font-size: 12px;
  font-family: inherit;
  background: var(--color-bg);
  color: var(--color-ink);
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
}
</style>
