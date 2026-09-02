# 遗迹图书馆 · Reliquiarum to Library

一座藏身于金牛星系啮合域之内的超阈限实体，以追寻宇宙至高奥秘为目标。本项目是其同名**网页游戏**的全栈实现。

## 目录结构

```
D:\ReliqLibrary\
├─ reliqLibrary\           # ★ 项目本体（npm workspaces monorepo，含独立 git 仓库）
│  ├─ CONVENTIONS.md       #   开发规范（必读）
│  ├─ AGENTS.md            #   架构速览与注意事项（AI 协作/接手必读）
│  ├─ frontend\            #   Vue 3 + Vite + Pinia（端口 4290）
│  ├─ backend\             #   Fastify + better-sqlite3（端口 3000）
│  └─ shared\              #   前后端共享领域类型 + 术语机制数据
├─ 设定-遗迹图书馆\          # 世界观档案（docx）与设计参考图 —— 一切叙事内容的原始依据
└─ README.md               # 本文件
```

## 三大模块

| 模块 | 主题色 | 现状 |
|---|---|---|
| 藏书阁 Armarium | 蓝 `#4a7fc4` | **PVZ 百科完整可用**（181 株植物、编辑器、卡图生成器、云端同步）；其余页面占位 |
| 迎书楼 Turris | 红 `#c04a32` | **楼层/司书编辑器 + 术语词典完整可用**；其余页面占位 |
| 寻书社 Collegium | 绿 `#55a05f` | 占位（数据表与 generic CRUD 已就绪，按需填充） |
| 馆长层 Director | 金 `#e0b564` | 无功能设计，空置 |

## 快速启动

双击 `reliqLibrary\start.bat`（自动装依赖 + 开后端/前端两个窗口），或手动：

```bash
cd reliqLibrary
npm install          # 首次
npm run dev:backend  # http://127.0.0.1:3000
npm run dev:frontend # http://localhost:4290
```

## 重要注意事项

### 数据是唯一权威，文件只是壳
- **后端 SQLite（`reliqLibrary\backend\data\library.db`）是唯一数据源**，前端纯消费
- 千万不要运行 `npm run seed:reset` 除非打算清空全部数据（它会 DROP 所有表）
- 目前新项目**只有本地 git、没有远程备份**，请尽早配置远程仓库或定期备份

### 三条历史教训写成的硬性规范（详见 CONVENTIONS.md）
1. **图片替换即回收**：任何图片替换/删除必须进 `_trash/` 回收站，禁止让旧图变孤儿；新表带图片列必须在 `IMAGE_COLUMNS` 登记
2. **数据直改库，禁止补丁层**：编辑一律 PUT 落库；`overrides`/覆盖脚本类机制已彻底弃用
3. **分层与命名**：前后端一律按 feature（三大模块平行）分目录，模块间禁止互相 import；资源命名要么按实体 codename 单文件、要么按类别集中池

### 编码陷阱（本项目曾因乱码灾难报废过一次）
- `.bat` 文件必须是 **GBK(936) 编码 + CRLF 行尾**（cmd 按系统 ANSI 码页解析）
- 含中文的 HTTP 请求体**禁止**经 PowerShell 字符串发送（PS 5.1 按 ASCII 编码会污染数据）；用 node 脚本或 `charset=utf-8` 字节体
- 前端文本文件一律 UTF-8（无 BOM）；提交信息走 `git commit -F <文件>` 以避开控制台编码

### 运维小贴士
- `npm run audit:art`：只读扫描孤儿图片（不删任何文件）
- `npm run import:terms` / `import:pvz`：从种子源幂等导入
- `backend/data/*.db-wal / *.db-shm` 为 WAL 运行时文件，勿手工处理；服务打开连接时会自动 checkpoint 归一化
