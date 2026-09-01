import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { TermFormat } from '@rtl/shared'
import { api } from '@/app/services/api'

// 后端 term_sections / term_entries 行结构
interface TermSectionRow {
  id: number
  slug: string
  title: string
  visible: number
  sortOrder: number
}
interface TermEntryRow {
  id: number
  sectionId: number
  groupTitle: string
  name: string
  tags: string
  tagColors: string
  tagFormats: string
  format: string
  description: string
  sortOrder: number
}

// 还原为前端原有的 DictSection / DictGroup / DictEntry 形态
export interface DictEntry {
  id: number
  name: string
  tags: string[]
  tagColors: string[]
  tagFormats: TermFormat[]
  format: TermFormat
  desc: string
}
export interface DictGroup {
  id: string
  title: string
  entries: DictEntry[]
}
export interface DictSection {
  id: string
  title: string
  visible: boolean
  groups: DictGroup[]
}

function parseArr<T>(s: string): T[] {
  try {
    const v = JSON.parse(s)
    return Array.isArray(v) ? (v as T[]) : []
  } catch {
    return []
  }
}
function parseObj<T>(s: string): T {
  try {
    return JSON.parse(s) as T
  } catch {
    return {} as T
  }
}

export const useTermsStore = defineStore('terms', () => {
  const sections = ref<DictSection[]>([])
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref<string | null>(null)

  const visibleSections = computed(() => sections.value.filter((s) => s.visible))

  async function load(): Promise<void> {
    if (loaded.value) return
    loading.value = true
    error.value = null
    try {
      const [secRows, entryRows] = await Promise.all([
        api.list<TermSectionRow>('term_sections'),
        api.list<TermEntryRow>('term_entries'),
      ])
      const secMap = new Map<number, DictSection>()
      const secs: DictSection[] = secRows
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((s) => {
          const sec: DictSection = {
            id: s.slug,
            title: s.title,
            visible: s.visible === 1,
            groups: [],
          }
          secMap.set(s.id, sec)
          return sec
        })
      for (const e of entryRows.sort((a, b) => a.sortOrder - b.sortOrder)) {
        const sec = secMap.get(e.sectionId)
        if (!sec) continue
        let group = sec.groups.find((g) => g.title === (e.groupTitle ?? ''))
        if (!group) {
          group = { id: `${sec.id}-${sec.groups.length + 1}`, title: e.groupTitle ?? '', entries: [] }
          sec.groups.push(group)
        }
        group.entries.push({
          id: e.id,
          name: e.name,
          tags: parseArr<string>(e.tags),
          tagColors: parseArr<string>(e.tagColors),
          tagFormats: parseArr<TermFormat>(e.tagFormats),
          format: parseObj<TermFormat>(e.format),
          desc: e.description,
        })
      }
      sections.value = secs
      loaded.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'unknown error'
    } finally {
      loading.value = false
    }
  }

  // 重新拉取（编辑后刷新用）
  async function reload(): Promise<void> {
    loaded.value = false
    await load()
  }

  return { sections, visibleSections, loading, loaded, error, load, reload }
})
