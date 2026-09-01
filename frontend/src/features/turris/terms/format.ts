import type { DictEntry } from './terms'
import type { TermFormat } from '@rtl/shared'

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace('#', '')
  return [
    parseInt(c.slice(0, 2), 16),
    parseInt(c.slice(2, 4), 16),
    parseInt(c.slice(4, 6), 16),
  ]
}
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
}
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
  const f = (v: number) => {
    v = v / 255
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * f(r!) + 0.7152 * f(g!) + 0.0722 * f(b!)
}
function mix(a: string, b: string, t: number): string {
  const A = hexToRgb(a)
  const B = hexToRgb(b)
  return rgbToHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t)
}

/** 夜间深色底：对过暗的颜色自动向暖白提亮，保证可读；数据里仍存原始 hex。
 *  `onLight`：在浅/亮底（如 SHM 卡面的金黄底）上，改为向深色收敛，避免提亮后看不见。 */
export function readableColor(hex: string, onLight = false): string {
  let c = hex
  let guard = 0
  if (onLight) {
    while (luminance(c) > 0.6 && guard < 40) {
      c = mix(c, '#1b1408', 0.12)
      guard++
    }
    return c
  }
  while (luminance(c) < 0.16 && guard < 40) {
    c = mix(c, '#f5ecd8', 0.12)
    guard++
  }
  return c
}

/** 把 TermFormat 转成 CSS 内联样式（颜色 / 背景色 / 粗体 / 斜体 / 下划线）。
 *  `onLight`：当前文字位于浅/亮底色上（SHM 卡面），按浅底标准调整字色对比度。 */
export function formatToCss(f: TermFormat, onLight = false): Record<string, string> {
  const s: Record<string, string> = { color: readableColor(f.color, onLight) }
  if (f.bgColor) s.background = f.bgColor
  if (f.bold) s.fontWeight = '700'
  if (f.italic) s.fontStyle = 'italic'
  if (f.underline === 'thin') s.textDecoration = 'underline'
  else if (f.underline === 'thick') {
    s.textDecoration = 'underline'
    s.textDecorationThickness = '3px'
  } else if (f.underline === 'double') s.textDecoration = 'underline double'
  return s
}

/** 词条最终格式 = DB 中的 format（导入时覆盖层已合并为最终值）。
 *  禁止再引入 overrides 补丁层；要改词条格式请直接编辑 DB（词典页编辑入口）。 */
export function mergedFormat(entry: Pick<DictEntry, 'name' | 'format'>): TermFormat {
  return entry.format
}
