# Zero-Knowledge Proximity Verification: Architecture & Paradigms

This document outlines the architectural blueprints, mathematical foundations, and implementation trade-offs for privacy-preserving distance verification within Aura's local-first P2P mesh network.

---

## The Core Privacy Challenge

In traditional location-based apps, sharing raw GPS coordinates is a massive security hazard, exposing users to central database leaks and local **triangulation/trilateration attacks** (where a malicious peer queries distance from multiple points to pinpoint a user's exact coordinates).

Aura solves this using **Zero-Knowledge Proofs (ZKPs) for distance**, allowing peers to mathematically verify:
> *"I am within $D_{max}$ distance of you"*
without ever disclosing actual coordinates, absolute positions, or sub-net details.

---

## Paradigm A: Spatial zk-SNARKs (Grid-Based)

This paradigm maps continuous spatial coordinates to a discrete grid system (such as the **Uber H3 Hexagonal Grid** or **Geohashes**).

```
   [Continuous Coordinates] ➔ [Discrete Grid Cell] ➔ [Salted Commitment Hash]
                                                           │
                                                           ▼
                                                  [zk-SNARK Circuit] 
                                                  ✔ Proves cell adjacency
                                                  ✔ Hides actual cell
```

### The Mechanism

1. **Commitment**: The prover converts their physical coordinate $(X_1, Y_1)$ to a discrete grid cell $C_1$. They generate a public commitment by hashing the cell with a cryptographically secure random salt $S_1$:
   $$\text{Commitment}_1 = \text{Hash}(C_1 \parallel S_1)$$
   Only this commitment is broadcasted over the P2P mesh.

2. **zk-SNARK Circuit**: To verify proximity, the prover generates a zero-knowledge proof locally. The circuit takes:
   * **Private Inputs**: Private coordinate $(X_1, Y_1)$, cell $C_1$, and salt $S_1$.
   * **Public Inputs**: Target commitment $\text{Commitment}_2$ and allowed neighborhood threshold.
   * **Assertion**: The circuit proves that $C_1$ and $C_2$ (revealed by the preimage of $\text{Commitment}_2$) are either identical or directly adjacent, and that $C_1$ hashes to $\text{Commitment}_1$.

### Trade-offs
* **Pros**: Completely non-interactive (broadcast once, verify offline); computationally fast to verify.
* **Cons**: Arbitrary cell boundaries cause **edge effects** (users standing 5 meters apart on opposite sides of a hex boundary appear completely disconnected); fixed grid resolutions make dynamic thresholds impossible without compiling multiple key-sets.

---

## Paradigm B: Homomorphic Distance & Range Proofs (Continuous)

This paradigm uses **additive homomorphic encryption** (such as the **Paillier cryptosystem**) combined with cryptographic **Range Proofs** (such as **Bulletproofs**) to compute distances directly on continuous Euclidean coordinates.

```
       Prover (Peer A)                               Verifier (Peer B)
  ─────────────────────────                     ───────────────────────────
   Encrypts coordinates
   [E(X1), E(Y1)]
             │
             │ 1. Sends Encrypted Coordinates
             └──────────────────────────────────────────────>
                                                 Homomorphically computes 
                                                 squared distance: E(d²)
                                                 Blinds it with random 'r':
                                                 E(d² · r)
                                                            │
             <──────────────────────────────────────────────┘
             2. Returns Encrypted Blinded Distance
   Decrypts: d² · r
   Generates Range Proof:
   Proves d² · r ≤ D_max² · r
             │
             │ 3. Sends Range Proof (Bulletproof)
             └──────────────────────────────────────────────>
                                                 Verifies Bulletproof
                                                 Returns TRUE or FALSE
```

### Mathematical Formulation

1. **Homomorphic Setup**: 
   Peer A generates a Paillier public/private key pair. They encrypt their continuous coordinates $(X_1, Y_1)$ using their public key:
   $$C_{X_1} = E(X_1), \quad C_{Y_1} = E(Y_1)$$
   Peer A sends these ciphertexts along with their public key to Peer B.

2. **Homomorphic Evaluation**: 
   Due to the additive homomorphic properties of Paillier:
   $$E(A + B) = E(A) \cdot E(B) \pmod{n^2}$$
   $$E(k \cdot A) = E(A)^k \pmod{n^2}$$
   
   Peer B (who knows their own continuous coordinate $(X_2, Y_2)$) can homomorphically compute the encrypted squared Euclidean distance $E(d^2)$ without learning $X_1$ or $Y_1$:
   $$d^2 = (X_1 - X_2)^2 + (Y_1 - Y_2)^2 = X_1^2 + Y_1^2 + X_2^2 + Y_2^2 - 2X_1X_2 - 2Y_1Y_2$$
   $$E(d^2) = E(X_1^2 + Y_1^2) \cdot E(X_1)^{-2X_2} \cdot E(Y_1)^{-2Y_2} \cdot E(X_2^2 + Y_2^2) \pmod{n^2}$$
   *(Note: Peer A sends the encrypted squared coordinate sum $E(X_1^2 + Y_1^2)$ in Step 1).*

3. **Blinding**:
   To prevent Peer A from immediately learning the exact distance upon decryption, Peer B selects a high-entropy random blinding factor $r \in \mathbb{Z}_n^+$ and computes the blinded ciphertext:
   $$E(d^2 \cdot r) = E(d^2)^r \pmod{n^2}$$
   Peer B sends $E(d^2 \cdot r)$ back to Peer A.

4. **Range Proof**:
   Peer A decrypts the blinded ciphertext to obtain the plaintext value $V = d^2 \cdot r$.
   Peer A generates a **Bulletproof** (a highly compact zero-knowledge range proof that requires no trusted setup) proving that:
   $$V \le D_{max}^2 \cdot r$$
   Peer A sends the Bulletproof to Peer B.
   
5. **Verification**:
   Peer B verifies the Bulletproof using $D_{max}^2 \cdot r$ (since Peer B knows both $D_{max}$ and the random factor $r$). If valid, Peer B is mathematically assured Peer A is within range.

### Trade-offs
* **Pros**: Fluid, continuous distance with zero edge effects; dynamic thresholds are natively supported ($D_{max}$ can be changed on the fly); completely trustless (no cryptographic trusted setup required).
* **Cons**: Requires active, multi-hop connection stability (3-4 network stages); computationally heavy on mobile processors due to Paillier modular exponentiations with 2048/4096-bit keys.

---

## Aura Selected Implementation: Paradigm B

To prioritize a premium, fluid **Aura resonance circle** with no artificial grid boundaries, **Paradigm B** has been selected as the active implementation pathway.

### Engineering Mitigations for Paradigm B
To counter the high CPU costs on mobile devices and potential triangulation oracle queries, our implementation will enforce:
1. **Rust Core Compilation**: Native Rust-level cryptography (via the `kzen-paillier` and `bulletproofs` crates) exposed as Tauri commands to bypass slow JavaScript runtimes.
2. **Oracle Rate Limiting**: Intercepting and throttling distance challenge requests per peer connection, binding verification to our **Hourly ID Rotation** cycles.
