use actix_web::{get, post, web, HttpResponse, Responder};
use crate::api::models::{
    AuthRequest, AuthResponse, GraphDataQuery, PromptRequest, PromptResponse,
};
use crate::service::{
    auth_service,
    data_for_graphs_service::{self, GraphDataParams, GraphDataType},
    pool_service,
    prompt_pipeline_service,
};

// --- Existing Auth Handler ---

#[post("/verify")]
pub async fn verify_signature(data: web::Json<AuthRequest>) -> impl Responder {
    match auth_service::handle_auth(data.into_inner()) {
        Ok(token) => HttpResponse::Ok().json(AuthResponse { token }),
        Err(err) => err,
    }
}

// --- New Graph Data Handler ---

#[get("/graph-data")]
pub async fn get_graph_data_handler(query: web::Query<GraphDataQuery>) -> impl Responder {
    let params_result = match query.graph_type.as_str() {
        "liquidity" => Ok(GraphDataParams {
            data_type: GraphDataType::LiquidityDistribution,
            pool_address: query.pool_address.as_deref(),
            token0_symbol: None,
            token1_symbol: None,
            interval: None,
            limit: None,
        }),
        "candles" => Ok(GraphDataParams {
            data_type: GraphDataType::PriceCandles,
            pool_address: None,
            token0_symbol: query.token0.as_deref(),
            token1_symbol: query.token1.as_deref(),
            interval: query.interval.as_deref(),
            limit: query.limit,
        }),
        _ => Err(HttpResponse::BadRequest().body("Invalid 'type' parameter. Use 'liquidity' or 'candles'.")),
    };

    let params = match params_result {
        Ok(p) => p,
        Err(e) => return e,
    };

    match data_for_graphs_service::get_graph_data(params).await {
        Ok(data) => HttpResponse::Ok().json(data),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

// --- New Prompt Pipeline Handler ---

#[post("/prompt")]
pub async fn prompt_handler(data: web::Json<PromptRequest>) -> impl Responder {
    // IMPORTANT: This URL should come from a configuration file, not be hardcoded.
    let js_backend_url = "http://localhost:4000/api/agent/invoke";

    match prompt_pipeline_service::forward_prompt_to_backend(&data.prompt, js_backend_url).await {
        Ok(llm_response) => {
            // We need to map the service response to our API response model
            HttpResponse::Ok().json(PromptResponse {
                response_text: llm_response.response_text,
            })
        }
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}


// ---  Pool List Handler ---

#[get("/pools")]
pub async fn get_pools_handler() -> impl Responder {
    match pool_service::get_pool_list().await {
        Ok(data) => HttpResponse::Ok().json(data),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}
