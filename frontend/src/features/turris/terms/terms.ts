// 术语索引模块：术语数据已落库（term_sections / term_entries），
// 由 @/features/turris/store/terms 异步加载，本模块只做形态适配与查询。
// 禁止再从静态 TS/JSON 建术语索引（见 CONVENTIONS §4.3）。
export type { DictEntry, DictGroup, DictSection } from '@/features/turris/store/terms'
export { TAG_STYLES } from './tagStyles'
