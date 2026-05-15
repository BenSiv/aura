import * as SQLite from 'expo-sqlite';

/**
 * Aura ML Engine - Implicit Preference Learning
 */

// Mapping of keywords found in bios to implicit attributes
const ATTRIBUTE_MAP: Record<string, string[]> = {
  'dog': ['Pets', 'Outdoors'],
  'cat': ['Pets', 'Introvert'],
  'mountain': ['Outdoors', 'Fitness', 'Adventure'],
  'hike': ['Outdoors', 'Fitness'],
  'read': ['Academic', 'Reading', 'Introvert'],
  'library': ['Academic', 'Reading'],
  'code': ['Tech', 'Science'],
  'engineer': ['Tech', 'Science'],
  'chef': ['Cooking', 'Art'],
  'cook': ['Cooking'],
  'wine': ['Travel', 'Humor'],
  'party': ['Extrovert', 'Music'],
  'concert': ['Music', 'Extrovert'],
  'gym': ['Fitness'],
  'yoga': ['Fitness', 'Yoga', 'Introvert'],
  'physics': ['Science', 'Academic'],
  'art': ['Art', 'Reading'],
  'museum': ['Art', 'Academic'],
};

/**
 * Extracts implicit tags from bio text that aren't explicitly mentioned in tags array.
 */
export function inferTagsFromBio(bio: string): string[] {
  const inferred = new Set<string>();
  const lowercaseBio = bio.toLowerCase();

  for (const [keyword, attributes] of Object.entries(ATTRIBUTE_MAP)) {
    if (lowercaseBio.includes(keyword)) {
      attributes.forEach(attr => inferred.add(attr));
    }
  }

  return Array.from(inferred);
}

export async function updatePreferences(
  db: SQLite.SQLiteDatabase,
  profileTags: string[],
  type: 'like' | 'pass'
) {
  // Learning rate: how fast your Aura changes
  const LEARNING_RATE = type === 'like' ? 0.15 : -0.10; // We value positive signals more
  
  for (const tag of profileTags) {
    const result = await db.getFirstAsync<{ weight: number }>(
      'SELECT weight FROM preferences WHERE tag = ?',
      [tag]
    );
    
    if (result) {
      // Clamp weights between -1.0 and 1.0
      const newWeight = Math.min(Math.max(result.weight + LEARNING_RATE, -1.0), 1.0);
      await db.runAsync(
        'UPDATE preferences SET weight = ? WHERE tag = ?',
        [newWeight, tag]
      );
    } else {
      await db.runAsync(
        'INSERT INTO preferences (tag, weight) VALUES (?, ?)',
        [tag, LEARNING_RATE]
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

export async function getPreferences(db: SQLite.SQLiteDatabase): Promise<{ tag: string; weight: number }[]> {
  return await db.getAllAsync<{ tag: string; weight: number }>(
    'SELECT * FROM preferences ORDER BY weight DESC'
  );
}

export async function setPreferenceWeight(db: SQLite.SQLiteDatabase, tag: string, weight: number): Promise<void> {
  await db.runAsync(
    'INSERT OR REPLACE INTO preferences (tag, weight) VALUES (?, ?)',
    [tag, weight]
  );
}
