import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { getOrInitializeDbKey } from './security';

const DATABASE_NAME = 'aura.db';

export interface Profile {
  id: string;
  name: string;
  bio: string;
  images: string; // JSON string
  tags: string;   // JSON string
  distance: number;
  lastSeen: number;
}

export interface Interaction {
  id: number;
  profileId: string;
  type: 'like' | 'pass';
  timestamp: number;
}

/**
 * Initializes the encrypted database and creates tables if they don't exist.
 */
export async function initializeDatabase() {
  console.log('[DB] Initializing database...');
  
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  
  if (Platform.OS !== 'web') {
    console.log('[DB] Applying SQLCipher encryption...');
    const key = await getOrInitializeDbKey();
    await db.execAsync(`PRAGMA key = '${key}';`);
  } else {
    console.log('[DB] Web detected: Skipping encryption for development.');
  }
  
  // Create tables
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      bio TEXT,
      images TEXT,
      tags TEXT, -- JSON array of strings
      distance REAL,
      lastSeen INTEGER
    );
    
    CREATE TABLE IF NOT EXISTS interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profileId TEXT NOT NULL,
      type TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (profileId) REFERENCES profiles(id)
    );

    CREATE TABLE IF NOT EXISTS preferences (
      tag TEXT PRIMARY KEY NOT NULL,
      weight REAL NOT NULL DEFAULT 0.0
    );
  `);
  
  return db;
}
