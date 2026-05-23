use serde::{Deserialize, Serialize};
use lettre::transport::smtp::authentication::Credentials;
use lettre::{Message, SmtpTransport, Transport};
use lettre::message::header::{Header, HeaderName, HeaderValue};

#[derive(Clone, Debug)]
struct AutocryptHeader(String);

impl Header for AutocryptHeader {
    fn name() -> HeaderName {
        HeaderName::new_from_ascii_str("Autocrypt")
    }

    fn parse(_s: &str) -> Result<Self, Box<dyn std::error::Error + Send + Sync>> {
        Err("Parsing AutocryptHeader not implemented".into())
    }

    fn display(&self) -> HeaderValue {
        HeaderValue::new(Self::name(), self.0.clone())
    }
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct EmailConfig {
    pub email: String,
    pub password: String,
    pub imap_server: String,
    pub smtp_server: String,
}

#[tauri::command]
pub fn send_email_chat_message(
    config: EmailConfig,
    to_email: String,
    message_json: String,
) -> Result<(), String> {
    println!("[EmailBridge] Sending chat message via SMTP to: {}", to_email);
    
    let from_addr = config.email.parse().map_err(|e| format!("Invalid from address: {:?}", e))?;
    let to_addr = to_email.parse().map_err(|e| format!("Invalid recipient address: {:?}", e))?;

    let email = Message::builder()
        .from(from_addr)
        .to(to_addr)
        .subject("Aura Proximity Chat")
        .header(AutocryptHeader(format!("addr={}; prefer-encrypt=mutual", config.email)))
        .body(message_json)
        .map_err(|e| e.to_string())?;

    let creds = Credentials::new(config.email.clone(), config.password.clone());

    // Use default submission port 587 or 465
    let mailer = SmtpTransport::relay(&config.smtp_server)
        .map_err(|e| e.to_string())?
        .credentials(creds)
        .build();

    mailer.send(&email).map_err(|e| e.to_string())?;
    println!("[EmailBridge] SMTP Message sent successfully!");
    
    Ok(())
}

#[tauri::command]
pub fn poll_email_chat_messages(config: EmailConfig) -> Result<Vec<String>, String> {
    println!("[EmailBridge] Polling IMAP mailbox for new chat bubbles...");
    
    let tcp = std::net::TcpStream::connect((config.imap_server.as_str(), 993))
        .map_err(|e| format!("Failed to connect to IMAP server: {}", e))?;
    let connector = rustls_connector::RustlsConnector::new_with_native_certs()
        .map_err(|e| format!("Failed to create RustlsConnector: {:?}", e))?;
    let tls_stream = connector.connect(&config.imap_server, tcp)
        .map_err(|e| format!("TLS handshake failed: {:?}", e))?;
    let client = imap::Client::new(tls_stream);

    let mut session = client.login(&config.email, &config.password)
        .map_err(|(e, _client)| e.to_string())?;

    session.select("INBOX").map_err(|e| e.to_string())?;

    // Search for emails containing "Aura Proximity Chat" in the subject
    let query = "SUBJECT \"Aura Proximity Chat\"";
    let uids = session.uid_search(query).map_err(|e| e.to_string())?;

    let mut messages = Vec::new();

    if !uids.is_empty() {
        // Fetch the raw BODY of matches
        let uid_str: Vec<String> = uids.iter().map(|id| id.to_string()).collect();
        let query_uids = uid_str.join(",");
        let fetch_result = session.uid_fetch(&query_uids, "BODY[]")
            .map_err(|e| e.to_string())?;
            
        for msg in fetch_result.iter() {
            if let Some(body) = msg.body() {
                if let Ok(body_str) = std::str::from_utf8(body) {
                    // Extract standard JSON payload block from email body
                    if let Some(json_start) = body_str.find('{') {
                        if let Some(json_end) = body_str.rfind('}') {
                            let json_payload = &body_str[json_start..=json_end];
                            messages.push(json_payload.to_string());
                        }
                    }
                }
            }
        }
    }

    Ok(messages)
}
