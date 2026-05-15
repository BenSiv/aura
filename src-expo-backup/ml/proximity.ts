import * as Notifications from 'expo-notifications';
import { scoreProfile, inferTagsFromBio } from './engine';
import * as SQLite from 'expo-sqlite';
import { Profile } from '../data/db';
import { addToHistory } from '../data/history';
import { calculateSocialScore } from './social';

const DATABASE_NAME = 'aura.db';
...
export async function simulateProximityMatch(mockPeer: Profile) {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

  // 1. Tag-based ML Score
  const explicitTags = JSON.parse(mockPeer.tags);
  const inferredTags = inferTagsFromBio(mockPeer.bio);
  const allTags = Array.from(new Set([...explicitTags, ...inferredTags]));
  const personalScore = await scoreProfile(db, allTags);

  // 2. Collective Social Aura Score (The new mesh-reputation signal)
  const { score: socialScore, confidence, attributes } = await calculateSocialScore(mockPeer.id);

  // 3. Composite Resonance: Personal Preference * Social Credibility
  const compositeScore = personalScore * socialScore;

  const threshold = 0.5; 

  if (compositeScore >= threshold) {
    // Cache the discovery with the composite score
    const updatedTags = JSON.stringify(allTags);
    await db.runAsync(
      'INSERT OR REPLACE INTO discovery_cache (id, profileId, score, timestamp, status) VALUES (?, ?, ?, ?, ?)',
      [Math.random().toString(36).substr(2, 9), mockPeer.id, compositeScore, Date.now(), 'pending']
    );
    // Ensure the profile itself is in the profiles table
    await db.runAsync(
      'INSERT OR IGNORE INTO profiles (id, name, bio, images, tags, distance, lastSeen) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [mockPeer.id, mockPeer.name, mockPeer.bio, mockPeer.images, updatedTags, mockPeer.distance, Date.now()]
    );

    // Add to permanent history log
    await addToHistory(mockPeer.id, compositeScore, 'none');

    await sendProximityNotification(mockPeer, compositeScore, confidence);
  }
}

export async function getPendingDiscoveries(): Promise<(Profile & { score: number, cacheId: string })[]> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  const rows = await db.getAllAsync<{ 
    id: string; 
    name: string; 
    bio: string; 
    images: string; 
    tags: string; 
    distance: number; 
    lastSeen: number;
    score: number;
    cacheId: string;
  }>(
    `SELECT p.*, c.score, c.id as cacheId 
     FROM profiles p 
     JOIN discovery_cache c ON p.id = c.profileId 
     WHERE c.status = 'pending' 
     ORDER BY c.score DESC`
  );
  
  return rows.map(row => ({
    ...row,
    score: row.score,
    cacheId: row.cacheId
  }));
}

export async function dismissDiscovery(cacheId: string) {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.runAsync('UPDATE discovery_cache SET status = ? WHERE id = ?', ['dismissed', cacheId]);
}

async function sendProximityNotification(peer: Profile, score: number, confidence: number) {
  const scorePercentage = Math.min(Math.round(score * 100), 100);
  const confidencePercentage = Math.round(confidence * 100);
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Resonant Aura Nearby",
      body: `A ${scorePercentage}% match is within 50 meters. (Confidence: ${confidencePercentage}%)`,
      data: { peerId: peer.id, score, confidence },
    },
    trigger: null, // Send immediately
  });
}

export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}
