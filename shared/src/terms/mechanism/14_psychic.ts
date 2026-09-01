export const psychicMechanics = [
    {
        name: '戏法空间',
        desc: '[空间] 速度关系倒置，低速度值速度骰子可拦截高速度值速度骰子，且低速度值优先行动',
        type: '空间',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#EF5B9C' }
    },
    {
        name: '魔法空间',
        desc: '[空间] 所有单位无法使用【特殊卡牌】与【EGO卡牌】',
        type: '空间',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#EF5B9C' }
    },
    {
        name: '奇妙空间',
        desc: '[空间] 所有单位的伤害抗性变为(2.0-现有抗性数值)',
        type: '空间',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#EF5B9C' }
    },
    {
        name: '重力空间',
        desc: '[空间] 所有闪避骰子威力-2，所有空中单位被视作地面单位',
        type: '空间',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#EF5B9C' }
    },
    {
        name: '神秘守护',
        desc: '[场地] [单向] [叠加] 不会被施加负面状态',
        type: '场地',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#EF5B9C' }
    },
    {
        name: '光墙',
        desc: '[场地] [单向] [叠加] 受到的法术伤害x0.5',
        type: '场地',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#EF5B9C' }
    },
    {
        name: '反射壁',
        desc: '[场地] [单向] [叠加] 受到的近战伤害与远程伤害x0.5',
        type: '场地',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#EF5B9C' }
    },
    {
        name: '精神场地',
        desc: '[场地] 超能属性卡牌造成的伤害x1.3；所有卡牌先制度固定为0',
        type: '场地',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#EF5B9C' }
    },
    {
        name: '魔力',
        desc: '中立状态 特定卡牌发动附加效果所需的资源，默认最大10层，舞台开启时恢复至上限；撤回备战区内每回合恢复2层',
        type: '中立状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', textDecoration: 'underline', textDecorationStyle: 'thick', color: '#7030A0' }
    },
    {
        name: '星辉',
        desc: '中立状态 独立于费用的另一种资源，部分卡牌同时需要星辉与费用才能使用',
        type: '中立状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', textDecoration: 'underline', textDecorationStyle: 'solid', color: '#60CAF3' }
    },
    {
        name: '瞌睡',
        desc: '负面状态 达到20层时，消耗所有层数获得睡眠',
        type: '负面状态',
        hasParam: true,
        format: { fontWeight: 'bold', fontStyle: 'italic', textDecoration: 'underline', textDecorationStyle: 'thick', color: '#FF69B4' }
    },
    {
        name: '睡眠',
        desc: '负面状态 2~5回合内无法行动，所有的负面状态清空',
        type: '负面状态',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#EF4179' }
    },
    {
        name: '狂咒',
        desc: '负面状态 这一回合内每使用1张卡牌则往弃牌堆加入1张【抓狂】',
        type: '负面状态',
        format: { fontWeight: 'bold', fontStyle: 'italic', color: '#0070C0' }
    }
]