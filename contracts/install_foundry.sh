#!/bin/bash

# Foundry Installation Script for SEI Testing
echo "🔧 Installing Foundry for SEI Liquidity Manager Testing"
echo "====================================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if curl is installed
if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ curl is required but not installed. Please install curl first.${NC}"
    exit 1
fi

# Install Foundry
echo -e "${YELLOW}📥 Installing Foundry...${NC}"
curl -L https://foundry.paradigm.xyz | bash

# Source the environment
echo -e "${YELLOW}🔄 Sourcing environment...${NC}"
source ~/.bashrc

# Update Foundry
echo -e "${YELLOW}⬆️ Updating Foundry...${NC}"
foundryup

# Verify installation
echo -e "${YELLOW}✅ Verifying installation...${NC}"
if command -v forge &> /dev/null; then
    echo -e "${GREEN}✅ Forge installed successfully!${NC}"
    forge --version
else
    echo -e "${RED}❌ Forge installation failed. Please run 'source ~/.bashrc' and try again.${NC}"
    echo "Or manually add ~/.foundry/bin to your PATH"
    exit 1
fi

if command -v anvil &> /dev/null; then
    echo -e "${GREEN}✅ Anvil installed successfully!${NC}"
    anvil --version
else
    echo -e "${RED}❌ Anvil installation failed.${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Foundry installation completed!${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Run: source ~/.bashrc"
echo "2. Test installation: forge --version"
echo "3. Run SEI tests: ./test_sei_mainnet.sh"
echo ""
echo -e "${YELLOW}💡 If forge command is not found after installation:${NC}"
echo "export PATH=\"\$PATH:\$HOME/.foundry/bin\""
echo "source ~/.bashrc"
