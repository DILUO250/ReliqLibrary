// ⚠️ 自动生成文件，禁止手动编辑——任何手改都会被下一次备份覆盖。
// 数据唯一权威源是 SQLite（CONVENTIONS §4.3）；本文件由 backend/src/db/seedExport.ts
// 从库内 term_sections / term_entries 重生成，是库的 git 提交级备份 + import:terms 恢复源。
export const generatedVisibleSections = [
  {
    "id": "状态标签",
    "title": "状态标签",
    "groups": [
      {
        "id": "g-状态标签-0",
        "title": "",
        "entries": [
          {
            "name": "负面状态",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#EE0000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "纯粹的负面减益效果"
          },
          {
            "name": "中立状态",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#002060",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "同时带来正面增益与负面减益，价值是中性的，具体表现取决于战斗的具体情况和策略"
          },
          {
            "name": "能力",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#FFC000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "描述一个单位（角色、召唤物等）固有的、独特的技能或特性。没有正面负面的倾向"
          },
          {
            "name": "标记",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#FFC000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "附加于特定卡牌上的指示物或印记。它为被标记的卡牌本身添加临时的、额外的效果或代价。"
          },
          {
            "name": "撤退",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#A02B93",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "按照条件撤回备战区，按照编队顺序令备战区的一名顺位单位上场，将自身排至编队末尾\n若备战区无单位，则撤退失败\n撤回备战区的单位保留手牌与速度骰子，卡组内被消耗的卡牌重新补充\n撤回备战区的单位体力与理智值不变，若理智值低于0则恢复至0"
          },
          {
            "name": "召唤物",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#4EA72E",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "依附于某个单位的独立单位，它有自己的属性(生命、攻击等)和可能存在的状态或能力。"
          },
          {
            "name": "天气",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#002060",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "影响整个战场所有单位的环境效果。它是全局性的。同一时间只能有一种天气生效，新的天气会覆盖旧的天气。"
          },
          {
            "name": "场地",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#002060",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "与天气类似，一类环境机制的统称，作用于完全相同对象的新场地效果，通常会覆盖旧的场地效果，但有些场地可能只作用于战场上的特定区域或特定对象\n叠加：带有该属性的场地可与其他场地同时存在，不会被覆盖\n单向：带有该属性的场地仅作用于场上某一方势力"
          },
          {
            "name": "气场",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#002060",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "某单位持有并散发的特殊状态。它的效果影响全场所有单位（包括敌我双方）。不同单位的气场效果可以同时存在并叠加生效。"
          },
          {
            "name": "空间",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#002060",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "一类强大的、改变战场基础规则的环境效果。与天气类似，它是全局性的，影响战场上所有单位（包括敌我双方）。空间效果通常不会覆盖当前存在的其他空间效果。"
          },
          {
            "name": "反应",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#0F9ED5",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "一类特殊的攻击；这类攻击必定与属性有关，通常是某种属性的拓展效果或复数属性的混合反应\n元素反应：以A异常状态为基础，额外消耗1层A异常状态，追加B属性的额外效果\n元素增幅：以A异常状态为基础，不消耗A异常状态的基础上额外施加1层A异常状态，并附加额外效果"
          },
          {
            "name": "唯一生效",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#0F9ED5",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这是一个特殊属性标签，带有该属性的机制同一时间只能作用于一个目标单位，如果施加者对另一个目标施加该效果，那么这个效果会从原来的目标转移到新目标身上;同时如果其他单位施加了同一系列但不同名的效果，那么之前存在的效果会被新施加的效果覆盖。"
          },
          {
            "name": "正面状态",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#00B0F0",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "纯粹的正面增益效果"
          }
        ]
      }
    ]
  },
  {
    "id": "基础状态",
    "title": "基础状态",
    "groups": [
      {
        "id": "g-基础状态-0",
        "title": "",
        "entries": [
          {
            "name": "易损 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EE0000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合中被击中时所受伤害+X*10%"
          },
          {
            "name": "守护 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#00B0F0",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合中被击中时所受伤害-X*10%"
          },
          {
            "name": "易伤 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EE0000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合中被击中时所受伤害+X"
          },
          {
            "name": "坚硬 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#00B0F0",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合中被击中时所受伤害-X"
          },
          {
            "name": "敏感 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EE0000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合中被击中时受到的元素伤害+X%"
          },
          {
            "name": "庇护 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#00B0F0",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合中被击中时受到的元素伤害-X%"
          },
          {
            "name": "脆弱 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EE0000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合中被击中时所受混乱伤害+X*10%"
          },
          {
            "name": "振奋 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#00B0F0",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合中被击中时所受混乱伤害-X*10%"
          },
          {
            "name": "拼点虚弱 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EE0000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "计算拼点点数时-X，不影响攻击伤害"
          },
          {
            "name": "拼点强壮 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#00B0F0",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "计算拼点点数时+X，不影响攻击伤害"
          },
          {
            "name": "伤害弱化 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EE0000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合中“进攻型”骰子伤害-X*10%"
          },
          {
            "name": "伤害强化 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#00B0F0",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合中“进攻型”骰子伤害+X*10%"
          },
          {
            "name": "爆伤弱化 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EE0000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合中暴击造成的伤害-X*12.5%"
          },
          {
            "name": "爆伤强化 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#00B0F0",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合中暴击造成的伤害+X*12.5%"
          },
          {
            "name": "无力 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EE0000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合中“进攻型”骰子伤害-X"
          },
          {
            "name": "力量 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#00B0F0",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合中“进攻型”骰子伤害+X"
          },
          {
            "name": "虚弱 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EE0000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合中“进攻型”骰子威力-X"
          },
          {
            "name": "强壮 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#00B0F0",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合中“进攻型”骰子威力+X"
          },
          {
            "name": "破绽 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EE0000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合中“防御型”骰子威力-X"
          },
          {
            "name": "忍耐 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#00B0F0",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合中“防御型”骰子威力+X"
          },
          {
            "name": "束缚 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EE0000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合中速度-X"
          },
          {
            "name": "迅捷 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#00B0F0",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合中速度+X"
          },
          {
            "name": "状态虚弱 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EE0000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合施加的异常状态层数-X"
          },
          {
            "name": "状态增强 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#00B0F0",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合施加的异常状态层数+X"
          },
          {
            "name": "烧伤易损 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EE0000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合受到的烧伤伤害+X*10%"
          },
          {
            "name": "烧伤守护 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#00B0F0",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合受到的烧伤伤害-X*10%"
          },
          {
            "name": "理智值恢复效率减少 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EE0000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合理智值增加条件下增加的理智值-X*10%"
          },
          {
            "name": "理智值恢复效率增加 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#00B0F0",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合理智值增加条件下增加的理智值+X*10%"
          },
          {
            "name": "理智值降低效率增加 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EE0000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合理智值减少条件下减少的理智值+X*10%"
          },
          {
            "name": "理智值降低效率减少 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#00B0F0",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合理智值减少条件下减少的理智值-X*10%"
          },
          {
            "name": "抽牌减少 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EE0000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "下X次抽牌失效"
          },
          {
            "name": "抽牌增加 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#00B0F0",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "下X次抽牌额外抽1张"
          },
          {
            "name": "费用流失 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EE0000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "该回合结束时失去X点费用"
          },
          {
            "name": "费用充盈 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#00B0F0",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "该回合结束时获得X点费用"
          }
        ]
      }
    ]
  },
  {
    "id": "通用状态",
    "title": "通用状态",
    "groups": [
      {
        "id": "g-通用状态-0",
        "title": "",
        "entries": [
          {
            "name": "眩晕",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#000000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合无法使用卡牌"
          },
          {
            "name": "混乱",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#000000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合中所有物理抗性变为1.5，无法行动且无法抽取卡牌与恢复费用"
          },
          {
            "name": "迷彩",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#000000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合无法被远程战斗卡牌指定为目标"
          },
          {
            "name": "隐匿",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#000000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合无法被任何战斗卡牌指定为目标"
          },
          {
            "name": "威力无效",
            "tags": [
              "中立状态"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#000000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合中该角色的骰子不受威力增减效果影响"
          },
          {
            "name": "晕头转向",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#000000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "1~3内速度骰子行动时有33%的概率随机改变攻击目标"
          },
          {
            "name": "再来一次",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#000000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "3回合内必须使用【某张卡牌】"
          },
          {
            "name": "定身法",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#000000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "3回合内无法使用【某张卡牌】"
          },
          {
            "name": "无特性",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#000000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合被动能力失效，速战速决除外"
          },
          {
            "name": "沉默",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#000000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合所有骰子的追加效果失效"
          }
        ]
      }
    ]
  },
  {
    "id": "机制类状态",
    "title": "机制类状态",
    "groups": [
      {
        "id": "g-机制类状态-0",
        "title": "一般",
        "entries": [
          {
            "name": "缓冲 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#9FA19F",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "抵御下X次受到的伤害"
          },
          {
            "name": "活力 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#9FA19F",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "下1张卡牌的进攻型骰子追加X点伤害"
          },
          {
            "name": "精准 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#9FA19F",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "费用为0的卡牌造成的伤害+X"
          },
          {
            "name": "封印 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#9FA19F",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合封印至多X颗速度骰子"
          },
          {
            "name": "合体",
            "tags": [
              "能力"
            ],
            "tagColors": [
              "#FFC000"
            ],
            "tagFormats": [
              {
                "color": "#FFC000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#9FA19F",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "通过某种手段使得2名司书单位合二为一的机制；\n- 发起合体的司书被称作“主体”，另一名司书被称作“附体”；\n- 合体后的单位继承主体的被动能力与状态效果，额外获得附体的费用上限与战斗卡牌，默认情况下速度骰子+2，手牌上限+2，费用上限+3；\n- 部分合体单位获得额外被动能力与卡牌"
          },
          {
            "name": "同化",
            "tags": [
              "能力"
            ],
            "tagColors": [
              "#FFC000"
            ],
            "tagFormats": [
              {
                "color": "#FFC000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#9FA19F",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "获得某个存在的部分力量；战斗卡组被替换为指定卡组"
          },
          {
            "name": "侵蚀",
            "tags": [
              "能力"
            ],
            "tagColors": [
              "#FFC000"
            ],
            "tagFormats": [
              {
                "color": "#FFC000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#9FA19F",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "被强制同化为某个存在；战斗卡组被替换为指定卡组，攻击不受控制"
          },
          {
            "name": "超频",
            "tags": [
              "能力"
            ],
            "tagColors": [
              "#FFC000"
            ],
            "tagFormats": [
              {
                "color": "#FFC000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#9FA19F",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "主动被强制同化为某个存在；战斗卡组被替换为指定卡组"
          },
          {
            "name": "混淆",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#9FA19F",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "抽取费用为0~3的卡牌时使其费用在0~3内随机改变"
          },
          {
            "name": "致盲",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#9FA19F",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "抽取卡牌时无法看见其卡面、名称、骰子效果"
          },
          {
            "name": "失控",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#9FA19F",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "所有骰子类型随机变化"
          },
          {
            "name": "随机攻击",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#9FA19F",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "该回合自身所有进攻型骰子类型随机变化"
          }
        ]
      },
      {
        "id": "g-机制类状态-1",
        "title": "格斗",
        "entries": [
          {
            "name": "呼吸法 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#767171",
              "bold": false,
              "italic": false,
              "underline": "thick"
            },
            "desc": "下次造成伤害时获得X*2.5%的暴击率，暴击后将该层数减至2/3"
          },
          {
            "name": "破防 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FF8000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "受到物理伤害以外的伤害时，消耗所有层数并追加X点伤害"
          },
          {
            "name": "倒地",
            "tags": [
              "反应"
            ],
            "tagColors": [
              "#0F9ED5"
            ],
            "tagFormats": [
              {
                "color": "#0F9ED5",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FF8000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "元素增幅 \"破防\"；\n- 若目标已带有\"破防\"，且重量不高于5，则下一回合所有速度值-3\n- 若目标已带有\"破防\"，且重量高于5，则额外受到25点混乱伤害"
          },
          {
            "name": "击飞",
            "tags": [
              "反应"
            ],
            "tagColors": [
              "#0F9ED5"
            ],
            "tagFormats": [
              {
                "color": "#0F9ED5",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FF8000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "元素增幅 \"破防\"；\n若目标已带有\"破防\"，且重量不高于5，则本回合成为空中单位，剩下的行动被摧毁\n若目标已带有\"破防\"，且重量高于5，则额外受到15点混乱伤害"
          },
          {
            "name": "碎甲",
            "tags": [
              "反应"
            ],
            "tagColors": [
              "#0F9ED5"
            ],
            "tagFormats": [
              {
                "color": "#0F9ED5",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FF8000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "元素增幅 \"破防\"；\n若目标已带有\"破防\"，则消耗所有破防层数，并立刻施加（消耗层数）层“易伤”"
          },
          {
            "name": "猛击",
            "tags": [
              "反应"
            ],
            "tagColors": [
              "#0F9ED5"
            ],
            "tagFormats": [
              {
                "color": "#0F9ED5",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FF8000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "元素增幅 \"破防\"；\n若目标已带有\"破防\"，则消耗所有\"破防\"层数，并追加（消耗层数*3）点伤害"
          },
          {
            "name": "战栗 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FF8000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "下X张近战卡牌若速度小于拼点目标则必投出最小值"
          },
          {
            "name": "独一",
            "tags": [
              "标记"
            ],
            "tagColors": [
              "#FFC000"
            ],
            "tagFormats": [
              {
                "color": "#FFC000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FF8000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "卡组内所有卡牌互不重名"
          },
          {
            "name": "剑刃解禁 X层",
            "tags": [
              "中立状态"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FF8000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "已累计使用X张不同卡牌，达到8层时转化为“剑刃解放”"
          },
          {
            "name": "剑刃解放",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FF8000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "所有骰子威力+1"
          },
          {
            "name": "弱点解析",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FF8000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "该回合使随机1个抗性为0.5~1.0的攻击类型受到的伤害+1"
          },
          {
            "name": "弱点攻击",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FF8000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "该回合自身造成伤害时，使伤害类型变为目标抗性不高于1.0的伤害类型"
          },
          {
            "name": "[追击]",
            "tags": [
              "中立状态"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FF8000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "满足条件后，使用【特定卡牌】发起单方面攻击；\n- 该次攻击无法拼点，不会触发反击和回击，不会重复使用，不会影响实际卡牌运转"
          },
          {
            "name": "[连击]",
            "tags": [
              "中立状态"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FF8000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "满足条件后，使下一张卡牌造成的物理伤害x1.1，每次连续触发[连击]时，增幅倍率额外+0.1"
          },
          {
            "name": "援护攻击 X层",
            "tags": [
              "中立状态"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FF8000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "本回合内X次，选定1个目标，持有者使用【特定卡牌】进行“[追击]”"
          },
          {
            "name": "援护防御 X层",
            "tags": [
              "中立状态"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FF8000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "本回合内X次，友方单位受到单方面攻击且无法反击时，持有者使用特殊的[援护守备]卡牌，代替该友方单位进行防御"
          }
        ]
      },
      {
        "id": "g-机制类状态-2",
        "title": "飞行",
        "entries": [
          {
            "name": "起雾天",
            "tags": [
              "天气"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#81B9EF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "所有攻击有30%的概率命中失败，对“不可摧毁”骰子与必定命中的攻击无效"
          },
          {
            "name": "顺风",
            "tags": [
              "场地",
              "单向",
              "叠加"
            ],
            "tagColors": [
              "#002060",
              "#8a8a8a",
              "#8a8a8a"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              },
              {
                "color": "#8a8a8a",
                "bold": false,
                "italic": false,
                "underline": "none"
              },
              {
                "color": "#8a8a8a",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#81B9EF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "所有速度骰子速度值x2"
          },
          {
            "name": "德尔塔乱流",
            "tags": [
              "天气"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#81B9EF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "飞行属性的弱点消失；所有空中单位被施加的“负面状态”层数-1"
          },
          {
            "name": "扩散",
            "tags": [
              "反应"
            ],
            "tagColors": [
              "#0F9ED5"
            ],
            "tagFormats": [
              {
                "color": "#0F9ED5",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#81B9EF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "元素反应 “灼燃”/“电磁”/“水蚀”/“霜寒”，使本次攻击施加的“负面状态”层数x2"
          },
          {
            "name": "起飞 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#81B9EF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "在X回合内被视作空中单位"
          },
          {
            "name": "近地悬浮",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#81B9EF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "被视作空中单位；但被施加 “晕头转向”/“眩晕”/混乱 后失去该状态"
          },
          {
            "name": "有翼飞行",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#81B9EF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "被视作空中单位；但同回合内被累计攻击8次后失去该状态"
          }
        ]
      },
      {
        "id": "g-机制类状态-3",
        "title": "毒",
        "entries": [
          {
            "name": "毒液 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#70ad47",
              "bold": false,
              "italic": false,
              "underline": "thick"
            },
            "desc": "受到 “毒液爆发” 时受到X点伤害并将该层数减至2/3"
          },
          {
            "name": "毒药瓶 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#70ad47",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "获取时，令卡组内至少X张战斗卡牌被附加“毒药瓶”；\n- 被附加“毒药瓶”的战斗卡牌使用时将消耗“毒药瓶”，令卡牌所有骰子命中时造成1次“多重攻击”并额外施加3层“毒液”，每回合1张卡牌至多触发1次"
          },
          {
            "name": "尸爆术",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#9141CB",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "若持有者阵亡时带有“毒液”，则对所有存活敌方单位造成（持有者体力上限）点伤害"
          },
          {
            "name": "中毒",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#9141CB",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "与毒属性异常状态共存；每回合开始时受到7点毒属性伤害"
          },
          {
            "name": "剧毒",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#9141CB",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "与毒属性异常状态共存；第1回合开始时受到4点毒属性伤害，之后每回合受到的伤害+4，上限40点"
          },
          {
            "name": "毒菱 X层",
            "tags": [
              "场地",
              "单向",
              "常驻"
            ],
            "tagColors": [
              "#002060",
              "#8a8a8a",
              "#8a8a8a"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              },
              {
                "color": "#8a8a8a",
                "bold": false,
                "italic": false,
                "underline": "none"
              },
              {
                "color": "#8a8a8a",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#9141CB",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "最多3层；替换出场的单位会被施加4层“毒液”；\n-- 层数为2时，替换出场的单位会被额外施加“中毒”；\n-- 层数为3时，替换出场的单位会被额外施加“剧毒”"
          },
          {
            "name": "猩红腐败 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#9141CB",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "受到攻击时追加Y点毒元素伤害并将该层数减至2/3；元素爆发立刻造成体力上限13%的真实伤害"
          },
          {
            "name": "毒液爆发",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#70ad47",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "令目标受到(\"毒液\"层数)点伤害并将\"毒液\"层数减至2/3"
          }
        ]
      },
      {
        "id": "g-机制类状态-4",
        "title": "地面",
        "entries": [
          {
            "name": "撒菱 X层",
            "tags": [
              "场地",
              "单向",
              "常驻"
            ],
            "tagColors": [
              "#002060",
              "#8a8a8a",
              "#8a8a8a"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              },
              {
                "color": "#8a8a8a",
                "bold": false,
                "italic": false,
                "underline": "none"
              },
              {
                "color": "#8a8a8a",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#915121",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "最多5层；替换出场的单位会受到X*12点伤害，对空中单位无效"
          },
          {
            "name": "缓慢",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#915121",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合每被攻击1次则受到的最终伤害+2%"
          },
          {
            "name": "自然 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#915121",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "受到攻击时追加Y点地面元素伤害并将该层数减至2/3；元素爆发后立刻受到15点混乱伤害，并使所有混乱抗性永久+0.1"
          },
          {
            "name": "腐蚀 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#915121",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "每一回合开始时承受X点伤害随后将该层数-1；被击中时将追加承受X点伤害与混乱伤害"
          }
        ]
      },
      {
        "id": "g-机制类状态-5",
        "title": "岩石",
        "entries": [
          {
            "name": "隐形岩",
            "tags": [
              "场地",
              "单向",
              "常驻"
            ],
            "tagColors": [
              "#002060",
              "#8a8a8a",
              "#8a8a8a"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              },
              {
                "color": "#8a8a8a",
                "bold": false,
                "italic": false,
                "underline": "none"
              },
              {
                "color": "#8a8a8a",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#AFA981",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "替换出场的单位会受到25点岩石元素伤害"
          },
          {
            "name": "沙暴天",
            "tags": [
              "天气"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#AFA981",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "岩石属性的单位受到的法术伤害与“负面状态”伤害x0.5；\n- 每回合结束时，岩石属性、地面属性、钢属性以外的单位受到上限1⁄16的真实伤害"
          },
          {
            "name": "震颤 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#BF8F00",
              "bold": false,
              "italic": false,
              "underline": "thick"
            },
            "desc": "受到 “震颤引爆” 时将X%的混乱上限转化为体力上限并将该层数减至2/3"
          },
          {
            "name": "震颤引爆",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#BF8F00",
              "bold": false,
              "italic": false,
              "underline": "thick"
            },
            "desc": "将目标(\"震颤\"层数)%的混乱上限转化为体力上限并将\"震颤\"层数减至2/3"
          },
          {
            "name": "振幅转换",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#bf8f00",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "将目标的所有\"震颤\"转换为其他类型的\"震颤\"；转换时，现有\"震颤\"的层数不变"
          },
          {
            "name": "振幅纠缠",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#AFA981",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "使目标这一回合进入\"震颤 - 叠加\"状态，现有\"震颤\"的层数不变，该回合结束后转化为普通\"震颤\""
          },
          {
            "name": "震颤 - 叠加",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#AFA981",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "获得时，吸收持有者已有的震颤的被动效果；\n持有时，持有者每被振幅转换为其他类型的震颤，则吸收该类型震颤的被动效果；\n被吸收的被动效果同时生效"
          },
          {
            "name": "震颤-崩坏 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#AFA981",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "特殊震颤；每有6层则使持有者受到的伤害+1，受到 震颤引爆 时将X%的混乱上限转化为体力上限并将该层数减至2/3"
          },
          {
            "name": "震颤-裂痕 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#AFA981",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "特殊震颤；持有者陷入混乱时，若X不低于30则使自身所有伤害抗性+0.4；受到 震颤引爆 时将X%的混乱上限转化为体力上限并将该层数减至2/3"
          },
          {
            "name": "震颤-回响 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#AFA981",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "特殊震颤；受到 震颤引爆 时将X%的混乱上限转化为体力上限并将该层数减至2/3，额外受到X点伤害"
          },
          {
            "name": "震颤-寸止 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#AFA981",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "特殊震颤；持有者被反震时将受到理智伤害；受到 震颤引爆 时将X%的混乱上限转化为体力上限并将该层数减至2/3"
          },
          {
            "name": "震颤-锁链 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#AFA981",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "特殊震颤；每有10层则使持有者拼点威力-1(最多-3)；受到 震颤引爆 时将X%的混乱上限转化为体力上限并将该层数减至2/3"
          },
          {
            "name": "震颤-永恒 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#AFA981",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "特殊震颤；受到 震颤引爆 时将X%的混乱上限转化为体力上限并将该层数减至2/3，有X%的概率重复引爆1次"
          },
          {
            "name": "震颤-分配 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#AFA981",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "特殊震颤；持有者造成的伤害+(全体友方单位震颤层数之和/友方单位存活数)(至多+5)；受到 震颤引爆 时将X%的混乱上限转化为体力上限并将该层数减至2/3"
          },
          {
            "name": "震颤-上弦 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#AFA981",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "特殊震颤；持有者最大速度值+2，施加震颤层数时，消耗自身的1层震颤使施加的层数+1；受到 震颤引爆 时将X%的混乱上限转化为体力上限并将该层数减至2/3"
          },
          {
            "name": "震颤-灼热 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#ffc000",
              "bold": true,
              "italic": false,
              "underline": "thick"
            },
            "desc": "特殊震颤；受到 震颤引爆 时将X%的混乱上限转化为体力上限并将该层数减至2/3，并额外受到(自身的震颤与烧伤层数之和/2)点烧伤伤害，同时自身的烧伤层数减至2/3"
          },
          {
            "name": "震颤-大出血 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#AFA981",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "特殊震颤；受到 震颤引爆 时将X%的混乱上限转化为体力上限并将该层数减至2/3，并额外受到(自身的震颤与流血层数之和/2)点流血伤害，同时自身的流血层数减至2/3"
          },
          {
            "name": "崩碎 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#AFA981",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "受到攻击时追加Y点岩石元素伤害并将该层数减至2/3；元素爆发后立刻受到10点体力伤害与10点混乱伤害，并永久获得1层破绽"
          },
          {
            "name": "结晶",
            "tags": [
              "反应"
            ],
            "tagColors": [
              "#0F9ED5"
            ],
            "tagFormats": [
              {
                "color": "#0F9ED5",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#AFA981",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "元素反应 灼燃/电磁/水蚀/霜寒，使本次攻击命中时获得(伤害量)点屏障"
          }
        ]
      },
      {
        "id": "g-机制类状态-6",
        "title": "虫",
        "entries": [
          {
            "name": "黏黏网",
            "tags": [
              "场地",
              "单向",
              "常驻"
            ],
            "tagColors": [
              "#002060",
              "#8a8a8a",
              "#8a8a8a"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              },
              {
                "color": "#8a8a8a",
                "bold": false,
                "italic": false,
                "underline": "none"
              },
              {
                "color": "#8a8a8a",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#91A119",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "替换出场的单位被施加2层束缚"
          },
          {
            "name": "集火",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#91A119",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "被击中时所受伤害与混乱伤害+50%"
          },
          {
            "name": "流血 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#c00000",
              "bold": false,
              "italic": false,
              "underline": "thick"
            },
            "desc": "这一回合中每投掷一颗骰子便承受X点伤害并将该层数减至2/3"
          },
          {
            "name": "潜伏之血",
            "tags": [
              "场地",
              "常驻"
            ],
            "tagColors": [
              "#002060",
              "#8a8a8a"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              },
              {
                "color": "#8a8a8a",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#c00000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "记录场地内所有单位受到的“流血”伤害与恢复的体力量，将其转化为等量“血宴”"
          },
          {
            "name": "血宴 X层",
            "tags": [
              "中立状态"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#c00000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "特定卡牌发动附加效果所需的资源；\n- 同一回合内若友方单位有消耗“血宴”的上位【血魔】，则在该友方单位消耗“血宴”之前，自身不能消耗“血宴”"
          },
          {
            "name": "消耗血宴总数 X层",
            "tags": [
              "中立状态"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#c00000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "记录在该舞台某单位消耗的“血宴”数量"
          },
          {
            "name": "共用消耗血宴总数 X层",
            "tags": [
              "中立状态"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#c00000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "记录在该舞台所有单位消耗的“血宴”数量"
          },
          {
            "name": "吸血 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#91A119",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "造成伤害时恢复X点体力"
          },
          {
            "name": "尖钉 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#75aabb",
              "bold": false,
              "italic": false,
              "underline": "thick"
            },
            "desc": "特殊“流血”；每回合结束时获得 X*2 层“流血”，随后层数减至2/3"
          },
          {
            "name": "自助餐 X层",
            "tags": [
              "能力"
            ],
            "tagColors": [
              "#FFC000"
            ],
            "tagFormats": [
              {
                "color": "#FFC000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#91A119",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "若友方单位内有上位影族，则阵亡时被所有上位影族吞食X次"
          },
          {
            "name": "吞食 X次",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#91A119",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "立刻恢复X点体力，溢出的恢复量将转化为等量的力量与格挡"
          },
          {
            "name": "合金燃料 X层",
            "tags": [
              "中立状态"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#91A119",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "X回合开始时解除自身的所有负面状态，触发吞食时层数+1"
          },
          {
            "name": "重塑 X次",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#91A119",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "该回合结束时，使随机X名放逐区的友方单位复活\n该单位的体力上限永久+5，且获得(复活次数)层伤害强化与燃命"
          },
          {
            "name": "燃命 X回合",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#91A119",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "X回合后阵亡"
          },
          {
            "name": "召唤 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#91A119",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "该回合结束时，所有召唤物的体力上限+X"
          },
          {
            "name": "爪牙",
            "tags": [
              "能力"
            ],
            "tagColors": [
              "#FFC000"
            ],
            "tagFormats": [
              {
                "color": "#FFC000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#91A119",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "持有该状态的召唤物阵亡不算做被击杀，但其召唤者死亡时立刻阵亡"
          }
        ]
      },
      {
        "id": "g-机制类状态-7",
        "title": "幽灵",
        "entries": [
          {
            "name": "神经 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#704170",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "受到攻击时追加X点幽灵元素伤害并将该层数减至2/3；元素爆发后“眩晕”且获得凝视 直至元素爆发结束"
          },
          {
            "name": "凝视",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#b069b0",
              "bold": true,
              "italic": true,
              "underline": "none"
            },
            "desc": "本回合内受到的突刺，打击伤害+20%；\n- 我方单位击杀持有本效果的敌方单位时，使其恢复15点“理智值”并在下一回合进入“狂信”"
          },
          {
            "name": "狂信",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#ff0000",
              "bold": true,
              "italic": true,
              "underline": "none"
            },
            "desc": "这一回合所有攻击最终伤害+2，\"理智值\"固定不会改变"
          },
          {
            "name": "灾厄 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#704170",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "持有者每回合结束时若体力小于X，则立刻阵亡"
          },
          {
            "name": "骤死 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#704170",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "达到100层时立刻阵亡"
          },
          {
            "name": "无实体",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#704170",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合受到的所有伤害固定为1点"
          },
          {
            "name": "折射",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#704170",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合受到的法术伤害降低90%"
          },
          {
            "name": "晦 X层",
            "tags": [
              "中立状态"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#704170",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "无法与 明 同时存在，对 明 的持有者造成的伤害+100%;\nX回合内受到的伤害+50%，造成的暴击伤害+100%"
          },
          {
            "name": "明 X层",
            "tags": [
              "中立状态"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#704170",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "无法与 晦 同时存在，对 晦 的持有者造成的伤害+100%;\nX回合内受到的伤害-50%，无法造成暴击"
          }
        ]
      },
      {
        "id": "g-机制类状态-8",
        "title": "钢",
        "entries": [
          {
            "name": "金属化 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#60A1B8",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "战斗开始时获得X层\"格挡\""
          },
          {
            "name": "多重护甲 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#60A1B8",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "战斗开始时获得X层格挡，受到伤害时层数-1"
          },
          {
            "name": "覆甲 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#60A1B8",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "X回合内，战斗开始时获得X层格挡"
          },
          {
            "name": "格挡 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#60A1B8",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合中受到伤害时抵消X点伤害，被抵消的伤害视作被招架"
          },
          {
            "name": "人工制品 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#60A1B8",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "抵御下X次受到的负面状态"
          },
          {
            "name": "壁垒",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#60A1B8",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合结束时格挡不会消失"
          },
          {
            "name": "挑衅值 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#ed7d31",
              "bold": false,
              "italic": false,
              "underline": "thick"
            },
            "desc": "这一回合这颗速度骰子被指定为攻击目标的概率+X*10%"
          },
          {
            "name": "弹药 X层",
            "tags": [
              "中立状态"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#000000",
              "bold": false,
              "italic": false,
              "underline": "none",
              "bgColor": "#FFFF00"
            },
            "desc": "部分骰子进行攻击或卡牌发动特效时消耗的资源；\n缺少弹药时这些攻击和特效将不会发动"
          },
          {
            "name": "锻造 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#60A1B8",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "某附属单位的效果+X"
          }
        ]
      },
      {
        "id": "g-机制类状态-9",
        "title": "火",
        "entries": [
          {
            "name": "烧伤 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FFC000",
              "bold": false,
              "italic": false,
              "underline": "thick"
            },
            "desc": "每一回合结束时承受X点伤害，随后将该层数减至2/3"
          },
          {
            "name": "灼燃 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#E62829",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "受到攻击时追加X点火元素伤害并将该层数减至2/3；元素爆发后受到20点法术伤害，并获得2层法术易损直至元素爆发结束"
          },
          {
            "name": "灼燃爆发",
            "tags": [
              "反应"
            ],
            "tagColors": [
              "#0F9ED5"
            ],
            "tagFormats": [
              {
                "color": "#0F9ED5",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#E62829",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "元素增幅 灼燃；命中时追加10点火元素伤害"
          },
          {
            "name": "融化",
            "tags": [
              "反应"
            ],
            "tagColors": [
              "#0F9ED5"
            ],
            "tagFormats": [
              {
                "color": "#0F9ED5",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#E62829",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "元素反应 霜寒，使本次攻击伤害x2"
          },
          {
            "name": "点燃",
            "tags": [
              "反应"
            ],
            "tagColors": [
              "#0F9ED5"
            ],
            "tagFormats": [
              {
                "color": "#0F9ED5",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#E62829",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "元素反应 草种，使本次攻击额外施加10层烧伤"
          },
          {
            "name": "烈绽放",
            "tags": [
              "反应"
            ],
            "tagColors": [
              "#0F9ED5"
            ],
            "tagFormats": [
              {
                "color": "#0F9ED5",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#E62829",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "元素反应 草原核，使本次攻击追加(骰子基础值)点草元素伤害"
          },
          {
            "name": "引燃",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FFC000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这回合结束时若受到烧伤伤害则追加(烧伤的层数/2)点混乱伤害"
          },
          {
            "name": "预燃 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FFC000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合命中目标时施加X层烧伤，结束时烧伤额外结算X次"
          },
          {
            "name": "星火 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FFC000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "若在X回合内陷入混乱，则对所有己方单位施加(自身烧伤层数/2)层烧伤"
          },
          {
            "name": "灼伤",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#E62829",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "与火属性异常状态共同存在，造成的近战伤害x 0.5"
          },
          {
            "name": "火海",
            "tags": [
              "场地",
              "叠加"
            ],
            "tagColors": [
              "#002060",
              "#8a8a8a"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              },
              {
                "color": "#8a8a8a",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#E62829",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "每回合结束时，火属性以外的单位被施加3层烧伤，额外受到体力上限12.5%的火属性伤害，并且烧伤层数不会减少"
          },
          {
            "name": "大晴天",
            "tags": [
              "天气"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#E62829",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "火属性卡牌造成的伤害x1.5，水属性卡牌造成的伤害x0.5；所有单位被施加的火属性异常状态层数+1，水属性异常状态层数-1，冰属性异常状态层数-2"
          },
          {
            "name": "欧米伽日照",
            "tags": [
              "天气"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#E62829",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "特殊大晴天；火属性卡牌造成的伤害x1.5，水属性卡牌造成的伤害x0；所有单位被施加的火属性异常状态层数+1，水属性异常状态固定为0，冰属性异常状态固定为0"
          },
          {
            "name": "浸油 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#E62829",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "被施加烧伤时，使所有带有浸油的己方单位消耗自身的浸油层数获得等量的烧伤"
          },
          {
            "name": "助燃火药 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#E62829",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "受到烧伤伤害时，额外受到(X*烧伤层数)点烧伤伤害"
          },
          {
            "name": "狂怒 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#E62829",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "X回合内，造成的伤害+X*2"
          }
        ]
      },
      {
        "id": "g-机制类状态-10",
        "title": "水",
        "entries": [
          {
            "name": "彩虹",
            "tags": [
              "场地",
              "单向",
              "叠加"
            ],
            "tagColors": [
              "#002060",
              "#8a8a8a",
              "#8a8a8a"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              },
              {
                "color": "#8a8a8a",
                "bold": false,
                "italic": false,
                "underline": "none"
              },
              {
                "color": "#8a8a8a",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#2980EF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "所有卡牌的增伤词条与威力词条必取到最大值"
          },
          {
            "name": "下雨天",
            "tags": [
              "天气"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#2980EF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "水属性卡牌造成的伤害x1.5，火属性卡牌造成的伤害x0.5；所有单位被施加的水属性异常状态层数+1，火属性异常状态层数-1"
          },
          {
            "name": "阿尔法暴雨",
            "tags": [
              "天气"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#2980EF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "特殊下雨天；水属性卡牌造成的伤害x1.5，火属性卡牌造成的伤害x0；所有单位被施加的水属性异常状态层数+2，火属性异常状态层数固定为0"
          },
          {
            "name": "沉沦 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#00b0f0",
              "bold": false,
              "italic": false,
              "underline": "thick"
            },
            "desc": "受到攻击时额外受到X点“理智伤害”并将该层数减至2/3；\n- 若自身没有“理智槽”或“理智值”已达到-45，则改为受到X/2点伤害"
          },
          {
            "name": "沉沦泛滥",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#00b0f0",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "立刻触发所有“沉沦”效果直至层数归零"
          },
          {
            "name": "水蚀 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#2980EF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "受到攻击时追加X点水元素伤害并将该层数减至2/3；元素爆发后受到30点物理伤害，并获得3层易损直至元素爆发结束"
          },
          {
            "name": "蒸发",
            "tags": [
              "反应"
            ],
            "tagColors": [
              "#0F9ED5"
            ],
            "tagFormats": [
              {
                "color": "#0F9ED5",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#2980EF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "元素反应 灼燃，使本次攻击伤害x2"
          },
          {
            "name": "感电",
            "tags": [
              "反应"
            ],
            "tagColors": [
              "#0F9ED5"
            ],
            "tagFormats": [
              {
                "color": "#0F9ED5",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#2980EF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "元素反应 电磁，使所有带有电磁的敌方单位受到相同的伤害"
          },
          {
            "name": "绽放",
            "tags": [
              "反应"
            ],
            "tagColors": [
              "#0F9ED5"
            ],
            "tagFormats": [
              {
                "color": "#0F9ED5",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#2980EF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "元素增幅 草原核"
          }
        ]
      },
      {
        "id": "g-机制类状态-11",
        "title": "草",
        "entries": [
          {
            "name": "湿地",
            "tags": [
              "场地",
              "单向",
              "叠加"
            ],
            "tagColors": [
              "#002060",
              "#8a8a8a",
              "#8a8a8a"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              },
              {
                "color": "#8a8a8a",
                "bold": false,
                "italic": false,
                "underline": "none"
              },
              {
                "color": "#8a8a8a",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#3FA129",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "所有速度骰子速度值降低至原本的25%"
          },
          {
            "name": "青草场地",
            "tags": [
              "场地"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#3FA129",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "草属性卡牌造成的伤害x1.3；所有单位获得的草属性状态层数+1，每回合结束时所有单位恢复上限6.25%的体力"
          },
          {
            "name": "破裂 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#bfbfbf",
              "bold": false,
              "italic": false,
              "underline": "thick"
            },
            "desc": "受到攻击时额外受到X点伤害并将该层数减至2/3"
          },
          {
            "name": "咒杀",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#3FA129",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "特殊破裂；被施加咒杀状态时获得1个基础值计数，满足条件时使对应咒杀的计数-1，减至0时立刻受到1次(持有者破裂层数)点破裂伤害，并同时受到咒杀的特殊效果，随后解除该咒杀状态；持有咒杀时被再次施加相同种类的咒杀不会有任何效果"
          },
          {
            "name": "咒杀【迅捷】 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#3FA129",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "咒杀3: 受到速度值不低于6点的攻击 -&gt; 获得10层破裂"
          },
          {
            "name": "咒杀【剧毒】 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#3FA129",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "咒杀5: 受到暴击攻击 -&gt; 获得2层无力与易伤"
          },
          {
            "name": "咒杀【弱化】 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#3FA129",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "咒杀5: 受到速度值高于自身至少3点的攻击 -&gt; 获得3层易伤与1层束缚"
          },
          {
            "name": "咒杀【勿动】 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#3FA129",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "咒杀4: 持有者被累积施加3层束缚 -&gt; 受到(持有者破裂层数)点混乱伤害"
          },
          {
            "name": "咒杀【血爆】 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#3FA129",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "咒杀3：持有者受到体力比例低于自身的目标攻击 -&gt; 受到(持有者烧伤层数)点破裂伤害"
          },
          {
            "name": "咒杀【掣肘】 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#3FA129",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "咒杀10: 其他咒杀的计数-1 -&gt; 获得2层虚弱"
          },
          {
            "name": "咒杀【衰亡】 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#3FA129",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "咒杀4: 施加者触发破裂 -&gt; 使持有者所有咒杀的计数-1"
          },
          {
            "name": "咒杀【破】 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#3FA129",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "咒杀3: 持有者的破裂被触发 -&gt; 受到(持有者破裂层数)点真实伤害"
          },
          {
            "name": "草种 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#3FA129",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "受到攻击时追加Y点草元素伤害并将该层数减至2/3；元素爆发后失去15点体力，并使所有敌方单位恢复等量体力"
          },
          {
            "name": "蔓激化",
            "tags": [
              "反应"
            ],
            "tagColors": [
              "#0F9ED5"
            ],
            "tagFormats": [
              {
                "color": "#0F9ED5",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#3FA129",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "元素反应 电磁，使本次攻击获得85%的暴击率"
          },
          {
            "name": "草原核 X颗",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#3FA129",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "下回合开始时受到X点草元素伤害"
          },
          {
            "name": "草露 X颗",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#3FA129",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "下X次受到物理伤害时必定暴击"
          },
          {
            "name": "屏障 X点",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#00b0f0",
              "bold": false,
              "italic": false,
              "underline": "thick"
            },
            "desc": "可以吸收X点体力条受到的伤害"
          },
          {
            "name": "荆棘屏障 X点",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#00b0f0",
              "bold": false,
              "italic": false,
              "underline": "thick"
            },
            "desc": "特殊屏障；持有时被攻击造成2-4点反伤"
          },
          {
            "name": "体液屏障 X点",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#3FA129",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "特殊屏障；持有时被攻击反施加1点混乱伤害/2点理智伤害/1层烟气"
          },
          {
            "name": "再生 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#3FA129",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "X回合结束时恢复X点体力"
          },
          {
            "name": "荆棘 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#3FA129",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合中每次受到伤害，造成X点反伤"
          },
          {
            "name": "滋养 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#3FA129",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "下X次恢复体力时，获得1层力量与1层格挡"
          }
        ]
      },
      {
        "id": "g-机制类状态-12",
        "title": "电",
        "entries": [
          {
            "name": "电气场地",
            "tags": [
              "场地"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FAC000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "电属性卡牌造成的伤害x1.3；所有单位获得的电属性状态层数+1，所有单位不会陷入睡眠 状态"
          },
          {
            "name": "充能 X层",
            "tags": [
              "中立状态"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#7030a0",
              "bold": false,
              "italic": false,
              "underline": "thick"
            },
            "desc": "特定卡牌发动附加效果所需的资源，默认最大10层"
          },
          {
            "name": "电磁 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FAC000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "受到攻击时追加X点电元素伤害并将该层数减至2/3；元素爆发后受到10点法术伤害并永久获得1层法术易损"
          },
          {
            "name": "电磁爆发",
            "tags": [
              "反应"
            ],
            "tagColors": [
              "#0F9ED5"
            ],
            "tagFormats": [
              {
                "color": "#0F9ED5",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FAC000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "元素增幅 电磁；命中时追加10点电元素伤害"
          },
          {
            "name": "超载",
            "tags": [
              "反应"
            ],
            "tagColors": [
              "#0F9ED5"
            ],
            "tagFormats": [
              {
                "color": "#0F9ED5",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FAC000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "元素反应 灼燃，使本次攻击容量+2"
          },
          {
            "name": "超绽放",
            "tags": [
              "反应"
            ],
            "tagColors": [
              "#0F9ED5"
            ],
            "tagFormats": [
              {
                "color": "#0F9ED5",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FAC000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "元素反应 草原核，使本次攻击追加(骰子基础值)点草元素伤害"
          },
          {
            "name": "超激化",
            "tags": [
              "反应"
            ],
            "tagColors": [
              "#0F9ED5"
            ],
            "tagFormats": [
              {
                "color": "#0F9ED5",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FAC000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "元素反应 草种，使本次攻击获得65%的暴击率"
          },
          {
            "name": "麻痹 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#f4d03f",
              "bold": false,
              "italic": false,
              "underline": "thick"
            },
            "desc": "这一回合中至多X颗骰子最大值-3"
          },
          {
            "name": "痉挛",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FAC000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "与电属性异常状态共同存在；速度骰子的速度减半"
          },
          {
            "name": "集中 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FAC000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "所有附属单位效果+X"
          },
          {
            "name": "次元裂痕 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#7030a0",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这回合结束时获得X层破裂"
          },
          {
            "name": "充能力场 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#7030a0",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "获得(X*3)点屏障，每失去3点屏障则使该层数-1；该回合结束时解除所有屏障并获得X层充能"
          },
          {
            "name": "负荷 X级",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#7030a0",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合使用的充能关键词卡牌伤害+X*2.5%(至多+15%)"
          },
          {
            "name": "电流释放 X级",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#7030a0",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "抵消X次受到的致命伤害并在触发时获得2层充能、对伤害来源立刻施加1层破裂"
          },
          {
            "name": "数据乱流 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#7030a0",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "每回合开始时随机获得X层(\"烧伤\"/\"流血\"/\"破裂\"/\"沉沦\")，随后层数减少至2/3"
          },
          {
            "name": "小黄鸭 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FAC000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合中持有小黄鸭的单位被攻击时，所有持有小黄鸭的单位获得X层数据乱流"
          },
          {
            "name": "入侵 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FAC000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "仅对【机械融合生命体】生效；\n完成【入侵矩阵】小游戏后，根据结果施加对应层数的入侵并受到对应伤害；\n累积100层后，消耗所有层数进入破解 状态"
          },
          {
            "name": "破解",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FAC000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "仅对【机械融合生命体】生效；这一回合所有混乱抗性+0.6，受到伤害时追加1~3点高热"
          },
          {
            "name": "高热 X点",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#FAC000",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "仅对【机械融合生命体】生效；累积到50点时立刻陷入混乱，每回合结束时层数-2~4"
          }
        ]
      },
      {
        "id": "g-机制类状态-13",
        "title": "超能",
        "entries": [
          {
            "name": "戏法空间",
            "tags": [
              "空间"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EF4179",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "速度关系倒置，低速度值速度骰子可拦截高速度值速度骰子，且低速度值优先行动"
          },
          {
            "name": "魔法空间",
            "tags": [
              "空间"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EF4179",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "所有单位无法使用【特殊卡牌】与【EGO卡牌】"
          },
          {
            "name": "奇妙空间",
            "tags": [
              "空间"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EF4179",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "所有单位的伤害抗性变为(2.0-现有抗性数值)"
          },
          {
            "name": "重力空间",
            "tags": [
              "空间"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EF4179",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "所有闪避骰子威力-2，所有空中单位被视作地面单位"
          },
          {
            "name": "神秘守护",
            "tags": [
              "场地",
              "单向",
              "叠加"
            ],
            "tagColors": [
              "#002060",
              "#8a8a8a",
              "#8a8a8a"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              },
              {
                "color": "#8a8a8a",
                "bold": false,
                "italic": false,
                "underline": "none"
              },
              {
                "color": "#8a8a8a",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EF4179",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "不会被施加负面状态"
          },
          {
            "name": "光墙",
            "tags": [
              "场地",
              "单向",
              "叠加"
            ],
            "tagColors": [
              "#002060",
              "#8a8a8a",
              "#8a8a8a"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              },
              {
                "color": "#8a8a8a",
                "bold": false,
                "italic": false,
                "underline": "none"
              },
              {
                "color": "#8a8a8a",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EF4179",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "受到的法术伤害x0.5"
          },
          {
            "name": "反射壁",
            "tags": [
              "场地",
              "单向",
              "叠加"
            ],
            "tagColors": [
              "#002060",
              "#8a8a8a",
              "#8a8a8a"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              },
              {
                "color": "#8a8a8a",
                "bold": false,
                "italic": false,
                "underline": "none"
              },
              {
                "color": "#8a8a8a",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EF4179",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "受到的近战伤害与远程伤害x0.5"
          },
          {
            "name": "精神场地",
            "tags": [
              "场地"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EF4179",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "超能属性卡牌造成的伤害x1.3；所有卡牌先制度固定为0"
          },
          {
            "name": "魔力 X层",
            "tags": [
              "中立状态"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EF4179",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "特定卡牌发动附加效果所需的资源，默认最大10层，舞台开启时恢复至上限；撤回备战区内每回合恢复2层"
          },
          {
            "name": "星辉 X层",
            "tags": [
              "中立状态"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EF4179",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "独立于费用的另一种资源，部分卡牌同时需要星辉与费用才能使用"
          },
          {
            "name": "瞌睡 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EF4179",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "达到20层时，消耗所有层数获得睡眠"
          },
          {
            "name": "睡眠",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EF4179",
              "bold": true,
              "italic": true,
              "underline": "none"
            },
            "desc": "2~5回合内无法行动，所有的负面状态清空"
          },
          {
            "name": "狂咒",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EF4179",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合内每使用1张卡牌则往弃牌堆加入1张【抓狂】"
          }
        ]
      },
      {
        "id": "g-机制类状态-14",
        "title": "冰",
        "entries": [
          {
            "name": "白雾",
            "tags": [
              "场地",
              "单向",
              "叠加"
            ],
            "tagColors": [
              "#002060",
              "#8a8a8a",
              "#8a8a8a"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              },
              {
                "color": "#8a8a8a",
                "bold": false,
                "italic": false,
                "underline": "none"
              },
              {
                "color": "#8a8a8a",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#3FD8FF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "不会被施加负面基础异常"
          },
          {
            "name": "极光幕",
            "tags": [
              "场地",
              "单向",
              "叠加"
            ],
            "tagColors": [
              "#002060",
              "#8a8a8a",
              "#8a8a8a"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              },
              {
                "color": "#8a8a8a",
                "bold": false,
                "italic": false,
                "underline": "none"
              },
              {
                "color": "#8a8a8a",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#3FD8FF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "所有单位受到的伤害x0.5"
          },
          {
            "name": "下雪天",
            "tags": [
              "天气"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#3FD8FF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "所有单位被施加的冰属性异常状态层数+1；冰属性的单位受到的攻击伤害x0.5"
          },
          {
            "name": "冰雹天",
            "tags": [
              "天气"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#3FD8FF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "所有单位被施加的冰属性异常状态层数+1；每回合结束时，冰属性以外的单位受到体力上限6.25%的真实伤害"
          },
          {
            "name": "寒冷 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#3FD8FF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "每一回合开始时速度骰子数值-X(不小于1) 并将该层数减至2/3，若已达到1则受到X/2点伤害；层数达到24层时获得冰冻"
          },
          {
            "name": "冰冻",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#3FD8FF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "2~4回合内无法行动，所有伤害抗性-0.5"
          },
          {
            "name": "霜寒 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#3FD8FF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "受到攻击时追加X点冰元素伤害并将该层数减至2/3；元素爆发后受到25点物理伤害，并使所有速度值固定为1直至元素爆发结束"
          },
          {
            "name": "霜寒爆发",
            "tags": [
              "反应"
            ],
            "tagColors": [
              "#0F9ED5"
            ],
            "tagFormats": [
              {
                "color": "#0F9ED5",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#3FD8FF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "元素增幅 霜寒；命中时追加10点冰属性伤害"
          },
          {
            "name": "超导",
            "tags": [
              "反应"
            ],
            "tagColors": [
              "#0F9ED5"
            ],
            "tagFormats": [
              {
                "color": "#0F9ED5",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#3FD8FF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "元素反应 电磁，使本次攻击容量+2"
          },
          {
            "name": "碎冰",
            "tags": [
              "反应"
            ],
            "tagColors": [
              "#0F9ED5"
            ],
            "tagFormats": [
              {
                "color": "#0F9ED5",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#3FD8FF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "元素反应 冰冻，使本次攻击伤害x3"
          }
        ]
      },
      {
        "id": "g-机制类状态-15",
        "title": "龙",
        "entries": [
          {
            "name": "坚不可摧 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#5060E1",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "这一回合中受到的伤害不会高于X"
          },
          {
            "name": "光之种",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#5060E1",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "获得的情感点数翻倍"
          },
          {
            "name": "烟气 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#767171",
              "bold": false,
              "italic": false,
              "underline": "thick"
            },
            "desc": "至多10层；被击中时所受伤害+X*3%；若烟气层数不低于9则所有骰子威力+1，每回合结束时层数-1"
          },
          {
            "name": "二噁英 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#767171",
              "bold": false,
              "italic": false,
              "underline": "thick"
            },
            "desc": "至多10层，特殊“烟气”；击中目标时伤害+X*3%；若二噁英层数不低于9则所有骰子威力+1，每回合结束时层数-1"
          },
          {
            "name": "尼古丁 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#767171",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "受到“烟气”卡牌的攻击时转化为1层“麻痹”/“虚弱”/“易损”"
          },
          {
            "name": "源石刺激",
            "tags": [
              "中立状态"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#5060E1",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "造成的所有伤害x2.5，每回合结束受到体力上限12.5%的真实伤害"
          }
        ]
      },
      {
        "id": "g-机制类状态-16",
        "title": "恶",
        "entries": [
          {
            "name": "暗黑气场",
            "tags": [
              "气场"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#50413F",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "恶属性卡牌造成的伤害x1.3"
          },
          {
            "name": "仇恨氛围",
            "tags": [
              "气场"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#50413F",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "恶属性以外的单位造成的物理伤害降低为原本的75%"
          },
          {
            "name": "恐惧氛围",
            "tags": [
              "气场"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#50413F",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "恶属性以外的单位造成的混乱伤害降低为原本的75%"
          },
          {
            "name": "暴戾氛围",
            "tags": [
              "气场"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#50413F",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "恶属性以外的单位的所有物理抗性降低为原本的75%"
          },
          {
            "name": "憎恶氛围",
            "tags": [
              "气场"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#50413F",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "恶属性以外的单位的所有混乱抗性降低为原本的75%"
          },
          {
            "name": "凋亡X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#50413F",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "受到攻击时追加X点恶元素伤害并将该层数减至2/3；元素爆发后失去6点费用，并获得2层虚弱直至元素爆发结束"
          },
          {
            "name": "激怒",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#50413F",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "3回合内，只能使用近战与远程战斗卡牌"
          },
          {
            "name": "缴械",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#50413F",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "3回合内，只能使用装备与变化战斗卡牌"
          },
          {
            "name": "无理取闹",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#50413F",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "2回合内，不能同回合之间使出同样的卡牌"
          },
          {
            "name": "迷惑",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#50413F",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "本回合内，使用书页时有60%的概率改变攻击目标为友方单位"
          }
        ]
      },
      {
        "id": "g-机制类状态-17",
        "title": "妖精",
        "entries": [
          {
            "name": "妖精气场",
            "tags": [
              "气场"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EF70EF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "妖精属性卡牌造成的伤害x1.3"
          },
          {
            "name": "薄雾场地",
            "tags": [
              "场地"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EF70EF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "龙属性卡牌造成的伤害x0.5；所有单位不会陷入负面异常状态"
          },
          {
            "name": "着迷",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EF70EF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "2回合内跟异性拼点时有75%的概率无法行动"
          },
          {
            "name": "鲜红雨滴 X滴",
            "tags": [
              "标记"
            ],
            "tagColors": [
              "#FFC000"
            ],
            "tagFormats": [
              {
                "color": "#FFC000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EF70EF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "随机附着于手牌之上，装备被标记的卡牌时受到X点伤害并清除所有鲜红雨滴；使用非标记卡牌时X-1"
          },
          {
            "name": "精液 X层",
            "tags": [
              "负面状态"
            ],
            "tagColors": [
              "#EE0000"
            ],
            "tagFormats": [
              {
                "color": "#EE0000",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EF70EF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "受到攻击时追加Y点妖精元素伤害并将该层数减至2/3；元素爆发后受到40点理智伤害，获得4层战栗直至元素爆发结束"
          },
          {
            "name": "阴茎勃起",
            "tags": [
              "中立状态"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EF70EF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "可以参与 阴茎 相关体位，受到的伤害+10%"
          },
          {
            "name": "乳汁 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EF70EF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "X回合结束后恢复X点体力"
          },
          {
            "name": "乳房勃起",
            "tags": [
              "中立状态"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EF70EF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "可以参与 乳房 相关体位，所有速度骰子获得0~2层挑衅值"
          },
          {
            "name": "爱液 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EF70EF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "X回合结束后恢复X点理智值"
          },
          {
            "name": "爱穴收紧",
            "tags": [
              "中立状态"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EF70EF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "可以参与 爱穴 相关体位，理智值降低效率+10%"
          },
          {
            "name": "赤身裸体",
            "tags": [
              "中立状态"
            ],
            "tagColors": [
              "#002060"
            ],
            "tagFormats": [
              {
                "color": "#002060",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#EF70EF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "不穿戴任何衣物，每回合自然恢复费用+2，所有物理抗性+0.3"
          },
          {
            "name": "月笼 X层",
            "tags": [
              "正面状态"
            ],
            "tagColors": [
              "#00B0F0"
            ],
            "tagFormats": [
              {
                "color": "#00B0F0",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#ef70ef",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "累积3层后，下一次攻击必定暴击"
          },
          {
            "name": "月感电",
            "tags": [
              "反应"
            ],
            "tagColors": [
              "#0F9ED5"
            ],
            "tagFormats": [
              {
                "color": "#0F9ED5",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#ef70ef",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "元素反应 电磁/水蚀，使所有带有电磁/水蚀的敌方单位受到相同的暴击伤害"
          },
          {
            "name": "月绽放",
            "tags": [
              "反应"
            ],
            "tagColors": [
              "#0F9ED5"
            ],
            "tagFormats": [
              {
                "color": "#0F9ED5",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#ef70ef",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "元素反应 草种/水蚀，元素增幅 草原核&amp;草露"
          },
          {
            "name": "月结晶",
            "tags": [
              "反应"
            ],
            "tagColors": [
              "#0F9ED5"
            ],
            "tagFormats": [
              {
                "color": "#0F9ED5",
                "bold": false,
                "italic": false,
                "underline": "none"
              }
            ],
            "format": {
              "color": "#ef70ef",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "元素反应 崩碎/水蚀，使本次攻击命中时获得1层月笼与(伤害量)点屏障"
          }
        ]
      }
    ]
  },
  {
    "id": "特殊骰子",
    "title": "特殊骰子",
    "groups": [
      {
        "id": "g-特殊骰子-0",
        "title": "",
        "entries": [
          {
            "name": "反击",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#000000",
              "bold": false,
              "italic": false,
              "underline": "double"
            },
            "desc": "反击骰子将按照使用顺序置于使用者的反击池中；使用者受到单方面攻击时，将从池子底部顺次投掷反击骰子与攻击者进行拼点；每回合结束时反击池清空"
          },
          {
            "name": "回击",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#000000",
              "bold": false,
              "italic": false,
              "underline": "double"
            },
            "desc": "回击骰子将按照使用顺序置于使用者的回击池中；使用者受到单方面攻击后，将从池子底部顺次投掷回击骰子对攻击者进行单方面攻击；每回合结束时回击池清空"
          },
          {
            "name": "多重攻击 X次",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#000000",
              "bold": false,
              "italic": false,
              "underline": "double"
            },
            "desc": "进攻型骰子命中时额外造成X次伤害"
          },
          {
            "name": "重复投掷 X次",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#000000",
              "bold": false,
              "italic": false,
              "underline": "double"
            },
            "desc": "该骰子首次投掷结束后，将重复投掷X次"
          },
          {
            "name": "不可摧毁",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#EE0000",
              "bold": false,
              "italic": false,
              "underline": "double"
            },
            "desc": "不可摧毁骰子拼点失败时，将强行以最小值命中目标"
          },
          {
            "name": "重复使用",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#00B0F0",
              "bold": false,
              "italic": false,
              "underline": "double"
            },
            "desc": "重复使用骰子拼点胜利后，将重复投掷直至拼点失败"
          },
          {
            "name": "碎裂",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#808080",
              "bold": false,
              "italic": false,
              "underline": "double"
            },
            "desc": "碎裂骰子被修复前无法投掷，将按照使用顺序置于使用者的碎裂池子中；使用者调用修复效果时，将从池子底部顺次投掷碎裂骰子对随机敌方单位进行单方面攻击；每回合结束时碎裂池子清空"
          }
        ]
      }
    ]
  },
  {
    "id": "卡牌分类",
    "title": "卡牌分类",
    "groups": [
      {
        "id": "g-卡牌分类-0",
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
        "id": "g-基础标签-0",
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
              "underline": "none"
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
              "underline": "none"
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
              "underline": "none"
            },
            "desc": "带有该标签的卡牌将拼点的敌方速度骰子视为“主要目标”并会选择多名“次要目标”，对主要目标造成伤害时会同时对次要目标造成伤害。"
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
              "underline": "none"
            },
            "desc": "使用消耗卡牌后将其移入消耗堆"
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
              "underline": "none"
            },
            "desc": "该卡牌在使用 X 次后被消耗掉；卡牌使用次数归零后将其移入消耗堆"
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
              "underline": "none"
            },
            "desc": "该回合结束时若“虚无”卡牌处于手牌堆，则将其移入消耗堆"
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
              "underline": "none"
            },
            "desc": "该回合结束时若“丢弃”卡牌处于手牌堆，则将其移入弃牌堆"
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
        "id": "g-泛用标签-0",
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
            "desc": "一种“连携”机制。发起者使用带有 [“连携-同技”] 标签的卡牌时，可指定一名符合条件的友方单位作为连携者。本次行动中，发起者与连携者将各自独立使用一次该卡牌的全部效果。"
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
            "desc": "一种需要条件解锁的“连携”机制。发起者想要使用卡牌A，需要场上存在一名装备了特定卡牌B的友方单位时，卡牌A才可发动。发动后，发起者使用卡牌A，连携者使用卡牌B。"
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
            "desc": "牺牲卡牌必须令X名指定类型的友方单位立刻阵亡以发动效果。若场上没有该类型的友方单位，则使用失败"
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
        "id": "g-卡牌前缀-0",
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
        "id": "g-基础骰子-0",
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

export const generatedHiddenSections = [
  {
    "id": "基础数值",
    "title": "基础数值",
    "groups": [
      {
        "id": "g-基础数值-0",
        "title": "",
        "entries": [
          {
            "name": "情感等级",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#000000",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "情感等级战斗系统的基础成长资源"
          },
          {
            "name": "情感点数",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#000000",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "情感等级战斗系统的基础数值"
          },
          {
            "name": "正面情感",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#98DA8C",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "正面情感倾向"
          },
          {
            "name": "负面情感",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#B40E09",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "负面情感倾向"
          },
          {
            "name": "理智值",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#00B0F0",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "单位当前理智值"
          },
          {
            "name": "理智伤害",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#00B0F0",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "对理智值造成的伤害"
          },
          {
            "name": "理智槽",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#00B0F0",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "储存理智值数值的容器"
          }
        ]
      }
    ]
  },
  {
    "id": "体系数值",
    "title": "体系数值",
    "groups": [
      {
        "id": "g-体系数值-0",
        "title": "部署点数",
        "entries": [
          {
            "name": "部署点数",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#3A7D99",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "部署点数战斗系统的基础运营资源"
          },
          {
            "name": "部署费用",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#3A7D99",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "单位出场消耗的部署点数"
          },
          {
            "name": "指挥等级",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#E0B564",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "部署点数战斗系统的队伍成长等级"
          },
          {
            "name": "指挥经验",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#E0B564",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "提升指挥等级所需的进度值"
          },
          {
            "name": "精英化",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#E0A83C",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "消费部署点数解锁单位额外被动与卡牌的阶段成长"
          },
          {
            "name": "再次部署",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#3A7D99",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "单位阵亡4回合后以初始状态重新上场"
          },
          {
            "name": "元素损伤",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#B48CFF",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "对元素损伤条造成的伤害"
          },
          {
            "name": "元素损伤条",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#B48CFF",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "单位承受元素伤害的容量条，归零触发元素爆发"
          },
          {
            "name": "元素伤害",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#B48CFF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "消耗元素损伤条的伤害类型"
          },
          {
            "name": "元素爆发",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#B48CFF",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "元素损伤条归零后触发的状态"
          },
          {
            "name": "希望书页",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#98DA8C",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "RHD 系统的正面异常实体书页"
          },
          {
            "name": "危机书页",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#B40E09",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "RHD 系统的风险收益型异常实体书页"
          },
          {
            "name": "合约",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#B40E09",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "危机书页附带的强化敌方/劣化环境条款"
          }
        ]
      },
      {
        "id": "g-体系数值-1",
        "title": "奇迹能量",
        "entries": [
          {
            "name": "训练师",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#000000",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "PKM 系统的指挥角色单位"
          },
          {
            "name": "宝可梦",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#000000",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "PKM 系统被指挥的召唤物单位"
          },
          {
            "name": "奇迹能量",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#E8A317",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "PKM 系统的基础成长资源"
          },
          {
            "name": "形态能量",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#B88AFF",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "用于进入对战形态的奇迹能量（超级/Z/极巨/太晶）"
          },
          {
            "name": "超级能量",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#B88AFF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "发动 MEGA 进化所需"
          },
          {
            "name": "Z能量",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#B88AFF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "发动 Z 招式所需"
          },
          {
            "name": "极巨能量",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#B88AFF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "发动极巨化所需"
          },
          {
            "name": "太晶能量",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#B88AFF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "发动太晶化所需"
          },
          {
            "name": "补给能量",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#6FC3E0",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "随时间与舞台开启积攒的奇迹能量"
          },
          {
            "name": "宝藏能量",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#FBBF24",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "兑换宝藏书页所需"
          },
          {
            "name": "支援能量",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#98DA8C",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "我方宝可梦阵亡时获得"
          },
          {
            "name": "战斗能量",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#E0A83C",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "发动特定战斗机制的奇迹能量（合能/一击/汇流/光辉等）"
          },
          {
            "name": "宝藏书页",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#FBBF24",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "PKM 系统的异常实体书页"
          },
          {
            "name": "太晶爆发",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#B88AFF",
              "bold": false,
              "italic": false,
              "underline": "none"
            },
            "desc": "太晶化后变为对应太晶属性的卡牌"
          },
          {
            "name": "对战形态",
            "tags": [],
            "tagColors": [],
            "tagFormats": [],
            "format": {
              "color": "#E0B564",
              "bold": true,
              "italic": false,
              "underline": "none"
            },
            "desc": "形态能量令单位进入的特殊状态"
          }
        ]
      }
    ]
  }
]

export const generatedHasParamTerms = {
  "易损 X层": 1,
  "守护 X层": 1,
  "易伤 X层": 1,
  "坚硬 X层": 1,
  "敏感 X层": 1,
  "庇护 X层": 1,
  "脆弱 X层": 1,
  "振奋 X层": 1,
  "拼点虚弱 X层": 1,
  "拼点强壮 X层": 1,
  "伤害弱化 X层": 1,
  "伤害强化 X层": 1,
  "爆伤弱化 X层": 1,
  "爆伤强化 X层": 1,
  "无力 X层": 1,
  "力量 X层": 1,
  "虚弱 X层": 1,
  "强壮 X层": 1,
  "破绽 X层": 1,
  "忍耐 X层": 1,
  "束缚 X层": 1,
  "迅捷 X层": 1,
  "状态虚弱 X层": 1,
  "状态增强 X层": 1,
  "烧伤易损 X层": 1,
  "烧伤守护 X层": 1,
  "理智值恢复效率减少 X层": 1,
  "理智值恢复效率增加 X层": 1,
  "理智值降低效率增加 X层": 1,
  "理智值降低效率减少 X层": 1,
  "抽牌减少 X层": 1,
  "抽牌增加 X层": 1,
  "费用流失 X层": 1,
  "费用充盈 X层": 1,
  "缓冲 X层": 1,
  "活力 X层": 1,
  "精准 X层": 1,
  "封印 X层": 1,
  "呼吸法 X层": 1,
  "破防 X层": 1,
  "战栗 X层": 1,
  "剑刃解禁 X层": 1,
  "援护攻击 X层": 1,
  "援护防御 X层": 1,
  "起飞 X层": 1,
  "毒液 X层": 1,
  "毒药瓶 X层": 1,
  "毒菱 X层": 1,
  "猩红腐败 X层": 1,
  "撒菱 X层": 1,
  "自然 X层": 1,
  "腐蚀 X层": 1,
  "震颤 X层": 1,
  "震颤-崩坏 X层": 1,
  "震颤-裂痕 X层": 1,
  "震颤-回响 X层": 1,
  "震颤-寸止 X层": 1,
  "震颤-锁链 X层": 1,
  "震颤-永恒 X层": 1,
  "震颤-分配 X层": 1,
  "震颤-上弦 X层": 1,
  "震颤-灼热 X层": 1,
  "震颤-大出血 X层": 1,
  "崩碎 X层": 1,
  "流血 X层": 1,
  "血宴 X层": 1,
  "消耗血宴总数 X层": 1,
  "共用消耗血宴总数 X层": 1,
  "吸血 X层": 1,
  "尖钉 X层": 1,
  "自助餐 X层": 1,
  "吞食 X次": 1,
  "合金燃料 X层": 1,
  "重塑 X次": 1,
  "燃命 X回合": 1,
  "召唤 X层": 1,
  "神经 X层": 1,
  "灾厄 X层": 1,
  "骤死 X层": 1,
  "晦 X层": 1,
  "明 X层": 1,
  "金属化 X层": 1,
  "多重护甲 X层": 1,
  "覆甲 X层": 1,
  "格挡 X层": 1,
  "人工制品 X层": 1,
  "挑衅值 X层": 1,
  "弹药 X层": 1,
  "锻造 X层": 1,
  "烧伤 X层": 1,
  "灼燃 X层": 1,
  "预燃 X层": 1,
  "星火 X层": 1,
  "浸油 X层": 1,
  "助燃火药 X层": 1,
  "狂怒 X层": 1,
  "沉沦 X层": 1,
  "水蚀 X层": 1,
  "破裂 X层": 1,
  "咒杀【迅捷】 X层": 1,
  "咒杀【剧毒】 X层": 1,
  "咒杀【弱化】 X层": 1,
  "咒杀【勿动】 X层": 1,
  "咒杀【血爆】 X层": 1,
  "咒杀【掣肘】 X层": 1,
  "咒杀【衰亡】 X层": 1,
  "咒杀【破】 X层": 1,
  "草种 X层": 1,
  "草原核 X颗": 1,
  "草露 X颗": 1,
  "屏障 X点": 1,
  "荆棘屏障 X点": 1,
  "体液屏障 X点": 1,
  "再生 X层": 1,
  "荆棘 X层": 1,
  "滋养 X层": 1,
  "充能 X层": 1,
  "电磁 X层": 1,
  "麻痹 X层": 1,
  "集中 X层": 1,
  "次元裂痕 X层": 1,
  "充能力场 X层": 1,
  "负荷 X级": 1,
  "电流释放 X级": 1,
  "数据乱流 X层": 1,
  "小黄鸭 X层": 1,
  "入侵 X层": 1,
  "高热 X点": 1,
  "魔力 X层": 1,
  "星辉 X层": 1,
  "瞌睡 X层": 1,
  "寒冷 X层": 1,
  "霜寒 X层": 1,
  "坚不可摧 X层": 1,
  "烟气 X层": 1,
  "二噁英 X层": 1,
  "尼古丁 X层": 1,
  "凋亡X层": 1,
  "鲜红雨滴 X滴": 1,
  "精液 X层": 1,
  "乳汁 X层": 1,
  "爱液 X层": 1,
  "月笼 X层": 1,
  "多重攻击 X次": 1,
  "重复投掷 X次": 1,
  "攻击容量": 1,
  "消耗:X": 1,
  "牺牲": 1
}
