use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// --- Item Example ---
#[derive(Serialize, Deserialize, ToSchema)]
pub struct Item {
    pub id: i32,
    pub name: String,
    pub description: String,
}

impl Item {
    pub fn new(id: i32, name: String, description: String) -> Self {
        Item { id, name, description }
    }
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct ItemResponse {
    pub id: i32,
    pub name: String,
    pub description: String,
}

impl ItemResponse {
    pub fn from_item(item: &Item) -> Self {
        ItemResponse {
            id: item.id,
            name: item.name.clone(),
            description: item.description.clone(),
        }
    }
}

// --- Chat Message ---
#[derive(Deserialize, ToSchema)]
pub struct ChatMessageRequest {
    pub message: String,
    #[serde(rename = "walletAddress")]
    pub wallet_address: String,
    #[serde(rename = "sessionId")]
    pub session_id: String,
    pub context: ChatContext,
}

#[derive(Deserialize, ToSchema)]
pub struct ChatContext {
    #[serde(rename = "previousMessages")]
    pub previous_messages: i32,
    #[serde(rename = "userPreferences")]
    pub user_preferences: UserPreferences,
}

#[derive(Deserialize, ToSchema)]
pub struct UserPreferences {
    pub language: String,
    #[serde(rename = "riskTolerance")]
    pub risk_tolerance: String,
}

#[derive(Serialize, ToSchema)]
pub struct ChatMessageResponse {
    pub success: bool,
    pub data: ChatMessageData,
}

#[derive(Serialize, ToSchema)]
pub struct ChatMessageData {
    pub response: String,
    #[serde(rename = "messageId")]
    pub message_id: String,
    #[serde(rename = "sessionId")]
    pub session_id: String,
    pub timestamp: String,
    pub suggestions: Vec<String>,
}

// --- Wallet Connect/Disconnect ---
#[derive(Deserialize, ToSchema)]
pub struct WalletConnectRequest {
    #[serde(rename = "walletAddress")]
    pub wallet_address: String,
    #[serde(rename = "walletType")]
    pub wallet_type: String,
    pub signature: String,
    pub message: String,
}

#[derive(Serialize, ToSchema)]
pub struct WalletConnectResponse {
    pub success: bool,
    pub data: WalletConnectData,
}

#[derive(Serialize, ToSchema)]
pub struct WalletConnectData {
    pub token: String,
    pub user: WalletUser,
}

#[derive(Serialize, ToSchema)]
pub struct WalletUser {
    pub id: String,
    #[serde(rename = "walletAddress")]
    pub wallet_address: String,
    #[serde(rename = "walletType")]
    pub wallet_type: String,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "lastLogin")]
    pub last_login: String,
}

#[derive(Deserialize, ToSchema)]
pub struct WalletDisconnectRequest {
    #[serde(rename = "walletAddress")]
    pub wallet_address: String,
}

// --- DeFi Opportunities ---
#[derive(Serialize, ToSchema)]
pub struct DefiOpportunity {
    pub protocol: String,
    #[serde(rename = "type")]
    #[schema(rename = "type")]
    pub type_: String,
    pub apy: f64,
    pub tvl: u64,
    pub risk: String,
    #[serde(rename = "minAmount")]
    pub min_amount: String,
    pub token: String,
    pub description: String,
    pub logo: String,
}

#[derive(Serialize, ToSchema)]
pub struct DefiOpportunitiesResponse {
    pub success: bool,
    pub data: DefiOpportunitiesData,
}

#[derive(Serialize, ToSchema)]
pub struct DefiOpportunitiesData {
    pub opportunities: Vec<DefiOpportunity>,
}

// --- Meme Coin Trending ---
#[derive(Serialize, ToSchema)]
pub struct MemeCoinExchange {
    pub name: String,
    pub price: f64,
    pub volume: f64,
    #[serde(rename = "change24h")]
    pub change_24h: f64,
}

#[derive(Serialize, ToSchema)]
pub struct MemeCoinChange {
    pub percentage: f64,
    #[serde(rename = "isPositive")]
    pub is_positive: bool,
}

#[derive(Serialize, ToSchema)]
pub struct MemeCoin {
    pub symbol: String,
    pub name: String,
    pub price: f64,
    #[serde(rename = "change24h")]
    pub change_24h: MemeCoinChange,
    #[serde(rename = "volume24h")]
    pub volume_24h: f64,
    #[serde(rename = "marketCap")]
    pub market_cap: u64,
    pub holders: u64,
    pub logo: String,
    pub exchanges: Vec<MemeCoinExchange>,
}

#[derive(Serialize, ToSchema)]
pub struct MemeCoinsTrendingResponse {
    pub success: bool,
    pub data: MemeCoinsTrendingData,
}

#[derive(Serialize, ToSchema)]
pub struct MemeCoinsTrendingData {
    pub coins: Vec<MemeCoin>,
    #[serde(rename = "lastUpdated")]
    pub last_updated: String,
}

// --- Meme Coin Analytics ---
#[derive(Serialize, ToSchema)]
pub struct MemeCoinAnalyticsResponse {
    pub success: bool,
    pub data: MemeCoinAnalyticsData,
}

#[derive(Serialize, ToSchema)]
pub struct MemeCoinAnalyticsData {
    #[serde(rename = "priceHistory")]
    pub price_history: Vec<MemeCoinPriceHistory>,
    #[serde(rename = "inflowOutflow")]
    pub inflow_outflow: Vec<MemeCoinInflowOutflow>,
    #[serde(rename = "socialMetrics")]
    pub social_metrics: MemeCoinSocialMetrics,
    #[serde(rename = "technicalIndicators")]
    pub technical_indicators: MemeCoinTechnicalIndicators,
}

#[derive(Serialize, ToSchema)]
pub struct MemeCoinPriceHistory {
    pub timestamp: String,
    pub price: f64,
    pub volume: u64,
}

#[derive(Serialize, ToSchema)]
pub struct MemeCoinInflowOutflow {
    pub timestamp: String,
    pub inflow: u64,
    pub outflow: u64,
}

#[derive(Serialize, ToSchema)]
pub struct MemeCoinSocialMetrics {
    #[serde(rename = "twitterMentions")]
    pub twitter_mentions: u64,
    #[serde(rename = "redditPosts")]
    pub reddit_posts: u64,
    #[serde(rename = "telegramMembers")]
    pub telegram_members: u64,
    pub sentiment: String,
}

#[derive(Serialize, ToSchema)]
pub struct MemeCoinTechnicalIndicators {
    pub rsi: f64,
    pub macd: f64,
    pub support: f64,
    pub resistance: f64,
}

// --- Chat History ---
#[derive(Serialize, ToSchema)]
pub struct ChatHistoryResponse {
    pub success: bool,
    pub data: ChatHistoryData,
}

#[derive(Serialize, ToSchema)]
pub struct ChatHistoryData {
    pub sessions: Vec<ChatSession>,
    pub messages: Vec<ChatMessage>,
}

#[derive(Serialize, ToSchema)]
pub struct ChatSession {
    pub id: String,
    pub title: String,
    #[serde(rename = "lastMessage")]
    pub last_message: String,
    #[serde(rename = "messageCount")]
    pub message_count: u32,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
}

#[derive(Serialize, ToSchema)]
pub struct ChatMessage {
    pub id: String,
    #[serde(rename = "sessionId")]
    pub session_id: String,
    #[serde(rename = "type")]
    #[schema(rename = "type")]
    pub type_: String,
    pub content: String,
    pub timestamp: String,
    #[serde(rename = "transactionProposal")]
    pub transaction_proposal: Option<serde_json::Value>,
}

// --- Wallet Analytics ---
#[derive(Serialize, ToSchema)]
pub struct WalletAnalyticsResponse {
    pub success: bool,
    pub data: WalletAnalyticsData,
}

#[derive(Serialize, ToSchema)]
pub struct WalletAnalyticsData {
    #[serde(rename = "portfolioHistory")]
    pub portfolio_history: Vec<PortfolioHistoryEntry>,
    #[serde(rename = "transactionVolume")]
    pub transaction_volume: Vec<TransactionVolumeEntry>,
    #[serde(rename = "walletBehavior")]
    pub wallet_behavior: WalletBehavior,
    #[serde(rename = "defiPositions")]
    pub defi_positions: Vec<DefiPosition>,
}

#[derive(Serialize, ToSchema)]
pub struct PortfolioHistoryEntry {
    pub date: String,
    #[serde(rename = "totalValueUsd")]
    pub total_value_usd: f64,
}

#[derive(Serialize, ToSchema)]
pub struct TransactionVolumeEntry {
    pub date: String,
    #[serde(rename = "volumeUsd")]
    pub volume_usd: f64,
    #[serde(rename = "transactionCount")]
    pub transaction_count: u32,
}

#[derive(Serialize, ToSchema)]
pub struct WalletBehavior {
    #[serde(rename = "totalTransactions")]
    pub total_transactions: u32,
    #[serde(rename = "avgTransactionValue")]
    pub avg_transaction_value: f64,
    #[serde(rename = "mostActiveHour")]
    pub most_active_hour: u8,
    #[serde(rename = "preferredTokens")]
    pub preferred_tokens: Vec<String>,
}

#[derive(Serialize, ToSchema)]
pub struct DefiPosition {
    pub protocol: String,
    #[serde(rename = "type")]
    #[schema(rename = "type")]
    pub type_: String,
    pub amount: String,
    pub token: String,
}

// --- Notifications ---
#[derive(Serialize, ToSchema)]
pub struct NotificationsResponse {
    pub success: bool,
    pub data: NotificationsData,
}

#[derive(Serialize, ToSchema)]
pub struct NotificationsData {
    pub notifications: Vec<Notification>,
    #[serde(rename = "unreadCount")]
    pub unread_count: u32,
}

#[derive(Serialize, ToSchema)]
pub struct Notification {
    pub id: String,
    #[serde(rename = "type")]
    #[schema(rename = "type")]
    pub type_: String,
    pub title: String,
    pub message: String,
    pub timestamp: String,
    pub read: bool,
    #[serde(rename = "actionUrl")]
    pub action_url: String,
}

// --- Price Alert ---
#[derive(Deserialize, ToSchema)]
pub struct PriceAlertRequest {
    #[serde(rename = "walletAddress")]
    pub wallet_address: String,
    pub token: String,
    pub condition: String,
    pub price: f64,
    pub enabled: bool,
}

// --- Portfolio Performance ---
#[derive(Serialize, ToSchema)]
pub struct PortfolioPerformanceResponse {
    pub success: bool,
    pub data: PortfolioPerformanceData,
}

#[derive(Serialize, ToSchema)]
pub struct PortfolioPerformanceData {
    pub performance: PortfolioPerformance,
    #[serde(rename = "riskMetrics")]
    pub risk_metrics: RiskMetrics,
}

#[derive(Serialize, ToSchema)]
pub struct PortfolioPerformance {
    #[serde(rename = "totalReturn")]
    pub total_return: f64,
    #[serde(rename = "totalReturnUsd")]
    pub total_return_usd: f64,
    #[serde(rename = "bestPerformingAsset")]
    pub best_performing_asset: AssetPerformance,
    #[serde(rename = "worstPerformingAsset")]
    pub worst_performing_asset: AssetPerformance,
}

#[derive(Serialize, ToSchema)]
pub struct AssetPerformance {
    pub symbol: String,
    #[serde(rename = "return")]
    pub return_: f64,
}

#[derive(Serialize, ToSchema)]
pub struct RiskMetrics {
    pub volatility: f64,
    #[serde(rename = "sharpeRatio")]
    pub sharpe_ratio: f64,
    #[serde(rename = "maxDrawdown")]
    pub max_drawdown: f64,
}

// --- Transactions Execute ---
#[derive(Deserialize, ToSchema)]
pub struct TransactionExecuteRequest {
    #[serde(rename = "transactionData")]
    pub transaction_data: String,
    pub signature: String,
    #[serde(rename = "walletAddress")]
    pub wallet_address: String,
}

// --- Transactions Simulate ---
#[derive(Deserialize, Serialize, ToSchema)]
pub struct TransactionSimulateRequest {
    #[serde(rename = "type")]
    #[schema(rename = "type")]
    pub type_: String,
    pub from: TransactionParty,
    pub to: TransactionParty,
    #[serde(rename = "walletAddress")]
    pub wallet_address: String,
    pub slippage: f64,
}

#[derive(Deserialize, Serialize, ToSchema)]
pub struct TransactionParty {
    pub token: String,
    pub amount: Option<String>,
    pub address: Option<String>,
}

#[derive(Serialize, ToSchema)]
pub struct TransactionSimulateResponse {
    pub success: bool,
    pub data: TransactionSimulateData,
}

#[derive(Serialize, ToSchema)]
pub struct TransactionSimulateData {
    #[serde(rename = "estimatedOutput")]
    pub estimated_output: String,
    #[serde(rename = "priceImpact")]
    pub price_impact: f64,
    pub fee: TransactionFee,
    pub route: Vec<String>,
    #[serde(rename = "minimumReceived")]
    pub minimum_received: String,
    #[serde(rename = "gasEstimate")]
    pub gas_estimate: String,
}

#[derive(Serialize, ToSchema)]
pub struct TransactionFee {
    pub amount: String,
    pub token: String,
    pub usd: f64,
}

// --- Market Stats ---
#[derive(Serialize, ToSchema)]
pub struct MarketSeiStatsResponse {
    pub success: bool,
    pub data: MarketSeiStatsData,
}

#[derive(Serialize, ToSchema)]
pub struct MarketSeiStatsData {
    pub network: NetworkStats,
    pub ecosystem: EcosystemStats,
}

#[derive(Serialize, ToSchema)]
pub struct NetworkStats {
    #[serde(rename = "blockHeight")]
    pub block_height: u64,
    #[serde(rename = "totalTransactions")]
    pub total_transactions: u64,
    #[serde(rename = "activeValidators")]
    pub active_validators: u32,
    #[serde(rename = "bondedTokens")]
    pub bonded_tokens: String,
    pub inflation: f64,
    #[serde(rename = "stakingApr")]
    pub staking_apr: f64,
}

#[derive(Serialize, ToSchema)]
pub struct EcosystemStats {
    #[serde(rename = "totalValueLocked")]
    pub total_value_locked: u64,
    #[serde(rename = "activeProtocols")]
    pub active_protocols: u32,
    #[serde(rename = "totalUsers")]
    pub total_users: u64,
}

// --- Market Prices ---
#[derive(Serialize, ToSchema)]
pub struct MarketPricesResponse {
    pub success: bool,
    pub data: MarketPricesData,
}

#[derive(Serialize, ToSchema)]
pub struct MarketPricesData {
    pub prices: std::collections::HashMap<String, MarketPrice>,
    #[serde(rename = "lastUpdated")]
    pub last_updated: String,
}

#[derive(Serialize, ToSchema)]
pub struct MarketPrice {
    pub usd: f64,
    #[serde(rename = "change24h")]
    pub change_24h: f64,
    #[serde(rename = "volume24h")]
    pub volume_24h: u64,
    #[serde(rename = "marketCap")]
    pub market_cap: u64,
}

// --- Wallet Transactions ---
#[derive(Serialize, ToSchema)]
pub struct WalletTransactionsResponse {
    pub success: bool,
    pub data: WalletTransactionsData,
}

#[derive(Serialize, ToSchema)]
pub struct WalletTransactionsData {
    pub transactions: Vec<WalletTransaction>,
    pub pagination: Pagination,
}

#[derive(Serialize, ToSchema)]
pub struct WalletTransaction {
    pub id: String,
    pub hash: String,
    #[serde(rename = "type")]
    #[schema(rename = "type")]
    pub type_: String,
    pub status: String,
    pub timestamp: String,
    pub from: String,
    pub to: String,
    pub amount: String,
    pub token: WalletToken,
    pub fee: TransactionFee,
    #[serde(rename = "valueUsd")]
    pub value_usd: f64,
}

#[derive(Serialize, ToSchema)]
pub struct WalletToken {
    pub symbol: String,
    pub name: String,
    pub logo: String,
}

#[derive(Serialize, ToSchema)]
pub struct Pagination {
    pub page: u32,
    pub limit: u32,
    pub total: u32,
    #[serde(rename = "totalPages")]
    pub total_pages: u32,
}

// --- Wallet Portfolio ---
#[derive(Serialize, ToSchema)]
pub struct WalletPortfolioResponse {
    pub success: bool,
    pub data: WalletPortfolioData,
}

#[derive(Serialize, ToSchema)]
pub struct WalletPortfolioData {
    #[serde(rename = "totalBalance")]
    pub total_balance: WalletBalance,
    #[serde(rename = "change24h")]
    pub change_24h: WalletChange24h,
    pub assets: Vec<WalletAsset>,
}

#[derive(Serialize, ToSchema)]
pub struct WalletBalance {
    pub usd: f64,
    pub sei: f64,
}

#[derive(Serialize, ToSchema)]
pub struct WalletChange24h {
    pub usd: f64,
    pub percentage: f64,
}

#[derive(Serialize, ToSchema)]
pub struct WalletAsset {
    pub symbol: String,
    pub name: String,
    pub balance: String,
    #[serde(rename = "valueUsd")]
    pub value_usd: f64,
    #[serde(rename = "change24h")]
    pub change_24h: WalletAssetChange24h,
    pub price: f64,
    pub logo: String,
}

#[derive(Serialize, ToSchema)]
pub struct WalletAssetChange24h {
    pub percentage: f64,
    #[serde(rename = "isPositive")]
    pub is_positive: bool,
}
