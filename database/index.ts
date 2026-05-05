export { closeDatabase, getDatabase } from './client';
export { initializeDatabase, runMigrations } from './migrations';

import { db } from './client';
import { runMigrations } from './migrations';
// import { seed } from './seed';

export async function initDB() {
    await runMigrations(db);
    // await seed(db);
}