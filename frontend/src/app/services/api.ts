const BASE = (import.meta.env.VITE_API_BASE ?? '/api').replace(/\/$/, '')
// 写操作令牌，与后端 RTL_TOKEN 配同一值（默认值见 backend/src/config/index.ts），
// 正式部署用 .env 的 VITE_RTL_KEY 覆盖。GET 不附头（后端对 GET 不设门）。
const WRITE_TOKEN = import.meta.env.VITE_RTL_KEY ?? 'reliq-2026'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const method = init?.method ?? 'GET'
  const extra = (init?.headers ?? {}) as Record<string, string>
  const headers: Record<string, string> = { ...extra }
  // Content-Type 仅在确有 body 时设置——DELETE 等"空 body + json Content-Type"
  // 的请求会被 Fastify 以 FST_ERR_CTP_EMPTY_JSON_BODY 拒成 400（前端删除功能曾因此全灭）
  if (init?.body != null) headers['Content-Type'] = 'application/json'
  if (method !== 'GET' && method !== 'HEAD') headers['x-rtl-key'] = WRITE_TOKEN
  const { headers: _omit, ...rest } = init ?? {}
  const res = await fetch(`${BASE}${path}`, { ...rest, headers })
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`)
  }
  return (await res.json()) as T
}

export const api = {
  health: () => request<{ ok: boolean }>('/health'),
  overview: () => request<import('@rtl/shared').OverviewStats>('/overview'),
  backupStatus: () => request<{ lastBackupAt: string | null; version: number; dirty: boolean }>('/backup/status'),
  list: <T>(resource: string) => request<T[]>(`/${resource}`),
  get: <T>(resource: string, id: number | string) => request<T>(`/${resource}/${id}`),
  create: <T>(resource: string, body: unknown) =>
    request<T>(`/${resource}`, { method: 'POST', body: JSON.stringify(body) }),
  update: <T>(resource: string, id: number | string, body: unknown) =>
    request<T>(`/${resource}/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (resource: string, id: number | string) =>
    request<void>(`/${resource}/${id}`, { method: 'DELETE' }),
  uploadImage: async (
    file: File,
    kind: 'portrait' | 'preview' | 'floor',
  ): Promise<{ url: string }> => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`${BASE}/turris/upload?kind=${kind}`, {
      method: 'POST',
      headers: { 'x-rtl-key': WRITE_TOKEN },
      body: fd,
    })
    if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
    return (await res.json()) as { url: string }
  },
  generateArt: (prompt: string, kind: 'portrait' | 'floor') =>
    request<{ url: string; raw?: string; model?: string }>(`/turris/art/generate?kind=${kind}`, {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }),
}
