use crate::api::models::{LiquidityDataQuery, PromptRequest};
use crate::config::mcp_client_base_url;
use crate::dtos::auth::{AuthRequest, AuthResponse};
use crate::dtos::price_history::PriceHistoryRequest;
use crate::service::token_service;
use crate::service::{
    auth_service,
    data_service::{self},
    pool_service, price_history_tool_service, prompt_pipeline_service,
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
#[get("/liquidity-chart")]
pub async fn get_graph_data_handler(query: web::Query<LiquidityDataQuery>) -> impl Responder {
    match data_service::get_graph_data(&query.pool_address).await {
        Ok(data) => HttpResponse::Ok().json(data),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

// --- Token Pair Price History Handler ---
#[get("/price-chart/{token0}/{token1}")]
pub async fn get_token_pair_price_history(
    path: web::Path<(String, String)>,
    query: web::Query<PriceHistoryQuery>,
) -> impl Responder {
    let (token0, token1) = path.into_inner();
    let interval = query.interval.unwrap_or(15);
    let limit = query.limit.unwrap_or(200);

    match data_service::get_kline_data(&token0, &token1, interval, limit).await {
        Ok(kline_data) => HttpResponse::Ok().json(kline_data),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

#[derive(Deserialize)]
pub struct PriceHistoryQuery {
    pub interval: Option<u32>,
    pub limit: Option<u32>,
}

// --- Prompt Handler ---
#[post("/ask")]
pub async fn prompt_handler(data: web::Json<PromptRequest>) -> impl Responder {
    let nodejs_backend_url = format!("{}/ask", mcp_client_base_url());

    println!("🔥 Received request:");
    println!("   Prompt: {}", data.prompt);
    println!("   Address: {:?}", data.address);

    match prompt_pipeline_service::forward_prompt_to_backend(
        &data.prompt,
        &data.address,
        &nodejs_backend_url,
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

#[get("/token/{address}")]
pub async fn get_token_symbol_handler(path: web::Path<String>) -> impl Responder {
    let address = path.into_inner();
    match token_service::get_token_symbol(&address).await {
        Ok(symbol) => HttpResponse::Ok().json(symbol),
        Err(e) => {
            eprintln!("Error fetching token symbol: {:?}", e);
            HttpResponse::InternalServerError()
                .body("An internal error occurred. Please check server logs.")
        }
    }
}

// --- Price History Tool for AI Agent Handler ---
#[get("/price-history")]
pub async fn get_price_history_tool(query: web::Query<PriceHistoryRequest>) -> impl Responder {
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

    match price_history_tool_service::get_price_history_analysis(
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
