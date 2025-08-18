// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/LiquidityManager.sol";
import "../src/interfaces/IPool.sol";

contract MintLiquidityScript is Script {
    // Real SEI mainnet addresses from DragonSwap
    address constant USDC = 0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392;
    address constant WSEI = 0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7;

    // Real pool addresses from DragonSwap API response
    address constant USDC_WSEI_POOL =
        0xcca2352200a63eb0Aaba2D40BA69b1d32174F285; // V3 pool with high volume
    address constant TEST_USER = 0x79dAa774769334aF120f6CAA57E828FBBF56b39a;

    LiquidityManager liquidityManager =
        LiquidityManager(0x182C9728dca9f21Bb7BB95F8B5018827ADF313f0);

    function run() external {
        uint256 usdcAmount = 0.1 * 1e6;
        uint256 wseiAmount = 0.3 * 1e18;

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Start broadcasting tx from your signer
        vm.startBroadcast(deployerPrivateKey);

        // Approve tokens
        IERC20(USDC).approve(address(liquidityManager), usdcAmount);
        IERC20(WSEI).approve(address(liquidityManager), wseiAmount);

        (uint160 sqrtPriceX96, int24 currentTick, , , , , ) = IPool(
            USDC_WSEI_POOL
        ).slot0();

        int24 tickSpacing = 60;
        int24 tickRange = 200;
        int24 tickLower = ((currentTick - tickRange) / tickSpacing) *
            tickSpacing;
        int24 tickUpper = ((currentTick + tickRange) / tickSpacing) *
            tickSpacing;

        console.log("Current Tick:", currentTick);
        console.log("Tick Lower:", tickLower);
        console.log("Tick Upper:", tickUpper);

        // Mint liquidity
        (uint256 amount0Used, uint256 amount1Used) = liquidityManager
            .mintLiquidity(
                usdcAmount,
                wseiAmount,
                tickLower,
                tickUpper,
                USDC_WSEI_POOL,
                TEST_USER
            );

        console.log("Amount0 used:", amount0Used);
        console.log("Amount1 used:", amount1Used);

        vm.stopBroadcast();
    }
}
