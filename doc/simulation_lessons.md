# Lessons from the Aura Simulation

This document outlines key findings from the `simaura` agent-based simulation and how they have been applied to the `aura` application.

## 1. The "Aura Theorem" & Squelch Logic
**Lesson:** In a decentralized mesh, negative signals from unverified sources (strangers) must be heavily discounted to prevent malicious "Aura Hacking."
- **Simulation Finding:** Trolls could easily tank an honest user's score if all feedback was weighted equally.
- **Application Implementation:** Untrusted negative signals are weighted at **0.1**, while trusted (mutual) positive signals are weighted at **3.0**.

## 2. Redemption & Asymmetric Time Decay
**Lesson:** Fixed reputation makes it impossible for users to fix a "bad first impression."
- **Simulation Finding:** After a "Troll" actor changed behavior, their reputation recovered too slowly because old negative signals remained in peer caches.
- **Application Implementation:** Implemented **Asymmetric Time Decay** in `ml/social.ts`. Negative signals now decay 4x faster (7-day half-life) than positive signals (30-day half-life).

## 3. Reputation Confidence & Maturation
**Lesson:** A "100% Match" from a newcomer is mathematically different from a "100% Match" from a long-term community member.
- **Simulation Finding:** Newcomers with neutral scores could be mistaken for "Low Quality" actors who had been downvoted to neutral.
- **Application Implementation:** Added a **Confidence Metric**. Scores are now presented with a percentage indicating how many unique peers have verified the signal. Notifications now show: `A 85% match (Confidence: 90%)`.

## 4. Bridging Digital & Physical (The "Approach" Behavior)
**Lesson:** High digital resonance should trigger physical intent.
- **Simulation Finding:** When agents received notifications of a high-resonance match (>1.8 score), they transitioned from "Socializing" to "Approaching." This created physical clusters of high-match individuals.
- **Application Implementation:** Future UI work should focus on "Intent Signalling"—allowing a user to signal that they are open to an approach after a high-Aura discovery.

## 5. Subjective Reality
**Lesson:** Your Aura is not a global property; it is a relational perception.
- **Simulation Finding:** A Troll can look "Green" to another Troll but "Red" to an Honest user simultaneously.
- **Application Implementation:** The app architecture enforces this by ensuring the "Aura Score" is calculated strictly on the local device based on the specific gossip it has received.
