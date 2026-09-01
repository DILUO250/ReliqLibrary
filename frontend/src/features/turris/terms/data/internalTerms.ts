// 术语字典数据 — 基础数值区（内部数据）
// 该分区不展示在词典页，仅供渲染器精准检索使用。
import type { DictSection } from './terms'

export const internalTermSections: DictSection[] = [
  {
    id: '基础数值',
    title: '基础数值',
    groups: [
      {
        id: 'sec-基础数值',
        title: '',
        entries: [
          {
            name: '情感等级',
            tags: [],
            tagColors: [],
            tagFormats: [],
            format: { color: '#000000', bold: true, italic: false, underline: 'none' },
            desc: '情感等级战斗系统的基础成长资源',
          },
          {
            name: '情感点数',
            tags: [],
            tagColors: [],
            tagFormats: [],
            format: { color: '#000000', bold: true, italic: false, underline: 'none' },
            desc: '情感等级战斗系统的基础数值',
          },
          {
            name: '正面情感',
            tags: [],
            tagColors: [],
            tagFormats: [],
            format: { color: '#98DA8C', bold: true, italic: false, underline: 'none' },
            desc: '正面情感倾向',
          },
          {
            name: '负面情感',
            tags: [],
            tagColors: [],
            tagFormats: [],
            format: { color: '#B40E09', bold: true, italic: false, underline: 'none' },
            desc: '负面情感倾向',
          },
          {
            name: '理智值',
            tags: [],
            tagColors: [],
            tagFormats: [],
            format: { color: '#00B0F0', bold: false, italic: false, underline: 'none' },
            desc: '单位当前理智值',
          },
          {
            name: '理智伤害',
            tags: [],
            tagColors: [],
            tagFormats: [],
            format: { color: '#00B0F0', bold: false, italic: false, underline: 'none' },
            desc: '对理智值造成的伤害',
          },
          {
            name: '理智槽',
            tags: [],
            tagColors: [],
            tagFormats: [],
            format: { color: '#00B0F0', bold: false, italic: false, underline: 'none' },
            desc: '储存理智值数值的容器',
          },
        ],
      },
    ],
  },
]
