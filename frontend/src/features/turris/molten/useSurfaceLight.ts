import { onBeforeUnmount, onMounted, ref } from 'vue'

/** 根据当前主题表面亮度选择术语渲染器的明暗字色规则。 */
export function useSurfaceLight() {
  const onLight = ref(false)
  let observer: MutationObserver | null = null

  function update(): void {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim()
    const values = raw.match(/[\d.]+/g)?.map(Number) ?? []
    if (raw.startsWith('#') && (raw.length === 7 || raw.length === 4)) {
      const hex = raw.length === 4 ? raw.slice(1).split('').map((c) => c + c).join('') : raw.slice(1)
      onLight.value = (parseInt(hex.slice(0, 2), 16) * .2126 + parseInt(hex.slice(2, 4), 16) * .7152 + parseInt(hex.slice(4, 6), 16) * .0722) > 150
    } else if (values.length >= 3) {
      onLight.value = (values[0]! * .2126 + values[1]! * .7152 + values[2]! * .0722) > 150
    }
  }

  onMounted(() => {
    update()
    observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-color', 'data-design'] })
  })
  onBeforeUnmount(() => observer?.disconnect())
  return { onLight }
}
