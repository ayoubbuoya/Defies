use actix_cors::Cors;
use actix_web::{App, HttpServer, web};
use tracing_actix_web::TracingLogger;
use sea_orm::{Database, DatabaseConnection};
use dotenvy::dotenv;
use std::env;

mod api;
mod config;
mod domain;
mod dtos;
mod infrastructure;
mod math;
mod service;

use api::routes::init_routes;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // This sets up a logger that will print all trace, debug, info, etc.
    // messages to your console.
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .with_test_writer()
        .init();
    
    // --- DATABASE CONNECTION SETUP ---
    // Load environment variables from .env file
    dotenv::dotenv().ok();
    env_logger::init();
    
    // Get database URL from environment variable
    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set in .env file");
    
    // Establish database connection
    let db_connection: DatabaseConnection = match Database::connect(&database_url).await {
        Ok(db) => {
            println!("Successfully connected to database!");
            db
        },
        Err(e) => {
            eprintln!("Failed to connect to database: {:?}", e);
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("Failed to connect to database: {}", e),
            ));
        }
    };
    // --- END DATABASE CONNECTION SETUP ---


    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()

            .allowed_methods(vec!["GET", "POST", "DELETE"]) 

            .allow_any_header()
            .max_age(3600)
            .supports_credentials();

        App::new()
            .app_data(web::Data::new(db_connection.clone())) // Add database connection to app state
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
