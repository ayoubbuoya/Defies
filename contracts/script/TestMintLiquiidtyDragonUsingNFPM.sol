// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/LiquidityManager.sol";
import "../src/interfaces/IPool.sol";

contract MintLiquidityDragonUsingNFPMScript is Script {
    // NFMP contract address on SEI mainnet
    address constant SAILOR_NFMP = 0xe294d5Eb435807cD21017013Bef620ed1AeafbeB;
    address constant DRAGONSWAP_NFMP =
        0xa7FDcBe645d6b2B98639EbacbC347e2B575f6F70;

    // Real SEI mainnet addresses
    address constant USDC = 0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392;
    address constant WSEI = 0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7;

    // Real pool addresses from DragonSwap and sailor
    address constant USDC_WSEI_DRAGON_POOL =
        0xcca2352200a63eb0Aaba2D40BA69b1d32174F285; // V3 pool with high volume
    address constant USDC_WSEI_SAILOR_POOL =
        0x80fE558C54f1F43263E08F0E1Fa3E02D8B897F93; // V3 pool with high volume

    // Use the sailopr pool for testing
    address constant USDC_WSEI_POOL = USDC_WSEI_DRAGON_POOL;

    address constant TEST_USER = 0x79dAa774769334aF120f6CAA57E828FBBF56b39a;

    LiquidityManager liquidityManager =
        LiquidityManager(0x36BcE29839Db8DC5cbA2dC64200A729558baB8FD);

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

        console.log("Current Tick:", currentTick);

        int24 tickSpacing = 60;
        int24 tickRange = 200;
        int24 tickLower = ((currentTick - tickRange) / tickSpacing) *
            tickSpacing;
        int24 tickUpper = ((currentTick + tickRange) / tickSpacing) *
            tickSpacing;

        console.log("Tick Lower:", tickLower);
        console.log("Tick Upper:", tickUpper);

        // Mint liquidity
        // Mint concentrated liquidity
        (
            uint256 tokenId,
            uint128 liquidity,
            uint256 amount0Used,
            uint256 amount1Used
        ) = liquidityManager.mintLiquidityUsingNFPM(
                usdcAmount, //  USDC max
                wseiAmount, //  WSEI max
                tickLower,
                tickUpper,
                USDC_WSEI_POOL,
                TEST_USER,
                DRAGONSWAP_NFMP,
                UINT256_MAX
            );

        console.log("Token ID:", tokenId);
        console.log("Liquidity:", liquidity);
        console.log("Amount0 used:", amount0Used);
        console.log("Amount1 used:", amount1Used);

        vm.stopBroadcast();
    }
}
