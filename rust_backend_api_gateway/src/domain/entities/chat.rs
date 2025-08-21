use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Chat {
    pub public_key: String,
    pub conversation: String,
}

impl Chat {
    pub fn new(public_key: String, conversation: String) -> Self {
        Self {
            public_key,
            conversation,
        }
    }

    pub fn update_conversation(&mut self, conversation: String) {
        self.conversation = conversation;
    }
}
