export const bugMechanics = [
    {
        name: '黏黏网',
        desc: '[场地] [单向] [常驻] 替换出场的单位被施加2层束缚',
        type: '场地',
        format: { color: '#70AD47' }
    },
    {
        name: '集火',
        desc: '负面状态 被击中时所受伤害与混乱伤害+50%',
        type: '负面状态',
        format: { color: '#FF0000' }
    },
    {
        name: '流血',
        desc: '负面状态 这一回合中每投掷一颗骰子便承受X点伤害...',
        type: '负面状态',
        hasParam: true,
        format: { color: '#C00000' }
    },
    {
        name: '潜伏之血',
        desc: '[场地] [常驻] 记录场地内所有单位受到的流血伤害...',
        type: '场地',
        format: { color: '#8B0000' }
    },
    {
        name: '血宴',
        desc: '中立状态 特定卡牌发动附加效果所需的资源...',
        type: '中立状态',
        hasParam: true,
        format: { color: '#8B0000' }
    },
    {
        name: '消耗血宴总数',
        desc: '中立状态 记录在该舞台某单位消耗的血宴数量',
        type: '中立状态',
        hasParam: true,
        format: { color: '#8B0000' }
    },
    {
        name: '共用消耗血宴总数',
        desc: '中立状态 记录在该舞台所有单位消耗的血宴数量',
        type: '中立状态',
        hasParam: true,
        format: { color: '#8B0000' }
    },
    {
        name: '吸血',
        desc: '正面状态 造成伤害时恢复X点体力',
        type: '正面状态',
        hasParam: true,
        format: { color: '#00B050' }
    },
    {
        name: '尖钉',
        desc: '负面状态 特殊流血；每回合结束时获得X层流血，随后层数减半',
        type: '负面状态',
        hasParam: true,
        format: { color: '#C00000' }
    },
    {
        name: '自助餐',
        desc: '能力 若友方单位内有上位影族，则阵亡时被所有上位影族吞食X次',
        type: '能力',
        hasParam: true,
        format: { color: '#FFC000' }
    },
    {
        name: '吞食',
        desc: '正面状态 立刻恢复X点体力，溢出的恢复量将转化为等量的力量与格挡',
        type: '正面状态',
        hasParam: true,
        format: { color: '#00B050' }
    },
    {
        name: '合金燃料',
        desc: '中立状态 X回合开始时解除自身的所有负面状态，触发吞食时层数+1',
        type: '中立状态',
        hasParam: true,
        format: { color: '#808080' }
    },
    {
        name: '重塑',
        desc: '正面状态 该回合结束时，使随机X名放逐区的友方单位复活',
        type: '正面状态',
        hasParam: true,
        format: { color: '#7030A0' }
    },
    {
        name: '燃命',
        desc: '负面状态 X回合后阵亡',
        type: '负面状态',
        hasParam: true,
        format: { color: '#FF0000' }
    },
    {
        name: '召唤',
        desc: '正面状态 该回合结束时，所有召唤物的体力上限+X',
        type: '正面状态',
        hasParam: true,
        format: { color: '#70AD47' }
    },
    {
        name: '爪牙',
        desc: '能力 持有该状态的召唤物阵亡不算做被击杀...',
        type: '能力',
        format: { color: '#FFC000' }
    }
]