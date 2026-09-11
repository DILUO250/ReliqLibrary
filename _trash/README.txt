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
