import { fileURLToPath } from 'node:url'

export const PORT = Number(process.env.PORT ?? 3000)
export const HOST = process.env.HOST ?? '0.0.0.0'

// 写操作访问令牌（局域网多人形态的最小防线）：所有非 GET 的 /api/* 请求必须携带
// `x-rtl-key: <RTL_TOKEN>` 请求头，否则 401。默认值仅作开箱即用，正式部署请用
// 环境变量覆盖；前端经 VITE_RTL_KEY 配同一值（api.ts 自动附头）。
export const RTL_TOKEN = process.env.RTL_TOKEN ?? 'reliq-2026'

export const DATA_DIR = fileURLToPath(new URL('../../data', import.meta.url))
export const DB_PATH = fileURLToPath(new URL('../../data/library.db', import.meta.url))

// 由后端管理的上传/AI 生成图目录（前端只引用 /art/... URL，走后端静态服务，不进 Vite 打包）
export const ART_DIR = fileURLToPath(new URL('../../../frontend/public/art', import.meta.url))
