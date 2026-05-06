import { getDatabase } from './client';

const SCHEMA_VERSION = 1;

export const runMigrations = async (): Promise<void> => {
  const db = await getDatabase();

  console.log('🚀 Running migrations...');

  // Routines
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS routines (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      color TEXT,
      frequency TEXT NOT NULL,
      days_of_week TEXT,
      preferred_time TEXT,
      duration INTEGER,
      is_active INTEGER DEFAULT 1,
      start_date TEXT NOT NULL,
      end_date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  console.log('✅ routines OK');

  // Tasks (FIXED)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      due_date TEXT NOT NULL,
      due_time TEXT,
      duration INTEGER,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      category_id TEXT,
      tags TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  console.log('✅ tasks OK');

  // Routine completions (SIN foreign key para evitar problemas en web)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS routine_completions (
      id TEXT PRIMARY KEY NOT NULL,
      routine_id TEXT NOT NULL,
      date TEXT NOT NULL,
      completed_at TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(routine_id, date)
    );
  `);
  console.log('✅ completions OK');

  // Categories
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      icon TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  console.log('✅ categories OK');

  // Indexes
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
    CREATE INDEX IF NOT EXISTS idx_routine_completions_date ON routine_completions(date);
    CREATE INDEX IF NOT EXISTS idx_routine_completions_routine ON routine_completions(routine_id);
  `);
  console.log('✅ indexes OK');

  // Schema version
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_version (version INTEGER);
    INSERT OR REPLACE INTO schema_version (rowid, version) VALUES (1, ${SCHEMA_VERSION});
  `);
  console.log('✅ schema version OK');
};

export const initializeDatabase = async (): Promise<void> => {
  try {
    await runMigrations();
    console.log('🎉 Database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
};