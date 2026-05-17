mod db;
mod mesh;
mod zk_distance;

use std::sync::Mutex;
use rusqlite::Connection;
use tauri::Manager;
use serde::{Serialize, Deserialize};

pub struct AppState {
    pub db: Mutex<Connection>,
}

#[derive(Serialize, Deserialize)]
struct LocalProfile {
    id: String,
    name: String,
    bio: String,
    images: String,
    tags: String,
    gender: String,
    interested_in: String,
}

#[tauri::command]
fn save_local_profile(state: tauri::State<AppState>, profile: LocalProfile) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT OR REPLACE INTO local_profile (id, name, bio, images, tags, gender, interested_in) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        [
            &profile.id, 
            &profile.name, 
            &profile.bio, 
            &profile.images, 
            &profile.tags,
            &profile.gender,
            &profile.interested_in
        ],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_local_profile(state: tauri::State<AppState>) -> Result<Option<LocalProfile>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, name, bio, images, tags, gender, interested_in FROM local_profile LIMIT 1").map_err(|e| e.to_string())?;
    let mut rows = stmt.query([]).map_err(|e| e.to_string())?;

    if let Some(row) = rows.next().map_err(|e| e.to_string())? {
        Ok(Some(LocalProfile {
            id: row.get(0).map_err(|e| e.to_string())?,
            name: row.get(1).map_err(|e| e.to_string())?,
            bio: row.get(2).map_err(|e| e.to_string())?,
            images: row.get(3).map_err(|e| e.to_string())?,
            tags: row.get(4).map_err(|e| e.to_string())?,
            gender: row.get::<_, Option<String>>(5).map_err(|e| e.to_string())?.unwrap_or_else(|| "Other".to_string()),
            interested_in: row.get::<_, Option<String>>(6).map_err(|e| e.to_string())?.unwrap_or_else(|| "Both".to_string()),
        }))
    } else {
        Ok(None)
    }
}

#[tauri::command]
fn get_settings(state: tauri::State<AppState>) -> Result<Vec<(String, String)>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT key, value FROM settings").map_err(|e| e.to_string())?;
    
    let settings = stmt.query_map([], |row| {
        Ok((row.get(0)?, row.get(1)?))
    })
    .map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;

    Ok(settings)
}

#[tauri::command]
fn start_broadcasting(_state: tauri::State<AppState>, profile: mesh::PeerProfile) -> Result<(), String> {
    mesh::broadcast_profile(profile);
    Ok(())
}

#[tauri::command]
fn record_local_interaction(state: tauri::State<AppState>, profile_id: String, interaction_type: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let timestamp = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs();
    
    // Check if interaction already exists to avoid duplicates
    let count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM interactions WHERE profileId = ? AND type = ?",
        [&profile_id, &interaction_type],
        |row| row.get(0)
    ).unwrap_or(0);

    if count == 0 {
        conn.execute(
            "INSERT INTO interactions (profileId, type, timestamp) VALUES (?1, ?2, ?3)",
            (&profile_id, &interaction_type, timestamp),
        ).map_err(|e| e.to_string())?;
    }
    
    // Send P2P Like message
    if interaction_type == "like" {
        if let Ok(mut stmt) = conn.prepare("SELECT id FROM local_profile LIMIT 1") {
            if let Ok(mut rows) = stmt.query([]) {
                if let Ok(Some(row)) = rows.next() {
                    if let Ok(sender_id) = row.get::<_, String>(0) {
                        let msg = mesh::ChatMessage {
                            msg_type: "blind_like".to_string(),
                            id: format!("like_{}_{}", sender_id, timestamp),
                            sender_id,
                            receiver_id: profile_id.clone(),
                            text: "like".to_string(),
                            timestamp,
                        };
                        mesh::broadcast_chat(msg);
                    }
                }
            }
        }
    }
    
    Ok(())
}

#[tauri::command]
fn check_mutual_match(state: tauri::State<AppState>, profile_id: String) -> Result<bool, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    
    // Check if we liked them
    let our_like: i64 = conn.query_row(
        "SELECT COUNT(*) FROM interactions WHERE profileId = ? AND type = 'like'",
        [&profile_id],
        |row| row.get(0)
    ).unwrap_or(0);

    // Check if they liked us
    let their_like: i64 = conn.query_row(
        "SELECT COUNT(*) FROM pending_likes WHERE senderId = ?",
        [&profile_id],
        |row| row.get(0)
    ).unwrap_or(0);

    Ok(our_like > 0 && their_like > 0)
}

#[tauri::command]
fn get_interaction_history(state: tauri::State<AppState>) -> Result<Vec<(String, String, u64)>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT profileId, type, timestamp FROM interactions ORDER BY timestamp DESC").map_err(|e| e.to_string())?;
    
    let history = stmt.query_map([], |row| {
        Ok((row.get(0)?, row.get(1)?, row.get(2)?))
    })
    .map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;

    Ok(history)
}

#[tauri::command]
fn revert_interaction(state: tauri::State<AppState>, profile_id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "DELETE FROM interactions WHERE profileId = ?",
        [&profile_id],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn broadcast_zk_packet(sender_id: String, receiver_id: String, msg_type: String, text: String) -> Result<(), String> {
    let timestamp = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs();
    let id = format!("zk_{}_{}", sender_id, timestamp);
    let msg = mesh::ChatMessage {
        msg_type,
        id,
        sender_id,
        receiver_id,
        text,
        timestamp,
    };
    mesh::broadcast_chat(msg);
    Ok(())
}

#[tauri::command]
fn send_chat_message(state: tauri::State<AppState>, sender_id: String, receiver_id: String, text: String) -> Result<(), String> {
    let timestamp = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs();
    let id = format!("{}_{}", sender_id, timestamp);
    
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO messages (id, senderId, receiverId, text, timestamp) VALUES (?1, ?2, ?3, ?4, ?5)",
        (&id, &sender_id, &receiver_id, &text, timestamp),
    ).map_err(|e| e.to_string())?;

    let msg = mesh::ChatMessage {
        msg_type: "chat".to_string(),
        id,
        sender_id,
        receiver_id,
        text,
        timestamp,
    };
    mesh::broadcast_chat(msg);
    
    Ok(())
}

#[tauri::command]
fn get_chat_history(state: tauri::State<AppState>, peer_id: String) -> Result<Vec<mesh::ChatMessage>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, senderId, receiverId, text, timestamp FROM messages WHERE senderId = ?1 OR receiverId = ?1 ORDER BY timestamp ASC").map_err(|e| e.to_string())?;
    
    let messages = stmt.query_map([&peer_id], |row| {
        Ok(mesh::ChatMessage {
            msg_type: "chat".to_string(),
            id: row.get(0)?,
            sender_id: row.get(1)?,
            receiver_id: row.get(2)?,
            text: row.get(3)?,
            timestamp: row.get(4)?,
        })
    })
    .map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;

    Ok(messages)
}

#[tauri::command]
fn get_chat_partners(state: tauri::State<AppState>) -> Result<Vec<mesh::PeerProfile>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    
    // Get unique peer IDs from messages table
    let mut stmt = conn.prepare("
        SELECT DISTINCT CASE 
            WHEN senderId IN (SELECT id FROM local_profile) THEN receiverId 
            ELSE senderId 
        END as peer_id 
        FROM messages
    ").map_err(|e| e.to_string())?;
    
    let peer_ids = stmt.query_map([], |row| {
        Ok(row.get::<_, String>(0)?)
    })
    .map_err(|e| e.to_string())?
    .collect::<Result<Vec<String>, _>>()
    .map_err(|e| e.to_string())?;

    if peer_ids.is_empty() {
        return Ok(Vec::new());
    }

    // Fetch full profiles for these IDs
    let placeholders = peer_ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
    let query = format!("SELECT id, name, bio, images, tags FROM profiles WHERE id IN ({})", placeholders);
    
    let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;
    let params = rusqlite::params_from_iter(peer_ids.iter());
    
    let profiles = stmt.query_map(params, |row| {
        Ok(mesh::PeerProfile {
            id: row.get(0)?,
            name: row.get(1)?,
            bio: row.get(2)?,
            images: row.get(3)?,
            tags: row.get(4)?,
            gender: "Other".to_string(),
            interested_in: "Both".to_string(),
        })
    })
    .map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;

    Ok(profiles)
}

#[tauri::command]
fn save_peer_profile(state: tauri::State<AppState>, profile: mesh::PeerProfile) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let timestamp = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs();
    
    conn.execute(
        "INSERT OR REPLACE INTO profiles (id, name, bio, images, tags, lastSeen) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        (&profile.id, &profile.name, &profile.bio, &profile.images, &profile.tags, timestamp),
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
fn get_peer_profiles(state: tauri::State<AppState>, profile_ids: Vec<String>) -> Result<Vec<mesh::PeerProfile>, String> {
    if profile_ids.is_empty() {
        return Ok(Vec::new());
    }
    
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let placeholders = profile_ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
    let query = format!("SELECT id, name, bio, images, tags FROM profiles WHERE id IN ({})", placeholders);
    
    let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;
    let params = rusqlite::params_from_iter(profile_ids.iter());
    
    let profiles = stmt.query_map(params, |row| {
        Ok(mesh::PeerProfile {
            id: row.get(0)?,
            name: row.get(1)?,
            bio: row.get(2)?,
            images: row.get(3)?,
            tags: row.get(4)?,
            gender: "Other".to_string(),
            interested_in: "Both".to_string(),
        })
    })
    .map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;

    Ok(profiles)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Get platform-specific app data dir
            let app_dir = app.path().app_data_dir().unwrap_or_else(|_| std::path::PathBuf::from("."));
            
            // Initialize database
            let conn = db::initialize_database(app_dir).expect("Failed to initialize database");
            
            // Manage state
            app.manage(AppState {
                db: Mutex::new(conn),
            });
            
            // Start listening for peers
            mesh::start_mesh(app.handle().clone());
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_settings,
            save_local_profile,
            get_local_profile,
            start_broadcasting,
            record_local_interaction,
            get_interaction_history,
            revert_interaction,
            send_chat_message,
            get_chat_history,
            get_chat_partners,
            check_mutual_match,
            save_peer_profile,
            get_peer_profiles,
            broadcast_zk_packet,
            zk_distance::generate_paillier_keypair,
            zk_distance::encrypt_location,
            zk_distance::compute_homomorphic_distance,
            zk_distance::decrypt_blinded_distance,
            zk_distance::generate_range_proof,
            zk_distance::verify_range_proof
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
