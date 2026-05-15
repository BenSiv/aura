mod db;
mod mesh;

use std::sync::Mutex;
use rusqlite::Connection;
use tauri::Manager;

struct AppState {
    db: Mutex<Connection>,
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
            
            // Start background proximity scanner (Mesh placeholder)
            mesh::start_background_scan(app.handle().clone());
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_settings])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
