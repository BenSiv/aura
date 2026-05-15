import * as Notifications from 'expo-notifications';
import { scoreProfile } from './engine';
import * as SQLite from 'expo-sqlite';
import { Profile } from '../data/db';

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
  
  // Score the mock peer using our ML engine
  const tags = JSON.parse(mockPeer.tags);
  const score = await scoreProfile(db, tags);
  
  // Threshold for notification (simplified for mock)
  const threshold = 0.5; 
  
  if (score >= threshold) {
    // Cache the discovery
    await db.runAsync(
      'INSERT OR REPLACE INTO discovery_cache (id, profileId, score, timestamp, status) VALUES (?, ?, ?, ?, ?)',
      [Math.random().toString(36).substr(2, 9), mockPeer.id, score, Date.now(), 'pending']
    );
    // Ensure the profile itself is in the profiles table (mocking the gossip receipt)
    await db.runAsync(
      'INSERT OR IGNORE INTO profiles (id, name, bio, images, tags, distance, lastSeen) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [mockPeer.id, mockPeer.name, mockPeer.bio, mockPeer.images, mockPeer.tags, mockPeer.distance, Date.now()]
    );

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
