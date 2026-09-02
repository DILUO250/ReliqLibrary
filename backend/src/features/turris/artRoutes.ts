import type { FastifyInstance } from 'fastify'
import { execFile } from 'node:child_process'
import { createWriteStream, mkdirSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import { promisify } from 'node:util'
import { ART_DIR } from '../../config/index.js'

const execFileP = promisify(execFile)

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif'])

// 迎书楼用户素材目录：司书全图 / 司书缩略图 / 楼层背景图，各自独立存放（对齐 features/ 分模块逻辑）
const TURRIS_DIRS = {
  portrait: 'librarian-portraits',
  preview: 'librarian-previews',
  floor: 'floors',
} as const

type UploadKind = keyof typeof TURRIS_DIRS

function turrisDir(kind: UploadKind): string {
  return join(ART_DIR, 'turris', TURRIS_DIRS[kind])
}

function slugify(input: string): string {
  return (
    input
      .replace(/[^\w\u4e00-\u9fa5-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'asset'
  )
}

function runArk(args: string[]): Promise<string> {
  return execFileP('arkcli', args, {
    shell: 'powershell.exe',
    windowsHide: true,
    maxBuffer: 10 * 1024 * 1024,
  }).then((r) => r.stdout)
}

export async function registerTurrisArtRoutes(app: FastifyInstance): Promise<void> {
  // 迎书楼素材上传：kind=portrait(司书全图) | preview(司书缩略图) | floor(楼层背景)
  app.post('/api/turris/upload', async (req, reply) => {
    const kind = ((req.query as { kind?: string }).kind ?? '') as UploadKind
    if (!(kind in TURRIS_DIRS)) {
      return reply.code(400).send({ error: 'kind must be portrait | preview | floor' })
    }
    const dir = turrisDir(kind)
    mkdirSync(dir, { recursive: true })
    const parts = req.parts()
    for await (const part of parts) {
      if (part.type !== 'file') continue
      const ext = extname(part.filename ?? '').toLowerCase()
      if (!IMAGE_EXT.has(ext)) {
        return reply.code(400).send({ error: `unsupported image type ${ext || '(none)'}` })
      }
      const name = `${Date.now()}-${slugify(basename(part.filename ?? '', ext))}${ext}`
      const dest = join(dir, name)
      await new Promise<void>((resolve, reject) => {
        const ws = createWriteStream(dest)
        part.file.on('error', reject)
        ws.on('error', reject)
        ws.on('finish', resolve)
        part.file.pipe(ws)
      })
      return { url: `/art/turris/${TURRIS_DIRS[kind]}/${name}` }
    }
    return reply.code(400).send({ error: 'no file uploaded' })
  })

  // AI 生成图：arkcli 产出按 kind 落入对应素材目录（portrait=司书全图, floor=楼层背景）
  app.post('/api/turris/art/generate', async (req, reply) => {
    const kind = ((req.query as { kind?: string }).kind ?? 'portrait') as UploadKind
    if (!(kind in TURRIS_DIRS)) {
      return reply.code(400).send({ error: 'kind must be portrait | preview | floor' })
    }
    const body = (req.body ?? {}) as { prompt?: string }
    const prompt = body.prompt?.trim()
    if (!prompt) return reply.code(400).send({ error: 'prompt is required' })
    const dir = turrisDir(kind)
    mkdirSync(dir, { recursive: true })
    try {
      const listRaw = await runArk(['resources', 'list', '--modality', 'image'])
      const list = JSON.parse(listRaw) as {
        items?: Array<{ id: string; is_default?: boolean }>
      }
      const model = list.items?.find((i) => i.is_default)?.id ?? list.items?.[0]?.id
      if (!model) {
        return reply.code(502).send({ error: 'no image model available from arkcli' })
      }
      const out = await runArk(['+gen', '--model', model, '--save-to', dir, prompt])
      const gen = JSON.parse(out) as { local_path?: string; output_url?: string }
      const file = gen.local_path ?? gen.output_url
      if (!file) return reply.code(502).send({ error: 'arkcli returned no asset' })
      const name = basename(file)
      return {
        url: `/art/turris/${TURRIS_DIRS[kind]}/${name}`,
        raw: file,
        model,
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      return reply.code(500).send({ error: `ark generation failed: ${msg}` })
    }
  })
}
