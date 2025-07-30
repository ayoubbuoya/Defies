use actix_cors::Cors;
use actix_web::{App, HttpServer};
use tracing_actix_web::TracingLogger;

mod api;
mod config;
mod domain;
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

    HttpServer::new(|| {
        let cors = Cors::default()
            // In production, you should restrict this to your frontend's domain
            // e.g., .allowed_origin("http://localhost:3000")
            .allow_any_origin() 
            .allowed_methods(vec!["GET", "POST"])
            .allow_any_header()
            .max_age(3600);

        App::new()
            .wrap(cors)
            // This TracingLogger replaces the old Logger::default()
            // and integrates with the tracing system.
            .wrap(TracingLogger::default()) 
            .configure(init_routes)
    })
    .bind("127.0.0.1:8081")?
    .run()
    .await
}