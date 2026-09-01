export const darkMechanics = [
    {
        name: '暗黑气场',
        desc: '[气场] 恶属性卡牌造成的伤害x1.3',
        type: '气场',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#000000' }
    },
    {
        name: '仇恨氛围',
        desc: '[气场] 恶属性以外的单位造成的物理伤害降低为原本的75%',
        type: '气场',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#000000' }
    },
    {
        name: '恐惧氛围',
        desc: '[气场] 恶属性以外的单位造成的混乱伤害降低为原本的75%',
        type: '气场',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#000000' }
    },
    {
        name: '暴戾氛围',
        desc: '[气场] 恶属性以外的单位的所有物理抗性降低为原本的75%',
        type: '气场',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#000000' }
    },
    {
        name: '憎恶氛围',
        desc: '[气场] 恶属性以外的单位的所有混乱抗性降低为原本的75%',
        type: '气场',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#000000' }
    },
    {
        name: '凋亡',
        desc: '负面状态 受到攻击时追加X点恶元素伤害并将该层数减至2/3；元素爆发后失去6点费用，并获得2层虚弱直至元素爆发结束',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', textDecoration: 'underline', textDecorationStyle: 'thick', color: '#000000' }
    },
    {
        name: '激怒',
        desc: '负面状态 3回合内，只能使用近战与远程战斗卡牌',
        type: '负面状态',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#50413F' }
    },
    {
        name: '缴械',
        desc: '负面状态 3回合内，只能使用装备与变化战斗卡牌',
        type: '负面状态',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#50413F' }
    },
    {
        name: '无理取闹',
        desc: '负面状态 2回合内，不能同回合之间使出同样的卡牌',
        type: '负面状态',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#50413F' }
    },
    {
        name: '迷惑',
        desc: '负面状态 本回合内，使用书页时有60%的概率改变攻击目标为友方单位',
        type: '负面状态',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#50413F' }
    }
]