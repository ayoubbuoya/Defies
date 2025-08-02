use crate::api::models::{GraphDataQuery, PromptRequest};
use crate::models::auth::{AuthRequest, AuthResponse};
use crate::models::price_history::PriceHistoryRequest;
use crate::service::{
    auth_service,
    data_for_graphs_service::{self, GraphDataParams, GraphDataType},
    kline_service, pool_service,
    price_history_tool_service::PriceHistoryService,
    prompt_pipeline_service,
};
use actix_web::{HttpResponse, Responder, get, post, web};
use serde::Deserialize;
use tracing::{error, info};

// --- Authentication Handler ---
#[post("/verify")]
pub async fn verify_signature(data: web::Json<AuthRequest>) -> impl Responder {
    match auth_service::handle_auth(data.into_inner()) {
        Ok(token) => HttpResponse::Ok().json(AuthResponse { token }),
        Err(err) => err,
    }
}

// --- Graph Data Handler ---
#[get("/graph-data")]
pub async fn get_graph_data_handler(query: web::Query<GraphDataQuery>) -> impl Responder {
    let params_result = match query.graph_type.as_str() {
        "liquidity" => Ok(GraphDataParams {
            data_type: GraphDataType::LiquidityDistribution,
            pool_address: query.pool_address.as_ref().map(|s| s.as_str()),
            token0_symbol: None,
            token1_symbol: None,
            interval: None,
            limit: None,
        }),
        "candles" => Ok(GraphDataParams {
            data_type: GraphDataType::PriceCandles,
            pool_address: None,
            token0_symbol: query.token0.as_ref().map(|s| s.as_str()),
            token1_symbol: query.token1.as_ref().map(|s| s.as_str()),
            interval: query.interval.as_ref().map(|s| s.as_str()),
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

// --- Prompt Handler ---
#[post("/ask")]
pub async fn prompt_handler(data: web::Json<PromptRequest>) -> impl Responder {
    let nodejs_backend_url = "http://localhost:5001/ask";

    println!("🔥 Received request:");
    println!("   Prompt: {}", data.prompt);
    println!("   Address: {:?}", data.address);

    match prompt_pipeline_service::forward_prompt_to_backend(
        &data.prompt,
        &data.address,
        nodejs_backend_url,
    )
    .await
    {
        Ok(nodejs_response) => {
            println!("✅ Successfully processed request");
            // Return the answer directly as JSON (not wrapped in PromptResponse)
            HttpResponse::Ok().json(nodejs_response.answer)
        }
        Err(e) => {
            eprintln!("❌ Error calling Node.js backend: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Failed to process request: {}", e)
            }))
        }
    }
}

// --- Pool List Handler ---
#[get("/pools")]
pub async fn get_pools_handler() -> impl Responder {
    match pool_service::get_pool_list().await {
        Ok(data) => HttpResponse::Ok().json(data),
        Err(e) => {
            // Add this log to see the real error in your terminal
            eprintln!("Error fetching pool list: {:?}", e);
            HttpResponse::InternalServerError()
                .body("An internal error occurred. Please check server logs.")
        }
    }
}

// --- Token Pair Price History Handler ---
#[get("/{token0}/{token1}/price-history")]
pub async fn get_token_pair_price_history(
    path: web::Path<(String, String)>,
    query: web::Query<PriceHistoryQuery>,
) -> impl Responder {
    let (token0, token1) = path.into_inner();
    let interval = query.interval.unwrap_or(15);
    let limit = query.limit.unwrap_or(200);

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

// --- Price History Tool for AI Agent Handler ---
#[get("/price-history")]
pub async fn get_price_history(query: web::Query<PriceHistoryRequest>) -> impl Responder {
    info!(
        "📊 Price history request: {}/{} (interval: {}min, limit: {})",
        query.token0,
        query.token1,
        query.interval.unwrap_or(1440),
        query.limit.unwrap_or(200)
    );

    // Validate input
    if query.token0.is_empty() || query.token1.is_empty() {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Both token0 and token1 are required"
        }));
    }

    if query.token0.eq_ignore_ascii_case(&query.token1) {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "token0 and token1 cannot be the same"
        }));
    }

    // Create service and process request
    let service = PriceHistoryService::new();

    match service
        .get_price_history_analysis(
            &query.token0,
            &query.token1,
            query.interval.unwrap_or(1440),
            query.limit.unwrap_or(200),
        )
        .await
    {
        Ok(result) => {
            info!(
                "✅ Successfully processed price history for {}/{}",
                query.token0, query.token1
            );
            HttpResponse::Ok().json(result)
        }
        Err(e) => {
            error!("❌ Failed to process price history: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to process price history",
                "details": e.to_string()
            }))
        }
    }
}
