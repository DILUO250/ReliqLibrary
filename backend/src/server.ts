import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import { HOST, PORT } from './config/index.js'
import { registerRoutes } from './routes/index.js'

const app = Fastify({ logger: true })

await app.register(cors, { origin: true })
await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } })
await registerRoutes(app)

try {
  await app.listen({ port: PORT, host: HOST })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
