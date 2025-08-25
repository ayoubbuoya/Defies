# Liquidity Manager for SEI Blockchain

A robust smart contract system for managing and optimizing liquidity positions across Uniswap V3-compatible pools on SEI mainnet, including full support for NFT-based positions via the Nonfungible Position Manager (NFPM). The system provides a simplified interface for minting, burning, and managing liquidity, with built-in security and gas optimizations.

---

## 🔗 Deployed Contract Information

- **Network:** Sei Pacific-1 (EVM)
- **DeFies LiquidityManager:** [`0x36BcE29839Db8DC5cbA2dC64200A729558baB8FD`](https://seitrace.com/address/0x36BcE29839Db8DC5cbA2dC64200A729558baB8FD?chain=pacific-1)

View contract details, transactions, and verification status on [SeiTrace explorer](https://seitrace.com/address/0x36BcE29839Db8DC5cbA2dC64200A729558baB8FD?chain=pacific-1).

---

## 🚀 Features

- **Simplified Liquidity Management**: Easy-to-use functions for minting and burning positions, with automatic tick and liquidity calculations.
- **NFT Liquidity Positions**: Supports Uniswap V3-style NFT positions using NFPM, allowing users to own, transfer, and manage their liquidity as NFTs.
- **Multi-Pool Support**: Interact with any Uniswap V3-compatible pool by specifying the pool address.
- **Automatic Optimization**: Uses Uniswap V3 math libraries to calculate optimal liquidity amounts and tick ranges.
- **Proper Callbacks**: Implements Uniswap V3 mint callback pattern for atomic, gas-efficient operations.
- **Security**: Built-in validations, slippage protection, and pool verification.
- **Multicall Support**: Batch multiple operations in a single transaction.
- **SEI Mainnet Ready**: Tested with DragonSwap and Sailor pools on SEI mainnet.

---

## 📋 Contract Overview

### Main Functions

```solidity
// Mint a standard liquidity position
function mintLiquidity(
    uint256 amount0Max,
    uint256 amount1Max,
    int24 tickLower,
    int24 tickUpper,
    address pool,
    address recipient
) external returns (uint256 amount0, uint256 amount1);

// Mint an NFT-based liquidity position (Uniswap V3 style)
function mintLiquidityUsingNFPM(
    uint256 amount0Max,
    uint256 amount1Max,
    int24 tickLower,
    int24 tickUpper,
    address pool,
    address recipient,
    address nfpm,
    uint256 deadline
) external returns (uint256 tokenId, uint128 liquidity, uint256 amount0Used, uint256 amount1Used);

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

---

## 🖼️ NFT Liquidity Positions

Uniswap V3-style liquidity positions are represented as NFTs (ERC-721 tokens) via the Nonfungible Position Manager (NFPM). Each NFT encodes the pool, tick range, and liquidity, allowing users to transfer, trade, or manage their positions as unique tokens.

**Example: Minting an NFT Liquidity Position**

```solidity
// Approve tokens first
IERC20(USDC).approve(address(liquidityManager), usdcAmount);
IERC20(WSEI).approve(address(liquidityManager), wseiAmount);

// Mint NFT position using NFPM
(uint256 tokenId, uint128 liquidity, uint256 amount0Used, uint256 amount1Used) =
    liquidityManager.mintLiquidityUsingNFPM(
        usdcAmount,
        wseiAmount,
        tickLower,
        tickUpper,
        USDC_WSEI_POOL,
        msg.sender,
        DRAGONSWAP_NFPM,
        UINT256_MAX
    );

// tokenId is the NFT representing your position
```

See [`script/TestMintLiquiidtyDragonUsingNFPM.sol`](script/TestMintLiquiidtyDragonUsingNFPM.sol) for a full example.

---

## 🏊 SEI Mainnet Pool Addresses

| Pool           | Address                                    | Description         |
|----------------|--------------------------------------------|---------------------|
| USDC/WSEI      | `0x882f62fe8E9594470D1da0f70Bc85096F6c60423` | High volume pool    |
| WBTC/USDC      | `0xe62fd4661c85e126744cc335e9bca8ae3d5d19d1` | Bitcoin/USD pool    |
| WSEI/USDC      | `0xcca2352200a63eb0aaba2d40ba69b1d32174f285` | Alternative WSEI    |

### Token Addresses

| Token | Address                                    | Decimals |
|-------|--------------------------------------------|----------|
| USDC  | `0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1` | 6        |
| WSEI  | `0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7` | 18       |
| WETH  | `0x160345fc359604fc6e70e3c5facbde5f7a9342d8` | 18       |
| WBTC  | `0x0555e30da8f98308edb960aa94c0db47230d2b9c` | 8        |

---

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

---

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

---

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

---

## 💡 Usage Examples

### Minting Standard Liquidity

```solidity
IERC20(USDC).approve(address(liquidityManager), 1000000); // 1 USDC
IERC20(WSEI).approve(address(liquidityManager), 1 ether); // 1 WSEI

(uint256 amount0, uint256 amount1) = liquidityManager.mintLiquidity(
    1000000,    // 1 USDC
    1 ether,    // 1 WSEI
    -887220,    // Full range lower
    887220,     // Full range upper
    USDC_WSEI_POOL,
    msg.sender
);
```

### Minting NFT Liquidity Position

```solidity
IERC20(USDC).approve(address(liquidityManager), usdcAmount);
IERC20(WSEI).approve(address(liquidityManager), wseiAmount);

(uint256 tokenId, uint128 liquidity, uint256 amount0Used, uint256 amount1Used) =
    liquidityManager.mintLiquidityUsingNFPM(
        usdcAmount,
        wseiAmount,
        tickLower,
        tickUpper,
        USDC_WSEI_POOL,
        msg.sender,
        DRAGONSWAP_NFPM,
        UINT256_MAX
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

---

## 📁 Project Structure

```
contracts/
├── src/
│   ├── LiquidityManager.sol          # Main contract
│   └── interfaces/
│       ├── IPool.sol                 # Pool interface
│       ├── INonfungiblePositionManager.sol # NFPM interface
│       └── IERC20.sol                # ERC20 interface
│   └── libraries/
│       ├── TickMath.sol              # Uniswap V3 math
│       ├── LiquidityAmounts.sol      # Uniswap V3 math
│       ├── FullMath.sol              # Math utilities
│       └── FixedPoint96.sol          # Math utilities
├── test/
│   ├── LiquidityManager.t.sol        # Unit tests
│   ├── LiquidityManagerIntegration.t.sol # Integration tests
│   └── LiquidityManagerCallback.t.sol    # Callback tests
├── script/
│   ├── DeployLiquidityManager.s.sol  # Deployment script
│   ├── TestMintLiquiidtyDragonUsingNFPM.sol # NFT mint example
│   ├── TestMintLiquiidtySailorUsingNFPM.sol # NFT mint example
│   └── testMintLqiuidity.s.sol       # Standard mint example
├── examples/
│   ├── MintLiquidityExample.sol      # Solidity examples
│   └── typescript/                   # TypeScript examples
└── docs/
    ├── SIMPLIFIED_MINT_GUIDE.md      # Usage guide
    ├── CALLBACK_MECHANISM.md         # Technical details
    └── SEI_TESTING_GUIDE.md          # Testing guide
```

---

## 🔧 Key Technical Features

### Uniswap V3 Callback Implementation
- Tokens are transferred via callback, not pre-transfer
- Atomic operations ensure either everything succeeds or fails
- Gas efficient - no unnecessary transfers or approvals
- Security verification prevents malicious callback attempts

### NFT Position Support
- Positions minted via NFPM are ERC-721 NFTs
- Each NFT encodes pool, tick range, and liquidity
- Positions can be transferred, traded, or managed as NFTs

### Automatic Liquidity Calculation
- `_getSqrtRatioAtTick()` - Converts ticks to sqrt price ratios
- `_getLiquidityForAmount0()` - Calculates liquidity for token0
- `_getLiquidityForAmount1()` - Calculates liquidity for token1
- `_calculateOptimalLiquidity()` - Determines optimal liquidity based on current price

### Security Features
- Input validation for pool addresses and tick ranges
- Pool verification in callback to prevent malicious calls
- Safe token transfer functions with proper error handling
- Slippage protection through optimal amount calculation

---

## 🎯 Tick Range Examples

| Range Type   | tickLower | tickUpper | Description                | Risk/Reward              |
|--------------|-----------|-----------|----------------------------|--------------------------|
| Full Range   | -887220   | 887220    | Maximum possible range     | Low risk, lower fees     |
| Wide Range   | -443610   | 443610    | Wide range around price    | Medium risk, medium fees |
| Medium Range | -60       | 60        | Medium concentration       | Higher risk, higher fees |
| Tight Range  | -10       | 10        | High concentration         | Highest risk, highest fees |

---

## 🛡️ Security Considerations

1. **Pool Verification**: Always verify pool addresses before interacting
2. **Token Approvals**: Only approve the amounts you intend to use
3. **Tick Alignment**: Ensure ticks align with pool's tick spacing
4. **Slippage**: Tight ranges have higher impermanent loss risk
5. **Testing**: Always test on testnet before mainnet deployment

---

## 📚 Documentation

- **[Simplified Mint Guide](SIMPLIFIED_MINT_GUIDE.md)** - Complete usage guide
- **[Callback Mechanism](CALLBACK_MECHANISM.md)** - Technical implementation details
- **[SEI Testing Guide](SEI_TESTING_GUIDE.md)** - Testing with real SEI pools
- **[Manual Setup](MANUAL_SETUP.md)** - Step-by-step setup instructions

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run the test suite: `./test_sei_mainnet.sh`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- [SEI Network](https://sei.io/)
- [DragonSwap](https://dragonswap.app/)
- [Uniswap V3 Documentation](https://docs.uniswap.org/protocol/V3/introduction)
- [Foundry Documentation](https://book.getfoundry.sh/)
- [SeiTrace Explorer - LiquidityManager Contract](https://seitrace.com/address/0x36BcE29839Db8DC5cbA2dC64200A729558baB8FD?chain=pacific-1)

---

## ⚠️ Disclaimer

This software is provided "as is", without warranty of any kind. Use at your own risk. Always audit smart contracts before using them with real funds.

---

**Built for SEI Mainnet** 🚀 | **Powered by Foundry** ⚡ | **Uniswap V3 & NFT Compatible** 🦄