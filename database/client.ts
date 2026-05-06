import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) return db;

  try {
    db = await SQLite.openDatabaseAsync('rutina.db');

    // 🔥 IMPORTANTE para web
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = OFF;
    `);

    console.log('✅ DB abierta correctamente');

    return db;
  } catch (error) {
    console.error('❌ Error abriendo DB:', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.closeAsync();
    db = null;
  }
};