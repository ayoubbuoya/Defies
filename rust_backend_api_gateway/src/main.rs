mod config;
mod domain;
mod infrastructure;
mod service;
pub mod math;
mod api;

use actix_web::{App, HttpServer};
use actix_cors::Cors;
use api::routes::init_routes;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenvy::dotenv().ok();
    env_logger::init();

    HttpServer::new(|| {
        App::new()
            .wrap(Cors::permissive())
            .configure(init_routes)
    })
    .bind("127.0.0.1:8081")?
    .run()
    .await
}