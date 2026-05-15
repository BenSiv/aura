import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'aura.db';

/**
 * Calculates the "Social Aura Score" for a profile based on mesh gossip.
 * This is the implementation of the "Trust Cluster" logic from the simulation.
 */
export async function calculateSocialScore(profileId: string): Promise<{ score: number, confidence: number, attributes: string[] }> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  
  // 1. Get all feedback for this profile
  const feedbacks = await db.getAllAsync<{ 
    reporterProfileId: string, 
    rating: number, 
    timestamp: number,
    attributes: string // JSON string array
  }>(
    'SELECT reporterProfileId, rating, timestamp, attributes FROM peer_feedback WHERE targetProfileId = ?',
    [profileId]
  );

  if (feedbacks.length === 0) return { score: 1.0, confidence: 0, attributes: [] };

  // 2. Identify "Trust Bonds"
  const trustedRows = await db.getAllAsync<{ profileId: string }>(
    "SELECT profileId FROM history WHERE interaction = 'liked'"
  );
  const trustedReporters = new Set(trustedRows.map(m => m.profileId));

  // 3. Subjective Attribute Valence (Preferences)
  // In a real app, this would be loaded from a user_preferences table.
  const myValence: Record<string, number> = {
    'charming': 0.5,
    'gentleman': 0.4,
    'straight forward': 0.2,
    'too nerdy': 0.1, // Subjective: I like nerds!
    'too aggressive': -0.8,
    'creep': -1.2
  };

  let totalWeightedRating = 0;
  let totalWeight = 0;
  const collectedAttributes = new Set<string>();

  for (const fb of feedbacks) {
    const isTrusted = trustedReporters.has(fb.reporterProfileId);
    
    // The "Aura Theorem" Weights:
    let weight = fb.rating > 0 ? (isTrusted ? 3.0 : 1.0) : (isTrusted ? 2.0 : 0.1);

    // ASYMMETRIC TIME DECAY:
    const age = Date.now() - fb.timestamp;
    const decayConst = fb.rating > 0 ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    const decayFactor = Math.max(0.1, Math.exp(-age / decayConst));
    
    // RELATIONAL VALENCE:
    let attributeImpact = 0;
    if (fb.attributes) {
      try {
        const attrs: string[] = JSON.parse(fb.attributes);
        attrs.forEach(a => {
          collectedAttributes.add(a);
          attributeImpact += (myValence[a.toLowerCase()] || 0);
        });
      } catch (e) { /* ignore parse errors */ }
    }

    const finalWeight = weight * decayFactor;
    totalWeightedRating += ((fb.rating + attributeImpact) * finalWeight);
    totalWeight += finalWeight;
  }

  const socialResonance = totalWeightedRating / totalWeight;
  const uniqueReporters = new Set(feedbacks.map(f => f.reporterProfileId)).size;

  return {
    score: Math.max(0.1, 1.0 + socialResonance),
    confidence: Math.min(uniqueReporters / 10, 1.0),
    attributes: Array.from(collectedAttributes).slice(0, 5)
  };
}

export async function addPeerFeedback(targetId: string, reporterId: string, rating: number, attributes: string[]) {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.runAsync(
    'INSERT INTO peer_feedback (targetProfileId, reporterProfileId, rating, attributes, timestamp) VALUES (?, ?, ?, ?, ?)',
    [targetId, reporterId, rating, JSON.stringify(attributes), Date.now()]
  );
}
