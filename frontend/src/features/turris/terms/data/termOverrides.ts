// 词典·词条级字体格式覆盖（最高优先级）
// → 以后要改「某个词条」的字色/背景色/粗体/斜体/下划线，就在这里加一行即可。
// 只写要改的项（Partial）：{ color, bgColor, bold, italic, underline: 'none' | 'thin' | 'thick' | 'double' }
import type { TermFormat } from '@rtl/shared'

export const ENTRY_OVERRIDES: Record<string, Partial<TermFormat>> = {
  '烧伤 X层': { color: '#FFC000', underline: 'thick' },
  引燃: { color: '#FFC000' },
  '预燃 X层': { color: '#FFC000' },
  '星火 X层': { color: '#FFC000' },
  '震颤 X层': { color: '#BF8F00', underline: 'thick' },
  '震颤引爆': { color: '#BF8F00', underline: 'thick' },
  '弹药 X层': { color: '#000000', bgColor: '#FFFF00' },
}
