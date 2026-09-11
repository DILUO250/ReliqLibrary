export const ghostMechanics = [
    {
        name: '神经',
        desc: '负面状态 受到攻击时追加X点幽灵元素伤害...元素爆发后"眩晕"且获得凝视',
        type: '负面状态',
        hasParam: true,
        format: { color: '#7030A0' }
    },
    {
        name: '月笼',
        desc: '正面状态 累积3层后，下一次攻击必定暴击',
        type: '正面状态',
        hasParam: true,
        format: { color: '#C0C0FF' }
    },
    {
        name: '月感电',
        desc: '反应 元素反应 电磁&水蚀，使所有带有电磁/水蚀的敌方单位受到相同的暴击伤害',
        type: '反应',
        format: { color: '#0DE3B8' }
    },
    {
        name: '月绽放',
        desc: '反应 元素反应 草种&水蚀，元素增幅 草原核&草露',
        type: '反应',
        format: { color: '#0DE3B8' }
    },
    {
        name: '月结晶',
        desc: '反应 元素反应 崩碎&水蚀...获得1层月笼与(伤害量)点屏障',
        type: '反应',
        format: { color: '#0DE3B8' }
    },
    {
        name: '凝视',
        desc: '负面状态 本回合内受到的突刺，打击伤害+20%...',
        type: '负面状态',
        format: { color: '#FF0000' }
    },
    {
        name: '狂信',
        desc: '正面状态 这一回合所有攻击最终伤害+2，理智值固定不会改变',
        type: '正面状态',
        format: { color: '#00B0F0' }
    },
    {
        name: '灾厄',
        desc: '负面状态 持有者每回合结束时若体力小于X，则立刻阵亡',
        type: '负面状态',
        hasParam: true,
        format: { color: '#000000' }
    },
    {
        name: '骤死',
        desc: '负面状态 达到100层时立刻阵亡',
        type: '负面状态',
        hasParam: true,
        format: { color: '#000000' }
    },
    {
        name: '无实体',
        desc: '正面状态 这一回合受到的所有伤害固定为1点',
        type: '正面状态',
        format: { color: '#808080' }
    },
    {
        name: '折射',
        desc: '正面状态 这一回合受到的法术伤害降低90%',
        type: '正面状态',
        format: { color: '#0070C0' }
    },
    {
        name: '晦',
        desc: '中立状态 无法与 明 同时存在...X回合内受到的伤害+50%，造成的暴击伤害+100%',
        type: '中立状态',
        hasParam: true,
        format: { color: '#404040' }
    },
    {
        name: '明',
        desc: '中立状态 无法与 晦 同时存在...X回合内受到的伤害-50%，无法造成暴击',
        type: '中立状态',
        hasParam: true,
        format: { color: '#FFD700' }
    }
]