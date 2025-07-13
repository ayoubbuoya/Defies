import { DynamicTool } from "langchain/tools";
import { ethers } from "ethers";

export const checkBalanceTool = new DynamicTool({
  name: "check_balance",
  description: "Check the SEI balance of a Sei EVM address. Input should be a valid Ethereum address string.",
  func: async (address) => {
    try {
      console.log(`\n🔍 TOOL CALLED: Checking balance for ${address}`);
      
      // Validate and normalize the address to proper checksum format
      let normalizedAddress;
      try {
        normalizedAddress = ethers.getAddress(address);
      } catch (checksumError) {
        console.log(`⚠️  Invalid address format, trying to normalize...`);
        // If checksum fails, try to normalize to lowercase first
        normalizedAddress = ethers.getAddress(address.toLowerCase());
      }
      
      console.log(`✅ Normalized address: ${normalizedAddress}`);
      
      // Connect to Sei EVM RPC
      const provider = new ethers.JsonRpcProvider("https://evm-rpc-testnet.sei-apis.com");
      
      // Get balance in wei using the normalized address
      const balanceWei = await provider.getBalance(normalizedAddress);
      
      // Convert to ETH for better readability
      const balanceEth = ethers.formatEther(balanceWei);
      
      console.log(`💰 RESULT: ${balanceEth} SEI (${balanceWei.toString()} wei)\n`);
      
      return `Balance for address ${normalizedAddress}: ${balanceEth} SEI (${balanceWei.toString()} wei)`;
    } catch (error) {
      console.error(`❌ TOOL ERROR: ${error.message}\n`);
      return `Error checking balance: ${error.message}`;
    }
  },
});