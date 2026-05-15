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
    await sendProximityNotification(mockPeer, score);
  }
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
