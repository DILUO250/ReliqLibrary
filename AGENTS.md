# AGENTS.md

`遗迹图书馆 · Reliquiarum to Library` — npm workspaces monorepo with three packages. Vue 3 + Vite frontend, Fastify + better-sqlite3 backend, shared TS domain types. No test framework exists.

## Workspaces

- `frontend` (`@rtl/frontend`) — Vue 3, Vite, Pinia, vue-router. Vite dev server (4290) proxies `/api` → `http://127.0.0.1:3000`.
- `backend` (`@rtl/backend`) — Fastify on `127.0.0.1:3000` (default), SQLite via better-sqlite3 at `backend/data/library.db` (gitignored WAL files, auto-migrates on open).
- `shared` (`@rtl/shared`) — domain types + terms structured data + `LABELS`. Consumed directly as `.ts` source (no build); `main`/`types` point at `src/index.ts`. Both other packages depend on `@rtl/shared: "*"`.

## Commands

Run everything from the repo root:

```bash
npm run dev:backend     # tsx watch backend/src/server.ts
npm run dev:frontend    # vite (port 4290)
npm run type-check      # vue-tsc frontend && tsc backend — must pass with zero errors
npm run lint --workspace frontend   # oxlint — must pass with zero warnings
npm run seed:reset      # backend: tsx src/scripts/seed.ts --reset (WIPES DATA)
```

Per-package (see each `package.json`):
- frontend: `build` = `vue-tsc --noEmit && vite build`; `lint` = `oxlint .`; `format` = `prettier --write src/`. Aliases `@/` → `./src/`, `@pvzwiki/` → `./src/features/armarium/projects/pvzwiki/`. Entry: `index.html` → `/src/app/main.ts`.
- backend: `build` = `tsc -p tsconfig.json`; `start` = `node dist/server.js`. Scripts also expose `seed:reset` / `audit:art` / `import:terms` / `import:pvz` (idempotent one-time importers).
- `start.bat` (repo root) checks Node 22+, installs deps if needed, opens backend + frontend in separate cmd windows.

No test runner is configured in any package.

## Architecture & wiring

- **Backend layout is feature-based** (see CONVENTIONS.md §5): `src/config/` (paths/env), `src/db/` (schema DDL + TABLES whitelist + connection/migrate), `src/routes/` (generic CRUD per TABLES + reorder + image-recycle hooks), `src/features/<module>/` (module-specific endpoints: `armarium/artRoutes.ts` = `/api/pvz/*` asset & cloud-sync routes + `pvzSync.ts`; `turris/artRoutes.ts` = `/api/turris/upload?kind=portrait|preview|floor` + `/api/turris/art/generate?kind=portrait|floor` via arkcli), `src/scripts/` (seed/importers/art audit), `src/seed/data.ts`.
- **User uploads live under `frontend/public/art/`, organized per module** (mirroring `features/`): `art/turris/{librarian-portraits, librarian-previews, floors, systems}` + `art/armarium/{plants, cards, backgrounds}` + per-module `_trash/`. Never write new uploads to the `art/` root. `trashArt()` routes trash to the owning module's `_trash/`. Exception: `art/turris/systems/` holds static mechanism-explanation table images referenced by code constants (`MECHANICS_IMAGES` in `shared/src/battleMechanics.ts`), not by DB rows — before trashing anything there, cross-check that file.
- Generic CRUD auto-registers for every table in `TABLES` (schema.ts). Image columns must be registered in `IMAGE_COLUMNS`; parent-delete nullify hooks in `DELETE_NULLIFY_HOOKS`; both live in `routes/index.ts`.
- `shared/src/index.ts` is the single domain model source of truth: record interfaces mirror the SQLite tables in `backend/src/db/schema.ts`. Add a type there first when extending a table.
- **Battle system (v2, "战斗系统革新")**: `BATTLE_SYSTEMS` in `shared/src/index.ts` is the per-system config hub. It now drives much of the turris UI:
  - `deckZones` — card zones per system (`combat`+`special` universal; `ego` LOB-only, `modules` RHD-only, `energy` PKM-only). `LibrarianSheetEditor.vue` / `DeckPreviewModal.vue` / `FloorDeck.vue` render zones from this config; do NOT hand-write `v-if` lists of card zones.
  - `cardPrefixes` / `passivePrefixes` — strict per-system whitelists (CardEditor filters its prefix dropdown; passive name prefix buttons for RHD ELIT1./ELIT2.).
  - `statTables` — opening-stats tables; multi-template systems (PKM 训练师|宝可梦, RHD 信标|其他单位) use 2 tables, rendered responsively (1 centered / 2 side-by-side / 3 across) by `SystemsView.vue`.
  - `mechanicsDesc` / `mechanicsImages` — mechanism explanation text lives in `shared/src/battleMechanics.ts` (`MECHANICS_TEXT`/`MECHANICS_IMAGES`); table images are static files in `frontend/public/art/turris/systems/` and must match the filenames declared in `MECHANICS_IMAGES` (see that folder's README.txt).
  - System-specific unit data lives in `LibrarianSheet.systemData`: LOB sanity/EGO/mind; RHD `elementDamage` (default 100) + `profession` (from `RHD_CLASSES`); PKM `attributes` (≤2 raw slots from `PKM_TYPES`, both `无属性` = trainer, display via `pkmAttributeDisplay`) + battle-form fields `megaForm`/`zMove`/`gmaxForm` (free text) and `teraType` (PKM_TYPES value, `无属性` = none).
  - Cards may carry `attr` (card attribute, shown for BASE/PKM via CardEditor `show-attr`). PKM cards created in the sheet editor auto-receive the `消耗:1` tag (editable chip); `消耗:X` is a `hasParam` term in `shared/src/terms/baseTags.ts`.
- **Adding a new battle system** (STS, NASE, ...): add the id to the `BattleSystemId` union and a complete entry to `BATTLE_SYSTEMS` (`deckZones` + `cardPrefixes` are mandatory; fill `statTables`/`mechanicsDesc`/`speedPassives`/`metrics`/`pros`/`cons`) — that enables it in the system dropdown, `emptySheet()` templates, `speedPassiveTemplates()`, card-zone rendering and the systems page. A per-system info panel still needs a hand-written `v-if="system.id === 'xxx'"` branch in `LibrarianSheetEditor.vue` (unknown systems fall through to the 预留 placeholder).
- Frontend `src/` layout: `app/` (shell: App.vue, main.ts, router/, pages/, services/api.ts, stores/, styles/ incl. `tokens.css` design tokens), `shared/` (cross-module components + assets), `features/{armarium,turris,collegium}/` (parallel module folders; features must not import each other).
- Turris terms are single-sourced from SQLite (`term_sections`/`term_entries` via `store/terms.ts` Pinia). Consumers of the same in-memory index: renderer (`terms/renderer.ts`: `ensureTermIndex()` / `termIndexReady()` / `renderTermText()`), rebuilt `TermInserter.vue` (inserts quoted `“词条”`, or `“词条” X层` for `hasParam` entries; palette shows dictionary-visible sections only), CardEditor form dropdowns (卡牌分类/基础骰子/特殊骰子/基础标签/泛用标签/卡牌前缀), and the mech-type dropdowns in `LibrarianSheetEditor.vue` / `EmotionEntityEditorModal.vue` (状态标签 section). `frontend/src/features/turris/terms/data/*.ts` (incl. `paletteTerms.ts` with `HAS_PARAM_TERMS`) are import seeds only — run `npm run import:terms` after editing. **`import:terms` is merge-only** (auto-backup to `backend/data/term-backup-*.json`, never DELETE/overwrite, dedup by name within a section) — see CONVENTIONS §2.3 accident clause. `term_entries.hasParam` column marks param terms; seed names may carry the ` X层` suffix convention. Legacy `shared/src/terms/` retired into `_trash/shared-terms-2026-09/` — shared holds no term data anymore.
- PVZ wiki consumes `pvz_plants`/`pvz_keywords` via `@pvzwiki/store/plants` (Pinia, pure consumer). `@pvzwiki/data/*.ts` and `@pvzwiki/store/{customPlants,plantEditor}.ts` are thin compatibility adapters delegating to the store. Asset path mapping (`/assets/...` legacy URLs → public dir) lives in `@pvzwiki/asset.ts`.

## Gotchas

- **Backend uses NodeNext ESM**: local imports must carry `.js` extension even for `.ts` files (e.g. `import { HOST } from './config/index.js'`). Importing without `.js` breaks under tsx/tsc.
- **Vite dev does not proxy `/art`** (only `/api`): custom uploaded PVZ images should be shown via the API `dataUrl` (`resolveImageSrc` in `@pvzwiki/store/plantImage`), not the raw URL. Files under `frontend/public/` (e.g. `art/turris/systems/*.png`) are served as-is by Vite/build — static URLs like `/art/turris/systems/x.png` work fine for code-referenced assets.
- `tsconfig` enables `noUncheckedIndexedAccess`: index access needs `?.` / non-null assertions.
- Seed table-name mismatch (latent bug, already fixed once): `seed/data.ts` keys must stay snake_case and match `TABLES` exactly.
- `PASSWORD`/`RTL_PASSWORD` in `backend/src/config/index.ts` is currently unused by routes.
- Node 22 is required. `start.bat` opens backend + frontend in separate `cmd` windows.
- Do not run `seed:reset` unless data loss is intended — it DROPs all tables. The authoritative live DB is `backend/data/library.db`.
- Historical note: the predecessor repo (`reliqLibraryOLD`) suffered an encoding-corruption disaster (double-encoded UTF-8→GBK mojibake). Any migrated text must be verified clean; `routes/index.ts`-style mojibake comments must be rewritten, not copied.
- **Never send JSON request bodies containing CJK through PowerShell `Invoke-WebRequest -Body <string>`** — PS 5.1 encodes string bodies as ASCII, turning Chinese into `?` and corrupting the DB row (this actually happened to `floors` during a "no-op PUT" test). For write-path tests use `Invoke-RestMethod` with `-ContentType 'application/json; charset=utf-8'` + byte body, or a node script instead.
