// src/api/routes.rs

// Add get_pools_handler to your use statement
use crate::api::handlers::{
    get_graph_data_handler, get_pools_handler, get_price_history_tool,
    get_token_pair_price_history, prompt_handler, verify_signature,
};
use actix_web::web;

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(web::scope("/tools").service(get_price_history_tool));

    // Authentication routes
    cfg.service(web::scope("/auth").service(verify_signature));

    // Data routes for graphs and pools
    cfg.service(
        web::scope("/data")
            .service(get_graph_data_handler)
            .service(get_pools_handler)
            .service(get_token_pair_price_history),
    );

    // Agent/LLM routes
    cfg.service(web::scope("/agent").service(prompt_handler));
}
