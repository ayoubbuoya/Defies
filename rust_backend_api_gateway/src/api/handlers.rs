use crate::api::models::{
    AuthRequest, AuthResponse, GraphDataQuery, PromptRequest, PromptResponse,
};
use crate::service::{
    auth_service,
    data_for_graphs_service::{self, GraphDataParams, GraphDataType},
    kline_service, pool_service, prompt_pipeline_service,
};
use actix_web::{HttpResponse, Responder, get, post, web};

use serde::Deserialize;

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
        _ => Err(HttpResponse::BadRequest()
            .body("Invalid 'type' parameter. Use 'liquidity' or 'candles'.")),
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
    println!("Pools endpoint called"); // Debug log

    match pool_service::get_pool_list().await {

        Ok(data) => HttpResponse::Ok().json(data),
        Err(e) => {
            // Add this log to see the real error in your terminal
            eprintln!("Error fetching pool list: {:?}", e); 
            HttpResponse::InternalServerError().body("An internal error occurred. Please check server logs.")

        }
    }
}
#[get("/{token0}/{token1}/price-history")]
pub async fn get_token_pair_price_history(
    path: web::Path<(String, String)>,
    query: web::Query<PriceHistoryQuery>,
) -> impl Responder {
    let (token0, token1) = path.into_inner();
    let interval = query.interval.unwrap_or(15); // Default to 15 minutes
    let limit = query.limit.unwrap_or(200); // Default to 200 results

    match kline_service::get_kline_data(&token0, &token1, interval, limit).await {
        Ok(kline_data) => HttpResponse::Ok().json(kline_data),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

#[derive(Deserialize)]
pub struct PriceHistoryQuery {
    pub interval: Option<u32>,
    pub limit: Option<u32>,
}
