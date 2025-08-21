use mongodb::{
    bson::doc,
    options::UpdateOptions, // Added for the upsert operation
    Client,
    Collection,
};
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

    // ## MODIFIED FUNCTION ##
    pub async fn add_content(&self, public_key: String, conversation: String) -> mongodb::error::Result<()> {
        // Find a document with the matching public key
        let filter = doc! { "public_key": &public_key };

        // Define the update operation to set the conversation field
        let update = doc! { "$set": { "conversation": &conversation } };

        // Configure options to perform an "upsert"
        // This will create the document if it doesn't exist
        let options = UpdateOptions::builder().upsert(true).build();

        // Execute the database command
        self.collection.update_one(filter, update, options).await?;

        Ok(())
    }

    // This function remains the same
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