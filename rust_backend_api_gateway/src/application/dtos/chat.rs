use serde::Deserialize;

#[derive(Deserialize)]
pub struct AddChatRequest {
    pub public_key: String,
    pub conversation: String,
}
