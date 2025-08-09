// migration/src/main.rs
use sea_orm_migration::prelude::*;

#[tokio::main] // Matches 'runtime-tokio-rustls' feature in Cargo.toml
async fn main() {
    cli::run_cli(migration::Migrator).await;
}