use actix_cors::Cors;
use actix_web::{App, HttpServer, middleware::Logger};

mod api;
mod config;
mod domain;
mod infrastructure;
mod math;
mod models;
mod service;

use api::routes::init_routes;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();

    HttpServer::new(|| {
        let cors = Cors::default()
            .allow_any_origin()
            .allowed_methods(vec!["GET", "POST"])
            .allow_any_header()
            .max_age(3600)
            .supports_credentials();

        App::new()
            .wrap(cors)
            .wrap(Logger::default())
            .configure(init_routes)
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
