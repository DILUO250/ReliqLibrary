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

- **Backend layout is feature-based** (see CONVENTIONS.md §5): `src/config/` (paths/env), `src/db/` (schema DDL + TABLES whitelist + connection/migrate), `src/routes/` (generic CRUD per TABLES + reorder + `/api/upload` + `/api/art/generate` via arkcli + image-recycle hooks), `src/features/<module>/` (module-specific endpoints: `armarium/artRoutes.ts` = `/api/pvz/*` asset & cloud-sync routes + `pvzSync.ts`), `src/scripts/` (seed/importers/art audit), `src/seed/data.ts`.
- Generic CRUD auto-registers for every table in `TABLES` (schema.ts). Image columns must be registered in `IMAGE_COLUMNS`; parent-delete nullify hooks in `DELETE_NULLIFY_HOOKS`; both live in `routes/index.ts`.
- `shared/src/index.ts` is the single domain model source of truth: record interfaces mirror the SQLite tables in `backend/src/db/schema.ts`. Add a type there first when extending a table.
- Frontend `src/` layout: `app/` (shell: App.vue, main.ts, router/, pages/, services/api.ts, stores/, styles/ incl. `tokens.css` design tokens), `shared/` (cross-module components + assets), `features/{armarium,turris,collegium}/` (parallel module folders; features must not import each other).
- Turris term rendering is async: `terms/renderer.ts` exposes `ensureTermIndex()` / `termIndexReady()` / `renderTermText()`; data comes from the backend via `store/terms.ts` (Pinia). Static `terms/data/*.ts` files are import seeds only.
- PVZ wiki consumes `pvz_plants`/`pvz_keywords` via `@pvzwiki/store/plants` (Pinia, pure consumer). `@pvzwiki/data/*.ts` and `@pvzwiki/store/{customPlants,plantEditor}.ts` are thin compatibility adapters delegating to the store. Asset path mapping (`/assets/...` legacy URLs → public dir) lives in `@pvzwiki/asset.ts`.

## Gotchas

- **Backend uses NodeNext ESM**: local imports must carry `.js` extension even for `.ts` files (e.g. `import { HOST } from './config/index.js'`). Importing without `.js` breaks under tsx/tsc.
- **Vite dev does not proxy `/art`** (only `/api`): custom uploaded PVZ images should be shown via the API `dataUrl` (`resolveImageSrc` in `@pvzwiki/store/plantImage`), not the raw URL.
- `tsconfig` enables `noUncheckedIndexedAccess`: index access needs `?.` / non-null assertions.
- Seed table-name mismatch (latent bug, already fixed once): `seed/data.ts` keys must stay snake_case and match `TABLES` exactly.
- `PASSWORD`/`RTL_PASSWORD` in `backend/src/config/index.ts` is currently unused by routes.
- Node 22 is required. `start.bat` opens backend + frontend in separate `cmd` windows.
- Do not run `seed:reset` unless data loss is intended — it DROPs all tables. The authoritative live DB is `backend/data/library.db`.
- Historical note: the predecessor repo (`reliqLibraryOLD`) suffered an encoding-corruption disaster (double-encoded UTF-8→GBK mojibake). Any migrated text must be verified clean; `routes/index.ts`-style mojibake comments must be rewritten, not copied.
