export const rockMechanics = [
    {
        name: '隐形岩',
        desc: '[场地] [单向] [常驻] 替换出场的单位会受到25点岩石属性伤害',
        type: '场地',
        format: { color: '#F1A983' }
    },
    {
        name: '沙暴天',
        desc: '[天气] 岩石属性的单位受到的法术伤害与机制类伤害x0.5...',
        type: '天气',
        format: { color: '#F1A983' }
    },
    {
        name: '震颤',
        desc: '负面状态 受到 震颤引爆 时将X%的混乱上限转化为体力上限...',
        type: '负面状态',
        hasParam: true,
        format: { color: '#BF8F00' }
    },
    {
        name: '振幅转换',
        desc: '将目标的所有震颤转换为其他类型的震颤...',
        type: '特殊',
        format: { color: '#BF8F00' }
    },
    {
        name: '振幅纠缠',
        desc: '使目标这一回合进入震颤 - 叠加 状态...',
        type: '特殊',
        format: { color: '#7A5A00' }
    },
    {
        name: '震颤 - 叠加',
        desc: '负面状态 获得时，吸收持有者已有的震颤的被动效果...',
        type: '负面状态',
        format: { color: '#FF0000' }  // 双色暂取 #FF0000
    },
    {
        name: '震颤-崩坏',
        desc: '负面状态 特殊震颤；每有6层则使持有者受到的伤害+1...',
        type: '负面状态',
        hasParam: true,
        format: { color: '#7030A0' }
    },
    {
        name: '震颤-裂痕',
        desc: '负面状态 特殊震颤；持有者陷入混乱时...',
        type: '负面状态',
        hasParam: true,
        format: { color: '#FF0000' }
    },
    {
        name: '震颤-回响',
        desc: '负面状态 特殊震颤；受到 震颤引爆 时...额外受到X点伤害',
        type: '负面状态',
        hasParam: true,
        format: { color: '#FFFF00' }
    },
    {
        name: '震颤-寸止',
        desc: '负面状态 特殊震颤；持有者被反震时将受到理智伤害...',
        type: '负面状态',
        hasParam: true,
        format: { color: '#FF1493' }
    },
    {
        name: '震颤-锁链',
        desc: '负面状态 特殊震颤；每有10层则使持有者拼点威力-1...',
        type: '负面状态',
        hasParam: true,
        format: { color: '#00B0F0' }
    },
    {
        name: '震颤-永恒',
        desc: '负面状态 特殊震颤；...有X%的概率重复引爆1次',
        type: '负面状态',
        hasParam: true,
        format: { color: '#E8E8E8' }
    },
    {
        name: '震颤-分配',
        desc: '负面状态 特殊震颤；持有者造成的伤害+(全体友方单位震颤层数之和/友方单位存活数)...',
        type: '负面状态',
        hasParam: true,
        format: { color: '#0A2F41' }
    },
    {
        name: '震颤-上弦',
        desc: '负面状态 特殊震颤；持有者最大速度值+2...',
        type: '负面状态',
        hasParam: true,
        format: { color: '#00B050' }
    },
    {
        name: '震颤-灼热',
        desc: '负面状态 特殊震颤；...额外受到(自身的震颤与烧伤层数之和/2)点烧伤伤害',
        type: '负面状态',
        hasParam: true,
        format: { color: '#FFC000' }
    },
    {
        name: '震颤-大出血',
        desc: '负面状态 特殊震颤；...额外受到(自身的震颤与流血层数之和/2)点流血伤害',
        type: '负面状态',
        hasParam: true,
        format: { color: '#C00000' }
    },
    {
        name: '崩碎',
        desc: '负面状态 受到攻击时追加Y点岩石元素伤害...',
        type: '负面状态',
        hasParam: true,
        format: { color: '#A5A5A5' }
    },
    {
        name: '结晶',
        desc: '反应 元素反应 灼燃/电磁/水蚀/霜寒...',
        type: '反应',
        format: { color: '#0DE3B8' }
    }
]