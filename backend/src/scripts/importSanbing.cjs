// 零号层·无楼层散兵 一次性导入脚本（数据源：参考文档/迎书楼素材/无楼层散兵.docx）
// 幂等：零号层(floorId=7)内同名司书已存在则跳过。用法：node importSanbing.cjs [--apply]
// @ts-nocheck
const Database = require('better-sqlite3')

const R = { 耐性: 0.5, 一般: 1, 脆弱: 1.5 }
const phys = (s, p, st) => ({ slash: R[s], pierce: R[p], strike: R[st] })

const d = (baseType, min, max, specialType = '', effects = ['']) => ({ baseType, specialType, rangeMin: min, rangeMax: max, effects })
const card = (name, cost, type, tags, effects, dice, extra = {}) => ({ name, cost, type, tags, effects, dice, ...extra })
const copies = (n, c) => Array.from({ length: n }, () => JSON.parse(JSON.stringify(c)))

const UNITS = [
  {
    name: '黑羽夜鹤',
    title: '黑羽夜鹤之页',
    affiliation: '【裸吠的母狗】',
    sortOrder: 1,
    sheet: {
      battleSystem: 'base', romanNum: '', name: '黑羽夜鹤',
      hp: 175, stagger: 74, sanity: 0, speedMin: 4, speedMax: 7,
      resist: { physic: phys('耐性', '一般', '一般'), chaos: phys('耐性', '耐性', '耐性') },
      factions: [], faction: '',
      passives: [
        { name: '速战速决BASE', effect: '速度骰子+1' },
        { name: '神器-妖刀正宗', effect: '来到舞台时，将1张【妖刀解放】洗入抽牌堆' },
        { name: '魔力充裕', effect: '“魔力”上限提升至20层；\n- 每回合结束时，恢复1层“魔力”' },
        { name: '资深魔剑士', effect: '造成的伤害+15%，速度值+1，卡牌消耗的“魔力”层数-1' },
        { name: '暴露狂搭档', effect: '永久获得“赤身裸体”；\n- 若【白雪·林德布洛姆】也在场，则免疫“赤身裸体”的负面效果；\n- 处于“解放：妖刀正宗”，将【神器合一】置入手牌(每舞台至多1次)' },
        { name: '超越搭档的关系', effect: '若【白雪·林德布洛姆】在场，则每回合战斗开始时获得1次“我来帮助白雪酱”；\n- 与【白雪·林德布洛姆】触发“援护攻击”与[“连携”]卡牌后，恢复5~9点混乱抗性' },
      ],
      mechanisms: [
        { name: '解放：妖刀正宗', stack: '', type: '能力', desc: '所有骰子威力+2，造成的伤害+10%，受到的伤害-10%\n- 每回合结束时消耗1层“魔力”', format: { color: '#fecf4d', bold: true, italic: false, underline: 'none' } },
        { name: '我来帮助白雪酱', stack: 'X', type: '中立状态', desc: '特殊“援护攻击”，在【白雪·林德布洛姆】使用完卡牌后触发\n- 优先使用卡组内的【斩星一闪】', format: { color: '#ffffff', bold: false, italic: false, underline: 'none' } },
      ],
      cards: {
        combat: [
          card('复苏之光', 0, '装备', [], ['装备时 消耗2层“魔力”，以恢复4点费用并抽取1张卡牌'], []),
          card('斩星一闪', 1, '近战', [], ['使用时 抽取1张卡牌'], [d('斩击', 3, 6, '', ['命中时 追加(骰子基础值)点法术伤害'])]),
          card('红莲百花', 1, '近战', [], ['- 若自身带有“魔力”，则本卡牌变成火属性'], [d('突刺', 3, 6), d('突刺', 3, 5), d('闪避', 2, 6)]),
          card('雪月风花', 1, '近战', [], ['- 若自身带有“魔力”，则本卡牌变成冰属性'], [d('招架', 3, 5), d('打击', 4, 6)]),
          card('圣焰灭却', 1, '近战', [], ['- 若自身带有“魔力”，则本卡牌变成超能属性'], [d('斩击', 5, 10), d('闪避', 1, 5)]),
          card('烈焰焚城', 2, '法术', [], ['使用前 需要2层“魔力”'], [d('突刺', 6, 13, '', ['命中时 对随机1名敌方单位造成(骰子基础值/2)点伤害'])], { attr: '火' }),
          card('极寒冰川', 2, '法术', ['攻击容量:2'], ['使用前 需要2层“魔力”'], [d('打击', 5, 8, '', ['命中时 下一回合施加1层“束缚”']), d('打击', 5, 7, '', ['命中时 下一回合施加2层“寒冷”'])], { attr: '冰' }),
          card('脉冲雷光', 2, '法术', [], ['使用前 需要2层“魔力”'], [d('突刺', 5, 15, '', ['命中时 下一回合施加2层“麻痹”'])], { attr: '电' }),
          card('大地吞噬者', 2, '法术', [], ['使用前 需要2层“魔力”'], [d('斩击', 3, 6, '', ['命中时 追加1~3点法术伤害']), d('斩击', 3, 6, '', ['命中时 追加1~3点法术伤害']), d('斩击', 3, 5, '', ['命中时 追加1~3点法术伤害'])], { attr: '岩石' }),
          card('龙卷飓风', 2, '法术', [], ['使用前 需要2层“魔力”'], [d('突刺', 4, 7, '', ['命中时 下一回合获得1层“迅捷”']), d('突刺', 3, 6, '', ['命中时 下一回合获得1层“迅捷”'])], { attr: '飞行' }),
          card('黑羽流 · 影月无双', 3, '近战', [], ['- 若带有“解放：妖刀正宗”，则本卡牌威力+2，造成的伤害+15%', '斩杀时 恢复4层“魔力”'], [d('斩击', 5, 18, '', ['拼点胜利 目标卡牌剩余骰子威力-1'])]),
          card('月虹', 3, '法术', [], ['使用前 需要4层“魔力”', '- 若带有“解放：妖刀正宗”，则本卡牌攻击容量+2'], [d('打击', 6, 8, '', ['命中时 追加4点法术伤害']), d('打击', 7, 9)]),
        ],
        special: [
          card('妖刀解放', 3, '能力', [], ['战斗结束 下一回合起获得“解放：妖刀正宗”'], [], { prefix: 'V.' }),
          card('神器合一', 4, '法术', ['消耗', '保留', '连携-合击'], ['[“连携”]：【白雪·林德布洛姆】使用【神器合一】'], [d('打击', 6, 12, '', ['拼点胜利 摧毁目标卡牌剩余骰子']), d('突刺', 2, 5, '', ['“多重攻击”4'])], { prefix: 'EX.' }),
        ],
        ego: [], modules: [], energy: [],
      },
      systemData: {},
    },
  },
  {
    name: '暗精灵芙蕾莉亚',
    title: '暗精灵芙蕾莉亚之页',
    affiliation: '【暗精灵】【裸吠的母狗】',
    sortOrder: 2,
    sheet: {
      battleSystem: 'base', romanNum: '', name: '暗精灵芙蕾莉亚',
      hp: 138, stagger: 83, sanity: 0, speedMin: 3, speedMax: 6,
      resist: { physic: phys('一般', '一般', '一般'), chaos: phys('一般', '耐性', '耐性') },
      factions: [], faction: '',
      passives: [
        { name: '速战速决BASE2', effect: '速度骰子+2' },
        { name: '淫魔之剑', effect: '造成的法术伤害+20%，自身的攻击有35%的概率施加“着迷”' },
        { name: '暴露狂', effect: '永久获得“赤身裸体”；\n- 场上每有1名处于“赤身裸体”的单位则使自身速度最小值+1' },
        { name: '堕落的黑骑士', effect: '自身所有速度骰子“挑衅值”-1；\n- “魔力”上限提升至25层，且卡牌消耗的“魔力”层数减半' },
        { name: '圣火火种', effect: '自身使用法术卡牌时，生成一张对应属性的法术卡牌\n- 火属性 → 【回旋火焰球】\n- 冰属性 → 【投掷冰墙】\n- 电属性 → 【雷光闪】\n- 对0费卡牌不会生效' },
      ],
      mechanisms: [
        { name: '火焰球', stack: 'X', type: '正面状态', desc: '将施加卡牌的骰子置入“火焰球”；\n- 本回合内受到敌方单位的攻击时，使用“火焰球”内的骰子攻击敌方单位', format: { color: '#ff6600', bold: true, italic: false, underline: 'none' } },
        { name: '冰墙', stack: 'X', type: '负面状态', desc: '将施加卡牌的骰子置入“冰墙”；\n- 目标速度骰子必须先与“冰墙”的骰子拼点，拼点胜利后才可以正常行动', format: { color: '#5b97e6', bold: true, italic: false, underline: 'none' } },
        { name: '雷光附着', stack: 'X', type: '正面状态', desc: '将施加卡牌的骰子置入“电光”；\n- 附着的卡牌造成伤害时，额外使用“电光”中的骰子攻击目标', format: { color: '#ffde40', bold: true, italic: false, underline: 'none' } },
      ],
      cards: {
        combat: [
          card('辅助治疗', 1, '装备', [], ['装备时 选择1名友方单位 消耗2层“魔力”使其恢复5~11点体力并抽取1张卡牌', '- 若选择敌方单位，则改为对自身使用'], []),
          ...copies(3, card('爆炎', 2, '法术', ['攻击容量:3'], ['使用前 需要3层“魔力”', '- 若“魔力”层数不高于15层，则本卡牌骰子威力+2，造成的伤害+20%，施加的“烧伤”层数+1'], [d('打击', 4, 7, '', ['命中时 下一回合施加3层“烧伤”'])], { attr: '火' })),
          ...copies(3, card('雪暴', 2, '法术', ['攻击容量:3'], ['使用前 需要3层“魔力”', '- 若“魔力”层数不高于15层，则本卡牌骰子威力+2，造成的伤害+20%，攻击容量+1'], [d('突刺', 5, 8, '', ['命中时 下一回合施加3层“寒冷”'])], { attr: '冰' })),
          ...copies(3, card('雷暴', 2, '法术', ['攻击容量:3'], ['使用前 需要3层“魔力”', '- 若“魔力”层数不高于15层，则本卡牌骰子威力+2，造成的伤害+20%，骰子最小值+3'], [d('斩击', 4, 9, '', ['命中时 下一回合施加2层“麻痹”'])], { attr: '电' })),
          card('瞬间移动', 2, '变化', ['保留'], ['战斗结束 撤退回备战区，5回合后可返回舞台'], []),
          card('圣火倾泻', 3, '法术', ['攻击容量:3', '保留'], ['使用时 消耗手牌中所有费用为0的法术卡牌', '- 每消耗1张卡牌，立刻触发其使用特效，并将卡牌内骰子置入该卡牌', '- 每消耗2张卡牌，则使本卡牌攻击容量+1(至多+3)'], [d('斩击', 5, 8, '', ['命中时 立刻施加1层“法术易损”'])], { attr: '火' }),
        ],
        special: [
          ...copies(3, card('回旋火焰球', 0, '法术', [], ['战斗开始 使自身获得1颗“火焰球”'], [d('打击', 3, 4, '', ['命中时 下一回合施加1层“烧伤”'])], { prefix: 'V.', attr: '火' })),
          ...copies(3, card('投掷冰墙', 0, '法术', [], ['战斗开始 使目标前出现1道“冰墙”'], [d('招架', 2, 5, '', ['拼点失败 下一回合施加1层“寒冷”'])], { prefix: 'V.', attr: '冰' })),
          ...copies(3, card('雷光闪', 0, '法术', [], ['战斗开始 使自己的1张战斗卡牌获得“雷光附着”'], [d('斩击', 3, 3)], { prefix: 'V.', attr: '电' })),
        ],
        ego: [], modules: [], energy: [],
      },
      systemData: {},
    },
  },
  {
    name: '爱丽丝·迪特莉希',
    title: '爱丽丝·迪特莉希之页',
    affiliation: '【裸吠的母狗】',
    sortOrder: 3,
    sheet: {
      battleSystem: 'base', romanNum: '', name: '爱丽丝·迪特莉希',
      hp: 146, stagger: 58, sanity: 0, speedMin: 4, speedMax: 7,
      resist: { physic: phys('一般', '耐性', '一般'), chaos: phys('一般', '耐性', '一般') },
      factions: [], faction: '',
      passives: [
        { name: '速战速决BASE', effect: '速度骰子+1' },
        { name: '家传枪技', effect: '舞台开启时，获得30发“弹药”与10层“魔力”；\n- 每回合结束时，若自身“弹药”用尽，则消耗2层“魔力”将其补充至上限' },
        { name: '血之魔法枪', effect: '使用远程卡牌时，所有骰子造成的伤害降低至33%，获得2次“多重攻击”；\n- 所有骰子获得30%的暴击率；每消耗1发“弹药”，则获得2层“呼吸法”' },
        { name: '顶级肉便器', effect: '永久获得“赤身裸体”，满足以下条件后将1张【彻底堕落】置入手牌：\n- 友方单位全部阵亡\n- 自身累计陷入混乱2次\n- 自身体力不足上限的25%' },
        { name: '滥情的女枪手', effect: '突刺骰子威力+2，斩击骰子威力+1，打击骰子威力-2' },
        { name: '千金大小姐', effect: '恢复费用时有40%的概率额外恢复1点，抽取卡牌时有100%的概率额外抽取1张\n- 自身在场时，所有友方单位享受上述效果的一半概率' },
      ],
      mechanisms: [
        { name: '内心的恶神，里贝拉', stack: '', type: '能力', desc: '速度骰子+1，速度值+1\n- 所有远程骰子额外获得50%的暴击率与“拼点失败 使目标无法重复投掷”\n- 免疫“赤身裸体”的负面效果，且所有伤害抗性-0.4\n- 每回合开始时费用恢复至上限，抽牌数+1\n- 本次接待结束后，获得的书本-60%', format: { color: '#fecf4d', bold: true, italic: false, underline: 'none' } },
      ],
      cards: {
        combat: [
          card('战神之光', 0, '装备', ['保留'], ['装备时 恢复1点费用，该回合额外获得15%的暴击率'], []),
          card('矮人之光', 0, '装备', ['保留'], ['装备时 恢复1点费用，该回合战斗开始时获得1颗反击骰子(闪避 3-6)'], []),
          card('风神之光', 0, '装备', ['保留'], ['装备时 恢复1点费用，该回合速度值+2'], []),
          ...copies(3, card('爆头一击', 1, '远程', [], ['使用前 需要1发“弹药”'], [d('突刺', 6, 9, '', ['命中时 使本骰子额外命中1名随机敌人']), d('闪避', 1, 6)])),
          card('眩晕弹', 1, '远程', [], ['使用前 需要1发“弹药”', '使用时 抽取1张卡牌'], [d('斩击', 4, 10, '', ['命中时 下一回合施加2层“束缚”与1层“易损”'])]),
          ...copies(2, card('钢铁切割', 2, '远程', [], ['使用前 需要2发“弹药”', '- 本卡牌会比较目标的斩击抗性与突刺抗性，使用抗性更高的属性造成伤害'], [d('突刺/斩击', 3, 6), d('突刺/斩击', 3, 5), d('突刺/斩击', 3, 5)])),
          ...copies(2, card('多重射击', 2, '远程', ['攻击容量:2'], ['使用前 需要3发“弹药”', '- 本卡牌受被动能力“血之魔法枪”的所有效果影响翻倍'], [d('突刺', 4, 8), d('突刺', 3, 7)])),
          card('无限射击', 3, '远程', ['攻击容量:3', '广域乱射'], ['使用前 需要至多4发“弹药”', '使用时 抽取1张卡牌', '- 本卡牌每消耗1发“弹药”，则暴击率+15%，骰子最小值+1'], [d('突刺', 5, 13, '', ['“重复投掷”2']), d('斩击', 4, 7, '', ['使用前 若本卡牌上一颗骰子没有击杀敌方单位，则摧毁本骰子'])]),
        ],
        special: [
          card('彻底堕落', 0, '能力', ['保留'], ['战斗开始 本次接待中永久获得“内心的恶神，里贝拉”'], [], { prefix: 'V.' }),
        ],
        ego: [], modules: [], energy: [],
      },
      systemData: {},
    },
  },
  {
    name: '叶月',
    title: '叶月之页',
    affiliation: '【裸吠的母狗】',
    sortOrder: 4,
    sheet: {
      battleSystem: 'base', romanNum: '', name: '叶月',
      hp: 198, stagger: 79, sanity: 0, speedMin: 4, speedMax: 6,
      resist: { physic: phys('耐性', '一般', '一般'), chaos: phys('耐性', '一般', '耐性') },
      factions: [], faction: '',
      passives: [
        { name: '速战速决BASE', effect: '速度骰子+1' },
        { name: '胧月', effect: '自身每累计造成3次近战伤害，则使用1颗特殊近战骰子造成[追击](斩击4-6 该骰子有40%的暴击率)' },
        { name: '黑色死神', effect: '满足以下条件后，可立刻获得“刀影”：\n- 使用装备卡牌后，获得1层\n- 近战攻击命中时未造成暴击，立刻获得2层\n- 友方单位阵亡/被击晕时，立刻获得10层' },
        { name: '有觉悟的精液罐', effect: '永久获得“赤身裸体”，免疫“赤身裸体”的负面效果；\n- 自身永远不会陷入“着迷”状态' },
        { name: '反乌托邦的顶级杀手', effect: '造成的物理伤害+20%，暴击伤害+10%，斩击骰子威力+2，其余所有骰子威力-1' },
      ],
      mechanisms: [
        { name: '刀影', stack: 'X', type: '正面状态', desc: '至多20层；近战攻击命中时，有X*3%的概率立刻触发被动能力【胧月】；\n- 每回合结束时消耗所有层数，下一回合速度值+X/5', format: { color: '#79e65b', bold: true, italic: false, underline: 'none' } },
      ],
      cards: {
        combat: [
          ...copies(3, card('圣水', 0, '装备', [], ['装备时 消耗3点混乱抗性，抽取1张卡牌并恢复1点费用', '装备后 若自身混乱抗性不少于50%，则重复使用1次该卡牌(无法连续使用)'], [])),
          ...copies(2, card('居合斩', 1, '近战', [], ['使用后 获得1层“易伤”', '- 若目标带有草属性，则本卡牌造成的伤害+10%'], [d('斩击', 4, 8), d('斩击', 3, 8)])),
          ...copies(3, card('隼斩', 2, '近战', [], ['使用后 获得2层“易伤”与1层“破绽”', '- 若自身速度值高于目标，则本卡牌造成的暴击伤害+5%'], [d('斩击', 5, 8), d('斩击', 5, 7), d('斩击', 4, 6)])),
          card('玄武之势', 2, '装备', [], ['装备时 获得1层“振奋”与20层“呼吸法”'], []),
          card('川蝉之势', 2, '装备', [], ['装备时 获得1层“迅捷”与15层“呼吸法”', '- 战斗开始时，将1颗特殊骰子置入反击池(闪避3-5)'], []),
          card('精神集中', 2, '装备', [], ['战斗结束 本回合每消耗3层“刀影”，则恢复2点混乱抗性'], []),
          card('明王乱舞', 3, '近战', [], ['使用后 获得2层“易伤”、2层“破绽”与1层“易损”', '- 若自身速度值高于目标，则本卡牌造成的暴击伤害+10%'], [d('斩击', 5, 10), d('斩击', 5, 9, '', ['“多重攻击”1']), d('斩击', 4, 9, '', ['“多重攻击”1/2'])]),
        ],
        special: [],
        ego: [], modules: [], energy: [],
      },
      systemData: {},
    },
  },
  {
    name: '闪击光拳 :: 蕾贝卡',
    title: '闪击光拳 :: 蕾贝卡之页',
    affiliation: '【性危机干预与情色联络局】',
    sortOrder: 5,
    sheet: {
      battleSystem: 'base', romanNum: '', name: '闪击光拳 :: 蕾贝卡',
      hp: 175, stagger: 105, sanity: 0, speedMin: 3, speedMax: 8,
      resist: { physic: phys('一般', '耐性', '一般'), chaos: phys('耐性', '耐性', '耐性') },
      factions: [], faction: '',
      passives: [
        { name: '速战速决BASE2', effect: '速度骰子+2' },
        { name: '超级英雄::闪击光拳', effect: '我方单位使用卡牌后，自身有10%的概率使用【闪光拳！】造成[追击]\n- 若该效果未触发，则触发概率+10%，直至触发后概率恢复至初始' },
        { name: '喷射拳套', effect: '每累计命中敌方单位3次，恢复1点费用；\n- 每累计命中敌方单位5次，抽取1张卡牌；\n- 每累计命中敌方单位20次，则将1张【莉莉雅，让我使用组合拳！】置入手牌' },
        { name: 'LC超薄装甲', effect: '受到的伤害-30%，所有速度骰子“挑衅值”+4' },
      ],
      mechanisms: [],
      cards: {
        combat: [
          ...copies(12, card('闪光拳！', 2, '近战', ['连击'], ['使用后 本回合内同名卡牌拼点威力+1(至多+3)'], [d('打击', 5, 10), d('打击', 5, 9), d('打击', 4, 9)])),
        ],
        special: [
          card('莉莉雅，让我们使用组合拳！', 3, '群体攻击', ['攻击容量:4', '清算'], ['使用后 本回合内被动能力“超级英雄::闪击光拳”的触发概率固定为100%'], [d('打击', 14, 23, '', ['命中时 追加4点混乱伤害2次'])], { prefix: 'V.' }),
        ],
        ego: [], modules: [], energy: [],
      },
      systemData: {},
    },
  },
]

const APPLY = process.argv.includes('--apply')
const db = new Database('backend/data/library.db')
const FLOOR_ID = 7
const exists = db.prepare('SELECT id, name FROM librarians WHERE floorId = ? AND name = ?')
const ins = db.prepare(
  `INSERT INTO librarians (name, title, department, role, floorId, rarity, coreColor, affiliation, status, description, sheet, portrait, portraitPreview, sortOrder)
   VALUES (@name, @title, 'turris', 'curator', ${FLOOR_ID}, '', 'neutral', @affiliation, '在任', '', @sheet, '', '', @sortOrder)`,
)
let inserted = 0
let skipped = 0
for (const u of UNITS) {
  if (exists.get(FLOOR_ID, u.name)) {
    console.log(`[跳过] ${u.name} 已存在于零号层`)
    skipped++
    continue
  }
  const sheetJson = JSON.stringify(u.sheet)
  const s = u.sheet
  const nCards = s.cards.combat.length + s.cards.special.length
  console.log(`[将插入] ${u.name}（${u.title}）体力${s.hp} 被动${s.passives.length} 机制${s.mechanisms.length} 战斗卡${s.cards.combat.length} 特殊卡${s.cards.special.length}`)
  if (APPLY) {
    ins.run({ name: u.name, title: u.title, affiliation: u.affiliation, sheet: sheetJson, sortOrder: u.sortOrder })
    inserted++
  }
}
console.log(APPLY ? `完成：插入 ${inserted}，跳过 ${skipped}` : `（干跑）将插入 ${UNITS.length - skipped} 名，加 --apply 执行写入`)
db.close()
