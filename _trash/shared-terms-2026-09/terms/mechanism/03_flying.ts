export const flyingMechanics = [
    {
        name: '起雾天',
        desc: '[天气] 所有攻击有30%的概率命中失败...',
        type: '天气',
        format: { fontWeight: 'bold', color: '#E59EDC' }
    },
    {
        name: '顺风',
        desc: '[场地] [单向] [叠加] 所有速度骰子速度值x2',
        type: '场地',
        format: { color: '#000000' }
    },
    {
        name: '德尔塔乱流',
        desc: '[天气] 飞行属性的弱点消失...',
        type: '天气',
        format: { fontWeight: 'bold', color: '#E59EDC' }
    },
    {
        name: '扩散',
        desc: '反应 元素反应 灼燃/电磁/水蚀/霜寒...',
        type: '反应',
        format: { color: '#0DE3B8' }
    },
    {
        name: '起飞',
        desc: '正面状态 在X回合内被视作空中单位',
        type: '正面状态',
        hasParam: true,
        format: { color: '#81B9EF' }
    },
    {
        name: '近地悬浮',
        desc: '正面状态 被视作空中单位；但被施加 晕头转向/眩晕/混乱 后失去该状态',
        type: '正面状态',
        format: { color: '#81B9EF' }
    },
    {
        name: '有翼飞行',
        desc: '正面状态 被视作空中单位；但同回合内被累计攻击8次后失去该状态',
        type: '正面状态',
        format: { color: '#81B9EF' }
    }
]