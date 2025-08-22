#[derive(serde::Deserialize)]
pub struct AddPositionRequest {
    pub pb_key: String,
    pub trans_id: i32,
    pub left: f32,
    pub right: f32,
    pub value_locker: f32,
}
