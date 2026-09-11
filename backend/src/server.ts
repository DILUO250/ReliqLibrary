import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import { HOST, PORT } from './config/index.js'
import { registerRoutes } from './routes/index.js'

// bodyLimit 调大：PVZ 图片走 JSON body 的 base64（base64 体积 ≈ 原图 4/3），
// Fastify 默认 1MB 会把大图上传拒成 413。
const app = Fastify({ logger: true, bodyLimit: 25 * 1024 * 1024 })

await app.register(cors, { origin: true })
await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } })
await registerRoutes(app)

try {
  await app.listen({ port: PORT, host: HOST })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
