import * as Notifications from 'expo-notifications';
import { scoreProfile, inferTagsFromBio } from './engine';
import * as SQLite from 'expo-sqlite';
import { Profile } from '../data/db';
import { addToHistory } from '../data/history';

const DATABASE_NAME = 'aura.db';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function simulateProximityMatch(mockPeer: Profile) {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  
  // 1. Combine explicit tags with inferred tags from bio
  const explicitTags = JSON.parse(mockPeer.tags);
  const inferredTags = inferTagsFromBio(mockPeer.bio);
  const allTags = Array.from(new Set([...explicitTags, ...inferredTags]));
  
  // 2. Score the peer using the expanded tag set
  const score = await scoreProfile(db, allTags);
  
  // Threshold for notification (simplified for mock)
  const threshold = 0.5; 
  
  if (score >= threshold) {
    // Cache the discovery with the expanded tags
    const updatedTags = JSON.stringify(allTags);
    await db.runAsync(
      'INSERT OR REPLACE INTO discovery_cache (id, profileId, score, timestamp, status) VALUES (?, ?, ?, ?, ?)',
      [Math.random().toString(36).substr(2, 9), mockPeer.id, score, Date.now(), 'pending']
    );
    // Ensure the profile itself is in the profiles table
    await db.runAsync(
      'INSERT OR IGNORE INTO profiles (id, name, bio, images, tags, distance, lastSeen) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [mockPeer.id, mockPeer.name, mockPeer.bio, mockPeer.images, updatedTags, mockPeer.distance, Date.now()]
    );

    // Add to permanent history log
    await addToHistory(mockPeer.id, score, 'none');

    await sendProximityNotification(mockPeer, score);
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

async function sendProximityNotification(peer: Profile, score: number) {
  const scorePercentage = Math.min(Math.round(score * 100), 100);
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Resonant Aura Nearby",
      body: `A ${scorePercentage}% match is within 50 meters. Tap to view.`,
      data: { peerId: peer.id },
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
