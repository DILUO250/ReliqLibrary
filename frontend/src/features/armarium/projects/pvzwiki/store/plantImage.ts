import { reactive } from 'vue'

// Session-scoped state for the custom plant image (立绘) upload channel.
// `backups` lives in sessionStorage so it survives a page reload (used after
// save) but is cleared when the browser tab closes, giving the operator a
// limited window to undo a replacement.
interface ImageBackup {
  dataUrl: string | null
  ext: string | null
}

const STORAGE_KEY = 'pvz_plant_image_backups'

function loadBackups(): Record<string, ImageBackup> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, ImageBackup>) : {}
  } catch {
    return {}
  }
}

function persistBackups(backups: Record<string, ImageBackup>): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(backups))
  } catch {
    // quota exceeded or unavailable; keep in-memory only
  }
}

const state = reactive<{
  version: Record<string, number>
  backups: Record<string, ImageBackup>
  cachedUrl: Record<string, string | null>
  cachedSrc: Record<string, string | null>
}>({
  version: {},
  backups: loadBackups(),
  cachedUrl: {},
  cachedSrc: {},
})

// Cache-busting version for a codename's custom image (bumped on every change).
export function customVersion(codename: string): number {
  return state.version[codename] ?? 0
}

export function hasBackup(codename: string): boolean {
  return !!state.backups[codename]
}

function bump(codename: string): void {
  state.version[codename] = (state.version[codename] ?? 0) + 1
}

async function fetchCurrent(
  codename: string,
): Promise<{ url: string | null; dataUrl: string | null; ext: string | null }> {
  try {
    const res = await fetch(`/api/pvz/plant-image?codename=${encodeURIComponent(codename)}`)
    if (!res.ok) return { url: null, dataUrl: null, ext: null }
    return (await res.json()) as { url: string | null; dataUrl: string | null; ext: string | null }
  } catch {
    return { url: null, dataUrl: null, ext: null }
  }
}

// Capture the current custom image once (before any replacement) so the
// operator can later undo. Subsequent calls for the same codename are no-ops.
export async function ensureBackup(codename: string): Promise<void> {
  if (state.backups[codename]) return
  const cur = await fetchCurrent(codename)
  state.backups[codename] = { dataUrl: cur.dataUrl, ext: cur.ext }
  persistBackups(state.backups)
}

// Resolve the effective portrait URL for a codename: the custom upload if one
// exists, otherwise null. Results are cached per codename; uploads/restores
// invalidate the cache.
export async function resolveImageUrl(codename: string): Promise<string | null> {
  const cached = state.cachedUrl[codename]
  if (cached !== undefined) return cached
  const cur = await fetchCurrent(codename)
  state.cachedUrl[codename] = cur.url
  return cur.url
}

// Resolve a directly embeddable portrait source: prefers the inline dataUrl
// (works even when the /art static route is not proxied, e.g. vite dev),
// falling back to the /art URL. Used by the almanac card & detail showcase.
export async function resolveImageSrc(codename: string): Promise<string | null> {
  const cached = state.cachedSrc[codename]
  if (cached !== undefined) return cached
  const cur = await fetchCurrent(codename)
  const src = cur.dataUrl ?? cur.url
  state.cachedSrc[codename] = src
  return src
}

// ---------------------------------------------------------------------------
// Card image (卡片图) channel. Mirrors the portrait channel but targets the
// 240x152 generated seed-packet art used as the almanac grid thumbnail.
// ---------------------------------------------------------------------------

const cardState = reactive<{
  version: Record<string, number>
  cachedSrc: Record<string, string | null>
}>({
  version: {},
  cachedSrc: {},
})

export function cardVersion(codename: string): number {
  return cardState.version[codename] ?? 0
}

async function fetchCardCurrent(
  codename: string,
): Promise<{ url: string | null; dataUrl: string | null; ext: string | null }> {
  try {
    const res = await fetch(`/api/pvz/plant-card?codename=${encodeURIComponent(codename)}`)
    if (!res.ok) return { url: null, dataUrl: null, ext: null }
    return (await res.json()) as { url: string | null; dataUrl: string | null; ext: string | null }
  } catch {
    return { url: null, dataUrl: null, ext: null }
  }
}

// Resolve a directly embeddable card source (dataUrl preferred), or null.
export async function resolveCardSrc(codename: string): Promise<string | null> {
  const cached = cardState.cachedSrc[codename]
  if (cached !== undefined) return cached
  const cur = await fetchCardCurrent(codename)
  const src = cur.dataUrl ?? cur.url
  cardState.cachedSrc[codename] = src
  return src
}

export async function uploadCard(codename: string, dataUrl: string): Promise<void> {
  const res = await fetch('/api/pvz/plant-card', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codename, dataUrl }),
  })
  if (!res.ok) throw new Error('card upload failed')
  cardState.version[codename] = (cardState.version[codename] ?? 0) + 1
  delete cardState.cachedSrc[codename]
}

export async function uploadImage(codename: string, dataUrl: string): Promise<void> {
  const res = await fetch('/api/pvz/plant-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codename, dataUrl }),
  })
  if (!res.ok) throw new Error('upload failed')
  bump(codename)
  delete state.cachedUrl[codename]
  delete state.cachedSrc[codename]
}

export async function restoreImage(codename: string): Promise<void> {
  const b = state.backups[codename]
  if (!b) return
  if (b.dataUrl) {
    await uploadImage(codename, b.dataUrl)
  } else {
    try {
      await fetch(`/api/pvz/plant-image?codename=${encodeURIComponent(codename)}`, {
        method: 'DELETE',
      })
    } catch {
      // dev server unavailable; nothing more we can do
    }
    bump(codename)
    delete state.cachedUrl[codename]
    delete state.cachedSrc[codename]
  }
  delete state.backups[codename]
  persistBackups(state.backups)
}

// ---------------------------------------------------------------------------
// Background (背景图) channel. Mirrors the portrait image channel above but
// targets `public/assets/image/almanac/backgrounds/custom/{codename}.{ext}`.
// ---------------------------------------------------------------------------

interface BgBackup {
  dataUrl: string | null
  ext: string | null
}

const BG_STORAGE_KEY = 'pvz_plant_bg_backups'

function loadBgBackups(): Record<string, BgBackup> {
  try {
    const raw = sessionStorage.getItem(BG_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, BgBackup>) : {}
  } catch {
    return {}
  }
}

function persistBgBackups(backups: Record<string, BgBackup>): void {
  try {
    sessionStorage.setItem(BG_STORAGE_KEY, JSON.stringify(backups))
  } catch {
    // quota exceeded or unavailable; keep in-memory only
  }
}

const bgState = reactive<{
  version: Record<string, number>
  backups: Record<string, BgBackup>
  cachedUrl: Record<string, string | null>
}>({
  version: {},
  backups: loadBgBackups(),
  cachedUrl: {},
})

// Cache-busting version for a codename's custom background.
export function customBgVersion(codename: string): number {
  return bgState.version[codename] ?? 0
}

export function hasBgBackup(codename: string): boolean {
  return !!bgState.backups[codename]
}

function bumpBg(codename: string): void {
  bgState.version[codename] = (bgState.version[codename] ?? 0) + 1
}

async function fetchBgCurrent(
  codename: string,
): Promise<{ url: string | null; dataUrl: string | null; ext: string | null }> {
  try {
    const res = await fetch(`/api/pvz/plant-bg?codename=${encodeURIComponent(codename)}`)
    if (!res.ok) return { url: null, dataUrl: null, ext: null }
    return (await res.json()) as { url: string | null; dataUrl: string | null; ext: string | null }
  } catch {
    return { url: null, dataUrl: null, ext: null }
  }
}

// Resolve the effective background URL for a codename: the custom background
// if one exists, otherwise null (the caller falls back to the world default).
// Results are cached per codename; uploads/restores invalidate the cache.
export async function resolveBgUrl(codename: string): Promise<string | null> {
  const cached = bgState.cachedUrl[codename]
  if (cached !== undefined) return cached
  const cur = await fetchBgCurrent(codename)
  bgState.cachedUrl[codename] = cur.url
  return cur.url
}

export async function ensureBgBackup(codename: string): Promise<void> {
  if (bgState.backups[codename]) return
  const cur = await fetchBgCurrent(codename)
  bgState.backups[codename] = { dataUrl: cur.dataUrl, ext: cur.ext }
  persistBgBackups(bgState.backups)
}

export async function uploadBg(codename: string, dataUrl: string): Promise<void> {
  const res = await fetch('/api/pvz/plant-bg', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codename, dataUrl }),
  })
  if (!res.ok) throw new Error('bg upload failed')
  bumpBg(codename)
  delete bgState.cachedUrl[codename]
}

// Set the background from an existing library asset. The server copies the file
// into this plant's custom background slot; callers should ensureBgBackup()
// beforehand so the change is undoable.
export async function setBgFromLibrary(codename: string, source: string): Promise<void> {
  const res = await fetch('/api/pvz/plant-bg/copy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codename, source }),
  })
  if (!res.ok) throw new Error('bg copy failed')
  bumpBg(codename)
  delete bgState.cachedUrl[codename]
}

export async function restoreBg(codename: string): Promise<void> {
  const b = bgState.backups[codename]
  if (!b) return
  if (b.dataUrl) {
    await uploadBg(codename, b.dataUrl)
  } else {
    try {
      await fetch(`/api/pvz/plant-bg?codename=${encodeURIComponent(codename)}`, {
        method: 'DELETE',
      })
    } catch {
      // dev server unavailable; nothing more we can do
    }
    bumpBg(codename)
    delete bgState.cachedUrl[codename]
  }
  delete bgState.backups[codename]
  persistBgBackups(bgState.backups)
}
