# 遗迹图书馆 · Reliquiarum to Library

一座藏身于金牛星系啮合域之内的超阈限实体，以追寻宇宙至高奥秘为目标。本项目是其同名**网页游戏**的全栈实现。

> **如果你是接手这个项目的新人**：请从头到尾读完这份 README，再看 `CONVENTIONS.md`（开发规范，硬性约束）和 `AGENTS.md`（AI 协作速查）。这份文档假设你没有任何背景知识，会把每个目录、每个文件的作用都讲清楚。

---

## 1. 这个项目是什么

一个**内容管理型网页游戏**：目前的核心是"把游戏设定整理成可编辑、可预览的数据"，三大模块各管一个玩法：

| 模块 | 主题色 | 现状 |
|---|---|---|
| 藏书阁 Armarium | 蓝 `#4a7fc4` | **PVZ 百科完整可用**（181 株植物、编辑器、卡图生成器、云端同步）；其余页面占位 |
| 迎书楼 Turris | 红 `#c04a32` | **楼层/司书编辑器 + 术语词典 + 战斗系统页完整可用**（战斗系统 v2）；其余页面占位 |
| 寻书社 Collegium | 绿 `#55a05f` | 占位（数据表与 generic CRUD 已就绪，按需填充） |
| 馆长层 Director | 金 `#e0b564` | 无功能设计，空置 |

版本：当前为 **v0.4「战斗系统革新」** —— 战斗系统设定从 v1 升级到 v2（新增 PKM 奇迹能量、RHD 部署点数两套完整模板，机制说明、前缀白名单、多模板数值表等）。设定原始依据在 `参考文档\术语解析\`（docx）。

---

## 2. 快速开始

### 2.1 一键启动（推荐）

双击 `reliqLibrary\start.bat`。它会：
1. 检查你的 Node.js 是否 ≥ 22（必须）；
2. 第一次运行时自动安装依赖；
3. 开两个黑色命令行窗口：一个是后端（3000 端口），一个是前端（4290 端口）；
4. 你只需要打开浏览器访问 **http://localhost:4290**。

### 2.2 手动启动

```bash
cd reliqLibrary
npm install          # 首次运行需要
npm run dev:backend  # 开后端 http://127.0.0.1:3000
npm run dev:frontend # 开前端 http://localhost:4290（另开一个终端）
```

### 2.3 提交代码前必须跑的检查

```bash
npm run type-check                    # 类型检查，必须零报错
npm run lint --workspace frontend     # 代码风格检查，必须零告警
```

这两个命令不过，代码不许提交。

---

## 3. 项目结构总览

这是一个 **monorepo**（一个仓库里装了几个独立的小项目，用 npm workspaces 管理）。三大件：`frontend`（前端）、`backend`（后端）、`shared`（两边共用的类型和数据）。

```
D:\ReliqLibrary\
├─ README.md               # 就是这份文档（项目根说明）
├─ 参考文档\                 # 世界观 docx、术语解析、设计图 —— 一切叙事内容的原始依据
├─ 草稿\                    # 设计草稿
└─ reliqLibrary\            # ★ 项目本体（真正的代码仓库，含独立 git）
   ├─ AGENTS.md             # AI 协作必读：架构速览 + 注意事项
   ├─ CONVENTIONS.md        # 开发规范（硬性约束，违反 = 违规）
   ├─ start.bat             # 一键启动脚本（GBK 编码 + CRLF，别乱改）
   ├─ frontend\             # 前端（Vue 3 + Vite + Pinia）
   ├─ backend\              # 后端（Fastify + better-sqlite3）
   └─ shared\               # 前后端共用的领域类型 + 战斗系统配置
```

**记住一句话：后端的 SQLite 数据库是唯一数据源，前端只是"读库 + 展示 + 编辑后写回"。** 任何数据都不允许硬编码在前端里当权威（例外见 §6.2 战斗系统的"设定层"）。

---

## 4. 后端详解（backend\）

一句话：**后端就是个"数据库管家"**——前端要数据，它去 SQLite 里查；前端要存数据，它替你写进 SQLite。它不装任何游戏逻辑。

### 4.1 目录逐个讲

```
backend\src\
├─ server.ts            # 入口：启动 Fastify 服务器（127.0.0.1:3000）
├─ config\index.ts      # 配置：路径、端口、环境变量
├─ db\
│  ├─ schema.ts         # 建表语句（DDL）+ TABLES 白名单 —— ★ 想加新表先来这里
│  └─ index.ts          # 数据库连接（better-sqlite3，WAL 模式，启动时自动迁移建表）
├─ routes\index.ts      # ★ 核心：generic CRUD —— 按 TABLES 白名单给每张表自动生成
│                       #   增/删/改/查/排序 五套接口，还有图片回收钩子
├─ features\
│  ├─ turris\artRoutes.ts    # 迎书楼专属接口：图片上传 + AI 立绘生成
│  ├─ armarium\artRoutes.ts  # 藏书阁专属接口：PVZ 素材上传 + 云端同步
│  └─ armarium\pvzSync.ts    # PVZ 云端同步逻辑
├─ scripts\
│  ├─ importTerms.ts    # 把前端术语种子灌进数据库（npm run import:terms）
│  ├─ importPvz.ts      # 把 PVZ 植物种子灌进数据库（npm run import:pvz）
│  ├─ importCT2.ts / importCT34.ts  # 迎书楼历史数据导入脚本
│  └─ auditArt.ts       # 只读扫描孤儿图片（npm run audit:art）
└─ seed\data.ts         # 首次建库时的种子数据（npm run seed:reset 会用它重建）
```

数据库文件本体在 `backend\data\library.db` —— **这是全项目最值钱的文件，别删它**。旁边的 `*.db-wal` / `*.db-shm` 是运行时临时文件，别手工碰。

### 4.2 数据库表 = 数据的"抽屉"

每张表对应一类数据（楼层、司书、术语、植物……）。**generic CRUD** 的意思是：不管什么表，前端都用同一套网址格式读写：

| 方法 | 网址 | 意思 |
|---|---|---|
| GET | `/api/floors` | 拿到全部楼层的列表 |
| GET | `/api/librarians/3` | 拿到 id=3 的那位司书 |
| POST | `/api/floors` | 新建一个楼层 |
| PUT | `/api/floors/3` | 修改 id=3 的楼层 |
| DELETE | `/api/floors/3` | 删除 id=3 的楼层 |
| POST | `/api/librarians/reorder` | 批量拖拽排序 |

所以**加一种新数据几乎不用写后端代码**：① 在 `db/schema.ts` 建表 → ② 把表名加进 `TABLES` 数组 → ③ 在 `shared/src/index.ts` 加对应的 TS 接口。完事，五套接口自动就有。

和战斗系统有关的表只有两个地方：
- `floors.battleSystem` 列：这个楼层用哪个战斗系统（'base'/'lob'/'pkm'/'rhd'）；
- `librarians.sheet` / `emotion_entities.sheet` 列：司书的**全部战斗数据**（属性、被动、卡组、系统专属数据）以 JSON 字符串存在这一列里。后端对这些 JSON **完全不懂也不懂装懂**，原样存取，解析是前端的事。

### 4.3 运行方式

开发时用 `npm run dev:backend`（tsx 实时监听重启）。要正式部署时 `npm run build` 编译成 JS 到 `dist/`，再 `npm start` 运行。

---

## 5. 前端详解（frontend\）

一句话：**前端负责把数据库里的数据变成漂亮的界面**。Vue 3 写的，界面 = 一棵组件树。

### 5.1 目录逐个讲

```
frontend\
├─ index.html                 # 网页入口
├─ public\art\                # ★ 所有图片素材都住这里（按模块分家）
│  └─ turris\
│     ├─ librarian-portraits\ #   司书立绘
│     ├─ librarian-previews\  #   司书缩略图
│     ├─ floors\              #   楼层背景图
│     ├─ systems\             #   战斗系统页"机制说明"的表格图（静态引用）
│     └─ _trash\              #   回收站（替换下来的旧图进这里）
└─ src\
   ├─ app\                    # "壳"：全站共用的骨架
   │  ├─ main.ts              #   程序入口
   │  ├─ router\              #   网址 → 页面的路由表
   │  ├─ services\api.ts      # ★ 唯一的后端请求通道（统一封装）
   │  ├─ stores\              #   全局 Pinia 状态（如 toast 提示）
   │  └─ styles\              #   全站样式 + tokens.css 设计变量
   ├─ shared\                 # 跨模块的公共组件（三个模块都能用的）
   └─ features\               # ★ 三个模块各一个平行文件夹，互不 import
      ├─ turris\              #   迎书楼（重点，见 5.2）
      ├─ armarium\            #   藏书阁（PVZ 百科）
      └─ collegium\           #   寻书社（占位）
```

**铁律：三个 features 文件夹之间禁止互相 import。** 公共的东西放 `shared/` 或 `app/`。

### 5.2 迎书楼 turris 重点导览（战斗系统主场）

```
frontend\src\features\turris\
├─ views\
│  ├─ FloorsView.vue      # 楼层页：楼层/司书/情感实体的管理界面
│  ├─ SystemsView.vue     # ★ 战斗系统页：雷达图→优劣势→开局数值→机制说明 四段式
│  ├─ TermsView.vue       # 词典页：术语的查看与编辑
│  └─ InvitationsView.vue # 邀请函页
├─ editor\                # 司书编辑器家族
│  ├─ FloorDeck.vue           # 楼层/司书管理主视图（含卡牌计数）
│  ├─ FloorEditorModal.vue    # 新建/编辑楼层弹窗（含战斗系统下拉）
│  ├─ LibrarianEditorModal.vue# 新建/编辑司书弹窗（组装战斗数据）
│  ├─ LibrarianSheetEditor.vue# ★★ 司书书页编辑器：按系统切换模板的核心
│  ├─ CardEditor.vue          # 单张卡牌的编辑器（前缀/标签/效果/骰子）
│  ├─ StsCard.vue             # 卡牌的"卡面"渲染（就是玩家看到的卡）
│  ├─ DeckPreviewModal.vue    # 司书预览弹窗（编辑完看效果）
│  ├─ EmotionEntityEditorModal.vue # LOB 楼层专属：情感实体（情感书页+EGO）
│  ├─ Modal.vue               # 全站唯一的弹窗容器（新弹窗必须复用它）
│  └─ TermInserter.vue        # "插入术语"面板（往文本框里塞带颜色的词）
├─ terms\                 # 术语渲染系统
│  ├─ renderer.ts            # ★ 核心：把文案里的“词条”变成带颜色的文字
│  ├─ RenderedText.vue       # 调 renderer 的组件
│  └─ data\                  # 术语种子（只给后端导入脚本用，运行时不读）
├─ store\terms.ts         # Pinia：从后端拉术语词典并缓存
└─ components\
   └─ SystemRadar.vue     # 六维属性雷达图（纯 SVG）
```

### 5.3 数据是怎么流动的（新手必懂）

```
你在界面上点了"保存"
   ↓
视图组件调用 api.update('librarians', 3, 数据)   ← frontend\src\app\services\api.ts
   ↓
后端 PUT /api/librarians/3 → 写进 SQLite
   ↓
刷新列表（重新 GET）→ 界面显示新数据
```

**永远不要**在视图组件里直接写 `fetch('/api/...')`，必须用 `api` 对象；跨页面共享的数据必须放 Pinia store（如 `store/terms.ts`），不要在视图里散落请求代码。

---

## 6. 战斗系统 v2 专区（最重要的一节）

战斗系统的数据分两层，判断标准是"这条数据会不会被运营编辑"：

### 6.1 两层数据

**第一层：设定层（代码常量）** —— 战斗系统的"规则设定"，改它 = 改代码：

| 文件 | 装什么 |
|---|---|
| `shared\src\index.ts` | `BATTLE_SYSTEMS` 大表：每个系统的卡组区配置（`deckZones`）、前缀白名单（`cardPrefixes`/`passivePrefixes`）、开局数值表（`statTables`）、六维评分（`metrics`）、优劣势、速战速决模板（`speedPassives`） |
| `shared\src\battleMechanics.ts` | 四个系统的"机制说明"长文本（`MECHANICS_TEXT`）+ 表格图片文件名（`MECHANICS_IMAGES`） |
| `shared\src\index.ts` 里的常量 | `RHD_CLASSES`（10 职业 emoji 文案）、`PKM_TYPES`（19 个属性选项） |
| `shared\src\terms\` | 术词条目种子（卡牌前缀、基础标签、18 属性机制词条……） |

**第二层：运营层（数据库）** —— 每个司书实际填的数据，存在 `librarians.sheet` JSON 里，通过界面编辑器增删改，不改代码：

- 通用战斗数据：体力/速度/抗性/被动/机制/卡组；
- `systemData` 各系统专属数据：LOB 的理智/EGO/心；RHD 的元素损伤+职业；PKM 的属性槽。

### 6.2 各系统的模板是怎么"切换"的

选了司书属于某系统后，编辑器按 `BATTLE_SYSTEMS[系统].deckZones` 决定显示哪些卡牌区：

| 系统 | 卡牌区 | 前缀白名单 | 系统专属编辑区 |
|---|---|---|---|
| BASE 基本系统 | 战斗+特殊 | V. GX. EX. DEF. | 无 |
| LOB 情感等级 | 战斗+特殊+**EGO** | V. GX. DEF. EGO. DST. SHM. | 理智/扭曲&EGO/心&望 |
| PKM 奇迹能量 | 战斗+特殊+**能量** | V. GX. EX. DEF. | 单位属性（19 选 2）；卡牌自动带"消耗:1"标签 |
| RHD 部署点数 | 战斗+特殊+**模组** | V. GX. DEF. ELIT1. ELIT2. | 元素损伤（默认100）+ 职业选择器（含预览行）+ 被动 ELIT 前缀按钮 |

**加新卡牌区/改前缀/改数值，都只改 `BATTLE_SYSTEMS` 对应字段，界面自动跟着变。** 不要在编辑器里写死卡牌区列表——那是已修掉的 bug 的来源。

### 6.3 战斗系统页的机制说明图片

`SystemsView.vue` 底部会显示每个系统的机制说明文字 + 表格图片。图片是静态文件：

1. 把表格截图放进 `frontend\public\art\turris\systems\`；
2. 文件名**必须**和 `shared\src\battleMechanics.ts` 里 `MECHANICS_IMAGES` 声明的一致（该目录里有 README.txt 列了全部清单，如 `lob-emotion-rewards.png`、`rhd-command-levels.png`）；
3. 放好即生效，无需任何代码或数据库改动。

### 6.4 术语文案改在哪里（单一术语源）

术语的**唯一权威源是数据库**（`term_sections` / `term_entries` 表）。前端所有消费者——渲染器、插入术语面板、卡牌编辑器的表单下拉——都读同一份库数据（经 Pinia store 缓存）。前身项目"静态 TS 文件直接 import"的旧双轨制已于 2026-09 废除（旧数据归档在 `reliqLibrary\_trash\shared-terms-2026-09\`）。

| 你想干什么 | 改哪里 | 还要做什么 |
|---|---|---|
| 让渲染器认识“XX”并画出格式 | **词典页直接建词条**（POST `term_entries`） | 无（备份自动跟随） |
| 改词条颜色/字体 | **词典页直接改库**（PUT `term_entries`） | 以库为准 |
| 新增词条进插入面板 | 词典页直接建（面板即库，无单独维护） | 无 |
| 带参数位的词条（插“词条” X层） | 词条编辑里勾选参数位（`hasParam` 列） | 无 |

> **重要**：数据库是唯一权威源，"种子"只是自动备份——任何写操作后 2 秒后台生成 `backend/data/db-snapshot.json`（全表快照）与 `termSeed.generated.ts`（生成种子，禁止手改），页面右上角会提示"数据已备份"。`import:terms` 仅用于新机引导/灾难恢复（合并模式，绝不回溯你在词典页做的修改，详见 `CONVENTIONS.md` §2.3）。

---

## 7. 常用命令速查

```bash
# 开发（在 reliqLibrary\ 目录下执行）
npm run dev:backend          # 开后端
npm run dev:frontend         # 开前端
npm start                    # 等价于双击 start.bat

# 校验（提交前必跑）
npm run type-check           # 类型检查，零报错
npm run lint --workspace frontend   # 风格检查，零告警

# 数据运维
npm run import:terms         # 术种子 → 数据库（幂等，随便跑）
npm run import:pvz           # PVZ 植物 → 数据库（幂等）
npm run audit:art            # 只读扫描孤儿图片（不删任何文件）
npm run seed:reset           # ⚠️ 清空全部数据库重建！除非确认要丢数据，永远别跑
```

---

## 8. 新手必读的坑（每一条都真实发生过）

1. **不要跑 `npm run seed:reset`**，除非你想清空全部数据。数据库 `backend\data\library.db` 才是真正的家当。
2. **含中文的数据不要用 PowerShell 的 `Invoke-WebRequest` 直接发**——Windows PowerShell 5.1 会把中文变成 `?` 存进数据库。测试接口用 node 脚本，或 `Invoke-RestMethod` + `charset=utf-8` 字节体。
3. **`.bat` 文件必须是 GBK 编码 + CRLF 换行**（Windows 命令行按系统编码解析），别用现代编辑器顺手保存成 UTF-8。
4. **后端本地 import 必须带 `.js` 后缀**，即使是引用 `.ts` 文件也要写 `./config/index.js`——NodeNext ESM 的规矩，漏了直接报错。
5. **前端文本文件一律 UTF-8 无 BOM**。历史版本曾因编码错乱整个报废过。
6. **图片替换必须进回收站**：界面上的"删除/替换图片"逻辑会自动把旧图挪进 `_trash\`，新写类似功能必须遵守（详见 `CONVENTIONS.md` §3.1）。
7. **数据直改库，禁止补丁层**：编辑一律 PUT 落库，禁止搞"覆盖文件/补丁脚本"这种二次修正机制。
8. **不要用 git 管理 `backend\data\` 里的数据库文件**（已在 .gitignore），也不要把 `_trash\` 里的东西删了又加回来。
9. **切图片地址时注意**：Vite 开发服务器只代理 `/api`，不代理 `/art`；但 `public\` 目录下的静态文件可以直接按 `/art/...` 路径访问，二者不冲突。
10. **模块之间禁止互相 import**：turris 的代码不许 import armarium 的东西，反之亦然。

---

## 9. 更多文档

- `reliqLibrary\CONVENTIONS.md` —— 硬性开发规范（含全部反模式清单），**读代码前先读它**
- `reliqLibrary\AGENTS.md` —— AI 协作/接手速查（架构要点 + Gotchas）
- `参考文档\设定-遗迹图书馆\` —— 世界观档案（docx），一切叙事的原始依据
- `参考文档\术语解析\` —— 战斗机制 v2 设定文档（docx）
