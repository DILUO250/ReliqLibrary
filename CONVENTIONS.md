# 遗迹图书馆 · 开发规范

>
> 文中 **必须 / 禁止 / 应当** 遵循 [RFC 2119](https://www.ietf.org/rfc/rfc2119.txt) 语义。
> 本规范适用于 `reliqLibrary/` 新项目（自 2026-09 重建起）。

---

## 0. 一句话总纲

**后端 SQLite 是唯一数据源，前端是纯消费方。** 任何把领域数据塞回前端静态文件、用"补丁文件"覆盖原始数据、或绕过后端直写前端源码的做法，都是本规范明确禁止的回归行为。

---

## 1. 数据架构

### 1.1 数据流向（必须）

```
SQLite (backend/data/library.db)
   │  better-sqlite3, WAL, 自动迁移
   ▼
Fastify 路由 (backend/src/routes + backend/src/features/*)
   │  /api/<table>  generic CRUD
   │  /api/<table>/reorder  批量排序
   │  /api/pvz/*  素材与云端同步（feature 层）
   ▼
前端 fetch (frontend/src/app/services/api.ts)
   │
   ▼
Pinia store (app/stores/*、features/*/store/*)
   │  内存缓存 + 组装为视图形态
   ▼
Vue 视图 (features/*/views, features/*/components)
```

- **领域数据必须落库**：凡是会被运营/玩家读到、且需要运行时编辑的内容（词条、楼层、司书、卡牌、植物……），**禁止**以前端 `.ts`/`.json` 静态文件为权威源。
- **前端只做消费**：视图通过 `api.list/get/create/update/remove` 拿数据，经 Pinia store 缓存后渲染。前端**不得**直接 `import` 任何领域数据 JSON/TS 作为展示源。
- **种子源例外**：`frontend/src/features/turris/terms/data/{terms,internalTerms,specialDiceTerms,termOverrides}.ts` 与 `features/armarium/projects/pvzwiki/data/*.json` 等历史静态文件**仅作为** `backend/src/scripts/importTerms.ts` / `importPvz.ts` 的导入种子源保留。前端业务代码**禁止**再 import 它们（`turris/terms/data/*` 仅被导入脚本经动态 import 加载；`pvzwiki/data/*.ts` 兼容层只做 store 形态适配、不含数据本体）。新模块若需类似一次性导入，把种子文件放在对应 feature 的 `data/` 下，并在导入脚本里用 `new Function('p','return import(p)')` 动态加载（避免 backend tsc 的 rootDir 报错）。

### 1.2 表与类型（应当）

- 新增表：先在 `backend/src/db/schema.ts` 的 DDL 里建表，再 push 进 `TABLES` 常量数组 → generic CRUD 自动产出 `/api/<table>` 全套端点。
- 对应的 TS 接口加在 `shared/src/index.ts`（前后端共用的单一领域模型源）。表列名与接口字段名保持一致（snake_case 表名，列名按需 camelCase 亦可，但同一张表内**必须**统一）。
- SQLite 关键字列名（如 `desc`、`order`、`key`）**应当**改用非保留词（`description`、`sortOrder`、`keyCode`），避免 generic CRUD 的 `${col}` 拼接踩坑。
- 外键约束**应当**写 `REFERENCES ... ON DELETE CASCADE`（如 `term_entries.sectionId`）；若业务要"级联置空"而非删除，则不靠 DB 外键，改在路由 DELETE 钩子里处理（见 §3.3）。

### 1.3 JSON 列约定（应当）

数组/对象类字段以 JSON 字符串存入 TEXT 列，列名语义清晰即可（如 `tags`、`format`、`sheet`）。前端 store 负责 `JSON.parse`/`JSON.stringify` 往返。**禁止**为此类字段单独建关联表——除非该字段会被独立查询/索引。

---

## 2. 后端路由

### 2.1 Generic CRUD（必须沿用）

`backend/src/routes/index.ts` 的 `registerRoutes` 已为 `TABLES` 中每张表自动注册：

| 方法 | 路径 | 用途 |
|---|---|---|
| GET | `/api/<table>` | 列表 |
| GET | `/api/<table>/:id` | 单条 |
| POST | `/api/<table>` | 新建 |
| PUT | `/api/<table>/:id` | 更新 |
| DELETE | `/api/<table>/:id` | 删除 |

- **禁止**为已覆盖的表再手写一套重复端点。需要特殊行为时，在循环内按表名分支加钩子，而非新开路由。
- `columnsOf(table)` 内含 `TABLES.includes` 白名单断言——**必须**保持。任何把动态参数拼进 `${table}` 或 `${col}` 的做法都要先过白名单，**禁止**直接拼用户输入（SQL 注入）。
- **feature 专属端点**放 `backend/src/features/<模块>/` 下各自的注册函数（如 `features/armarium/artRoutes.ts` 的 `/api/pvz/*`），由 `routes/index.ts` 统一挂载。**禁止**把某个 feature 的业务路由塞进通用层。

### 2.2 批量排序端点（应当复用）

需要拖拽排序的表**应当**加 `POST /api/<table>/reorder`，body 为 `[{id, sortOrder}]`，后端单 transaction 内 UPDATE 全部。**禁止**在前端循环发 N 次 PUT —— 既慢又留下半改的乱序态。

模板见 `routes/index.ts` 中 `floors`/`librarians` 的 reorder 实现。

### 2.3 跨 workspace 导入脚本（应当）

一次性数据导入脚本放 `backend/src/scripts/`，通过根 `package.json` 的 `audit:art`/`import:terms`/`import:pvz` 暴露为 npm script。脚本若需读前端 `.ts` 种子源：

- 顶部加 `// @ts-nocheck`（脚本不在 backend rootDir 内，且引用前端 `@/` alias 无法解析）。
- 用 `new Function('p', 'return import(p)')` 动态加载，**避免** tsc 跟随静态 `import(...)` 解析前端文件而报 `rootDir`/`alias` 错。
- 脚本**应当**幂等：先 `DELETE` 目标表再导入，重复运行不改变内容（仅自增 id 前移）。

### 2.4 Seed 数据（必须）

`backend/src/seed/data.ts` 的 `SeedData` 接口 key **必须**与 `TABLES` 中的 snake_case 表名完全一致（`core_pages` 而非 `corePages`）。`seed.ts` 直接拿 key 当表名拼 SQL，key 与真实表名不符会在填数据时 throw。

---

## 3. 数据完整性与素材治理

### 3.1 图片替换即回收（必须）

> 这是历史问题的第一道防线：旧版本上传立绘只新增文件不改旧文件，孤儿资源越积越多。

凡表含 `/art/` 图片 URL 列，其 PUT（替换/清空）与 DELETE（删行）**必须**走 `trashArt()` 回收旧文件，**禁止**让旧文件留在 `art/` 成孤儿。

**`art/` 目录按模块分治（对齐 features/ 逻辑）**：

```
art/
├─ turris/
│  ├─ librarian-portraits/   # 司书全图（上传 + AI 生成）
│  ├─ librarian-previews/    # 司书缩略图（裁剪产物）
│  ├─ floors/                # 楼层背景图
│  └─ _trash/                # turris 素材回收站
├─ armarium/                 # PVZ 用户素材（plants/cards/backgrounds）+ _trash/
└─ _trash/                   # 通用回收站
```

- 上传端点按 feature 归属：`POST /api/turris/upload?kind=portrait|preview|floor`（features/turris/artRoutes.ts）、`/api/pvz/*`（features/armarium/artRoutes.ts）。**禁止**新开往 art/ 顶层平铺的通道
- **文件在「保存」时才上传**（延迟上传）：选文件/裁剪只在本地暂存（File + objectURL），取消编辑即零服务器文件。服务端即时产出的通道（如 AI 生成）例外，其取消产生的孤儿由 `audit:art` 报告人工处置
- 图片列登记在 `routes/index.ts` 的 `IMAGE_COLUMNS` 常量：`{ floors: ['artwork'], librarians: ['portrait','portraitPreview'] }`。**新表有图片列就往这里加，漏登记 = 孤儿资源回归。**
- PVZ 用户素材（立绘/卡图/背景）的替换与删除统一走 `features/armarium/artRoutes.ts` 的 `pvzTrash()` → `art/armarium/_trash/`
- `trashArt()` 回收目标跟随素材所属模块（URL 含模块段 → `art/<模块>/_trash/`，否则全局 `art/_trash/`）；只改名不删除，失败时静默保留原文件（防丢）。`_trash/` 由人工定期清理

### 3.2 现存孤儿处置（人工，禁止自动删）

`npm run audit:art` 生成只读清单 `backend/data/art-audit-<ts>.md`（被引用 vs 孤儿）。脚本**绝不**自动移动或删除现有孤儿——由维护者照清单逐个决定。新模块产生的孤儿**禁止**再回头扫历史，只靠 §3.1 的钩子从源头止住。

### 3.3 删除上级记录的级联策略（应当）

默认"级联置空"而非"级联删除"——保留子数据，归入"未分配"区由用户重新分配。在 `routes/index.ts` 的 `DELETE_NULLIFY_HOOKS` 登记：

```ts
const DELETE_NULLIFY_HOOKS: Record<string, { table: string; fk: string }> = {
  floors: { table: 'librarians', fk: 'floorId' },
}
```

DELETE 钩子会在删父行前 `UPDATE <子表> SET <fk> = NULL WHERE <fk> = ?`。需要"连带删除子数据"的场景**应当**改用 DB 外键 `ON DELETE CASCADE`，并在提交说明里明确理由（这是丢数据方向）。

### 3.4 词条/文案直接改库（必须）

> 这是历史问题的第二道防线：旧版本靠"覆盖脚本"检索修改区再二次渲染，原始数据从未被改变。

- 词条字体格式一律编辑 DB 原行（词典页"编辑"入口 → `PUT /api/term_entries/:id`）。`mergedFormat()` 直接返回 `entry.format`。
- **禁止**再引入任何 overrides/patch 覆盖层（旧 `sync-term-overrides.ts`/`terms:sync` 机制已弃用并删除）。种子文件中的 `termOverrides.ts` 只在导入时合并为最终值。
- 种子 JSON 与库不一致时，**以库为准反向重建种子**（`overrides.json`/`pvz-user-edits.json` 即由此而来），保证重跑导入脚本结果与库一致。

---

## 4. 前端

### 4.1 数据访问层（必须）

- 视图**禁止**直接 `fetch('/api/...')`，**必须**经 `frontend/src/app/services/api.ts` 的 `api` 对象（统一 BASE、错误处理、JSON header）。例外：PVZ 素材通道（`store/plantImage.ts`）历史上直连 `/api/pvz/*`，**允许**保留现状，新增功能仍应走 `api`。
- 跨视图共享的数据**必须**走 Pinia store（`app/stores/*` 或各 feature 的 `store/*`），store 负责 load/reload/缓存。视图 `onMounted` 调 `store.load()`，加载态展示骨架，**禁止**在视图里散落 `ref([])` + `fetch` 的样板。
- store 的 load**应当**幂等（`loaded` flag 守卫，避免重复请求）；提供 `reload()` 供编辑后刷新。

### 4.2 弹窗（必须沿用 Modal 组件）

`frontend/src/features/turris/editor/Modal.vue` 是唯一的弹窗容器：`align-items: center` 居中、遮罩 `overflow-y: auto`、内容区内部滚动。**禁止**新写 `position: fixed; inset: 0` 的自制遮罩——会重蹈"视窗不居中"覆辙。需要宽弹窗传 `wide` prop。

### 4.3 术语渲染器（异步索引，必须遵守）

`frontend/src/features/turris/terms/renderer.ts` 的 `renderTermText` 依赖后端术语索引（经 `store/terms` 加载 `term_sections`/`term_entries`）。调用方（如 `features/turris/terms/RenderedText.vue`）**必须**：

1. `onMounted` 调 `ensureTermIndex()` 预热；
2. 用 `termIndexReady()` 做"未就绪降级为纯文本、就绪后格式化"的双态渲染。

**禁止**把 `renderTermText` 当同步函数用且不做就绪判断——索引未加载时全部词条会落 `unknown`。**禁止**把 `renderTermText` 当同步函数用且不做就绪判断。

### 4.4 展示层常量 vs 领域数据（应当区分）

- 配色/布局等纯展示层常量（如 `features/turris/terms/tagStyles.ts` 的 `TAG_STYLES` 状态标签→颜色映射、`styles/tokens.css` 的全局设计 token）可保留为前端静态文件。
- 词条内容、楼层数据、司书卡组等领域数据**必须**落库。判断标准：**这条数据会不会被运营编辑？** 会 → 入库；不会（纯前端样式） → 静态常量。

---

## 5. 结构与资源命名（必须）

> 这是历史问题的第三道防线：旧项目分层混乱（业务/技术混用）、资源命名无规范、模块间互相纠缠。

### 5.1 分层只按一种逻辑

- **前后端一律按 feature（三大模块平行）分目录**：`backend/src/features/{turris,armarium,collegium}`、`frontend/src/features/{turris,armarium,collegium}`。
- 技术层设施（db/routes/config/api/styles/shared 组件）只在共享层出现，**禁止**塞进某个 feature。
- feature 之间**禁止**互相 import（跨模块复用放 `shared/` 或 `app/`）。lint/review 时把跨 feature import 视为违规。

### 5.2 资源命名规范

- **可独立寻址实体的资源**（植物立绘/卡图、司书立绘、楼层图）→ 以实体 codename 单文件存放：`<codename>.<ext>`（现有 PVZ 图 `plants/<code>.png`、`plants_<code>_c.webp` 即此风格；后端上传图用 `<timestamp>-<slug>.<ext>`）。
- **无主公共资源**（背景、图标、字体、剪影）→ 按 feature + 类别集中池存放：`public/features/<模块>/.../assets/<类别>/<文件>`。
- **禁止**混合命名：既不按实体也不按类别的散落文件，或同一类资源一半按个体一半按池存放。

---

## 6. 命令速查

```bash
# 开发（均在仓库根目录执行）
npm run dev:backend          # tsx watch backend/src/server.ts（127.0.0.1:3000）
npm run dev:frontend         # vite（0.0.0.0:4290，/api 代理到后端）
npm start                    # 或双击 start.bat（自动安装依赖 + 开两个窗口）

# 校验（提交前必跑）
npm run type-check           # vue-tsc + tsc，零报错才合格
npm run lint --workspace frontend   # oxlint，零告警才合格

# 数据运维
npm run seed:reset           # 清库重建 + 种子（会丢现有数据，慎用）
npm run import:terms         # 从前端种子源导入术语到 SQLite（幂等）
npm run import:pvz           # 从前端种子源导入 PVZ 植物到 SQLite（幂等）
npm run audit:art            # 只读扫描 art/ 孤儿，生成报告（不删任何文件）
```

---

## 7. 已知的待办（不在本次规范范围）

- `shared/src/terms/`（cardTypes/baseTags/mechanism 等 `TermItem` 结构，供 `TermInserter` 插入术语法）与 `term_entries` 表（`DictEntry` 结构，供词典页展示 + 渲染器格式化）是两套重叠数据，待后续合并为单一术语源。
- 藏书阁其余页（异常实体/空间/书库/书库体系）与寻书社全部页仍是占位，数据表已建好（generic CRUD 已就绪），按需填充。
- `_trash/` 回收站需要人工定期清理。

---

## 8. 反模式清单（禁止）

| 反模式 | 正确做法 |
|---|---|
| 前端 `.ts`/`.json` 存领域数据并直接 import 展示 | 落 SQLite，前端 store 消费 |
| 用 overrides/patch 文件覆盖原始数据，原数据不动 | 直接改 DB 原行，入库即最终值 |
| 上传新图后旧文件留在原处成孤儿 | `trashArt()`/`pvzTrash()` 移入 `_trash/`，图片列必须登记 `IMAGE_COLUMNS` |
| 删楼层时子司书凭空消失（不级联） | `DELETE_NULLIFY_HOOKS` 置空 floorId |
| 拖拽排序发 N 次 PUT | `POST /<table>/reorder` 单事务 |
| 弹窗 `align-items: flex-start` 贴顶 | 复用 `Modal.vue`，居中 |
| `import type` 静态建术语索引 | `ensureTermIndex()` 异步从后端建索引 |
| generic CRUD 拼 `${table}` 不校验 | `columnsOf` 白名单断言 |
| seed key camelCase 与 snake_case 表名不符 | key 与 `TABLES` 完全一致 |
| feature 之间互相 import / 业务代码混进共享层 | 按模块平行分层，复用走 `shared/` |
| 资源命名一半按实体一半按池 | §5.2 二选一，同类内统一 |

每一条都曾真实出现过。别让它们复活。
