// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "src/LiquidityManager.sol";

/**
 * @title DeployLiquidityManager
 * @dev Deployment script for LiquidityManager contract
 * @notice Run with: forge script script/DeployLiquidityManager.s.sol --rpc-url https://evm-rpc.sei-apis.com --broadcast --verify
 */
contract DeployLiquidityManager is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy LiquidityManager
        LiquidityManager liquidityManager = new LiquidityManager();
        
        console.log("LiquidityManager deployed at:", address(liquidityManager));
        
        vm.stopBroadcast();
        
        // Log deployment info
        console.log("\n=== Deployment Summary ===");
        console.log("Network: SEI Mainnet");
        console.log("LiquidityManager Address:", address(liquidityManager));
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("Block Number:", block.number);
        console.log("Block Timestamp:", block.timestamp);
        
        // Test basic functionality
        _testBasicFunctionality(liquidityManager);
    }
    
    function _testBasicFunctionality(LiquidityManager liquidityManager) internal view {
        console.log("\n=== Testing Basic Functionality ===");
        
        // Real SEI mainnet pool addresses
        address USDC_WSEI_POOL = 0x882f62fe8E9594470D1da0f70Bc85096F6c60423;
        
        try liquidityManager.getPoolInfo(USDC_WSEI_POOL) returns (
            address token0,
            address token1,
            uint24 fee,
            int24 tickSpacing
        ) {
            console.log("getPoolInfo works");
            console.log("Token0:", token0);
            console.log("Token1:", token1);
            console.log("Fee:", fee);
            console.log("Tick Spacing:", uint256(int256(tickSpacing)));
        } catch {
            console.log("getPoolInfo failed");
        }
        
        console.log("Deployment and basic tests completed");
    }
}
