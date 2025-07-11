use actix::{Actor, StreamHandler};
use actix_web::{get, post, web, HttpRequest, HttpResponse, Error};
use actix_web_actors::ws;
use chrono::Utc;
use crate::models::*;
use serde_json;

pub struct ChatWebSocket;

impl Actor for ChatWebSocket {
    type Context = ws::WebsocketContext<Self>;
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for ChatWebSocket {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        if let Ok(ws::Message::Text(text)) = msg {
            if let Ok(request) = serde_json::from_str::<ChatMessageRequest>(&text) {
                let response = ChatMessageResponse {
                    success: true,
                    data: ChatMessageData {
                        response: "Your current portfolio balance is 1,234.56 SEI ($987.65).".to_string(),
                        message_id: "msg_123".to_string(),
                        session_id: request.session_id.clone(),
                        timestamp: Utc::now().to_rfc3339(),
                        suggestions: vec![
                            "Show me my transaction history.".to_string(),
                            "What are the best DeFi opportunities?".to_string(),
                            "Help me swap tokens".to_string(),
                        ],
                    },
                };
                let resp_text = serde_json::to_string(&response).unwrap();
                ctx.text(resp_text);
            }
        }
    }
}

// WebSocket route handler (no Swagger annotation)
pub async fn chat_ws(req: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
    ws::start(ChatWebSocket {}, &req, stream)
}

#[utoipa::path(
    get,
    path = "/",
    responses(
        (status = 200, description = "Welcome message", body = String)
    )
)]
pub async fn get_index() -> HttpResponse {
    HttpResponse::Ok().body("Welcome to my Actix web application!")
}

#[utoipa::path(
    post,
    path = "/api/items",
    request_body = Item,
    responses(
        (status = 201, description = "Created item", body = Item)
    )
)]
pub async fn post_item(item: web::Json<Item>) -> HttpResponse {
    HttpResponse::Created().json(item.into_inner())
}

#[utoipa::path(
    post,
    path = "/api/chat/message",
    request_body = ChatMessageRequest,
    responses(
        (status = 200, description = "Chat message response", body = ChatMessageResponse)
    )
)]
#[post("/api/chat/message")]
pub async fn chat_message(req: web::Json<ChatMessageRequest>) -> HttpResponse {
    let response = ChatMessageResponse {
        success: true,
        data: ChatMessageData {
            response: "Your current portfolio balance is 1,234.56 SEI ($987.65).".to_string(),
            message_id: "msg_123".to_string(),
            session_id: req.session_id.clone(),
            timestamp: Utc::now().to_rfc3339(),
            suggestions: vec![
                "Show me my transaction history.".to_string(),
                "What are the best DeFi opportunities?".to_string(),
                "Help me swap tokens".to_string(),
            ],
        },
    };
    HttpResponse::Ok().json(response)
}

#[utoipa::path(
    post,
    path = "/api/auth/wallet/connect",
    request_body = WalletConnectRequest,
    responses(
        (status = 200, description = "Wallet connect response", body = WalletConnectResponse)
    )
)]
#[post("/api/auth/wallet/connect")]
pub async fn wallet_connect(req: web::Json<WalletConnectRequest>) -> HttpResponse {
    let response = WalletConnectResponse {
        success: true,
        data: WalletConnectData {
            token: "jwt_token_here".to_string(),
            user: WalletUser {
                id: "user_123".to_string(),
                wallet_address: req.wallet_address.clone(),
                wallet_type: req.wallet_type.clone(),
                created_at: "2024-01-01T00:00:00Z".to_string(),
                last_login: "2024-01-01T00:00:00Z".to_string(),
            },
        },
    };
    HttpResponse::Ok().json(response)
}

#[utoipa::path(
    post,
    path = "/api/auth/wallet/disconnect",
    request_body = WalletDisconnectRequest,
    responses(
        (status = 200, description = "Wallet disconnect response", body = serde_json::Value)
    )
)]
#[post("/api/auth/wallet/disconnect")]
pub async fn wallet_disconnect(_req: web::Json<WalletDisconnectRequest>) -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({ "success": true }))
}

#[utoipa::path(
    get,
    path = "/api/defi/opportunities",
    responses(
        (status = 200, description = "List of DeFi opportunities", body = DefiOpportunitiesResponse)
    )
)]
#[get("/api/defi/opportunities")]
pub async fn defi_opportunities() -> HttpResponse {
    let response = DefiOpportunitiesResponse {
        success: true,
        data: DefiOpportunitiesData {
            opportunities: vec![
                DefiOpportunity {
                    protocol: "Sei Staking".to_string(),
                    type_: "staking".to_string(),
                    apy: 8.5,
                    tvl: 2100000,
                    risk: "low".to_string(),
                    min_amount: "1".to_string(),
                    token: "SEI".to_string(),
                    description: "Stake SEI tokens to secure the network and earn rewards".to_string(),
                    logo: "http://assets.sei.io/staking-logo.png".to_string(),
                },
                DefiOpportunity {
                    protocol: "SEI/USDC Pool".to_string(),
                    type_: "liquidity".to_string(),
                    apy: 12.3,
                    tvl: 850000,
                    risk: "medium".to_string(),
                    min_amount: "1".to_string(),
                    token: "SEI".to_string(),
                    description: "Provide liquidity to earn trading fees and rewards".to_string(),
                    logo: "".to_string(),
                },
            ],
        },
    };
    HttpResponse::Ok().json(response)
}

#[utoipa::path(
    get,
    path = "/api/meme-coins/trending",
    responses(
        (status = 200, description = "Trending meme coins", body = MemeCoinsTrendingResponse)
    )
)]
#[get("/api/meme-coins/trending")]
pub async fn meme_coins_trending() -> HttpResponse {
    let response = MemeCoinsTrendingResponse {
        success: true,
        data: MemeCoinsTrendingData {
            coins: vec![
                MemeCoin {
                    symbol: "SHIB".to_string(),
                    name: "Shiba Inu".to_string(),
                    price: 0.000008,
                    change_24h: MemeCoinChange {
                        percentage: 15.2,
                        is_positive: true,
                    },
                    volume_24h: 2100000.0,
                    market_cap: 4800000000,
                    holders: 1200000,
                    logo: "https://assets.coingecko.com/coins/images/11939/small/shiba-inu.png".to_string(),
                    exchanges: vec![
                        MemeCoinExchange {
                            name: "Binance".to_string(),
                            price: 0.000008,
                            volume: 2100000.0,
                            change_24h: 0.5,
                        }
                    ],
                }
            ],
            last_updated: "2024-01-01T12:00:00Z".to_string(),
        }
    };
    HttpResponse::Ok().json(response)
}

#[utoipa::path(
    get,
    path = "/api/meme-coins/{symbol}/analytics",
    params(
        ("symbol" = String, Path, description = "Meme coin symbol")
    ),
    responses(
        (status = 200, description = "Meme coin analytics data", body = MemeCoinAnalyticsResponse)
    )
)]
#[get("/api/meme-coins/{symbol}/analytics")]
pub async fn meme_coin_analytics(_path: web::Path<String>) -> HttpResponse {
    let response = MemeCoinAnalyticsResponse {
        success: true,
        data: MemeCoinAnalyticsData {
            price_history: vec![MemeCoinPriceHistory {
                timestamp: "2024-01-01T00:00:00Z".to_string(),
                price: 0.000008,
                volume: 1200000,
            }],
            inflow_outflow: vec![MemeCoinInflowOutflow {
                timestamp: "2024-01-01T00:00:00Z".to_string(),
                inflow: 1000000,
                outflow: 800000,
            }],
            social_metrics: MemeCoinSocialMetrics {
                twitter_mentions: 1500,
                reddit_posts: 250,
                telegram_members: 50000,
                sentiment: "bullish".to_string(),
            },
            technical_indicators: MemeCoinTechnicalIndicators {
                rsi: 65.5,
                macd: 0.0000002,
                support: 0.0000075,
                resistance: 0.0000095,
            },
        },
    };
    HttpResponse::Ok().json(response)
}

#[utoipa::path(
    get,
    path = "/api/chat/history/{walletAddress}",
    params(
        ("walletAddress" = String, Path, description = "Wallet address")
    ),
    responses(
        (status = 200, description = "Chat history", body = ChatHistoryResponse)
    )
)]
#[get("/api/chat/history/{walletAddress}")]
pub async fn chat_history(_path: web::Path<String>) -> HttpResponse {
    let response = ChatHistoryResponse {
        success: true,
        data: ChatHistoryData {
            sessions: vec![ChatSession {
                id: "session_123".to_string(),
                title: "Portfolio Analysis".to_string(),
                last_message: "Your portfolio has increased by 12.5%.".to_string(),
                message_count: 15,
                created_at: "2024-01-01T12:00:00Z".to_string(),
                updated_at: "2024-01-01T12:00:00Z".to_string(),
            }],
            messages: vec![ChatMessage {
                id: "msg_123".to_string(),
                session_id: "session_123".to_string(),
                type_: "user|ai".to_string(),
                content: "What is my portfolio balance?".to_string(),
                timestamp: "2024-01-01T12:00:00Z".to_string(),
                transaction_proposal: None,
            }],
        },
    };
    HttpResponse::Ok().json(response)
}

#[utoipa::path(
    get,
    path = "/api/wallet/{address}/analytics",
    params(
        ("address" = String, Path, description = "Wallet address")
    ),
    responses(
        (status = 200, description = "Wallet analytics data", body = WalletAnalyticsResponse)
    )
)]
#[get("/api/wallet/{address}/analytics")]
pub async fn wallet_analytics(_path: web::Path<String>) -> HttpResponse {
    let response = WalletAnalyticsResponse {
        success: true,
        data: WalletAnalyticsData {
            portfolio_history: vec![PortfolioHistoryEntry {
                date: "2024-01-01".to_string(),
                total_value_usd: 8500.0,
            }],
            transaction_volume: vec![TransactionVolumeEntry {
                date: "2024-01-01".to_string(),
                volume_usd: 1200.0,
                transaction_count: 5,
            }],
            wallet_behavior: WalletBehavior {
                total_transactions: 127,
                avg_transaction_value: 89.5,
                most_active_hour: 14,
                preferred_tokens: vec!["SEI".to_string(), "USDC".to_string(), "ATOM".to_string()],
            },
            defi_positions: vec![DefiPosition {
                protocol: "Sei Staking".to_string(),
                type_: "staking".to_string(),
                amount: "500.00".to_string(),
                token: "SEI".to_string(),
            }],
        },
    };
    HttpResponse::Ok().json(response)
}

#[utoipa::path(
    get,
    path = "/api/notifications/{walletAddress}",
    params(
        ("walletAddress" = String, Path, description = "Wallet address")
    ),
    responses(
        (status = 200, description = "Notifications", body = NotificationsResponse)
    )
)]
#[get("/api/notifications/{walletAddress}")]
pub async fn notifications_get(_path: web::Path<String>) -> HttpResponse {
    let response = NotificationsResponse {
        success: true,
        data: NotificationsData {
            notifications: vec![Notification {
                id: "notif_123".to_string(),
                type_: "price_alert".to_string(),
                title: "SEI Price Alert".to_string(),
                message: "SEI has increased by 15% in the last hour".to_string(),
                timestamp: "2024-01-01T12:00:00Z".to_string(),
                read: false,
                action_url: "/meme-tracker?symbol=SEI".to_string(),
            }],
            unread_count: 3,
        },
    };
    HttpResponse::Ok().json(response)
}

#[utoipa::path(
    post,
    path = "/api/notifications/price-alert",
    request_body = PriceAlertRequest,
    responses(
        (status = 200, description = "Price alert created", body = serde_json::Value)
    )
)]
#[post("/api/notifications/price-alert")]
pub async fn notifications_price_alert(_req: web::Json<PriceAlertRequest>) -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({ "success": true }))
}

#[utoipa::path(
    get,
    path = "/api/analytics/portfolio/{address}/performance",
    params(
        ("address" = String, Path, description = "Wallet address")
    ),
    responses(
        (status = 200, description = "Portfolio performance data", body = PortfolioPerformanceResponse)
    )
)]
#[get("/api/analytics/portfolio/{address}/performance")]
pub async fn analytics_portfolio_performance(_path: web::Path<String>) -> HttpResponse {
    let response = PortfolioPerformanceResponse {
        success: true,
        data: PortfolioPerformanceData {
            performance: PortfolioPerformance {
                total_return: 12.5,
                total_return_usd: 1250.0,
                best_performing_asset: AssetPerformance {
                    symbol: "SEI".to_string(),
                    return_: 25.5,
                },
                worst_performing_asset: AssetPerformance {
                    symbol: "WETH".to_string(),
                    return_: -2.3,
                },
            },
            risk_metrics: RiskMetrics {
                volatility: 15.2,
                sharpe_ratio: 1.8,
                max_drawdown: -8.5,
            },
        },
    };
    HttpResponse::Ok().json(response)
}

#[utoipa::path(
    post,
    path = "/api/transactions/execute",
    request_body = TransactionExecuteRequest,
    responses(
        (status = 200, description = "Transaction executed", body = serde_json::Value)
    )
)]
#[post("/api/transactions/execute")]
pub async fn transactions_execute(_req: web::Json<TransactionExecuteRequest>) -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({ "success": true }))
}

#[utoipa::path(
    post,
    path = "/api/transactions/simulate",
    request_body = TransactionSimulateRequest,
    responses(
        (status = 200, description = "Transaction simulation result", body = TransactionSimulateResponse)
    )
)]
#[post("/api/transactions/simulate")]
pub async fn transactions_simulate(_req: web::Json<TransactionSimulateRequest>) -> HttpResponse {
    let response = TransactionSimulateResponse {
        success: true,
        data: TransactionSimulateData {
            estimated_output: "85.2".to_string(),
            price_impact: 0.2,
            fee: TransactionFee {
                amount: "0.1".to_string(),
                token: "SEI".to_string(),
                usd: 0.08,
            },
            route: vec!["SEI".to_string(), "USDC".to_string()],
            minimum_received: "84.8".to_string(),
            gas_estimate: "0.001".to_string(),
        },
    };
    HttpResponse::Ok().json(response)
}

#[utoipa::path(
    get,
    path = "/api/market/sei/stats",
    responses(
        (status = 200, description = "Market SEI stats", body = MarketSeiStatsResponse)
    )
)]
#[get("/api/market/sei/stats")]
pub async fn market_sei_stats() -> HttpResponse {
    let response = MarketSeiStatsResponse {
        success: true,
        data: MarketSeiStatsData {
            network: NetworkStats {
                block_height: 12345678,
                total_transactions: 50000000,
                active_validators: 100,
                bonded_tokens: "400000000".to_string(),
                inflation: 7.5,
                staking_apr: 8.5,
            },
            ecosystem: EcosystemStats {
                total_value_locked: 150000000,
                active_protocols: 25,
                total_users: 500000,
            },
        },
    };
    HttpResponse::Ok().json(response)
}

#[utoipa::path(
    post,
    path = "/api/defi/stake",
    request_body = serde_json::Value,
    responses(
        (status = 200, description = "Stake successful", body = serde_json::Value)
    )
)]
#[post("/api/defi/stake")]
pub async fn defi_stake(_req: web::Json<serde_json::Value>) -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({ "success": true }))
}

#[utoipa::path(
    get,
    path = "/api/market/prices",
    responses(
        (status = 200, description = "Market prices", body = MarketPricesResponse)
    )
)]
#[get("/api/market/prices")]
pub async fn market_prices() -> HttpResponse {
    let mut prices = std::collections::HashMap::new();
    prices.insert("SEI".to_string(), MarketPrice {
        usd: 0.8,
        change_24h: 12.5,
        volume_24h: 15000000,
        market_cap: 800000000,
    });
    prices.insert("USDC".to_string(), MarketPrice {
        usd: 1.0,
        change_24h: 0.1,
        volume_24h: 20000000,
        market_cap: 2500000000,
    });
    let response = MarketPricesResponse {
        success: true,
        data: MarketPricesData {
            prices,
            last_updated: "2024-01-01T12:00:00Z".to_string(),
        },
    };
    HttpResponse::Ok().json(response)
}

#[utoipa::path(
    get,
    path = "/api/wallet/{address}/transactions",
    params(
        ("address" = String, Path, description = "Wallet address")
    ),
    responses(
        (status = 200, description = "Wallet transactions", body = WalletTransactionsResponse)
    )
)]
#[get("/api/wallet/{address}/transactions")]
pub async fn wallet_transactions(_path: web::Path<String>) -> HttpResponse {
    let response = WalletTransactionsResponse {
        success: true,
        data: WalletTransactionsData {
            transactions: vec![WalletTransaction {
                id: "tx_123".to_string(),
                hash: "0x1234567890abcdef...".to_string(),
                type_: "received".to_string(),
                status: "confirmed".to_string(),
                timestamp: "2024-01-01T12:00:00Z".to_string(),
                from: "sei1abc123...".to_string(),
                to: "sei1def456...".to_string(),
                amount: "100.00".to_string(),
                token: WalletToken {
                    symbol: "SEI".to_string(),
                    name: "Sei".to_string(),
                    logo: "https://assets.sei.io/sei-logo.png".to_string(),
                },
                fee: TransactionFee {
                    amount: "0.001".to_string(),
                    token: "SEI".to_string(),
                    usd: 0.001,
                },
                value_usd: 80.0,
            }],
            pagination: Pagination {
                page: 1,
                limit: 20,
                total: 127,
                total_pages: 7,
            },
        },
    };
    HttpResponse::Ok().json(response)
}

#[utoipa::path(
    get,
    path = "/api/wallet/{address}/portfolio",
    params(
        ("address" = String, Path, description = "Wallet address")
    ),
    responses(
        (status = 200, description = "Wallet portfolio", body = WalletPortfolioResponse)
    )
)]
#[get("/api/wallet/{address}/portfolio")]
pub async fn wallet_portfolio(_path: web::Path<String>) -> HttpResponse {
    let response = WalletPortfolioResponse {
        success: true,
        data: WalletPortfolioData {
            total_balance: WalletBalance {
                usd: 11187.65,
                sei: 1234.56,
            },
            change_24h: WalletChange24h {
                usd: 234.12,
                percentage: 2.1,
            },
            assets: vec![
                WalletAsset {
                    symbol: "SEI".to_string(),
                    name: "Sei".to_string(),
                    balance: "1234.56".to_string(),
                    value_usd: 987.65,
                    change_24h: WalletAssetChange24h {
                        percentage: 12.5,
                        is_positive: true,
                    },
                    price: 0.8,
                    logo: "https://assets.sei.io/sei-logo.png".to_string(),
                },
                WalletAsset {
                    symbol: "USDC".to_string(),
                    name: "USD Coin".to_string(),
                    balance: "500.00".to_string(),
                    value_usd: 500.0,
                    change_24h: WalletAssetChange24h {
                        percentage: 0.1,
                        is_positive: true,
                    },
                    price: 1.0,
                    logo: "".to_string(),
                },
            ],
        },
    };
    HttpResponse::Ok().json(response)
}
