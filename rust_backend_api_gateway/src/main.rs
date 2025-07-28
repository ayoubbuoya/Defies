// main.rs

// Declare the top-level modules of your application
pub mod api;
pub mod service;
pub mod config;
pub mod domain;
pub mod infrastructure;
pub mod math;

use actix_cors::Cors;
use actix_web::{web, App, HttpServer};
// You can simplify this path because of the `pub use` in api/mod.rs
use crate::api::init_routes;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        let cors = Cors::default()
           // .allowed_origin("http://localhost:3000") // <-- Your frontend's URL
            .allowed_methods(vec!["GET", "POST"])
            .allow_any_header()
            .max_age(3600)
        .supports_credentials();//for credentials and 

        App::new()
            .wrap(cors) // <-- Add CORS middleware
            .service(web::scope("/api").configure(init_routes))
    })
    .bind(("127.0.0.1", 8081))?
    .run()
    .await
}