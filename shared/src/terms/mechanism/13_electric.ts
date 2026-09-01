export const electricMechanics = [
    {
        name: '电气场地',
        desc: '[场地] 电属性卡牌造成的伤害x1.3；所有单位获得的电属性状态层数+1，所有单位不会陷入睡眠状态',
        type: '场地',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#FFC000' }
    },
    {
        name: '充能',
        desc: '中立状态 特定卡牌发动附加效果所需的资源，默认最大10层',
        type: '中立状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', textDecoration: 'underline', textDecorationStyle: 'thick', color: '#7030A0' }
    },
    {
        name: '电磁',
        desc: '负面状态 受到攻击时追加X点电元素伤害并将该层数减至2/3；元素爆发后受到10点法术伤害并永久获得1层法术易损',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', textDecoration: 'underline', textDecorationStyle: 'thick', color: '#FBC008' }
    },
    {
        name: '电磁爆发',
        desc: '反应 元素增幅 电磁；命中时追加10点电元素伤害',
        type: '反应',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#FBC008' }
    },
    {
        name: '超载',
        desc: '反应 元素反应 灼燃，使本次攻击容量+2',
        type: '反应',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#FF4E4E' }
    },
    {
        name: '超绽放',
        desc: '反应 元素反应 草原核，使本次攻击追加(骰子基础值)点草元素伤害',
        type: '反应',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#B34EFF' }
    },
    {
        name: '超激化',
        desc: '反应 元素反应 草种，使本次攻击获得65%的暴击率',
        type: '反应',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#B34EFF' }
    },
    {
        name: '麻痹',
        desc: '负面状态 这一回合中至多X颗骰子最大值-3',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', textDecoration: 'underline', textDecorationStyle: 'thick', color: '#F4D03F' }
    },
    {
        name: '痉挛',
        desc: '负面状态 与电属性异常状态共同存在；速度骰子的速度减半',
        type: '负面状态',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#FAC000' }
    },
    {
        name: '集中',
        desc: '正面状态 所有附属单位效果+X',
        type: '正面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#A02B93' }
    },
    {
        name: '次元裂痕',
        desc: '负面状态 这回合结束时获得X层破裂',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#7030A0' }
    },
    {
        name: '充能力场',
        desc: '正面状态 获得(X*3)点屏障，每失去3点屏障则使该层数-1；该回合结束时解除所有屏障并获得X层充能',
        type: '正面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#7030A0' }
    },
    {
        name: '负荷',
        desc: '正面状态 这一回合使用的充能关键词卡牌伤害+X*2.5%(至多+15%)',
        type: '正面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#7030A0' }
    },
    {
        name: '电流释放',
        desc: '正面状态 抵消X次受到的致命伤害并在触发时获得2层充能、对伤害来源立刻施加1层破裂',
        type: '正面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#7030A0' }
    },
    {
        name: '数据乱流',
        desc: '负面状态 每回合开始时随机获得X层(烧伤/流血/破裂/沉沦)，随后层数减少至2/3',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#7030A0' }
    },
    {
        name: '小黄鸭',
        desc: '负面状态 这一回合中持有小黄鸭的单位被攻击时，所有持有小黄鸭的单位获得X层数据乱流',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#FAC000' }
    },
    {
        name: '入侵',
        desc: '负面状态 仅对【机械融合生命体】生效；完成【入侵矩阵】小游戏后，根据结果施加对应层数的入侵并受到对应伤害；累积100层后，消耗所有层数进入破解状态',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#FFFF00' }
    },
    {
        name: '破解',
        desc: '负面状态 仅对【机械融合生命体】生效；这一回合所有混乱抗性+0.6，受到伤害时追加1~3点高热',
        type: '负面状态',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#FFFF00' }
    },
    {
        name: '高热',
        desc: '负面状态 仅对【机械融合生命体】生效；累积到50点时立刻陷入混乱，每回合结束时层数-2~4',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#FFFF00' }
    }
]