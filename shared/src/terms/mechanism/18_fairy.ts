export const fairyMechanics = [
    {
        name: '妖精气场',
        desc: '[气场] 妖精属性卡牌造成的伤害x1.3',
        type: '气场',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#00FFFF' }
    },
    {
        name: '薄雾场地',
        desc: '[场地] 龙属性卡牌造成的伤害x0.5；所有单位不会陷入负面异常状态',
        type: '场地',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#00FFFF' }
    },
    {
        name: '着迷',
        desc: '负面状态 2回合内跟异性拼点时有75%的概率无法行动',
        type: '负面状态',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#EF70EF' }
    },
    {
        name: '鲜红雨滴',
        desc: '标记 随机附着于手牌之上，装备被标记的卡牌时受到X点伤害并清除所有鲜红雨滴；使用非标记卡牌时X-1',
        type: '标记',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#FF0000' }
    }
]