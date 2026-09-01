import type Database from 'better-sqlite3'

const DDL = `
CREATE TABLE IF NOT EXISTS floors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  latinName TEXT DEFAULT '',
  code TEXT DEFAULT '',
  designation TEXT DEFAULT '',
  theme TEXT DEFAULT '',
  receptionType TEXT DEFAULT '',
  battleSystem TEXT DEFAULT 'base',
  description TEXT DEFAULT '',
  sortOrder INTEGER DEFAULT 0,
  artwork TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS librarians (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  title TEXT DEFAULT '',
  department TEXT DEFAULT 'armarium',
  role TEXT DEFAULT 'librarian',
  floorId INTEGER DEFAULT NULL,
  coreColor TEXT DEFAULT 'neutral',
  affiliation TEXT DEFAULT '',
  status TEXT DEFAULT '在任',
  description TEXT DEFAULT '',
  sheet TEXT DEFAULT '',
  portrait TEXT DEFAULT '',
  portraitPreview TEXT DEFAULT '',
  sortOrder INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS core_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ownerId INTEGER DEFAULT NULL,
  name TEXT DEFAULT '',
  hp INTEGER DEFAULT 0,
  stagger INTEGER DEFAULT 0,
  sanity INTEGER DEFAULT 0,
  passives TEXT DEFAULT '',
  mechanics TEXT DEFAULT '',
  color TEXT DEFAULT 'neutral'
);

CREATE TABLE IF NOT EXISTS combat_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'combat',
  floorId INTEGER DEFAULT NULL,
  ownerId INTEGER DEFAULT NULL,
  cost INTEGER DEFAULT 0,
  power INTEGER DEFAULT 0,
  effect TEXT DEFAULT '',
  cooldown TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT DEFAULT '',
  source TEXT DEFAULT '',
  type TEXT DEFAULT '馆藏',
  synopsis TEXT DEFAULT '',
  worldId INTEGER DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS anomalies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT DEFAULT '',
  name TEXT NOT NULL,
  level TEXT DEFAULT 'safe',
  subLevel TEXT DEFAULT 'safe-stable',
  status TEXT DEFAULT 'discovered',
  appearance TEXT DEFAULT '',
  containment TEXT DEFAULT '',
  appendix TEXT DEFAULT '',
  worldId INTEGER DEFAULT NULL,
  note TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS literary_worlds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bookId INTEGER DEFAULT NULL,
  name TEXT NOT NULL,
  rules TEXT DEFAULT '',
  holdsEntityId INTEGER DEFAULT NULL,
  note TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS supernatural_spaces (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT DEFAULT '',
  name TEXT NOT NULL,
  level TEXT DEFAULT 'safe',
  subLevel TEXT DEFAULT 'safe-logos',
  status TEXT DEFAULT 'discovered',
  rules TEXT DEFAULT '',
  resources TEXT DEFAULT '',
  anchorStatus TEXT DEFAULT '',
  note TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS repositories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'entity',
  permission TEXT DEFAULT 'B',
  parentId INTEGER DEFAULT NULL,
  functions TEXT DEFAULT '',
  description TEXT DEFAULT '',
  sortOrder INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS invitations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  receiverName TEXT NOT NULL,
  issuedDate TEXT DEFAULT '',
  items TEXT DEFAULT '',
  status TEXT DEFAULT '已签发',
  note TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS guests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  origin TEXT DEFAULT '',
  invitationId INTEGER DEFAULT NULL,
  isUninvited INTEGER DEFAULT 0,
  floorId INTEGER DEFAULT NULL,
  status TEXT DEFAULT 'invited',
  result TEXT DEFAULT '',
  bookId INTEGER DEFAULT NULL,
  note TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS page_packs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'standard',
  contents TEXT DEFAULT '',
  optimizedFor TEXT DEFAULT '',
  description TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  packId INTEGER DEFAULT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'tool',
  effect TEXT DEFAULT '',
  slotLimit TEXT DEFAULT '',
  description TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS rail_stations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  orderNo INTEGER DEFAULT 0,
  boss TEXT DEFAULT '',
  theme TEXT DEFAULT '',
  drops TEXT DEFAULT '',
  description TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS energy_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT DEFAULT '',
  amount REAL DEFAULT 0,
  source TEXT DEFAULT '',
  expeditionId TEXT DEFAULT '',
  note TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS factions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'neutral',
  goal TEXT DEFAULT '',
  description TEXT DEFAULT '',
  relationship TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS director_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT DEFAULT '',
  title TEXT DEFAULT '',
  content TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS lore_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  module TEXT DEFAULT 'world',
  category TEXT DEFAULT '',
  content TEXT DEFAULT '',
  sortOrder INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS term_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  visible INTEGER DEFAULT 1,
  sortOrder INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS term_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sectionId INTEGER NOT NULL REFERENCES term_sections(id) ON DELETE CASCADE,
  groupTitle TEXT DEFAULT '',
  name TEXT NOT NULL,
  tags TEXT DEFAULT '[]',
  tagColors TEXT DEFAULT '[]',
  tagFormats TEXT DEFAULT '[]',
  format TEXT DEFAULT '{}',
  description TEXT DEFAULT '',
  sortOrder INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pvz_plants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codename TEXT UNIQUE NOT NULL,
  numericId INTEGER DEFAULT 0,
  name TEXT NOT NULL,
  englishName TEXT DEFAULT '',
  image TEXT DEFAULT '',
  world TEXT DEFAULT '',
  familyCode TEXT DEFAULT '',
  familyName TEXT DEFAULT '',
  familyIcon TEXT DEFAULT '',
  summary TEXT DEFAULT '',
  path TEXT DEFAULT '',
  isCustom INTEGER DEFAULT 0,
  sunCost INTEGER,
  recharge INTEGER,
  toughness INTEGER,
  damage INTEGER,
  range TEXT,
  family TEXT,
  introduction TEXT,
  chat TEXT,
  ability TEXT DEFAULT '[]',
  traits TEXT DEFAULT '[]',
  wikiFull TEXT,
  wikiThumb TEXT,
  sortOrder INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pvz_keywords (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT ''
);
`

function ensureColumn(
  db: Database.Database,
  table: string,
  column: string,
  ddl: string,
): void {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddl}`)
  }
}

export function migrate(db: Database.Database): void {
  db.exec(DDL)
  ensureColumn(db, 'floors', 'artwork', "TEXT DEFAULT ''")
  ensureColumn(db, 'librarians', 'sheet', "TEXT DEFAULT ''")
  ensureColumn(db, 'librarians', 'portrait', "TEXT DEFAULT ''")
  ensureColumn(db, 'librarians', 'portraitPreview', "TEXT DEFAULT ''")
  ensureColumn(db, 'librarians', 'sortOrder', 'INTEGER DEFAULT 0')
}

export const TABLES = [
  'floors',
  'librarians',
  'core_pages',
  'combat_pages',
  'books',
  'anomalies',
  'literary_worlds',
  'supernatural_spaces',
  'repositories',
  'invitations',
  'guests',
  'page_packs',
  'cards',
  'rail_stations',
  'energy_records',
  'factions',
  'director_entries',
  'lore_entries',
  'term_sections',
  'term_entries',
  'pvz_plants',
  'pvz_keywords',
] as const

export type TableName = (typeof TABLES)[number]
