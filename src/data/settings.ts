import * as SQLite from 'expo-sqlite';

export type VisibilityMode = 'cloaked' | 'resonant' | 'public';
export type ProjectionTiming = 'foreground' | 'background' | 'always';

const DATABASE_NAME = 'aura.db';

export async function getSetting(key: string): Promise<string | null> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  const result = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    [key]
  );
  return result ? result.value : null;
}

export async function updateSetting(key: string, value: string): Promise<void> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, value]
  );
}

export async function getAuraSettings() {
  const visibilityMode = (await getSetting('visibility_mode')) as VisibilityMode;
  const projectionTiming = (await getSetting('projection_timing')) as ProjectionTiming;
  const activeAura = (await getSetting('active_aura')) === 'true';

  return {
    visibilityMode,
    projectionTiming,
    activeAura,
  };
}
