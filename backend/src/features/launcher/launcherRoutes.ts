/**
 * 域外书架 · launcher 接口（草稿 4.1 主页仪表盘化）：
 * 域外项目（external_projects 表）的「开馆 / 在馆探测 / 路径校验」三件事。
 *
 * 安全口径：launch 与 validate 操作的是本机任意脚本路径，等同写权限，
 * 必须过 x-rtl-key 门（POST 天然被 routes/index.ts 的全局 onRequest 钩子拦下，
 * 这里不再单独校验）；status 是 GET，不设防，但探测目标完全来自库内配置，
 * 无用户可控注入面。
 */
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, normalize } from 'node:path'
import type { FastifyInstance } from 'fastify'
import { getDb } from '../../db/index.js'

type IdParams = { id: string }

interface ExternalProjectRow {
  id: number
  name: string
  launchPath: string
  url: string
}

function getProject(id: string): ExternalProjectRow | undefined {
  return getDb()
    .prepare('SELECT id, name, launchPath, url FROM external_projects WHERE id = ?')
    .get(id) as ExternalProjectRow | undefined
}

/** 对项目 url 做短超时探测：2 秒内任何 HTTP 响应（含 4xx/5xx）都算"在馆"。 */
async function probe(url: string): Promise<boolean> {
  try {
    await fetch(url, { signal: AbortSignal.timeout(2000) })
    return true
  } catch {
    return false
  }
}

export async function registerLauncherRoutes(app: FastifyInstance): Promise<void> {
  // 开馆：分离模式拉起启动脚本，立即返回不等进程。
  // cmd /c start 让 .bat 走系统关联的打开方式（新窗口），detached + unref
  // 保证父进程（后端）退出不牵连子项目。
  app.post('/api/launcher/launch/:id', async (req, reply) => {
    const { id } = req.params as IdParams
    const project = getProject(id)
    if (!project) return reply.code(404).send({ error: '域外项目不存在' })
    if (!project.launchPath) return reply.code(400).send({ error: '该项目未配置启动脚本' })
    // normalize：用户可能粘正斜杠路径（D:/x/y.bat），win32 下统一归一成反斜杠再交给 cmd
    const scriptPath = normalize(project.launchPath)
    if (!existsSync(scriptPath)) {
      return reply.code(400).send({ error: `启动脚本不存在：${scriptPath}` })
    }
    try {
      // 不用 windowsHide：启动的项目的控制台窗口要可见（用户看得到日志与报错）
      const child = spawn('cmd.exe', ['/c', 'start', '', scriptPath], {
        detached: true,
        stdio: 'ignore',
        cwd: dirname(scriptPath),
      })
      child.unref()
    } catch (e) {
      return reply.code(500).send({ error: `开馆失败：${e instanceof Error ? e.message : 'unknown'}` })
    }
    return { ok: true, name: project.name }
  })

  // 在馆探测：url 未配置 → running: null（前端不显示在馆状态，纸条上注明）。
  app.get('/api/launcher/status/:id', async (req, reply) => {
    const { id } = req.params as IdParams
    const project = getProject(id)
    if (!project) return reply.code(404).send({ error: '域外项目不存在' })
    if (!project.url) return { running: null }
    return { running: await probe(project.url) }
  })

  // 路径校验（收录/编辑弹窗的「校验路径」按钮）：只做存在性判断，不做磁盘浏览。
  app.post('/api/launcher/validate', async (req, reply) => {
    const body = (req.body ?? {}) as { path?: unknown }
    if (typeof body.path !== 'string' || body.path.trim() === '') {
      return reply.code(400).send({ error: '缺少 path' })
    }
    return { exists: existsSync(normalize(body.path)) }
  })
}
