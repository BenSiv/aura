use rusqlite::{Connection, Result};
use std::fs;
use std::path::PathBuf;

pub fn initialize_database(app_dir: PathBuf) -> Result<Connection> {
    // Ensure the app data directory exists
    if !app_dir.exists() {
        fs::create_dir_all(&app_dir).expect("Failed to create app data directory");
    }

    let db_path = app_dir.join("aura.db");
    let conn = Connection::open(db_path)?;

    // TODO: Fetch this key securely from the system keychain instead of hardcoding
    let encryption_key = "aura_super_secret_migration_key";

    // Apply SQLCipher encryption key
    conn.execute(&format!("PRAGMA key = '{}';", encryption_key), [])?;

    // Create tables (migrated from db.ts)
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS profiles (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            bio TEXT,
            images TEXT,
            tags TEXT,
            distance REAL,
            lastSeen INTEGER
        );

        CREATE TABLE IF NOT EXISTS interactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profileId TEXT NOT NULL,
            type TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            FOREIGN KEY (profileId) REFERENCES profiles(id)
        );

        CREATE TABLE IF NOT EXISTS preferences (
            tag TEXT PRIMARY KEY NOT NULL,
            weight REAL NOT NULL DEFAULT 0.0
        );

        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY NOT NULL,
            value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS discovery_cache (
            id TEXT PRIMARY KEY NOT NULL,
            profileId TEXT NOT NULL,
            score REAL NOT NULL,
            timestamp INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            FOREIGN KEY (profileId) REFERENCES profiles(id)
        );

        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profileId TEXT NOT NULL,
            score REAL NOT NULL,
            timestamp INTEGER NOT NULL,
            interaction TEXT DEFAULT 'none',
            FOREIGN KEY (profileId) REFERENCES profiles(id)
        );

        CREATE TABLE IF NOT EXISTS local_profile (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            bio TEXT,
            images TEXT,
            tags TEXT,
            gender TEXT DEFAULT 'Other',
            interested_in TEXT DEFAULT 'Both'
        );

        CREATE TABLE IF NOT EXISTS peer_feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            targetProfileId TEXT NOT NULL,
            reporterProfileId TEXT NOT NULL,
            rating REAL NOT NULL,
            attributes TEXT,
            timestamp INTEGER NOT NULL,
            FOREIGN KEY (targetProfileId) REFERENCES profiles(id)
        );

        INSERT OR IGNORE INTO settings (key, value) VALUES ('visibility_mode', 'resonant');
        INSERT OR IGNORE INTO settings (key, value) VALUES ('projection_timing', 'foreground');
        INSERT OR IGNORE INTO settings (key, value) VALUES ('active_aura', 'true');
        "
    )?;

    // Migrations
    conn.execute("ALTER TABLE local_profile ADD COLUMN images TEXT;", []).ok();
    conn.execute("ALTER TABLE local_profile ADD COLUMN gender TEXT DEFAULT 'Other';", []).ok();
    conn.execute("ALTER TABLE local_profile ADD COLUMN interested_in TEXT DEFAULT 'Both';", []).ok();

    Ok(conn)
}
