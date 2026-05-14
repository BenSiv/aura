import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const DB_KEY_IDENTIFIER = 'aura_db_encryption_key';

/**
 * Manages the encryption key for the local SQLite database.
 * The key is generated on first run and stored in the device's SecureStore.
 */
export async function getOrInitializeDbKey(): Promise<string> {
  let key = await SecureStore.getItemAsync(DB_KEY_IDENTIFIER);
  
  if (!key) {
    // Generate a secure random key if it doesn't exist
    key = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Math.random().toString() + Date.now().toString()
    );
    await SecureStore.setItemAsync(DB_KEY_IDENTIFIER, key);
  }
  
  return key;
}
