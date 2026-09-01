import { fileURLToPath } from 'node:url'

export const PORT = Number(process.env.PORT ?? 3000)
export const HOST = process.env.HOST ?? '0.0.0.0'

export const DATA_DIR = fileURLToPath(new URL('../../data', import.meta.url))
export const DB_PATH = fileURLToPath(new URL('../../data/library.db', import.meta.url))

// 由后端管理的上传/AI 生成图目录（前端只引用 /art/... URL，走后端静态服务，不进 Vite 打包）
export const ART_DIR = fileURLToPath(new URL('../../../frontend/public/art', import.meta.url))
