// src/api/routes.rs

// Add get_pools_handler to your use statement
use actix_web::web;
use crate::api::handlers::{
    verify_signature, get_graph_data_handler, prompt_handler, get_pools_handler,
    get_token_pair_price_history,
    get_price_history, 
    get_positions_for_wallet,
    add_position_handler,
    delete_position_handler,
    add_chat,
    get_chat
};



pub fn init_routes(cfg: &mut web::ServiceConfig) {
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
    cfg.service(web::scope("/tools").service(get_price_history));
    cfg.service(
    web::resource("/positions/{pb_key}")
        .route(web::get().to(get_positions_for_wallet))
);
cfg.service(
    web::resource("/positions")
        .route(web::post().to(add_position_handler))
);
cfg.service(
    web::resource("/positions/{pb_key}/{trans_id}")
        .route(web::delete().to(delete_position_handler))
);
    cfg.service(
        web::resource("/chat")
            .route(web::put().to(add_chat))
    );
    cfg.service(
        web::resource("/chat/{public_key}")
            .route(web::get().to(get_chat))
    );
}