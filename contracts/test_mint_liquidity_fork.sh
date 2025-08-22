#!/bin/bash

# Test script for MintLiquidity fork tests
# This script runs the fork tests against SEI mainnet

echo "🚀 Running MintLiquidity Fork Tests on SEI Mainnet"
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

# Test 1: Basic mint liquidity test
echo -e "${YELLOW}Test 1: Basic Mint Liquidity${NC}"
echo "----------------------------"
forge test --match-contract LiquidityManagerTest --match-test testMintConcentratedLiquidity --fork-url $SEI_RPC -vvv

# Test 2: Mint liquidity using NFPM on sailor
echo -e "${YELLOW}Test 2: Mint Liquidity Using NFPM on sailor${NC}"
echo "----------------------------"
forge test --match-contract LiquidityManagerTest --match-test testMintLiquidityUsingNFMPSAILOR --fork-url $SEI_RPC -vvv

# Test 3: Mint liquidity using NFPM on dragon
echo -e "${YELLOW}Test 3: Mint Liquidity Using NFPM on dragon${NC}"
echo "----------------------------"
forge test --match-contract LiquidityManagerTest --match-test testMintLiquidityUsingNFMPDragon --fork-url $SEI_RPC -vvv

echo ""

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Basic mint test passed${NC}"
else
    echo -e "${RED}❌ Basic mint test failed${NC}"
fi
echo ""
