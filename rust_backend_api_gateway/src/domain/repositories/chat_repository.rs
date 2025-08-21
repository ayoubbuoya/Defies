use crate::domain::entities::Chat;
use async_trait::async_trait;
use std::result::Result;

pub type ChatRepositoryResult<T> = Result<T, Box<dyn std::error::Error + Send + Sync>>;

#[async_trait]
pub trait ChatRepository: Send + Sync {
    async fn save_or_update(&self, chat: Chat) -> ChatRepositoryResult<()>;
    async fn find_by_public_key(&self, public_key: &str) -> ChatRepositoryResult<Option<Chat>>;
    async fn find_all_by_public_key(&self, public_key: &str) -> ChatRepositoryResult<Vec<Chat>>;
}
