import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import { HOST, PORT } from './config/index.js'
import { registerRoutes } from './routes/index.js'
import { exportSnapshot } from './db/seedExport.js'

// bodyLimit 调大：PVZ 图片走 JSON body 的 base64（base64 体积 ≈ 原图 4/3），
// Fastify 默认 1MB 会把大图上传拒成 413。
const app = Fastify({ logger: true, bodyLimit: 25 * 1024 * 1024 })

await app.register(cors, { origin: true })
await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } })
await registerRoutes(app)

// 启动时同步一次快照：让 db-snapshot.json 在任何写操作发生前就与库对齐。
// 此前"重启自动更新快照"从未生效——启动流程里根本没有调用 exportSnapshot，
// 快照只在写操作 onResponse 钩子（routes/index.ts）触发，启动即覆盖的路径缺失。
try {
  const r = exportSnapshot()
  app.log.info(`[backup] 启动时快照已生成 → db-snapshot.json（version ${r.version}，${r.tables} 表 ${r.rows} 行）`)
} catch (err) {
  // 快照失败不能阻断启动（库可能尚未建表/为空），仅记录。
  app.log.error(`[backup] 启动时快照生成失败（不影响服务启动）：${err instanceof Error ? err.message : String(err)}`)
}

try {
  await app.listen({ port: PORT, host: HOST })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
