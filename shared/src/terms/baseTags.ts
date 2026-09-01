export const baseTags = [
    {
        name: '交锋',
        desc: '群体卡牌依次对敌方战斗卡牌上的每颗骰子进行拼点判定，若拼点成功则摧毁该骰子并造成伤害',
        format: { textDecoration: 'underline', textDecorationStyle: 'dotted' }
    },
    {
        name: '清算',
        desc: '群体卡牌对敌方战斗卡牌的所有骰子计算总和并进行拼点判定，若拼点成功则摧毁该卡牌并造成伤害',
        format: { textDecoration: 'underline', textDecorationStyle: 'dotted' }
    },
    {
        name: '攻击容量',
        desc: '带有该标签的卡牌将拼点的敌方速度骰子视为“主要目标”并会选择多名“次要目标”，对主要目标造成伤害时会同时对次要目标造成伤害。',
        hasParam: true,
        format: { textDecoration: 'underline', textDecorationStyle: 'dotted' }
    },
    {
        name: '消耗',
        desc: '使用消耗卡牌后将其移入放逐区',
        format: { textDecoration: 'underline', textDecorationStyle: 'dotted' }
    },
    {
        name: '虚无',
        desc: '该回合结束时若虚无卡牌处于手牌堆，则将其移入放逐区',
        format: { textDecoration: 'underline', textDecorationStyle: 'dotted' }
    },
    {
        name: '丢弃',
        desc: '该回合结束时若丢弃卡牌处于手牌堆，则将其移入弃牌堆',
        format: { textDecoration: 'underline', textDecorationStyle: 'dotted' }
    },
    {
        name: '禁用',
        desc: '禁用卡牌无法被装备',
        format: { textDecoration: 'underline', textDecorationStyle: 'dotted' }
    },
    {
        name: '固有',
        desc: '舞台开启时，固有卡牌将被直接置入手牌堆',
        format: { textDecoration: 'underline', textDecorationStyle: 'dotted' }
    },
    {
        name: '保留',
        desc: '保留卡牌每回合结束时不会被自动丢弃',
        format: { textDecoration: 'underline', textDecorationStyle: 'dotted' }
    }
]