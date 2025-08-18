#!/bin/bash

# SEI Mainnet Testing Script for Liquidity Manager
# This script tests the Liquidity Manager contract against real SEI mainnet data using Anvil

set -e

echo "🔷 SEI Mainnet Liquidity Manager Testing Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# SEI Mainnet configuration
SEI_RPC_URL="https://evm-rpc.sei-apis.com"
SEI_CHAIN_ID=1329

echo -e "${BLUE}📡 SEI Mainnet Configuration:${NC}"
echo "RPC URL: $SEI_RPC_URL"
echo "Chain ID: $SEI_CHAIN_ID"
echo ""

# Check if forge is installed
if ! command -v forge &> /dev/null; then
    echo -e "${RED}❌ Forge is not installed. Installing Foundry...${NC}"
    echo "Running installation script..."
    if [ -f "./install_foundry.sh" ]; then
        ./install_foundry.sh
        # Source the environment
        export PATH="$PATH:$HOME/.foundry/bin"
        # Check again
        if ! command -v forge &> /dev/null; then
            echo -e "${RED}❌ Foundry installation failed. Please run:${NC}"
            echo "curl -L https://foundry.paradigm.xyz | bash"
            echo "source ~/.bashrc"
            exit 1
        fi
    else
        echo "Please install Foundry manually:"
        echo "curl -L https://foundry.paradigm.xyz | bash"
        echo "source ~/.bashrc"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Forge is installed${NC}"

# Check if we can connect to SEI mainnet
echo -e "${YELLOW}🔍 Testing connection to SEI mainnet...${NC}"
if curl -s -X POST -H "Content-Type: application/json" \
   --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
   $SEI_RPC_URL | grep -q "0x531"; then
    echo -e "${GREEN}✅ Successfully connected to SEI mainnet${NC}"
else
    echo -e "${RED}❌ Failed to connect to SEI mainnet${NC}"
    exit 1
fi

# Build the project
echo -e "${YELLOW}🔨 Building the project...${NC}"
if forge build; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Run basic unit tests first
echo -e "${YELLOW}🧪 Running basic unit tests...${NC}"
if forge test --match-contract LiquidityManagerTest -v; then
    echo -e "${GREEN}✅ Unit tests passed${NC}"
else
    echo -e "${RED}❌ Unit tests failed${NC}"
    exit 1
fi

# Run callback tests
echo -e "${YELLOW}🔄 Running callback tests...${NC}"
if forge test --match-contract LiquidityManagerCallbackTest -v; then
    echo -e "${GREEN}✅ Callback tests passed${NC}"
else
    echo -e "${RED}❌ Callback tests failed${NC}"
    exit 1
fi

# Run integration tests with SEI mainnet fork
echo -e "${YELLOW}🌐 Running integration tests with SEI mainnet fork...${NC}"
echo "This will fork SEI mainnet and test against real pools..."

# Test 1: Basic pool information
echo -e "${BLUE}Test 1: Getting pool information${NC}"
if forge test --match-contract LiquidityManagerIntegration \
   --match-test testGetPoolInfo \
   --fork-url $SEI_RPC_URL \
   -vvv; then
    echo -e "${GREEN}✅ Pool info test passed${NC}"
else
    echo -e "${RED}❌ Pool info test failed${NC}"
fi

# Test 2: Multiple pools information
echo -e "${BLUE}Test 2: Getting multiple pools information${NC}"
if forge test --match-contract LiquidityManagerIntegration \
   --match-test testGetPoolInfoMultiplePools \
   --fork-url $SEI_RPC_URL \
   -vvv; then
    echo -e "${GREEN}✅ Multiple pools test passed${NC}"
else
    echo -e "${RED}❌ Multiple pools test failed${NC}"
fi

# Test 3: Pool slot0 data
echo -e "${BLUE}Test 3: Reading pool slot0 data${NC}"
if forge test --match-contract LiquidityManagerIntegration \
   --match-test testPoolSlot0 \
   --fork-url $SEI_RPC_URL \
   -vvv; then
    echo -e "${GREEN}✅ Pool slot0 test passed${NC}"
else
    echo -e "${RED}❌ Pool slot0 test failed${NC}"
fi

# Test 4: Token balances
echo -e "${BLUE}Test 4: Checking token balances${NC}"
if forge test --match-contract LiquidityManagerIntegration \
   --match-test testTokenBalances \
   --fork-url $SEI_RPC_URL \
   -vvv; then
    echo -e "${GREEN}✅ Token balances test passed${NC}"
else
    echo -e "${RED}❌ Token balances test failed${NC}"
fi

# Test 5: Mint parameters
echo -e "${BLUE}Test 5: Testing mint liquidity parameters${NC}"
if forge test --match-contract LiquidityManagerIntegration \
   --match-test testMintLiquidityParams \
   --fork-url $SEI_RPC_URL \
   -vvv; then
    echo -e "${GREEN}✅ Mint parameters test passed${NC}"
else
    echo -e "${RED}❌ Mint parameters test failed${NC}"
fi

# Test 6: Calculate liquidity
echo -e "${BLUE}Test 6: Testing liquidity calculation${NC}"
if forge test --match-contract LiquidityManagerIntegration \
   --match-test testCalculateLiquidity \
   --fork-url $SEI_RPC_URL \
   -vvv; then
    echo -e "${GREEN}✅ Calculate liquidity test passed${NC}"
else
    echo -e "${RED}❌ Calculate liquidity test failed${NC}"
fi

# Test 7: Emergency functions
echo -e "${BLUE}Test 7: Testing emergency functions${NC}"
if forge test --match-contract LiquidityManagerIntegration \
   --match-test testEmergencyFunctions \
   --fork-url $SEI_RPC_URL \
   -vvv; then
    echo -e "${GREEN}✅ Emergency functions test passed${NC}"
else
    echo -e "${RED}❌ Emergency functions test failed${NC}"
fi

# Test 8: Multicall
echo -e "${BLUE}Test 8: Testing multicall functionality${NC}"
if forge test --match-contract LiquidityManagerIntegration \
   --match-test testMulticall \
   --fork-url $SEI_RPC_URL \
   -vvv; then
    echo -e "${GREEN}✅ Multicall test passed${NC}"
else
    echo -e "${RED}❌ Multicall test failed${NC}"
fi

# Run all integration tests together
echo -e "${YELLOW}🚀 Running all integration tests together...${NC}"
if forge test --match-contract LiquidityManagerIntegration \
   --fork-url $SEI_RPC_URL \
   -v; then
    echo -e "${GREEN}✅ All integration tests passed!${NC}"
else
    echo -e "${RED}❌ Some integration tests failed${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Testing completed!${NC}"
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo "- Contract: LiquidityManager"
echo "- Network: SEI Mainnet (forked)"
echo "- RPC: $SEI_RPC_URL"
echo "- Chain ID: $SEI_CHAIN_ID"
echo ""
echo -e "${YELLOW}💡 Next steps:${NC}"
echo "1. Review test results above"
echo "2. If tests pass, you can deploy to SEI mainnet"
echo "3. Use the deployment script: forge script script/DeployLiquidityManager.s.sol"
echo ""
echo -e "${BLUE}🔗 Useful commands:${NC}"
echo "Deploy to SEI mainnet:"
echo "forge script script/DeployLiquidityManager.s.sol --rpc-url $SEI_RPC_URL --broadcast"
echo ""
echo "Verify contract:"
echo "forge verify-contract <CONTRACT_ADDRESS> LiquidityManager --chain-id $SEI_CHAIN_ID"
echo ""
echo -e "${GREEN}Happy testing! 🚀${NC}"
