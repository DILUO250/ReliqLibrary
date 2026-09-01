export const steelMechanics = [
    {
        name: '金属化',
        desc: '正面状态 战斗开始时获得X层格挡',
        type: '正面状态',
        hasParam: true,
        format: { color: '#808080' }
    },
    {
        name: '多重护甲',
        desc: '正面状态 战斗开始时获得X层格挡，受到伤害时层数-1',
        type: '正面状态',
        hasParam: true,
        format: { color: '#808080' }
    },
    {
        name: '覆甲',
        desc: '正面状态 X回合内，战斗开始时获得X层格挡',
        type: '正面状态',
        hasParam: true,
        format: { color: '#808080' }
    },
    {
        name: '格挡',
        desc: '正面状态 这一回合中受到伤害时抵消X点伤害，被抵消的伤害视作被招架',
        type: '正面状态',
        hasParam: true,
        format: { color: '#00B0F0' }
    },
    {
        name: '人工制品',
        desc: '正面状态 抵御下X次受到的负面状态',
        type: '正面状态',
        hasParam: true,
        format: { color: '#FFC000' }
    },
    {
        name: '壁垒',
        desc: '正面状态 这一回合结束时格挡不会消失',
        type: '正面状态',
        format: { color: '#00B0F0' }
    },
    {
        name: '挑衅值',
        desc: '正面状态 这一回合这颗速度骰子被指定为攻击目标的概率+X*10%',
        type: '正面状态',
        hasParam: true,
        format: { color: '#FF0000' }
    },
    {
        name: '弹药',
        desc: '中立状态 部分骰子进行攻击或卡牌发动特效时消耗的资源...',
        type: '中立状态',
        hasParam: true,
        format: { color: '#808080' }
    },
    {
        name: '锻造',
        desc: '正面状态 某附属单位的效果+X',
        type: '正面状态',
        hasParam: true,
        format: { color: '#FFC000' }
    }
]