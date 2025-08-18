# Liquidity Manager for SEI Blockchain

A comprehensive smart contract system for managing liquidity across multiple Uniswap V3-compatible pools on SEI mainnet. The Liquidity Manager provides a simplified interface for minting and burning liquidity positions while implementing proper Uniswap V3 callback mechanisms.

## 🚀 Features

- **Simplified Interface**: Easy-to-use `mintLiquidity()` function with automatic liquidity calculation
- **Multi-Pool Support**: Interact with any Uniswap V3-compatible pool by providing the pool address
- **Automatic Optimization**: Uses real Uniswap V3 math to calculate optimal liquidity amounts
- **Proper Callbacks**: Implements correct Uniswap V3 mint callback pattern for gas efficiency
- **Security**: Built-in validations, slippage protection, and pool verification
- **Multicall Support**: Execute multiple operations in a single transaction
- **SEI Mainnet Ready**: Tested with real DragonSwap pools on SEI mainnet

## 📋 Contract Overview

### Main Functions

```solidity
// Simplified mint function - no structs required!
function mintLiquidity(
    uint256 amount0Max,    // Maximum amount of token0 to use
    uint256 amount1Max,    // Maximum amount of token1 to use
    int24 tickLower,       // Lower tick of the position
    int24 tickUpper,       // Upper tick of the position
    address pool,          // Pool address
    address recipient      // Address to receive the liquidity position
) external returns (uint256 amount0, uint256 amount1);

// Burn liquidity from existing positions
function burnLiquidity(BurnParams calldata params) external returns (uint256, uint256);

// Collect fees from positions
function collectFees(...) external returns (uint256, uint256);

// Get pool and position information
function getPoolInfo(address pool) external view returns (...);
function getPosition(...) external view returns (...);

// Multicall for batch operations
function multicall(bytes[] calldata data) external returns (bytes[] memory);
```

## 🏊 SEI Mainnet Pool Addresses

| Pool | Address | Description |
|------|---------|-------------|
| USDC/WSEI | `0x882f62fe8E9594470D1da0f70Bc85096F6c60423` | High volume pool |
| WBTC/USDC | `0xe62fd4661c85e126744cc335e9bca8ae3d5d19d1` | Bitcoin/USD pool |
| WSEI/USDC | `0xcca2352200a63eb0aaba2d40ba69b1d32174f285` | Alternative WSEI pool |

### Token Addresses

| Token | Address | Decimals |
|-------|---------|----------|
| USDC | `0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1` | 6 |
| WSEI | `0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7` | 18 |
| WETH | `0x160345fc359604fc6e70e3c5facbde5f7a9342d8` | 18 |
| WBTC | `0x0555e30da8f98308edb960aa94c0db47230d2b9c` | 8 |

## 🛠️ Development Setup

### Prerequisites

- [Foundry](https://getfoundry.sh/) - Ethereum development toolkit
- Node.js (for TypeScript examples)
- Git

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd contracts
   ```

2. **Install Foundry** (if not already installed):
   ```bash
   ./install_foundry.sh
   # or manually:
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

3. **Build the project**:
   ```bash
   forge build
   ```

## 🧪 Testing

### Quick Test
```bash
./quick_test.sh
```

### Full SEI Mainnet Integration Tests
```bash
./test_sei_mainnet.sh
```

### Individual Test Categories
```bash
# Basic unit tests
forge test --match-contract LiquidityManagerTest -v

# Callback mechanism tests
forge test --match-contract LiquidityManagerCallbackTest -v

# SEI mainnet fork tests
forge test --match-contract LiquidityManagerIntegration \
  --fork-url https://evm-rpc.sei-apis.com -vvv
```

## 🚀 Deployment

### Deploy to SEI Mainnet

1. **Set environment variables**:
   ```bash
   export PRIVATE_KEY=0x... # Your private key
   ```

2. **Deploy the contract**:
   ```bash
   forge script script/DeployLiquidityManager.s.sol \
     --rpc-url https://evm-rpc.sei-apis.com \
     --broadcast
   ```

3. **Verify the contract** (optional):
   ```bash
   forge verify-contract <CONTRACT_ADDRESS> LiquidityManager \
     --chain-id 1329
   ```

## 💡 Usage Examples

### Basic Liquidity Minting

```solidity
// Approve tokens first
IERC20(USDC).approve(address(liquidityManager), 1000000); // 1 USDC
IERC20(WSEI).approve(address(liquidityManager), 1 ether);  // 1 WSEI

// Mint full-range liquidity
(uint256 amount0, uint256 amount1) = liquidityManager.mintLiquidity(
    1000000,               // 1 USDC (6 decimals)
    1 ether,               // 1 WSEI (18 decimals)
    -887220,               // Full range lower
    887220,                // Full range upper
    USDC_WSEI_POOL,        // Pool address
    msg.sender             // Recipient
);
```

### Concentrated Liquidity

```solidity
// Mint concentrated liquidity around current price
liquidityManager.mintLiquidity(
    1000000,               // 1 USDC
    1 ether,               // 1 WSEI
    -60,                   // Tight range lower
    60,                    // Tight range upper
    USDC_WSEI_POOL,        // Pool address
    msg.sender             // Recipient
);
```

### TypeScript Integration

```typescript
import { ethers } from 'ethers';

const liquidityManager = new ethers.Contract(address, abi, signer);

// Mint liquidity
const tx = await liquidityManager.mintLiquidity(
    ethers.parseUnits("1", 6),    // 1 USDC
    ethers.parseEther("1"),       // 1 WSEI
    -887220,                      // tickLower
    887220,                       // tickUpper
    poolAddress,                  // pool
    userAddress                   // recipient
);

await tx.wait();
```

## 📁 Project Structure

```
contracts/
├── src/
│   ├── LiquidityManager.sol          # Main contract
│   └── interfaces/
│       ├── IPool.sol                 # Pool interface
│       └── IERC20.sol               # ERC20 interface
├── test/
│   ├── LiquidityManager.t.sol        # Unit tests
│   ├── LiquidityManagerIntegration.t.sol # Integration tests
│   └── LiquidityManagerCallback.t.sol    # Callback tests
├── script/
│   └── DeployLiquidityManager.s.sol  # Deployment script
├── examples/
│   ├── MintLiquidityExample.sol      # Solidity examples
│   └── typescript/                   # TypeScript examples
└── docs/
    ├── SIMPLIFIED_MINT_GUIDE.md      # Usage guide
    ├── CALLBACK_MECHANISM.md         # Technical details
    └── SEI_TESTING_GUIDE.md          # Testing guide
```

## 🔧 Key Technical Features

### Uniswap V3 Callback Implementation
The contract properly implements the Uniswap V3 mint callback pattern:
- ✅ Tokens are transferred via callback, not pre-transfer
- ✅ Atomic operations ensure either everything succeeds or fails
- ✅ Gas efficient - no unnecessary transfers or approvals
- ✅ Security verification prevents malicious callback attempts

### Automatic Liquidity Calculation
Uses real Uniswap V3 math libraries:
- `_getSqrtRatioAtTick()` - Converts ticks to sqrt price ratios
- `_getLiquidityForAmount0()` - Calculates liquidity for token0
- `_getLiquidityForAmount1()` - Calculates liquidity for token1
- `_calculateOptimalLiquidity()` - Determines optimal liquidity based on current price

### Security Features
- Input validation for pool addresses and tick ranges
- Pool verification in callback to prevent malicious calls
- Safe token transfer functions with proper error handling
- Slippage protection through optimal amount calculation

## 🎯 Tick Range Examples

| Range Type | tickLower | tickUpper | Description | Risk/Reward |
|------------|-----------|-----------|-------------|-------------|
| Full Range | -887220 | 887220 | Maximum possible range | Low risk, lower fees |
| Wide Range | -443610 | 443610 | Wide range around current price | Medium risk, medium fees |
| Medium Range | -60 | 60 | Medium concentration | Higher risk, higher fees |
| Tight Range | -10 | 10 | High concentration | Highest risk, highest fees |

## 🛡️ Security Considerations

1. **Pool Verification**: Always verify pool addresses before interacting
2. **Token Approvals**: Only approve the amounts you intend to use
3. **Tick Alignment**: Ensure ticks align with pool's tick spacing
4. **Slippage**: Understand that tight ranges have higher impermanent loss risk
5. **Testing**: Always test on testnet before mainnet deployment

## 📚 Documentation

- **[Simplified Mint Guide](SIMPLIFIED_MINT_GUIDE.md)** - Complete usage guide
- **[Callback Mechanism](CALLBACK_MECHANISM.md)** - Technical implementation details
- **[SEI Testing Guide](SEI_TESTING_GUIDE.md)** - Testing with real SEI pools
- **[Manual Setup](MANUAL_SETUP.md)** - Step-by-step setup instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run the test suite: `./test_sei_mainnet.sh`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [SEI Network](https://sei.io/)
- [DragonSwap](https://dragonswap.app/)
- [Uniswap V3 Documentation](https://docs.uniswap.org/protocol/V3/introduction)
- [Foundry Documentation](https://book.getfoundry.sh/)

## ⚠️ Disclaimer

This software is provided "as is", without warranty of any kind. Use at your own risk. Always audit smart contracts before using them with real funds.

---

**Built for SEI Mainnet** 🚀 | **Powered by Foundry** ⚡ | **Uniswap V3 Compatible** 🦄
