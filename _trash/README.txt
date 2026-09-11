_trash/ — 代码归档区（2026-09 创建）

这里是"从运行代码中退役、但暂时不敢直接删除"的历史文件。
放入此目录的文件不再参与编译/构建/运行，仅作历史参考。

shared-terms-2026-09/
    原 shared/src/terms/ 目录（卡牌分类、基础标签、机制词条 01~18 等静态术语数据）。
    背景：前身项目（纯司书编辑器，无数据库）遗留的插入术语插件数据。
    2026-09 术语源合并后退役：
    - 单一术语源 = SQLite 的 term_sections / term_entries 表（前端经 store/terms 读取）
    - 其内容已由一次性脚本转换为前端种子：
      frontend/src/features/turris/terms/data/paletteTerms.ts（5 个词表分区 + HAS_PARAM_TERMS 参数位索引）
    - 恢复/查证历史数据时再翻阅本目录；确认无需要后可整目录删除。

seed-terms-2026-09/
    原 frontend/src/features/turris/terms/data/ 下 5 个手写种子文件
    （terms.ts / specialDiceTerms.ts / internalTerms.ts / paletteTerms.ts / termOverrides.ts）。
    背景：Word 文档一次性迁移的硬编码产物，被误当作"种子数据源"长期保留，
    但实际早已过时（前端 §4.3 改造后零消费），且过时值曾复活覆盖库内运营修改（月笼 幽灵→妖精 事故）。
    2026-09 数据流掉头后退役：
    - SQLite 是唯一权威源；备份由 exportSnapshot 自动产出
      （backend/data/db-snapshot.json 实时快照 + terms/data/termSeed.generated.ts 提交级生成种子）
    - 手改种子是禁止行为；恢复历史数据用 git 或本目录，恢复术语库用 npm run import:terms

migration-fossils-2026-09/（2026-09 第二批判死，直接 git rm，本条目仅作记录）
    backend/src/seed/data.ts（851KB：94 个 sheet 常量 + floors/librarians/emotion_entities 全量硬编码）——
      当年自动导入脚本的偷懒产物，"种子"实为一次性迁移残留，与库完全重复；
    backend/src/scripts/syncSeed.ts——正则回写种子（SQLite↔源码双向流），任一新司书未映射即 throw；
    backend/src/scripts/importPvz.ts——DELETE 重灌 PVZ 表（旧 JSON 快照会覆盖运营编辑）；
    backend/src/scripts/importCT2.ts / importCT34.ts——"跑完即弃"的 524KB 数据尸体；
    frontend pvzwiki/data/*.json（7 个，228KB）——PVZ 三层迁移 JSON，前端零消费、pvzSync 不读；
    shared LABELS——零引用死代码，部门名收敛至 frontend/src/app/labels.ts。
    数据均在库内（+ db-snapshot.json 自动快照）与 git 历史中，需要时可考古。

pvz-assets-2026-09/（2026-09 资产迁家，直接删除，本条目仅作记录）
    frontend/public/features/armarium/projects/pvzwiki/ 整棵目录（约 450 个文件）——
      PVZ 百科迁移期被"量身打造"的独享资产体系（不属规范家 art/、无回收站），
      其 overrides.json 曾是"前端覆盖脚本"时代的数据本体（每次页面加载覆盖 DB 值，
      后被 importPvz 烧录入库才寿终正寝——这正是 CONVENTIONS 反模式清单
      "修改后的数据硬编入覆盖脚本"条目的原型事故）；
    assets/image/plants/resources/（22 个 md5 命名抓取残留，库与前端零引用）；
    backend/data/term-backup-*.json × 8（今日调试积累，importTerms 已加轮转：保留最近 3 份）。
    迁家后的家：frontend/public/art/armarium/projects/pvz/（plants/card·full·icon、
    backgrounds、fonts、pvzg_nav.webp；DB URL 已全部改写为 /art/... 最终路径，零翻译层）。
    文件在 git 历史中，需要时可考古。
