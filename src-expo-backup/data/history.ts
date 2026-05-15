import * as SQLite from 'expo-sqlite';
import { Profile } from './db';

const DATABASE_NAME = 'aura.db';

export interface HistoryItem extends Profile {
  historyId: number;
  score: number;
  timestamp: number;
  interaction: 'none' | 'liked' | 'passed' | 'matched';
}

export async function addToHistory(profileId: string, score: number, interaction: HistoryItem['interaction'] = 'none') {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.runAsync(
    'INSERT INTO history (profileId, score, timestamp, interaction) VALUES (?, ?, ?, ?)',
    [profileId, score, Date.now(), interaction]
  );
}

export async function getHistory(): Promise<HistoryItem[]> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  const rows = await db.getAllAsync<any>(
    `SELECT h.id as historyId, h.score, h.timestamp, h.interaction, p.* 
     FROM history h
     JOIN profiles p ON h.profileId = p.id
     ORDER BY h.timestamp DESC
     LIMIT 100`
  );
  
  return rows.map(row => ({
    ...row,
    historyId: row.historyId,
    score: row.score,
    timestamp: row.timestamp,
    interaction: row.interaction
  }));
}

export async function updateHistoryInteraction(historyId: number, interaction: HistoryItem['interaction']) {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.runAsync(
    'UPDATE history SET interaction = ? WHERE id = ?',
    [interaction, historyId]
  );
}
