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
