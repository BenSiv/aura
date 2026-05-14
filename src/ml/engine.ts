import * as SQLite from 'expo-sqlite';

/**
 * Aura ML Engine - Implicit Preference Learning
 * Learns user preferences by adjusting weights of tags based on interactions.
 */

export async function updatePreferences(
  db: SQLite.SQLiteDatabase,
  profileTags: string[],
  type: 'like' | 'pass'
) {
  const delta = type === 'like' ? 0.1 : -0.1;
  
  for (const tag of profileTags) {
    // Check if tag exists
    const result = await db.getFirstAsync<{ tag: string; weight: number }>(
      'SELECT * FROM preferences WHERE tag = ?',
      [tag]
    );
    
    if (result) {
      await db.runAsync(
        'UPDATE preferences SET weight = weight + ? WHERE tag = ?',
        [delta, tag]
      );
    } else {
      await db.runAsync(
        'INSERT INTO preferences (tag, weight) VALUES (?, ?)',
        [tag, delta]
      );
    }
  }
}

export async function scoreProfile(
  db: SQLite.SQLiteDatabase,
  profileTags: string[]
): Promise<number> {
  let totalScore = 0;
  
  for (const tag of profileTags) {
    const result = await db.getFirstAsync<{ weight: number }>(
      'SELECT weight FROM preferences WHERE tag = ?',
      [tag]
    );
    if (result) {
      totalScore += result.weight;
    }
  }
  
  // Normalize score between 0 and 1 (conceptually)
  return totalScore;
}
