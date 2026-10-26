/**
 * 遗迹图书馆 · 迎书楼战斗模拟器 v1（随机源）
 *
 * 引擎不直接调 Math.random，而是依赖注入的 Rng，便于：
 *   - 默认用 Math.random 跑真随机；
 *   - 无头脚本 / 单测注入定值序列，验证数百场不异常。
 */

import type { Rng } from './types.js'

function int(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i] as T
    arr[i] = arr[j] as T
    arr[j] = tmp
  }
  return arr
}

/** 默认随机源（真随机）。 */
export const defaultRng: Rng = { int, pick, shuffle }

/**
 * 定值随机源：按调用顺序吐出预设的 [0,1) 序列（多用于测试/无头脚本）。
 * 未耗尽时循环复用。
 */
export function seqRng(seed: readonly number[]): Rng {
  const vals = seed.length ? [...seed] : [0.5]
  let i = 0
  const next = (): number => {
    const v = vals[i % vals.length] as number
    i++
    return v
  }
  return {
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    pick: (arr) => arr[Math.floor(next() * arr.length)] as never,
    shuffle: (arr) => {
      for (let k = arr.length - 1; k > 0; k--) {
        const j = Math.floor(next() * (k + 1))
        const tmp = arr[k] as never
        arr[k] = arr[j] as never
        arr[j] = tmp
      }
      return arr
    },
  }
}
