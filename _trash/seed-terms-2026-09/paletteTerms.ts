// 术语字典数据 — 插入面板词表区（卡牌分类/基础标签/泛用标签/卡牌前缀/基础骰子）
// 来源：原 shared/src/terms 静态数据，于 2026-09 术语源合并时由转换脚本自动生成。
// 该文件仅作为 backend/src/scripts/importTerms.ts 的导入种子，运行时业务代码不得 import。
import type { DictSection } from './terms'

export const paletteSections: DictSection[] = [
  {
    "id": "卡牌分类",
    "title": "卡牌分类",
    "groups": [
      {
        "id": "sec-卡牌分类",
        "title": "",
        "entries": [
          {
            "name": "近战",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "使用接触类攻击与敌方单位发生近距离拼点"
          },
          {
            "name": "远程",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "远程卡牌与近战卡牌拼点时，若与攻击型骰子拼点成功则摧毁对方用于拼点的那枚骰子；若拼点失败，在没有禁用骰子反复投掷的情况下，对方用于拼点的那枚攻击型骰子会被置入卡牌末尾。若与其他远程卡牌拼点则使用等同于近战卡牌攻击型骰子互相拼点的逻辑"
          },
          {
            "name": "法术",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "拼点机制与远程卡牌一致，对混乱条的伤害x1.25，对体力条的伤害x0.75，不受“强壮”影响"
          },
          {
            "name": "先制近战",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "该卡牌与近战卡牌拼点时被视作近战卡牌，与远程卡牌拼点时被视作远程卡牌"
          },
          {
            "name": "能力",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "能力牌会占用1次行动机会，并赋予使用者能持续整个舞台的战斗能力；它们使用后就会从本舞台内消失，但不会进入消耗牌堆"
          },
          {
            "name": "守备",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "守备牌不会主动发起攻击，只会在受到攻击时用卡牌内的骰子进行反击"
          },
          {
            "name": "群体攻击",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "先制度+2；这张卡牌可以选择复数敌方单位作为攻击目标"
          },
          {
            "name": "装备",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "在备战阶段可以直接消耗费用使用的卡牌"
          },
          {
            "name": "变化",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "占据一次行动，但在战斗阶段不发起拼点，而是获得一些增益效果的卡牌"
          },
          {
            "name": "状态",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "阻碍战斗的卡牌，它们通常由某些单位在战斗内添加到目标的牌堆中。所有状态牌会在一个舞台的战斗结束后从牌堆中消失。"
          },
          {
            "name": "诅咒",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "阻碍战斗的卡牌，它们的负面效果通常比状态牌更强，且不会在一个舞台的战斗结束后从牌堆中消失。只有通过将诅咒牌消耗掉移入放逐区，才能永久摆脱诅咒牌。"
          }
        ]
      }
    ]
  },
  {
    "id": "基础标签",
    "title": "基础标签",
    "groups": [
      {
        "id": "sec-基础标签",
        "title": "",
        "entries": [
          {
            "name": "交锋",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "thin"
            },
            "desc": "群体卡牌依次对敌方战斗卡牌上的每颗骰子进行拼点判定，若拼点成功则摧毁该骰子并造成伤害"
          },
          {
            "name": "清算",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "thin"
            },
            "desc": "群体卡牌对敌方战斗卡牌的所有骰子计算总和并进行拼点判定，若拼点成功则摧毁该卡牌并造成伤害"
          },
          {
            "name": "攻击容量",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "thin"
            },
            "desc": "带有该标签的卡牌将拼点的敌方速度骰子视为“主要目标”并会选择多名“次要目标”，对主要目标造成伤害时会同时对次要目标造成伤害。",
            "hasParam": true
          },
          {
            "name": "消耗",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "thin"
            },
            "desc": "使用消耗卡牌后将其移入放逐区"
          },
          {
            "name": "消耗:X",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "thin"
            },
            "desc": "PKM 系统专属：该卡牌在使用 X 次后被消耗掉；卡牌使用次数归零后将其移入放逐区",
            "hasParam": true
          },
          {
            "name": "虚无",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "thin"
            },
            "desc": "该回合结束时若虚无卡牌处于手牌堆，则将其移入放逐区"
          },
          {
            "name": "丢弃",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "thin"
            },
            "desc": "该回合结束时若丢弃卡牌处于手牌堆，则将其移入弃牌堆"
          },
          {
            "name": "禁用",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "thin"
            },
            "desc": "禁用卡牌无法被装备"
          },
          {
            "name": "固有",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "thin"
            },
            "desc": "舞台开启时，固有卡牌将被直接置入手牌堆"
          },
          {
            "name": "保留",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "thin"
            },
            "desc": "保留卡牌每回合结束时不会被自动丢弃"
          }
        ]
      }
    ]
  },
  {
    "id": "泛用标签",
    "title": "泛用标签",
    "groups": [
      {
        "id": "sec-泛用标签",
        "title": "",
        "entries": [
          {
            "name": "蓄力",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "thin"
            },
            "desc": "装备蓄力卡牌的这一回合可以选择不使用该卡牌，而是在蓄力完成的那一回合的战斗阶段才使用以获得额外效果"
          },
          {
            "name": "连携",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "thin"
            },
            "desc": "必须有满足条件的友方单位在场才能成功发动"
          },
          {
            "name": "连携-同技",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "thin"
            },
            "desc": "一种连携机制。发起者使用带有 [连携-同技] 标签的卡牌时，可指定一名符合条件的友方单位作为连携者。本次行动中，发起者与连携者将各自独立使用一次该卡牌的全部效果。"
          },
          {
            "name": "连携-合击",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "thin"
            },
            "desc": "一种需要条件解锁的连携机制。发起者想要使用卡牌A，需要场上存在一名装备了特定卡牌B的友方单位时，卡牌A才可发动。发动后，发起者使用卡牌A，连携者使用卡牌B。"
          },
          {
            "name": "穿刺",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "thin"
            },
            "desc": "穿刺卡牌无视防御型骰子与格挡"
          },
          {
            "name": "磨利",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "thin"
            },
            "desc": "磨利装备卡可以对其他手牌使用，使其获得[穿刺]"
          },
          {
            "name": "改造",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "thin"
            },
            "desc": "改造装备卡可以对其他手牌使用，使其点数临时+2"
          },
          {
            "name": "调和",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "thin"
            },
            "desc": "调和卡牌受到的法术强壮与法术伤害强化效果x5"
          },
          {
            "name": "牺牲",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "thin"
            },
            "desc": "牺牲卡牌必须令X名指定类型的友方单位立刻阵亡以发动效果。若场上没有该类型的友方单位，则使用失败",
            "hasParam": true
          },
          {
            "name": "活物",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "thin"
            },
            "desc": "活物卡牌在每回合开始时自动使用"
          },
          {
            "name": "奇巧",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "thin"
            },
            "desc": "奇巧卡牌在被丢弃时自动使用"
          },
          {
            "name": "蚀刻",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "thin"
            },
            "desc": "蚀刻卡牌在持有者消耗卡牌时自动使用"
          },
          {
            "name": "扫击",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "thin"
            },
            "desc": "扫击卡牌在持有者使用群体攻击卡牌时自动使用"
          },
          {
            "name": "咒语",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "thin"
            },
            "desc": "咒语卡牌在持有者使用法术卡牌时自动使用"
          },
          {
            "name": "暴食",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "thin"
            },
            "desc": "暴食卡牌在持有者恢复体力时自动使用"
          },
          {
            "name": "饥饿",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "thin"
            },
            "desc": "饥饿卡牌在持有者的友方单位出场时自动使用"
          },
          {
            "name": "复仇",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "thin"
            },
            "desc": "复仇卡牌在持有者受伤时自动使用"
          },
          {
            "name": "收割",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "thin"
            },
            "desc": "收割卡牌在持有者的友方单位阵亡时自动使用"
          },
          {
            "name": "亡语",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "thin"
            },
            "desc": "亡语卡牌在持有者阵亡时自动使用"
          }
        ]
      }
    ]
  },
  {
    "id": "卡牌前缀",
    "title": "卡牌前缀",
    "groups": [
      {
        "id": "sec-卡牌前缀",
        "title": "",
        "entries": [
          {
            "name": "V.",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "满足一定条件后才可使用的特殊卡牌"
          },
          {
            "name": "GX.",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "满足一定条件后才可使用的，特殊栏位的卡牌"
          },
          {
            "name": "DEF.",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "守备专属卡牌"
          },
          {
            "name": "EGO.",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "情感等级战斗系统之中，处于EGO展现状态下单位使用的卡牌"
          },
          {
            "name": "DST.",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "情感等级战斗系统之中，处于扭曲状态下单位才能使用的卡牌"
          },
          {
            "name": "SHM.",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "情感等级战斗系统之中，能够让持有\"心\"的单位生成\"望\"的卡牌"
          },
          {
            "name": "EX.",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "在几大战斗系统之外的小体系内才能用的卡牌"
          },
          {
            "name": "ELIT1.",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "部署点数战斗系统之中，精英化一阶段时解禁的卡牌"
          },
          {
            "name": "ELIT2.",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "部署点数战斗系统之中，精英化二阶段时解禁的卡牌"
          }
        ]
      }
    ]
  },
  {
    "id": "基础骰子",
    "title": "基础骰子",
    "groups": [
      {
        "id": "sec-基础骰子",
        "title": "",
        "entries": [
          {
            "name": "斩击",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "造成斩击伤害"
          },
          {
            "name": "打击",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "造成打击伤害"
          },
          {
            "name": "突刺",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "造成突刺伤害"
          },
          {
            "name": "招架",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "拼点胜利，则免疫所有伤害并反震对应数值的混乱伤害；拼点失败，则受到(目标点数-自身点数)点伤害"
          },
          {
            "name": "闪避",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#8a8a8a",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "拼点胜利，则恢复对应数值点混乱抗性，并重复投掷；拼点失败，则摧毁该骰子；与招架/闪避骰子拼点，无论数值直接摧毁双方的骰子"
          }
        ]
      }
    ]
  }
]

/** 全量 hasParam 索引（按词条名）：导入脚本据此为各分区词条补写「带参数位」标记。 */
export const HAS_PARAM_TERMS: Record<string, 1> = {
  "攻击容量": 1,
  "消耗:X": 1,
  "牺牲": 1,
  "多重攻击": 1,
  "重复投掷": 1,
  "易损": 1,
  "守护": 1,
  "易伤": 1,
  "坚硬": 1,
  "脆弱": 1,
  "振奋": 1,
  "拼点虚弱": 1,
  "拼点强壮": 1,
  "伤害弱化": 1,
  "伤害强化": 1,
  "爆伤弱化": 1,
  "爆伤强化": 1,
  "无力": 1,
  "力量": 1,
  "虚弱": 1,
  "强壮": 1,
  "破绽": 1,
  "忍耐": 1,
  "束缚": 1,
  "迅捷": 1,
  "状态虚弱": 1,
  "状态增强": 1,
  "抽牌减少": 1,
  "抽牌增加": 1,
  "费用流失": 1,
  "费用充盈": 1,
  "缓冲": 1,
  "活力": 1,
  "精准": 1,
  "封印": 1,
  "呼吸法": 1,
  "破防": 1,
  "战栗": 1,
  "剑刃解禁": 1,
  "援护攻击": 1,
  "援护防御": 1,
  "起飞": 1,
  "毒液": 1,
  "毒药瓶": 1,
  "毒菱": 1,
  "猩红腐败": 1,
  "撒菱": 1,
  "自然": 1,
  "腐蚀": 1,
  "震颤": 1,
  "震颤-崩坏": 1,
  "震颤-裂痕": 1,
  "震颤-回响": 1,
  "震颤-寸止": 1,
  "震颤-锁链": 1,
  "震颤-永恒": 1,
  "震颤-分配": 1,
  "震颤-上弦": 1,
  "震颤-灼热": 1,
  "震颤-大出血": 1,
  "崩碎": 1,
  "流血": 1,
  "血宴": 1,
  "消耗血宴总数": 1,
  "共用消耗血宴总数": 1,
  "吸血": 1,
  "尖钉": 1,
  "自助餐": 1,
  "吞食": 1,
  "合金燃料": 1,
  "重塑": 1,
  "燃命": 1,
  "召唤": 1,
  "神经": 1,
  "月笼": 1,
  "灾厄": 1,
  "骤死": 1,
  "晦": 1,
  "明": 1,
  "金属化": 1,
  "多重护甲": 1,
  "覆甲": 1,
  "格挡": 1,
  "人工制品": 1,
  "挑衅值": 1,
  "弹药": 1,
  "锻造": 1,
  "烧伤": 1,
  "灼燃": 1,
  "预燃": 1,
  "星火": 1,
  "浸油": 1,
  "助燃火药": 1,
  "狂怒": 1,
  "沉沦": 1,
  "水蚀": 1,
  "破裂": 1,
  "咒杀【迅捷】": 1,
  "咒杀【剧毒】": 1,
  "咒杀【弱化】": 1,
  "咒杀【勿动】": 1,
  "咒杀【血爆】": 1,
  "咒杀【掣肘】": 1,
  "咒杀【衰亡】": 1,
  "咒杀【破】": 1,
  "草种": 1,
  "草原核": 1,
  "草露": 1,
  "屏障": 1,
  "荆棘屏障": 1,
  "体液屏障": 1,
  "再生": 1,
  "荆棘": 1,
  "滋养": 1,
  "充能": 1,
  "电磁": 1,
  "麻痹": 1,
  "集中": 1,
  "次元裂痕": 1,
  "充能力场": 1,
  "负荷": 1,
  "电流释放": 1,
  "数据乱流": 1,
  "小黄鸭": 1,
  "入侵": 1,
  "高热": 1,
  "魔力": 1,
  "星辉": 1,
  "瞌睡": 1,
  "寒冷": 1,
  "霜寒": 1,
  "坚不可摧": 1,
  "烟气": 1,
  "二噁英": 1,
  "尼古丁": 1,
  "凋亡": 1,
  "鲜红雨滴": 1
}
