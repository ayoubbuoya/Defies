pub trait JwtEncoder {
    fn encode(&self, subject: &str) -> Result<String, String>;
}