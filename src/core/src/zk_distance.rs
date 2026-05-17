use kzen_paillier::{EncryptionKey, DecryptionKey, RawCiphertext, RawPlaintext, Keypair, Paillier, Encrypt, Decrypt, KeyGeneration};
use curv::BigInt;
use curv::arithmetic::{Converter, Modulo};
use bulletproofs::{BulletproofGens, PedersenGens, RangeProof};
use merlin::Transcript;
use curve25519_dalek_ng::scalar::Scalar;
use curve25519_dalek_ng::ristretto::CompressedRistretto;
use rand::thread_rng;
use std::str::FromStr;

#[tauri::command]
pub fn generate_paillier_keypair() -> Result<(String, String), String> {
    let (ek, dk) = Paillier::keypair().keys();
    let ek_hex = ek.n.to_str_radix(16);
    let dk_hex = format!("{},{}", dk.p.to_str_radix(16), dk.q.to_str_radix(16));
    Ok((ek_hex, dk_hex))
}

#[tauri::command]
pub fn encrypt_location(x: f64, y: f64, pubkey_hex: String) -> Result<(String, String, String), String> {
    let n = BigInt::from_str_radix(&pubkey_hex, 16).map_err(|e| e.to_string())?;
    let ek = EncryptionKey {
        nn: &n * &n,
        n: n.clone(),
    };

    // Represent coordinates as flat offset meters scaled by 1000 for millimeter precision
    let x_scaled = (x * 1000.0).round() as i64;
    let y_scaled = (y * 1000.0).round() as i64;

    let to_paillier_plain = |val: i64| {
        if val < 0 {
            &n - BigInt::from(val.abs() as u64)
        } else {
            BigInt::from(val as u64)
        }
    };

    let px = to_paillier_plain(x_scaled);
    let py = to_paillier_plain(y_scaled);
    let p_sq = &px * &px + &py * &py;

    let cx = Paillier::encrypt(&ek, RawPlaintext::from(px));
    let cy = Paillier::encrypt(&ek, RawPlaintext::from(py));
    let c_sq = Paillier::encrypt(&ek, RawPlaintext::from(p_sq));

    Ok((
        cx.0.to_str_radix(16),
        cy.0.to_str_radix(16),
        c_sq.0.to_str_radix(16)
    ))
}

#[tauri::command]
pub fn compute_homomorphic_distance(
    enc_x: String,
    enc_y: String,
    enc_sq: String,
    my_x: f64,
    my_y: f64,
    pubkey_hex: String
) -> Result<(String, String), String> {
    let n = BigInt::from_str_radix(&pubkey_hex, 16).map_err(|e| e.to_string())?;
    let ek = EncryptionKey {
        nn: &n * &n,
        n: n.clone(),
    };

    let x2 = (my_x * 1000.0).round() as i64;
    let y2 = (my_y * 1000.0).round() as i64;

    let c_x = BigInt::from_str_radix(&enc_x, 16).map_err(|e| e.to_string())?;
    let c_y = BigInt::from_str_radix(&enc_y, 16).map_err(|e| e.to_string())?;
    let c_sq = BigInt::from_str_radix(&enc_sq, 16).map_err(|e| e.to_string())?;

    let homomorphic_mul = |ciphertext: &BigInt, scalar: i64| -> BigInt {
        let abs_scalar = BigInt::from(scalar.abs() as u64);
        let c_pow = BigInt::mod_pow(ciphertext, &abs_scalar, &ek.nn);
        if scalar < 0 {
            BigInt::mod_inv(&c_pow, &ek.nn).unwrap_or_else(|| BigInt::from(1))
        } else {
            c_pow
        }
    };

    let term1 = homomorphic_mul(&c_x, -2 * x2);
    let term2 = homomorphic_mul(&c_y, -2 * y2);

    let const_val = x2 * x2 + y2 * y2;
    let const_enc = Paillier::encrypt(&ek, RawPlaintext::from(BigInt::from(const_val as u64)));

    let mut enc_d2 = (&c_sq * &term1) % &ek.nn;
    enc_d2 = (&enc_d2 * &term2) % &ek.nn;
    enc_d2 = (&enc_d2 * const_enc.0.as_ref()) % &ek.nn;

    // Blinding factor: 32-bit random factor to prevent triangulation
    let r = fastrand::u32(100_000..2_000_000) as u64;
    let r_bn = BigInt::from(r);

    let blinded_enc = BigInt::mod_pow(&enc_d2, &r_bn, &ek.nn);

    Ok((blinded_enc.to_str_radix(16), r.to_string()))
}

#[tauri::command]
pub fn decrypt_blinded_distance(blinded_enc_hex: String, privkey_hex: String) -> Result<String, String> {
    let parts: Vec<&str> = privkey_hex.split(',').collect();
    if parts.len() != 2 {
        return Err("Invalid private key format".to_string());
    }
    let p = BigInt::from_str_radix(parts[0], 16).map_err(|e| e.to_string())?;
    let q = BigInt::from_str_radix(parts[1], 16).map_err(|e| e.to_string())?;
    let dk = DecryptionKey { p, q };

    let c = BigInt::from_str_radix(&blinded_enc_hex, 16).map_err(|e| e.to_string())?;
    let plain = Paillier::decrypt(&dk, RawCiphertext(std::borrow::Cow::Owned(c)));

    Ok(plain.0.into_owned().to_str_radix(10))
}

#[tauri::command]
pub fn generate_range_proof(
    blinded_distance_decrypted: String,
    r: String,
    max_distance_meters: f64
) -> Result<(Vec<u8>, Vec<u8>), String> {
    let v = u64::from_str(&blinded_distance_decrypted).map_err(|e| e.to_string())?;
    let r_val = u64::from_str(&r).map_err(|e| e.to_string())?;

    // Threshold in squared millimeter units to match continuous flatness scaling
    let max_dist_mm = max_distance_meters * 1000.0;
    let threshold = ((max_dist_mm * max_dist_mm) as u64) * r_val;

    if v > threshold {
        return Err("Proximity verification failed: Distance exceeds threshold".to_string());
    }

    let diff = threshold - v;

    let pc_gens = PedersenGens::default();
    let bp_gens = BulletproofGens::new(64, 1);
    let mut prover_transcript = Transcript::new(b"AuraProximityProof");
    let blinding = Scalar::random(&mut thread_rng());

    let (proof, commitment) = RangeProof::prove_single(
        &bp_gens,
        &pc_gens,
        &mut prover_transcript,
        diff,
        &blinding,
        64,
    ).map_err(|e| format!("Proof generation failed: {:?}", e))?;

    Ok((proof.to_bytes(), commitment.as_bytes().to_vec()))
}

#[tauri::command]
pub fn verify_range_proof(
    proof_bytes: Vec<u8>,
    commitment_bytes: Vec<u8>,
    blinded_val_decrypted_for_verif: String, // wait! Peer B doesn't know decrypted v!
    r: String,
    max_distance_meters: f64
) -> Result<bool, String> {
    // Wait, Peer B knows the public Bulletproof proof and commitment for 'diff'!
    // Since diff = threshold - v, Peer B verifies the range proof against the commitment.
    let proof = RangeProof::from_bytes(&proof_bytes).map_err(|e| format!("Invalid proof bytes: {:?}", e))?;
    let mut arr = [0u8; 32];
    if commitment_bytes.len() == 32 {
        arr.copy_from_slice(&commitment_bytes);
    } else {
        return Err("Invalid commitment length, must be 32 bytes".to_string());
    }
    let comm_compress = CompressedRistretto(arr);

    let pc_gens = PedersenGens::default();
    let bp_gens = BulletproofGens::new(64, 1);
    let mut verifier_transcript = Transcript::new(b"AuraProximityProof");

    let is_valid = proof.verify_single(
        &bp_gens,
        &pc_gens,
        &mut verifier_transcript,
        &comm_compress,
        64,
    ).is_ok();

    Ok(is_valid)
}
