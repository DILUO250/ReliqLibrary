// 写操作令牌：与后端 RTL_TOKEN 配同一值（默认值见 backend/src/config/index.ts，
// 正式部署用 .env 的 VITE_RTL_KEY 覆盖）。pvzwiki 的裸 fetch 写通道必须附此头；
// GET 不需要（后端对 GET 不设门）。收编进 services/api.ts 时可整体移除。
export const WRITE_HEADERS: Record<string, string> = {
  'x-rtl-key': import.meta.env.VITE_RTL_KEY ?? 'reliq-2026',
}
