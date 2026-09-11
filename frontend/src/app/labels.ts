// 部门中文名唯一一份（原 shared 的 LABELS 是无人消费的死代码，2026-09 判死退役）。
// 新增部门或改名只改这里；SiteNav / ModuleLayout / LibraryTree 均从此消费。
export const MODULE_LABELS = {
  armarium: '藏书阁',
  turris: '迎书楼',
  collegium: '寻书社',
  director: '馆长层',
} as const

export type ModuleLabelKey = keyof typeof MODULE_LABELS

export function moduleLabel(id: string): string {
  return MODULE_LABELS[id as ModuleLabelKey] ?? id
}
