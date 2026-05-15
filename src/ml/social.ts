import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'aura.db';

/**
 * Calculates the "Social Aura Score" for a profile based on mesh gossip.
 * This is the implementation of the "Trust Cluster" logic from the simulation.
 */
export async function calculateSocialScore(profileId: string): Promise<number> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  
  // 1. Get all feedback for this profile
  const feedbacks = await db.getAllAsync<{ reporterProfileId: string, rating: number }>(
    'SELECT reporterProfileId, rating FROM peer_feedback WHERE targetProfileId = ?',
    [profileId]
  );

  if (feedbacks.length === 0) return 1.0; // Baseline

  // 2. Identify "Trust Bonds" (Mutual Matches)
  // We trust feedback more if we have also liked the person who gave the feedback
  const mutuals = await db.getAllAsync<{ profileId: string }>(
    "SELECT profileId FROM history WHERE interaction = 'liked'"
  );
  const trustedReporters = new Set(mutuals.map(m => m.profileId));

  let totalWeightedRating = 0;
  let totalWeight = 0;

  for (const fb of feedbacks) {
    const isTrusted = trustedReporters.has(fb.reporterProfileId);
    
    // The "Aura Theorem" Weights:
    // - Positive feedback from a mutual: 3.0 weight
    // - Negative feedback from a stranger: 0.1 weight (hard to tank someone)
    // - Positive feedback from a stranger: 1.0 weight
    let weight = 1.0;
    if (fb.rating > 0) {
      weight = isTrusted ? 3.0 : 1.0;
    } else {
      weight = isTrusted ? 2.0 : 0.1;
    }

    totalWeightedRating += (fb.rating * weight);
    totalWeight += weight;
  }

  const socialResonance = totalWeightedRating / totalWeight;
  return Math.max(0.1, 1.0 + socialResonance);
}

export async function addPeerFeedback(targetId: string, reporterId: string, rating: number) {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.runAsync(
    'INSERT INTO peer_feedback (targetProfileId, reporterProfileId, rating, timestamp) VALUES (?, ?, ?, ?)',
    [targetId, reporterId, rating, Date.now()]
  );
}
