# Rust Backend API Gateway

A Rust-based backend API gateway built with Actix-Web that provides cryptocurrency data aggregation, price analysis, and DeFi functionality. This service integrates with multiple data providers and offers real-time market data processing capabilities.

## 🚀 Features

- **Multi-Source Data Aggregation**: Integrates with Binance, DragonSwap, and Sailor data providers
- **Price Analysis**: Mathematical models for cryptocurrency price history analysis
- **Authentication System**: JWT-based user authentication and authorization
- **Chat Service Integration**: Forwards prompts to external AI backend services
- **Liquidity Data Management**: Handles liquidity pool data and position tracking
- **K-line Data Processing**: Candlestick chart data retrieval and analysis
- **Token Symbol Management**: Token information and symbol resolution
- **Graph Data Generation**: Pool-specific graph data for visualization
- **EVM Wallet Integration**: Ethereum Virtual Machine wallet connectivity

## 🏗️ Architecture

The application follows Clean Architecture principles with clear separation of concerns:

```
src/
├── application/          # Application layer
│   ├── dtos/            # Data Transfer Objects
│   │   ├── ask.rs       # Ask/query data structures
│   │   ├── auth.rs      # Authentication DTOs
│   │   ├── chat.rs      # Chat service DTOs
│   │   ├── liquidity_data.rs  # Liquidity data structures
│   │   ├── position.rs  # Position data structures
│   │   └── price_history.rs   # Price history DTOs
│   ├── service/         # Application services
│   │   ├── chat_service.rs     # Chat functionality
│   │   └── position_service.rs # Position management
│   └── use_cases/       # Business use cases
│       ├── forward_prompt_to_backend.rs  # AI prompt forwarding
│       ├── get_graph_data.rs             # Graph data retrieval
│       ├── get_kline_data.rs             # K-line data processing
│       ├── get_pool_list.rs              # Pool listing
│       ├── get_price_history_analysis.rs # Price analysis
│       ├── get_token_symbol.rs           # Token symbol resolution
│       └── handle_auth.rs                # Authentication handling
├── domain/              # Domain layer
│   ├── repositories/    # Repository interfaces
│   │   ├── data_provider.rs  # Data provider contracts
│   │   ├── dex_provider.rs   # DEX provider interfaces
│   │   ├── jwt.rs            # JWT service interface
│   │   └── wallet.rs         # Wallet interface
│   └── services/        # Domain services
│       └── data.rs      # Data processing services
├── infrastructure/      # Infrastructure layer
│   ├── data/           # Data provider implementations
│   │   ├── binance_data_provider.rs     # Binance API integration
│   │   ├── dragonswap_data_provider.rs  # DragonSwap integration
│   │   └── sailor_data_provider.rs      # Sailor DEX integration
│   ├── external_apis/  # External API implementations
│   │   ├── binance_data_provider.rs     # Binance external API
│   │   ├── dragonswap_data_provider.rs  # DragonSwap external API
│   │   └── sailor_data_provider.rs      # Sailor external API
│   ├── wallet/         # Wallet implementations
│   │   └── evm.rs      # EVM wallet implementation
│   └── jwt.rs          # JWT implementation
├── math/               # Mathematical utilities
│   └── price_analysis.rs  # Price analysis algorithms
├── presentation/       # Presentation layer
│   ├── handlers.rs     # HTTP request handlers
│   └── routes.rs       # Route definitions
└── config/             # Configuration management
```

## 📋 Prerequisites

- **Rust** (1.70.0 or later)
- **Cargo** (comes with Rust)
- **Docker** (optional, for containerized deployment)
- **Database** (as configured in migration)

## 🛠️ Installation

1. **Clone the repository**:
   ```bash
   cd rust_backend_api_gateway
   ```

2. **Install dependencies**:
   ```bash
   cargo build
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run database migrations**:
   ```bash
   cd migration
   cargo run
   ```

## ⚙️ Configuration

The application uses environment variables for configuration. Check `.env.example` for required variables:

- Database connection settings
- API keys for external data providers
- JWT secret keys
- Service endpoints

## 🚀 Running the Application

### Development Mode
```bash
cargo run
```

### Production Mode
```bash
cargo build --release
./target/release/rust_backend_api_gateway
```

### Using Docker
```bash
docker-compose up -d
```

## 📚 Available Functionality

### Data Providers
- **Binance Integration**: Real-time cryptocurrency market data
- **DragonSwap Integration**: DEX-specific trading and liquidity data
- **Sailor Integration**: Alternative DEX data source

### Core Use Cases
- **Authentication Handling**: User login and JWT token management
- **Chat Service**: Forward AI prompts to backend services
- **Graph Data Retrieval**: Generate visualization data for pools
- **K-line Data Processing**: Candlestick chart data for trading pairs
- **Pool List Management**: Retrieve and manage liquidity pools
- **Price History Analysis**: Statistical analysis of price movements
- **Token Symbol Resolution**: Resolve and validate token symbols

### Services
- **Chat Service**: Integration with external AI chat backends
- **Position Service**: Manage user positions and liquidity tracking

### Mathematical Analysis
- **Price Analysis**: Advanced algorithms for price trend analysis and predictions

### Wallet Integration
- **EVM Wallet**: Ethereum Virtual Machine compatible wallet operations

## 🧪 Testing

Run the test suite:
```bash
cargo test
```

## 🏛️ Database

The application includes database migration support using Sea-ORM:

### Running Migrations
```bash
cd migration
cargo run
```

The migration creates the necessary database tables as defined in the migration files.

## 🐳 Docker Support

The application includes Docker configuration for containerized deployment:

```bash
# Using Docker Compose
docker-compose up -d
```

## 🔧 Key Components

### DTOs (Data Transfer Objects)
- **Ask**: Query and request structures
- **Auth**: Authentication data structures
- **Chat**: Chat service communication objects
- **Liquidity Data**: Liquidity pool information
- **Position**: Trading position data
- **Price History**: Historical price data structures

### External Integrations
- **Binance API**: Cryptocurrency market data
- **DragonSwap API**: Decentralized exchange data
- **Sailor API**: Alternative DEX integration

### Infrastructure
- **JWT Authentication**: Secure token-based authentication
- **Multi-provider Data Access**: Abstracted data provider interfaces
- **EVM Wallet Support**: Ethereum-compatible wallet operations

## 🛡️ Security Features

- **JWT Token Management**: Secure authentication and authorization
- **Input Validation**: Comprehensive data validation through DTOs
- **Environment-based Configuration**: Sensitive data stored in environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the Clean Architecture pattern
4. Add appropriate tests
5. Run `cargo test` to ensure all tests pass
6. Submit a pull request

## 📄 License

This project follows standard Rust licensing practices.

---

**Built with Rust** 🦀 | **Powered by Actix-Web** ⚡ | **Clean Architecture** 🏗️