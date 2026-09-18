// 全站主题换肤：localStorage 持久化的唯一读写层。
// 纯展示层偏好，不落库（CONVENTIONS §4.4：纯前端样式可保留为静态常量）。
// index.html 的内联脚本在首帧前独立读同两个 key（防闪烁），两边 key/合法值必须一致。

export const COLOR_THEME_KEY = 'rtl.color-theme'
export const DESIGN_THEME_KEY = 'rtl.design-theme'

export interface ColorThemeOption {
  id: ColorThemeId
  name: string
  mode: '亮' | '暗'
  desc: string
}

export interface DesignThemeOption {
  id: DesignThemeId
  name: string
  desc: string
}

export type ColorThemeId = 'parchment' | 'jade' | 'fir' | 'celadon' | 'charcoal' | 'sandstone'
export type DesignThemeId =
  | 'woodcut'
  | 'faceted'
  | 'copperplate'
  | 'shoji'
  | 'runic'
  | 'wrought'

// null = 默认基线（暖色夜间 · 图书馆纸墨 / 0 号现有设计，tokens.css）
export type ThemeSelection = ColorThemeId | null
export type DesignSelection = DesignThemeId | null

const VALID_COLOR_IDS: readonly ColorThemeId[] = [
  'parchment',
  'jade',
  'fir',
  'celadon',
  'charcoal',
  'sandstone',
]

const VALID_DESIGN_IDS: readonly DesignThemeId[] = [
  'woodcut',
  'faceted',
  'copperplate',
  'shoji',
  'runic',
  'wrought',
]

export const COLOR_THEMES: readonly ColorThemeOption[] = [
  {
    id: 'parchment',
    name: '羊皮纸白昼',
    mode: '亮',
    desc: '米白纸底 + 深棕墨 + 鎏金，高对比最护眼',
  },
  {
    id: 'jade',
    name: '翡翠枝影',
    mode: '暗',
    desc: '墨绿夜幕 + 翡翠 + 鎏金窗光，呼应"翠枝金窗"设定',
  },
  {
    id: 'fir',
    name: '月下冷杉',
    mode: '暗',
    desc: '深蓝夜空 + 月白 + 青金，金牛星系的宇宙感',
  },
  {
    id: 'celadon',
    name: '琉璃青瓷',
    mode: '亮',
    desc: '月白灰 + 墨青 + 青瓷釉色，东方水墨气韵',
  },
  {
    id: 'charcoal',
    name: '鎏金炭墨',
    mode: '暗',
    desc: '炭黑 + 鎏金，去棕去红的高阶档案馆',
  },
  {
    id: 'sandstone',
    name: '绯霞砂金',
    mode: '亮',
    desc: '暖沙 + 朱砂 + 砂金，黄昏图书馆的温度',
  },
]

export const DESIGN_THEMES: readonly DesignThemeOption[] = [
  {
    id: 'woodcut',
    name: '雕版古籍',
    desc: '2px 墨黑粗线 + 双层框 · 近乎直角 · 宋体 · 古籍善本',
  },
  {
    id: 'faceted',
    name: '尖塔刻面',
    desc: '零圆角棱线 · 宝石投影 · 衬线大写标题 · 神秘几何',
  },
  {
    id: 'copperplate',
    name: '铜版科学',
    desc: '1.5px 铜线 · 3px 小圆角 · 仪表描边 · 科学仪器',
  },
  {
    id: 'shoji',
    name: '和纸障子',
    desc: '1.5px 暖木线 · 楷体 · 纸影 · 日式茶室',
  },
  {
    id: 'runic',
    name: '夜光符文',
    desc: '1.5px 荧光线 · 14px 大圆角 · 辉光 · 禁忌仪式',
  },
  {
    id: 'wrought',
    name: '铁艺铸铁',
    desc: '3px 粗铁线 · 黑体粗字 · 厚重投影 · 铸铁要塞',
  },
]

function readValid<T extends string>(key: string, valid: readonly T[]): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return null
    return (valid as readonly string[]).includes(raw) ? (raw as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    /* 存储不可用时静默：本次刷新后回到默认主题 */
  }
}

/** 当前主题色选择（null = 默认基线） */
export function loadColorTheme(): ThemeSelection {
  return readValid(COLOR_THEME_KEY, VALID_COLOR_IDS)
}

/** 当前主题设计选择（null = 默认基线） */
export function loadDesignTheme(): DesignSelection {
  return readValid(DESIGN_THEME_KEY, VALID_DESIGN_IDS)
}

/** 保存主题色并刷新页面（null 恢复默认） */
export function applyColorTheme(id: ThemeSelection): void {
  write(COLOR_THEME_KEY, id)
  location.reload()
}

/** 保存主题设计并刷新页面（null 恢复默认） */
export function applyDesignTheme(id: DesignSelection): void {
  write(DESIGN_THEME_KEY, id)
  location.reload()
}
