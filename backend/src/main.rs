mod models;
mod handlers;
mod routes;

use actix_web::{App, HttpServer, web};
use actix_cors::Cors;
use std::io;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use crate::handlers::{
    chat_message,
    wallet_connect,
    wallet_disconnect,
    defi_opportunities,
    meme_coins_trending,
    meme_coin_analytics,
    chat_history,
    wallet_analytics,
    notifications_get,
    notifications_price_alert,
    analytics_portfolio_performance,
    transactions_execute,
    transactions_simulate,
    market_sei_stats,
    defi_stake,
    market_prices,
    wallet_transactions,
    wallet_portfolio,
};

use crate::models::{
    Item,
    ItemResponse,
    ChatMessageRequest,
    ChatMessageResponse,
    ChatMessageData,
    WalletConnectRequest,
    WalletConnectResponse,
    WalletConnectData,
    WalletUser,
    WalletDisconnectRequest,
    DefiOpportunity,
    DefiOpportunitiesResponse,
    DefiOpportunitiesData,
    MemeCoinExchange,
    MemeCoinChange,
    MemeCoin,
    MemeCoinsTrendingResponse,
    MemeCoinsTrendingData,
    MemeCoinAnalyticsResponse,
    MemeCoinAnalyticsData,
    MemeCoinPriceHistory,
    MemeCoinInflowOutflow,
    MemeCoinSocialMetrics,
    MemeCoinTechnicalIndicators,
    ChatHistoryResponse,
    ChatHistoryData,
    ChatSession,
    ChatMessage,
    WalletAnalyticsResponse,
    WalletAnalyticsData,
    PortfolioHistoryEntry,
    TransactionVolumeEntry,
    WalletBehavior,
    DefiPosition,
    NotificationsResponse,
    NotificationsData,
    Notification,
    PriceAlertRequest,
    PortfolioPerformanceResponse,
    PortfolioPerformanceData,
    PortfolioPerformance,
    AssetPerformance,
    RiskMetrics,
    TransactionExecuteRequest,
    TransactionSimulateRequest,
    TransactionSimulateResponse,
    TransactionSimulateData,
    TransactionFee,
    MarketSeiStatsResponse,
    MarketSeiStatsData,
    NetworkStats,
    EcosystemStats,
    MarketPricesResponse,
    MarketPricesData,
    MarketPrice,
    WalletTransactionsResponse,
    WalletTransactionsData,
    WalletTransaction,
    WalletToken,
    Pagination,
    WalletPortfolioResponse,
    WalletPortfolioData,
    WalletBalance,
    WalletChange24h,
    WalletAsset,
    WalletAssetChange24h,
};

#[derive(OpenApi)]
#[openapi(
    paths(
        crate::handlers::chat_message,
        crate::handlers::wallet_connect,
        crate::handlers::wallet_disconnect,
        crate::handlers::defi_opportunities,
        crate::handlers::meme_coins_trending,
        crate::handlers::meme_coin_analytics,
        crate::handlers::chat_history,
        crate::handlers::wallet_analytics,
        crate::handlers::notifications_get,
        crate::handlers::notifications_price_alert,
        crate::handlers::analytics_portfolio_performance,
        crate::handlers::transactions_execute,
        crate::handlers::transactions_simulate,
        crate::handlers::market_sei_stats,
        crate::handlers::defi_stake,
        crate::handlers::market_prices,
        crate::handlers::wallet_transactions,
        crate::handlers::wallet_portfolio,
    ),
    components(
        schemas(
            Item,
            ItemResponse,
            ChatMessageRequest,
            ChatMessageResponse,
            ChatMessageData,
            WalletConnectRequest,
            WalletConnectResponse,
            WalletConnectData,
            WalletUser,
            WalletDisconnectRequest,
            DefiOpportunity,
            DefiOpportunitiesResponse,
            DefiOpportunitiesData,
            MemeCoinExchange,
            MemeCoinChange,
            MemeCoin,
            MemeCoinsTrendingResponse,
            MemeCoinsTrendingData,
            MemeCoinAnalyticsResponse,
            MemeCoinAnalyticsData,
            MemeCoinPriceHistory,
            MemeCoinInflowOutflow,
            MemeCoinSocialMetrics,
            MemeCoinTechnicalIndicators,
            ChatHistoryResponse,
            ChatHistoryData,
            ChatSession,
            ChatMessage,
            WalletAnalyticsResponse,
            WalletAnalyticsData,
            PortfolioHistoryEntry,
            TransactionVolumeEntry,
            WalletBehavior,
            DefiPosition,
            NotificationsResponse,
            NotificationsData,
            Notification,
            PriceAlertRequest,
            PortfolioPerformanceResponse,
            PortfolioPerformanceData,
            PortfolioPerformance,
            AssetPerformance,
            RiskMetrics,
            TransactionExecuteRequest,
            TransactionSimulateRequest,
            TransactionSimulateResponse,
            TransactionSimulateData,
            TransactionFee,
            MarketSeiStatsResponse,
            MarketSeiStatsData,
            NetworkStats,
            EcosystemStats,
            MarketPricesResponse,
            MarketPricesData,
            MarketPrice,
            WalletTransactionsResponse,
            WalletTransactionsData,
            WalletTransaction,
            WalletToken,
            Pagination,
            WalletPortfolioResponse,
            WalletPortfolioData,
            WalletBalance,
            WalletChange24h,
            WalletAsset,
            WalletAssetChange24h,
        )
    ),
    info(
        title = "My Actix Web API",
        version = "0.1.0",
        description = "API documentation for my Actix web backend"
    )
)]
pub struct ApiDoc;

#[actix_web::main]
async fn main() -> io::Result<()> {
    env_logger::init();

    HttpServer::new(|| {
        App::new()
            .wrap(Cors::permissive())
            .configure(routes::configure_routes)
            .service(
                web::scope("/api-doc")
                    .route("/openapi.json", web::get().to(|| async { web::Json(ApiDoc::openapi()) }))
                    .service(
                        SwaggerUi::new("/swagger-ui/{_:.*}")
                            .url("/api-doc/openapi.json", ApiDoc::openapi()),
                    )
            )
    })
    .bind("127.0.0.1:8081")?
    .run()
    .await
}
