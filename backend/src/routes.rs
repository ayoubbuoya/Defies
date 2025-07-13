use actix_web::web;
use crate::handlers::{
    chat_ws,
    get_index,
    post_item,
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

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg
        .route("/", web::get().to(get_index))
        .route("/api/items", web::post().to(post_item))
        .route("/api/chat/ws", web::get().to(chat_ws))
        //.service(chat_message)
        .service(wallet_connect)
        .service(wallet_disconnect)
        .service(defi_opportunities)
        .service(meme_coins_trending)
        .service(meme_coin_analytics)
        .service(chat_history)
        .service(wallet_analytics)
        .service(notifications_get)
        .service(notifications_price_alert)
        .service(analytics_portfolio_performance)
        .service(transactions_execute)
        .service(transactions_simulate)
        .service(market_sei_stats)
        .service(defi_stake)
        .service(market_prices)
        .service(wallet_transactions)
        .service(wallet_portfolio);
}