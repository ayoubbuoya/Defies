// Add get_pools_handler to your use statement
use crate::{
    api::handlers::{
        get_graph_data_handler, get_pools_handler, get_price_history_tool, verify_signature, get_graph_data_handler,
        get_token_pair_price_history, get_token_symbol_handler, prompt_handler, verify_signature, get_positions_for_wallet, add_position_handler, delete_position_handler,
    },
    service,
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
            .service(get_token_pair_price_history)
            .service(get_token_symbol_handler),
    );

    // Agent/LLM routes
    cfg.service(web::scope("/agent").service(prompt_handler));

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
}

