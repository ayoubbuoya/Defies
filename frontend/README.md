# Defies Frontend

A next-generation DeFi liquidity management platform built with Next.js, offering advanced analytics and concentrated liquidity provision for Uniswap V3-style pools.

## 🚀 Features

- **Advanced Liquidity Provider**: Create concentrated liquidity positions with real-time analytics
- **Multi-DEX Support**: Compatible with various DEX protocols
- **Real-time Price Charts**: Interactive price history and liquidity distribution charts
- **Wallet Integration**: Support for multiple wallet providers
- **Responsive Design**: Beautiful UI that works on desktop and mobile
- **Token Management**: Advanced token selection and balance management
- **Price Range Configuration**: Intuitive tools for setting custom price ranges

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library with shadcn/ui
- **Blockchain**: ethers.js v6
- **Charts**: Custom chart components
- **State Management**: React Context + Custom Hooks
- **Package Manager**: pnpm

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BlockAi/frontend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables:
   ```env
   NEXT_PUBLIC_RPC_URL=your_rpc_url
   NEXT_PUBLIC_CHAIN_ID=chain_id
   NEXT_PUBLIC_API_BASE_URL=api_base_url
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── liquidity/               # Liquidity pages
├── components/                   # React components
│   ├── ui/                      # Base UI components
│   ├── liquidity/               # Liquidity-specific components
│   ├── home-page.tsx            # Main landing page
│   ├── liquidity-provider.tsx   # Main liquidity interface
│   └── ...
├── hooks/                       # Custom React hooks
│   ├── useCurrentPrice.ts       # Price fetching
│   ├── useLiquidityManager.ts   # Liquidity operations
│   ├── usePool.ts               # Pool data management
│   └── ...
├── adapters/                    # External service adapters
│   ├── contracts/               # Smart contract adapters
│   ├── apis/                    # API adapters
│   └── wallet/                  # Wallet adapters
├── services/                    # Business logic services
├── contexts/                    # React contexts
├── constants/                   # Configuration constants
├── types/                       # TypeScript type definitions
└── utils/                       # Utility functions
```

## 🔧 Key Components

### Core Components

- **`liquidity-provider.tsx`**: Main liquidity management interface
- **`home-page.tsx`**: Landing page with pool overview
- **`pools-page.tsx`**: Pool browsing and selection
- **`wallet-connection-modal.tsx`**: Wallet connection interface

### Liquidity Components

- **`token-amount-props.tsx`**: Token amount input handling
- **`price-range-controls.tsx`**: Price range configuration
- **`analytics-chart-props.tsx`**: Interactive analytics charts

### UI Components

- **`ui/`**: Reusable UI components (buttons, inputs, cards, etc.)
- **`network-selector.tsx`**: Network switching
- **`top-navigation.tsx`**: Main navigation bar

## 🔌 Key Hooks

### Data Hooks
- `usePool(poolId)`: Fetch pool data and statistics
- `usePools()`: Fetch multiple pools
- `useCurrentPrice(token0, token1)`: Real-time price data
- `useToken(address)`: Token information and metadata

### Liquidity Hooks
- `useLiquidityManager()`: Liquidity position management
- `useLiquidityCalculation()`: Position calculations
- `useLiquidityChart()`: Chart data for liquidity visualization

### Chart Hooks
- `usePriceChart()`: Price history chart data
- `useLiquidityChart()`: Liquidity distribution data

## 🔗 Services & Adapters

### Contract Adapters
- **`LiquidityManagerAdapter`**: Smart contract interactions
- **`PoolAdapter`**: Pool contract operations
- **`TokenAdapter`**: ERC20 token operations

### API Adapters
- **`PriceAdapter`**: Price data fetching
- **`PoolAdapter`**: Pool information API
- **`TokenAdapter`**: Token metadata API

### Wallet Integration
- **`WalletStrategy`**: Abstract wallet interface
- **Multiple wallet providers**: MetaMask, WalletConnect, etc.

## 📊 Features Deep Dive

### Liquidity Provider
- **Concentrated Liquidity**: Set custom price ranges for capital efficiency
- **Full Range Options**: Traditional AMM-style liquidity provision
- **Real-time Calculations**: Live updates of position value and fees
- **Slippage Protection**: Automatic minimum amount calculations

### Price Management
- **Real-time Prices**: Live price feeds from multiple sources
- **Price History**: Interactive charts with historical data
- **Range Validation**: Automatic validation of price ranges
- **Tick Alignment**: Proper alignment to protocol tick spacing

### User Experience
- **Responsive Design**: Works on all device sizes
- **Dark Theme**: Modern dark UI with gradient accents
- **Loading States**: Smooth loading indicators
- **Error Handling**: Comprehensive error messages and recovery

## 🎨 Styling

The project uses **Tailwind CSS** with a custom design system:

### Color Palette
- **Primary**: Blue to Purple gradient (`from-blue-400 via-purple-400 to-pink-400`)
- **Background**: Dark gray (`bg-gray-950`)
- **Cards**: Translucent gray (`bg-gray-800/80`)
- **Accents**: Blue, Purple, Pink variations

### Design Principles
- **Glass morphism**: Translucent backgrounds with backdrop blur
- **Gradient text**: Eye-catching gradient text for headers
- **Smooth animations**: Hover effects and transitions
- **Consistent spacing**: Standardized padding and margins

## 🔧 Configuration

### Network Configuration
Configure supported networks in `constants/networks.ts`:

```typescript
export const NETWORKS = {
  sei: {
    chainId: 1329,
    name: "Sei Network",
    rpcUrl: "https://evm-rpc.sei-apis.com",
    // ...
  }
}
```

### DEX Configuration
Configure DEX protocols in `constants/dexs.ts`:

```typescript
export const DEX_CONFIGS = {
  dragonswap: {
    name: "DragonSwap",
    router: "0x...",
    factory: "0x...",
    // ...
  }
}
```

## 🚀 Build & Deployment

### Development
```bash
pnpm dev          # Start development server
pnpm lint         # Run ESLint
pnpm type-check   # TypeScript type checking
```

### Production
```bash
pnpm build        # Build for production
pnpm start        # Start production server
```

### Environment Variables
Required for production:
- `NEXT_PUBLIC_RPC_URL`: Blockchain RPC endpoint
- `NEXT_PUBLIC_CHAIN_ID`: Target chain ID
- `NEXT_PUBLIC_API_BASE_URL`: Backend API URL

## 🧪 Testing

```bash
pnpm test         # Run tests
pnpm test:watch   # Run tests in watch mode
pnpm test:coverage # Generate coverage report
```

## 📝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Code Style
- Use TypeScript for all new code
- Follow the existing component structure
- Use custom hooks for data fetching
- Implement proper error handling
- Add JSDoc comments for complex functions

## 📋 Common Issues & Solutions

### Price Display Issues
If prices show scientific notation (`*10^6`):
1. Check token decimals configuration
2. Verify price feed data format
3. Update `formatPrice` function in utils

### Wallet Connection
If wallet connection fails:
1. Verify network configuration
2. Check wallet provider compatibility
3. Ensure proper RPC endpoints

### Transaction Failures
For "Internal JSON-RPC error":
1. Validate tick alignment
2. Check token approvals
3. Verify gas estimation
4. Review transaction parameters

## 🔄 Updates & Maintenance

### Regular Updates
- Update dependencies monthly
- Monitor for security vulnerabilities
- Keep ethers.js updated for latest features
- Update Tailwind CSS for new utilities

### Performance Monitoring
- Monitor bundle size
- Optimize image loading
- Cache API responses
- Implement proper loading states

## 📞 Support

For support and questions:
- **Documentation**: Check inline code comments
- **Issues**: Create GitHub issues for bugs
- **Features**: Submit feature requests via GitHub
- **Community**: Join our Discord/Telegram

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ by the Defies Team**

*Revolutionizing DeFi liquidity management through advanced analytics and user-centric design.*