import type { TermFormat } from '@rtl/shared'

// 状态标签 → 字体格式（展示层配色，非词条数据；渲染器/词典页共用）
export const TAG_STYLES: Record<string, TermFormat> = {
  正面状态: { color: '#00B0F0', bold: false, italic: false, underline: 'none' },
  负面状态: { color: '#EE0000', bold: false, italic: false, underline: 'none' },
  中立状态: { color: '#002060', bold: false, italic: false, underline: 'none' },
  能力: { color: '#FFC000', bold: false, italic: false, underline: 'none' },
  标记: { color: '#FFC000', bold: false, italic: false, underline: 'none' },
  撤退: { color: '#A02B93', bold: false, italic: false, underline: 'none' },
  召唤物: { color: '#4EA72E', bold: false, italic: false, underline: 'none' },
  天气: { color: '#002060', bold: false, italic: false, underline: 'none' },
  场地: { color: '#002060', bold: false, italic: false, underline: 'none' },
  气场: { color: '#002060', bold: false, italic: false, underline: 'none' },
  空间: { color: '#002060', bold: false, italic: false, underline: 'none' },
  反应: { color: '#0F9ED5', bold: false, italic: false, underline: 'none' },
  唯一生效: { color: '#0F9ED5', bold: false, italic: false, underline: 'none' },
  一般: { color: '#9FA19F', bold: false, italic: false, underline: 'none' },
  格斗: { color: '#FF8000', bold: false, italic: false, underline: 'none' },
  飞行: { color: '#81B9EF', bold: false, italic: false, underline: 'none' },
  毒: { color: '#9141CB', bold: false, italic: false, underline: 'none' },
  地面: { color: '#915121', bold: false, italic: false, underline: 'none' },
  岩石: { color: '#AFA981', bold: false, italic: false, underline: 'none' },
  虫: { color: '#91A119', bold: false, italic: false, underline: 'none' },
  幽灵: { color: '#704170', bold: false, italic: false, underline: 'none' },
  钢: { color: '#60A1B8', bold: false, italic: false, underline: 'none' },
  火: { color: '#E62829', bold: false, italic: false, underline: 'none' },
  水: { color: '#2980EF', bold: false, italic: false, underline: 'none' },
  草: { color: '#3FA129', bold: false, italic: false, underline: 'none' },
  电: { color: '#FAC000', bold: false, italic: false, underline: 'none' },
  超能: { color: '#EF4179', bold: false, italic: false, underline: 'none' },
  冰: { color: '#3FD8FF', bold: false, italic: false, underline: 'none' },
  龙: { color: '#5060E1', bold: false, italic: false, underline: 'none' },
  恶: { color: '#50413F', bold: false, italic: false, underline: 'none' },
  妖精: { color: '#EF70EF', bold: false, italic: false, underline: 'none' },
}

export const DEFAULT_TAG_COLOR = '#8a8a8a'
