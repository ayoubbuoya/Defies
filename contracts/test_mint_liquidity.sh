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
forge test --match-contract MintLiquidityForkTest --match-test testMintLiquidityBasic --fork-url $SEI_RPC -vvv

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Basic mint test passed${NC}"
else
    echo -e "${RED}❌ Basic mint test failed${NC}"
fi
echo ""

# Test 2: Different tick ranges
echo -e "${YELLOW}Test 2: Different Tick Ranges${NC}"
echo "------------------------------"
forge test --match-contract MintLiquidityForkTest --match-test testMintLiquidityDifferentRanges --fork-url $SEI_RPC -vvv

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Tick ranges test passed${NC}"
else
    echo -e "${RED}❌ Tick ranges test failed${NC}"
fi
echo ""

# Test 3: Edge cases
echo -e "${YELLOW}Test 3: Edge Cases${NC}"
echo "-------------------"
forge test --match-contract MintLiquidityForkTest --match-test testMintLiquidityEdgeCases --fork-url $SEI_RPC -vvv

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Edge cases test passed${NC}"
else
    echo -e "${RED}❌ Edge cases test failed${NC}"
fi
echo ""

# Test 4: Real whales (if available)
echo -e "${YELLOW}Test 4: Real Whales${NC}"
echo "-------------------"
forge test --match-contract MintLiquidityForkTest --match-test testMintLiquidityWithRealWhales --fork-url $SEI_RPC -vvv

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Real whales test passed${NC}"
else
    echo -e "${RED}❌ Real whales test failed${NC}"
fi
echo ""

# Run all tests together
echo -e "${YELLOW}Running All Tests Together${NC}"
echo "============================"
forge test --match-contract MintLiquidityForkTest --fork-url $SEI_RPC -vvv

if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 All MintLiquidity fork tests passed!${NC}"
else
    echo -e "${RED}💥 Some tests failed. Check the output above.${NC}"
fi

echo ""
echo "📝 Test Summary:"
echo "- Tests run against SEI mainnet fork"
echo "- Pool used: USDC/WSEI (0x882f62fe8E9594470D1da0f70Bc85096F6c60423)"
echo "- USDC: 0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1"
echo "- WSEI: 0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7"
echo ""
echo "💡 Tips:"
echo "- If tests fail due to insufficient tokens, the deal() function might not work for these tokens"
echo "- You can find real whale addresses using blockchain explorers"
echo "- Update the whale addresses in the test file for better results"
echo ""
echo "🔧 To run individual tests:"
echo "forge test --match-contract MintLiquidityForkTest --match-test <test_name> --fork-url $SEI_RPC -vvv"
