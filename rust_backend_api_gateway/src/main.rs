use actix_cors::Cors;
use actix_web::{App, HttpServer, web};
use dotenvy::dotenv;
use sea_orm::{Database, DatabaseConnection};
use std::env;

use presentation::routes::init_routes;
use service::chat_service::ChatService;

use tracing_actix_web::TracingLogger;
use tracing_subscriber::EnvFilter;

mod application;
mod config;
mod domain;
mod infrastructure;
mod math;
mod presentation;
mod service;

struct AppState {
    db_connection: DatabaseConnection,
    chat_service: ChatService,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .with_max_level(tracing::Level::INFO)
        .with_test_writer()
        .init();

    dotenv().ok();

    // SQL Database connection
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set in .env file");

    let db_connection: DatabaseConnection = match Database::connect(&database_url).await {
        Ok(db) => {
            println!("Successfully connected to database!");
            db
        }
        Err(e) => {
            eprintln!("Failed to connect to database: {:?}", e);
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("Failed to connect to database: {}", e),
            ));
        }
    };

    // MongoDB Chat Service connection
    let mongo_uri =
        env::var("MONGODB_URI").unwrap_or_else(|_| "mongodb://localhost:27017".to_string());
    let chat_service = ChatService::new(&mongo_uri)
        .await
        .expect("Failed to connect to MongoDB");

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allowed_methods(vec!["GET", "POST", "DELETE"])
            .allow_any_header()
            .max_age(3600)
            .supports_credentials();

        App::new()
            .app_data(web::Data::new(AppState {
                db_connection: db_connection.clone(),
                chat_service: chat_service.clone(),
            }))
            .wrap(cors)
            // This TracingLogger replaces the old Logger::default()
            // and integrates with the tracing system.
            .wrap(TracingLogger::default())
            .configure(init_routes)
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
