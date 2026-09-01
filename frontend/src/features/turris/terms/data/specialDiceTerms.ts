// 术语字典数据 — 特殊骰子区（来源：`references/迎书楼素材/### 术语解析.docx` 骰子术语-特殊骰子区）
// 该分区展示于词典页，置于「机制类状态」下方；同时供渲染器解析。
import type { DictSection } from './terms'

export const specialDiceSection: DictSection = {
  id: '特殊骰子',
  title: '特殊骰子',
  groups: [
    {
      id: 'sec-特殊骰子',
      title: '',
      entries: [
        {
          name: '反击',
          tags: [],
          tagColors: [],
          tagFormats: [],
          format: { color: '#000000', bold: false, italic: false, underline: 'double' },
          desc: '反击骰子将按照使用顺序置于使用者的反击池中；使用者受到单方面攻击时，将从池子底部顺次投掷反击骰子与攻击者进行拼点；每回合结束时反击池清空',
        },
        {
          name: '回击',
          tags: [],
          tagColors: [],
          tagFormats: [],
          format: { color: '#000000', bold: false, italic: false, underline: 'double' },
          desc: '回击骰子将按照使用顺序置于使用者的回击池中；使用者受到单方面攻击后，将从池子底部顺次投掷回击骰子对攻击者进行单方面攻击；每回合结束时回击池清空',
        },
        {
          name: '多重攻击 X次',
          tags: [],
          tagColors: [],
          tagFormats: [],
          format: { color: '#000000', bold: false, italic: false, underline: 'double' },
          desc: '进攻型骰子命中时额外造成X次伤害',
        },
        {
          name: '重复投掷 X次',
          tags: [],
          tagColors: [],
          tagFormats: [],
          format: { color: '#000000', bold: false, italic: false, underline: 'double' },
          desc: '该骰子首次投掷结束后，将重复投掷X次',
        },
        {
          name: '不可摧毁',
          tags: [],
          tagColors: [],
          tagFormats: [],
          format: { color: '#EE0000', bold: false, italic: false, underline: 'double' },
          desc: '不可摧毁骰子拼点失败时，将强行以最小值命中目标',
        },
        {
          name: '重复使用',
          tags: [],
          tagColors: [],
          tagFormats: [],
          format: { color: '#00B0F0', bold: false, italic: false, underline: 'double' },
          desc: '重复使用骰子拼点胜利后，将重复投掷直至拼点失败',
        },
        {
          name: '碎裂',
          tags: [],
          tagColors: [],
          tagFormats: [],
          format: { color: '#808080', bold: false, italic: false, underline: 'double' },
          desc: '碎裂骰子被修复前无法投掷，将按照使用顺序置于使用者的碎裂池子中；使用者调用修复效果时，将从池子底部顺次投掷碎裂骰子对随机敌方单位进行单方面攻击；每回合结束时碎裂池子清空',
        },
      ],
    },
  ],
}
