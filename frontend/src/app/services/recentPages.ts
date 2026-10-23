import type { Router } from 'vue-router'

/**
 * 最近足迹（草稿 4.1）：路由钩子 + localStorage，纯展示层数据。
 * 不入库——项目没有用户体系（x-rtl-key 是共享令牌不是身份），落库会变成
 * 所有访问设备共享一份历史；足迹本质是"这台浏览器"的个人数据。
 */

const STORAGE_KEY = 'rtl.recent-pages'
const MAX_ITEMS = 10

export interface RecentPage {
  /** 完整路由路径（含 query 前不含 hash） */
  path: string
  /** 展示标题 */
  title: string
  /** 访问时间戳 */
  time: number
}

// 标题映射：静态常量（纯展示层，按规范不落库）。动态参数路由给通用名。
const PAGE_TITLES: Record<string, string> = {
  home: '主页',
  armarium: '藏书阁',
  'armarium-entities': '异常实体',
  'armarium-spaces': '超自然空间',
  'armarium-projects': '在研项目',
  'armarium-librarians': '司书名录',
  'armarium-entity-report': '异常实体报告单',
  'armarium-entity-edit': '异常实体编辑',
  'armarium-space-report': '空间报告单',
  'armarium-space-edit': '空间报告编辑',
  'armarium-project-pvz-plants': 'PVZ 图鉴',
  'armarium-project-pvz-plant-detail': 'PVZ 植物详情',
  'armarium-project-spa': '项目页',
  turris: '迎书楼',
  'turris-floors': '楼层',
  'turris-dictionary': '词典',
  'turris-systems': '体系',
  'turris-invitations': '邀请函',
  collegium: '寻书社',
  'collegium-explorers': '求索者',
  'collegium-packs': '书页包',
  'collegium-railway': '折射轨道',
  director: '馆长层',
  factions: '势力',
  settings: '设置',
}

function titleOf(to: { name?: unknown; path: string }): string {
  if (typeof to.name === 'string') {
    const mapped = PAGE_TITLES[to.name]
    if (mapped) return mapped
  }
  // 动态详情页（报告单 / 编辑 / SPA 项目）等无名可查的路由：用路径末段兜底。
  const last = to.path.split('/').filter(Boolean).pop()
  return last ? decodeURIComponent(last) : to.path
}

function readAll(): RecentPage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as RecentPage[]) : []
  } catch {
    return []
  }
}

function writeAll(items: RecentPage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)))
  } catch {
    /* 存储满 / 隐私模式：足迹是锦上添花，静默放弃 */
  }
}

export function recentPages(): RecentPage[] {
  // 展示前按标题去重：老版本记录允许同名条目重复入列，读时顺手清理（保留最近一次）
  const seen = new Set<string>()
  const out: RecentPage[] = []
  for (const it of readAll()) {
    if (seen.has(it.title)) continue
    seen.add(it.title)
    out.push(it)
  }
  return out
}

/** 在 main.ts 挂一次。跳过 chromeless（独立窗口）与 /print 打印路由。 */
export function setupRecentPageTracking(router: Router): void {
  router.afterEach((to, from) => {
    if (to.meta.chromeless || to.path.startsWith('/print/')) return
    // 主页是入口不是"看过的地方"，不记
    if (to.path === '/') return
    // 同一路由连续访问去重（刷新 / 同页 query 变化不刷时间）
    if (from.path === to.path) return
    const items = readAll()
    const title = titleOf(to)
    // 同名页面只保留最近一次：回访旧页（A→B→A）或换楼层 / 换 Tab 等
    // 同标题路由，都视为"再次到访"——旧条目挪到最前刷新时间，而不是插入重复行
    const dup = items.findIndex((it) => it.title === title)
    if (dup === 0) return
    if (dup > 0) items.splice(dup, 1)
    items.unshift({ path: to.path, title, time: Date.now() })
    writeAll(items)
  })
}
