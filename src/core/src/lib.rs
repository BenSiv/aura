mod db;
mod mesh;

use std::sync::Mutex;
use rusqlite::Connection;
use tauri::Manager;
use serde::{Serialize, Deserialize};

struct AppState {
    db: Mutex<Connection>,
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
            gender: row.get(5).map_err(|e| e.to_string())?,
            interested_in: row.get(6).map_err(|e| e.to_string())?,
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
fn start_broadcasting(state: tauri::State<AppState>, profile: mesh::PeerProfile) -> Result<(), String> {
    mesh::broadcast_profile(profile);
    Ok(())
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
            start_broadcasting
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
