use crate::domain::{
    entities::Chat,
    repositories::{ChatRepository, ChatRepositoryResult},
};
use async_trait::async_trait;
use futures::stream::TryStreamExt;
use mongodb::{Client, Collection, Database, bson::doc, options::UpdateOptions};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
struct ChatDocument {
    pub public_key: String,
    pub conversation: String,
}

impl From<Chat> for ChatDocument {
    fn from(chat: Chat) -> Self {
        Self {
            public_key: chat.public_key,
            conversation: chat.conversation,
        }
    }
}

impl From<ChatDocument> for Chat {
    fn from(doc: ChatDocument) -> Self {
        Self {
            public_key: doc.public_key,
            conversation: doc.conversation,
        }
    }
}

#[derive(Clone)]
pub struct MongoDbChatRepository {
    collection: Collection<ChatDocument>,
}

impl MongoDbChatRepository {
    pub async fn new(mongo_uri: &str) -> Result<Self, mongodb::error::Error> {
        let client = Client::with_uri_str(mongo_uri).await?;
        let db: Database = client.database("chatdb");
        let collection: Collection<ChatDocument> = db.collection("chats");
        Ok(Self { collection })
    }
}

#[async_trait]
impl ChatRepository for MongoDbChatRepository {
    async fn save_or_update(&self, chat: Chat) -> ChatRepositoryResult<()> {
        let chat_doc: ChatDocument = chat.into();
        let filter = doc! { "public_key": &chat_doc.public_key };
        let update = doc! { "$set": { "conversation": &chat_doc.conversation } };
        let options = UpdateOptions::builder().upsert(true).build();

        self.collection
            .update_one(filter, update, options)
            .await
            .map_err(|e| Box::new(e) as Box<dyn std::error::Error + Send + Sync>)?;

        Ok(())
    }

    async fn find_by_public_key(&self, public_key: &str) -> ChatRepositoryResult<Option<Chat>> {
        let filter = doc! { "public_key": public_key };

        match self.collection.find_one(filter, None).await {
            Ok(Some(doc)) => Ok(Some(doc.into())),
            Ok(None) => Ok(None),
            Err(e) => Err(Box::new(e) as Box<dyn std::error::Error + Send + Sync>),
        }
    }

    async fn find_all_by_public_key(&self, public_key: &str) -> ChatRepositoryResult<Vec<Chat>> {
        let filter = doc! { "public_key": public_key };
        let mut cursor = self
            .collection
            .find(filter, None)
            .await
            .map_err(|e| Box::new(e) as Box<dyn std::error::Error + Send + Sync>)?;

        let mut results = Vec::new();
        while let Some(doc) = cursor
            .try_next()
            .await
            .map_err(|e| Box::new(e) as Box<dyn std::error::Error + Send + Sync>)?
        {
            results.push(doc.into());
        }
        Ok(results)
    }
}
