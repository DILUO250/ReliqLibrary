import { existsSync, mkdirSync, renameSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'
import { ART_DIR } from '../config/index.js'

const ART_PREFIX = '/art/'

/**
 * 把 ART_DIR 下某个被引用图片文件移入 _trash 回收目录（带时间戳前缀防重名）。
 * - 只接受受控的 /art/ 相对 URL，杜绝任意路径。
 * - 回收目标跟随素材所属模块：URL 含模块段（如 turris/）时移入 art/<模块>/_trash/，
 *   否则移入全局 art/_trash/。
 * - 移动失败时静默保留原文件，避免数据丢失。
 * 返回是否执行了回收。
 */
export function trashArt(url: unknown): boolean {
  if (typeof url !== 'string' || !url.startsWith(ART_PREFIX)) return false
  const rel = url.slice(ART_PREFIX.length).replace(/\\/g, '/')
  if (!rel || rel.includes('..')) return false
  const file = join(ART_DIR, ...rel.split('/'))
  if (!existsSync(file) || statSync(file).isDirectory()) return false
  try {
    const segments = rel.split('/')
    // 首段为模块目录（且非回收站本身）时，回收进该模块自己的 _trash
    const moduleDir = segments.length > 1 && segments[0] !== '_trash' ? segments[0] : ''
    const trashDir = moduleDir ? join(ART_DIR, moduleDir, '_trash') : join(ART_DIR, '_trash')
    mkdirSync(trashDir, { recursive: true })
    renameSync(file, join(trashDir, `${Date.now()}_${basename(file)}`))
    return true
  } catch {
    return false
  }
}
