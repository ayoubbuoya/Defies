use mongodb::{bson::{doc, Document}, Client, Collection};
use serde::{Deserialize, Serialize};
use futures::stream::TryStreamExt;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChatDocument {
    pub public_key: String,
    pub conversation: String,
}

#[derive(Clone)]
pub struct ChatService {
    collection: Collection<ChatDocument>,
}

impl ChatService {
    pub async fn new(mongo_uri: &str) -> mongodb::error::Result<Self> {
        let client = Client::with_uri_str(mongo_uri).await?;
        let db = client.database("chatdb");
        let collection = db.collection::<ChatDocument>("chats");
        Ok(Self { collection })
    }

    pub async fn add_content(&self, public_key: String, conversation: String) -> mongodb::error::Result<()> {
        let doc = ChatDocument { public_key, conversation };
        self.collection.insert_one(doc, None).await?;
        Ok(())
    }

    pub async fn read_content(&self, public_key: String) -> mongodb::error::Result<Vec<ChatDocument>> {
        let filter = doc! { "public_key": &public_key };
        let mut cursor = self.collection.find(filter, None).await?;
        let mut results = Vec::new();
        while let Some(chat) = cursor.try_next().await? {
            results.push(chat);
        }
        Ok(results)
    }
}