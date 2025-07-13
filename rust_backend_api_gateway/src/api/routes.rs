use actix_web::web;
use crate::api::handlers::verify_signature;

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(web::scope("/auth").service(verify_signature));
}
