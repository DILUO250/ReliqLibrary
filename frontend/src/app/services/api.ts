const BASE = (import.meta.env.VITE_API_BASE ?? '/api').replace(/\/$/, '')

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`)
  }
  return (await res.json()) as T
}

export const api = {
  health: () => request<{ ok: boolean }>('/health'),
  overview: () => request<import('@rtl/shared').OverviewStats>('/overview'),
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
    const res = await fetch(`${BASE}/turris/upload?kind=${kind}`, { method: 'POST', body: fd })
    if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
    return (await res.json()) as { url: string }
  },
  generateArt: (prompt: string, kind: 'portrait' | 'floor') =>
    request<{ url: string; raw?: string; model?: string }>(`/turris/art/generate?kind=${kind}`, {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }),
}
