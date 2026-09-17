import { onBeforeUnmount, onMounted } from 'vue'

/**
 * 打印页设定（@page size/margins）只能全局生效且无法被 :has 守卫——
 * 一旦常驻 CSS 加载，全站任何页面的打印都会被强制 A4 零边距。
 * 因此只在纸面页挂载期间动态注入 <style>，卸载即移除。
 * （shared/paper：跨模块通用机制，各模块纸面共用。）
 */
export function usePrintPageStyle(): void {
  const STYLE_ID = 'paper-print-page'
  onMounted(() => {
    if (document.getElementById(STYLE_ID)) return
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = '@page { size: A4; margin: 0; }'
    document.head.appendChild(style)
  })
  onBeforeUnmount(() => {
    document.getElementById(STYLE_ID)?.remove()
  })
}
