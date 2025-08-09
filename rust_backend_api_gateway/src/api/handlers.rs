use crate::api::models::{
    AuthRequest, AuthResponse, GraphDataQuery, PriceHistoryRequest, PromptRequest, PromptResponse,
};
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
use crate::service::position_service;

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

// --- Prompt Handler ---
#[post("/prompt")]
pub async fn prompt_handler(data: web::Json<PromptRequest>) -> impl Responder {
    let js_backend_url = "http://localhost:4000/api/agent/invoke";

    match prompt_pipeline_service::forward_prompt_to_backend(&data.prompt, js_backend_url).await {
        Ok(llm_response) => HttpResponse::Ok().json(PromptResponse {
            response_text: llm_response.response_text,
        }),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

// --- Pool List Handler ---
#[get("/pools")]
pub async fn get_pools_handler() -> impl Responder {
    println!("Pools endpoint called");

    match pool_service::get_pool_list().await {

        Ok(data) => HttpResponse::Ok().json(data),
        Err(e) => {
            // Add this log to see the real error in your terminal
            eprintln!("Error fetching pool list: {:?}", e); 
            HttpResponse::InternalServerError().body("An internal error occurred. Please check server logs.")
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






// GET /positions/{pb_key}
pub async fn get_positions_for_wallet(
    db: web::Data<sea_orm::DatabaseConnection>,
    path: web::Path<String>,
) -> HttpResponse {
    let pb_key = path.into_inner();
    match position_service::get_all_positions_for_wallet(&db, pb_key).await {
        Ok(positions) => HttpResponse::Ok().json(positions),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

// POST /positions
#[derive(serde::Deserialize)]
pub struct AddPositionRequest {
    pub pb_key: String,
    pub trans_id: i32,
    pub left: f32,
    pub right: f32,
    pub value_locker: f32,
}

pub async fn add_position_handler(
    db: web::Data<sea_orm::DatabaseConnection>,
    req: web::Json<AddPositionRequest>,
) -> HttpResponse {
    let r = req.into_inner();
    match position_service::add_position(
        &db,
        r.pb_key,
        r.trans_id,
        r.left,
        r.right,
        r.value_locker,
    ).await {
        Ok(pos) => HttpResponse::Ok().json(pos),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}

// DELETE /positions/{pb_key}/{trans_id}
pub async fn delete_position_handler(
    db: web::Data<sea_orm::DatabaseConnection>,
    path: web::Path<(String, i32)>,
) -> HttpResponse {
    let (pb_key, trans_id) = path.into_inner();
    match position_service::delete_position(&db, pb_key, trans_id).await {
        Ok(_) => HttpResponse::Ok().body("Position deleted"),
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}