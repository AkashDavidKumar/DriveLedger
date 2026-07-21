import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '../../drizzle/migrations';
import * as schema from './schema';

export const expoDb = openDatabaseSync('driveledger.db');
export const db = drizzle(expoDb, { schema });

export function useDbMigrations() {
  return useMigrations(db, migrations);
}
