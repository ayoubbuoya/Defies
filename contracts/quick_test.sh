#!/bin/bash

# Quick test script for Liquidity Manager
echo "🚀 Quick Liquidity Manager Test"
echo "==============================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if forge is available
if ! command -v forge &> /dev/null; then
    echo -e "${YELLOW}Installing Foundry...${NC}"
    curl -L https://foundry.paradigm.xyz | bash
    export PATH="$PATH:$HOME/.foundry/bin"
    source ~/.bashrc
fi

# Build the project
echo -e "${YELLOW}Building project...${NC}"
if forge build; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Run basic tests
echo -e "${YELLOW}Running basic tests...${NC}"
if forge test --match-contract LiquidityManagerTest -v; then
    echo -e "${GREEN}✅ Basic tests passed${NC}"
else
    echo -e "${RED}❌ Basic tests failed${NC}"
    exit 1
fi

# Test with SEI mainnet fork (single test)
echo -e "${YELLOW}Testing with SEI mainnet fork...${NC}"
if forge test --match-test testGetPoolInfo \
   --fork-url https://evm-rpc.sei-apis.com \
   -v; then
    echo -e "${GREEN}✅ SEI mainnet fork test passed${NC}"
else
    echo -e "${RED}❌ SEI mainnet fork test failed${NC}"
    echo "This might be due to network issues or RPC limits"
fi

echo ""
echo -e "${GREEN}🎉 Quick test completed!${NC}"
echo ""
echo "To run full integration tests:"
echo "./test_sei_mainnet.sh"
