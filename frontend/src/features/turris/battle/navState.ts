import { ref } from 'vue'

/**
 * 战斗进行中临时隐藏全站 SiteNav 的开关。
 * 战斗舞台是 fixed 全屏（1280×720 等比缩放），顶部演出会被 62px 导航遮挡，
 * 因此进入战斗/结算阶段时置 true，回到选人或离开页面时置 false。
 */
export const battleNavHidden = ref(false)
