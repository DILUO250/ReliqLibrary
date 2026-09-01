export const grassMechanics = [
    {
        name: '湿地',
        desc: '[场地] [单向] [叠加] 所有速度骰子速度值降低至原本的25%',
        type: '场地',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#3A7C22' }
    },
    {
        name: '青草场地',
        desc: '[场地] 草属性卡牌造成的伤害x1.3；所有单位获得的草属性状态层数+1，每回合结束时所有单位恢复上限6.25%的体力',
        type: '场地',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#3A7C22' }
    },
    {
        name: '破裂',
        desc: '负面状态 受到攻击时额外受到X点伤害并将该层数减至2/3',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', textDecoration: 'underline', textDecorationStyle: 'thick', color: '#BFBFBF' }
    },
    {
        name: '咒杀',
        desc: '负面状态 特殊破裂；被施加咒杀状态时获得1个基础值计数，满足条件时使对应咒杀的计数-1，减至0时立刻受到1次(持有者破裂层数)点破裂伤害，并同时受到咒杀的特殊效果',
        type: '负面状态',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#000000' }
    },
    {
        name: '咒杀【迅捷】',
        desc: '负面状态 咒杀3: 受到速度值不低于6点的攻击 -> 获得10层破裂',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#FFC000' }
    },
    {
        name: '咒杀【剧毒】',
        desc: '负面状态 咒杀5: 受到暴击攻击 -> 获得2层无力与易伤',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#F1A9E7' }
    },
    {
        name: '咒杀【弱化】',
        desc: '负面状态 咒杀5: 受到速度值高于自身至少3点的攻击 -> 获得3层易伤与1层束缚',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#AD52EE' }
    },
    {
        name: '咒杀【勿动】',
        desc: '负面状态 咒杀4: 持有者被累积施加3层束缚 -> 受到(持有者破裂层数)点混乱伤害',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#E0D4C4' }
    },
    {
        name: '咒杀【血爆】',
        desc: '负面状态 咒杀3：持有者受到体力比例低于自身的目标攻击 -> 受到(持有者烧伤层数)点破裂伤害',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#EE0000' }
    },
    {
        name: '咒杀【掣肘】',
        desc: '负面状态 咒杀10: 其他咒杀的计数-1 -> 获得2层虚弱',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#039FDD' }
    },
    {
        name: '咒杀【衰亡】',
        desc: '负面状态 咒杀4: 施加者触发破裂 -> 使持有者所有咒杀的计数-1',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#5E3325' }
    },
    {
        name: '咒杀【破】',
        desc: '负面状态 咒杀3: 持有者的破裂被触发 -> 受到(持有者破裂层数)点真实伤害',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#E27E02' }
    },
    {
        name: '草种',
        desc: '负面状态 受到攻击时追加Y点草元素伤害并将该层数减至2/3；元素爆发后失去15点体力，并使所有敌方单位恢复等量体力',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', textDecoration: 'underline', textDecorationStyle: 'thick', color: '#3A7C22' }
    },
    {
        name: '蔓激化',
        desc: '反应 元素反应 电磁，使本次攻击获得85%的暴击率',
        type: '反应',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#619E7F' }
    },
    {
        name: '草原核',
        desc: '负面状态 下回合开始时受到X点草元素伤害',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#6CA588' }
    },
    {
        name: '草露',
        desc: '负面状态 下X次受到物理伤害时必定暴击',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#6CA588' }
    },
    {
        name: '屏障',
        desc: '正面状态 可以吸收X点体力条受到的伤害',
        type: '正面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', textDecoration: 'underline', textDecorationStyle: 'thick', color: '#00B0F0' }
    },
    {
        name: '荆棘屏障',
        desc: '正面状态 特殊屏障；持有时被攻击造成2-4点反伤',
        type: '正面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#00B0F0' }
    },
    {
        name: '体液屏障',
        desc: '正面状态 特殊屏障；持有时被攻击反施加1点混乱伤害/2点理智伤害/1层烟气',
        type: '正面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#FF1493' }
    },
    {
        name: '再生',
        desc: '正面状态 X回合结束时恢复X点体力',
        type: '正面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#4EA72E' }
    },
    {
        name: '荆棘',
        desc: '正面状态 这一回合中每次受到伤害，造成X点反伤',
        type: '正面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#000000' }
    },
    {
        name: '滋养',
        desc: '正面状态 下X次恢复体力时，获得1层力量与1层格挡',
        type: '正面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#3A7C22' }
    }
]