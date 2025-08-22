# SEI MCP AI Agent

An AI agent built on Node.js that integrates with the [SEI MCP Server](https://github.com/sei-protocol/sei-js/tree/main/packages/mcp-server) to provide intelligent DeFi analysis and concentrated liquidity position recommendations. This agent acts as a bridge between AI language models and SEI blockchain data, offering specialized tools for DeFi operations and liquidity management.

## 🚀 Features

- **SEI MCP Integration**: Direct integration with SEI's official MCP server for blockchain data access
- **DeFi AI Agent**: Specialized AI agent for DeFi-related queries and analysis
- **Concentrated Liquidity Recommendations**: Intelligent suggestions for optimal liquidity positions
- **SEI EVM Blockchain Integration**: Native connection to SEI EVM network
- **Token Management**: Comprehensive token registry and balance checking
- **Pool Data Analysis**: Real-time liquidity pool data and analytics
- **Price History Analysis**: Historical price tracking and trend analysis
- **HTTP Server**: RESTful API server for agent interactions

## 🏗️ Architecture

```
src/
├── index.js            # Main application entry point
├── agent/              # AI Agent implementations
│   └── seiAgent.js     # DeFi-specialized SEI agent with liquidity strategies
├── config/             # Configuration management
│   └── env.js          # Environment and SEI MCP configuration
├── infra/              # Infrastructure layer
│   ├── mcp/           # Model Context Protocol
│   │   └── McpClient.js    # SEI MCP server client implementation
│   ├── rest/          # REST API infrastructure
│   │   └── RestClient.js   # HTTP client for external APIs
│   └── sei/           # SEI blockchain integration
│       └── SeiEvmClient.js # SEI EVM client for direct blockchain access
├── llm/               # Language Model integration
│   └── LLM.js         # LLM interface for DeFi analysis and recommendations
├── server/            # Server implementations
│   └── httpServer.js  # HTTP server for agent interactions
├── tools/             # SEI MCP Tools + Custom DeFi Tools
│   ├── mcpBalanceTool.js        # SEI balance checking via MCP
│   ├── mcpTokenBalanceTool.js   # Token-specific balance queries
│   ├── poolsDataTool.js         # Liquidity pools data and analysis
│   └── tokenPairPriceHistoryTool.js # Price history for position optimization
└── utils/             # Utility functions
    ├── responseProcessor.js     # DeFi response formatting and analysis
    └── tokenRegistry.js         # SEI token registry and metadata
```

## 📋 Prerequisites

- **Node.js** (16.0.0 or later)
- **npm** or **yarn**
- **SEI MCP Server**: Access to SEI's official MCP server
- SEI EVM network access
- Environment configuration for SEI blockchain connections

## 🛠️ Installation

1. **Navigate to the project directory**:
   ```bash
   cd mcp-client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with SEI MCP and blockchain configuration
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm start
```

### Using Node.js directly
```bash
node src/index.js
```

## 🔧 Core Components

### SEI Agent (`seiAgent.js`)
- DeFi-specialized AI agent that processes natural language queries
- Integrates with SEI MCP tools and custom DeFi tools
- Provides intelligent responses for DeFi-related questions
- Offers concentrated liquidity position recommendations

### MCP Client (`McpClient.js`)
- Client implementation for connecting to SEI's official MCP server
- Handles MCP protocol communication and tool registration
- Manages data retrieval from SEI blockchain via MCP

### SEI EVM Client (`SeiEvmClient.js`)
- Direct integration with SEI EVM network
- Provides blockchain data access and transaction capabilities
- Supplements MCP data with direct blockchain queries

### LLM Integration (`LLM.js`)
- Language model interface for processing DeFi queries
- Handles AI response generation and reasoning
- Integrates with various LLM providers for intelligent analysis

### HTTP Server (`httpServer.js`)
- RESTful API server for external integrations
- Exposes agent functionality through HTTP endpoints
- Handles cross-origin requests and API routing

### REST Client (`RestClient.js`)
- HTTP client for external API communications
- Handles requests to backend services and data providers
- Manages connection pooling and error handling

## 🛠️ Available Tools

### SEI MCP Tools (via SEI MCP Server)
- **MCP Balance Tool** (`mcpBalanceTool.js`): Balance checking via SEI MCP server
- **MCP Token Balance Tool** (`mcpTokenBalanceTool.js`): Token-specific balance queries through MCP

### Custom DeFi Tools
- **Pools Data Tool** (`poolsDataTool.js`): Liquidity pool data analysis and metrics
- **Token Pair Price History Tool** (`tokenPairPriceHistoryTool.js`): Historical price analysis for position optimization

## 🧰 Utility Functions

### Token Registry (`tokenRegistry.js`)
- Maintains registry of supported SEI tokens
- Provides token metadata and contract addresses
- Handles token symbol resolution and validation

### Response Processor (`responseProcessor.js`)
- Processes and formats AI agent responses
- Handles DeFi-specific response formatting
- Manages error handling and response standardization

### Environment Configuration (`env.js`)
- Manages environment variables and configuration
- Handles SEI MCP server connection settings
- Configures blockchain network parameters

## 📚 Usage Examples

### Starting the Agent
```javascript
// Run the main application
node src/index.js
```

### Tool Usage
```javascript
// Balance checking via MCP
const mcpBalanceTool = require('./src/tools/mcpBalanceTool');
const balance = await mcpBalanceTool.execute({ 
  address: '0x...', 
  token: 'SEI' 
});

// Pool data analysis
const poolsTool = require('./src/tools/poolsDataTool');
const poolData = await poolsTool.execute({ poolId: 'pool_123' });

// Price history analysis
const priceHistoryTool = require('./src/tools/tokenPairPriceHistoryTool');
const priceHistory = await priceHistoryTool.execute({ 
  tokenA: 'SEI', 
  tokenB: 'USDC',
  timeframe: '24h'
});
```

## 🔒 Security Considerations

- **Environment Variables**: Sensitive configuration stored in environment variables
- **Input Validation**: Request validation and sanitization for all tools
- **Error Handling**: Comprehensive error handling for blockchain interactions
- **Rate Limiting**: Protection against API abuse

## 🤝 Integration Points

### SEI Ecosystem
- **SEI MCP Server**: Official SEI blockchain data provider via MCP protocol
- **SEI EVM Network**: Direct blockchain network integration
- **SEI DEXs**: Data integration with SEI-based decentralized exchanges

### External Services
- **Backend APIs**: Communication with external data aggregation services
- **LLM Providers**: Integration with AI language model services
- **Price Feeds**: Real-time and historical price data sources

## 🚀 Key Features

### AI-Powered DeFi Analysis
- Natural language processing for DeFi queries
- Intelligent response generation using LLM integration
- Specialized knowledge base for SEI ecosystem and DeFi protocols

### SEI MCP Integration
- Direct connection to SEI's official MCP server
- Access to real-time blockchain data through MCP protocol
- Seamless integration with SEI ecosystem tools and services

### Concentrated Liquidity Support
- Tools for analyzing liquidity positions and opportunities
- Price history analysis for optimal position range calculation
- Pool data analysis for yield optimization strategies

## 📄 License

This project follows standard Node.js licensing practices.

## 🔗 Related Projects

- [SEI MCP Server](https://github.com/sei-protocol/sei-js/tree/main/packages/mcp-server) - Official SEI MCP implementation
- [Rust Backend API Gateway](../rust_backend_api_gateway/) - Backend data aggregation service
- [Smart Contracts](../contracts/) - SEI blockchain smart contracts
- [Frontend](../frontend/) - User interface for DeFi interactions

---

**Built with Node.js** 🟢 | **SEI MCP Integration** 🔗 | **AI-Powered DeFi** 🤖 | **Concentrated Liquidity Expert** 💧