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

// ---- 服务端 PDF 导出（plans/paper-engine-promote-shared.md §导出请求路径）----
// 无头浏览器加载的前端 origin（/print 无 UI 打印路由的宿主）：
// 纸面渲染器在前端（SSOT），后端只负责驱动浏览器，所以必须先有前端 dev server 在线。
export const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://127.0.0.1:4290'
// 导出 PDF 暂存目录（UUID 命名 + TTL 过期清理，见 features/pdf/pdfPrinter.ts 侧约定）
export const EXPORT_CACHE_DIR = fileURLToPath(new URL('../../data/export-cache', import.meta.url))
// 暂存文件保留时长（ms）：导出是"临时文件"语义，过期即清，防止出现第二个无人认领的 _trash/
export const EXPORT_TTL_MS = Number(process.env.EXPORT_TTL_MS ?? 15 * 60 * 1000)
// 无头浏览器可执行文件路径（缺省自动探测本机 Chrome → Edge；双浏览器皆无或路径特殊时用 env 指定）
export const PDF_BROWSER_PATH = process.env.PDF_BROWSER_PATH ?? ''
