// PVZ 静态素材路径映射。
// 静态素材位于 frontend/public/features/armarium/projects/pvzwiki/assets/，
// 而 DB / 后端接口里统一存储旧版 /assets/... 形式的相对路径，由此模块换算。
const PVZ_ASSET_PREFIX = '/features/armarium/projects/pvzwiki/assets'

/** 通用素材路径：/assets/<rest> → PVZ 素材目录下的同名资源（图鉴背景等）。 */
export function pvzAsset(path: string): string {
  if (!path.startsWith('/assets/')) return path
  return `${PVZ_ASSET_PREFIX}/${path.slice('/assets/'.length)}`
}

/** 植物图片路径（DB image / wikiFull / familyIcon 等）：
 *  - /assets/wikicon/*               → assets/image/plants/icon/*（家族图标，原 wikicon 已并入）
 *  - /assets/image/plants/full|custom/* → assets/image/plants/full/*（高清大图，原 custom 已并入 full）
 *  - /assets/image/plants/*          → assets/image/plants/card/*（卡片图，如 plants_xxx_c.webp）
 *  - 其余（/art/... 等）原样返回。 */
export function pvzImagePath(path: string): string {
  if (!path.startsWith('/assets/')) return path
  if (path.startsWith('/assets/wikicon/')) {
    return `${PVZ_ASSET_PREFIX}/image/plants/icon/${path.slice('/assets/wikicon/'.length)}`
  }
  if (path.startsWith('/assets/image/plants/full/') || path.startsWith('/assets/image/plants/custom/')) {
    const name = path.slice(path.lastIndexOf('/') + 1)
    return `${PVZ_ASSET_PREFIX}/image/plants/full/${name}`
  }
  if (path.startsWith('/assets/image/plants/')) {
    return `${PVZ_ASSET_PREFIX}/image/plants/card/${path.slice('/assets/image/plants/'.length)}`
  }
  return pvzAsset(path)
}
