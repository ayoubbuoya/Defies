#!/bin/bash

# Test script for MintLiquidity tests
# This script runs the tests against SEI mainnet

echo "🚀 Running MintLiquidity Tests on SEI Mainnet"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# SEI mainnet RPC URL
SEI_RPC="https://evm-rpc.sei-apis.com"

echo -e "${YELLOW}Using SEI RPC:${NC} $SEI_RPC"
echo ""

# Test 1: mint liquidity test
echo -e "${YELLOW}Test 1: Mint Liquidity${NC}"
echo "----------------------------"
forge script script/testMintLqiuidity.s.sol:MintLiquidityScript --rpc-url sei_mainnet --broadcast

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ mint test passed${NC}"
else
    echo -e "${RED}❌ mint test failed${NC}"
fi
echo ""
