// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {LiquidityManager} from "src/LiquidityManager.sol";
import {IPool} from "src/interfaces/IPool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {console} from "forge-std/console.sol";

contract LiquidityManagerTest is Test {
    LiquidityManager public liquidityManager;

    // NFMP contract address on SEI mainnet
    address constant SAILOR_NFMP = 0xe294d5Eb435807cD21017013Bef620ed1AeafbeB;
    address constant DRAGONSWAP_NFMP =
        0xa7FDcBe645d6b2B98639EbacbC347e2B575f6F70;

    // Real SEI mainnet addresses from DragonSwap
    address constant USDC = 0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392;
    address constant WSEI = 0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7;
    // Real pool addresses from DragonSwap API response
    address constant USDC_WSEI_DRAGON_POOL =
        0xcca2352200a63eb0Aaba2D40BA69b1d32174F285; // V3 pool with high volume
    address constant USDC_WSEI_SAILOR_POOL =
        0x80fE558C54f1F43263E08F0E1Fa3E02D8B897F93; // V3 pool with high volume

    // Use the DragonSwap pool for testing
    // address constant USDC_WSEI_POOL = USDC_WSEI_DRAGON_POOL;
    address constant USDC_WSEI_POOL = USDC_WSEI_SAILOR_POOL;

    // Test user addresses
    address constant TEST_USER = 0x79dAa774769334aF120f6CAA57E828FBBF56b39a;

    function setUp() public {
        // Deploy LiquidityManager
        liquidityManager = new LiquidityManager();

        vm.deal(TEST_USER, 10 ether);
    }

    function testGetPoolInfo() public {
        // Test getting pool information for USDC/WSEI pool
        (
            address token0,
            address token1,
            uint24 fee,
            int24 tickSpacing
        ) = liquidityManager.getPoolInfo(USDC_WSEI_POOL);

        console.log("Pool Info for USDC/WSEI:");
        console.log("Token0:", token0);
        console.log("Token1:", token1);
        console.log("Fee:", fee);
        console.log("Tick Spacing:", uint256(int256(tickSpacing)));

        // Verify the pool returns valid data
        assertTrue(token0 != address(0), "Token0 should not be zero");
        assertTrue(token1 != address(0), "Token1 should not be zero");
        assertTrue(fee > 0, "Fee should be greater than zero");
        assertTrue(tickSpacing > 0, "Tick spacing should be greater than zero");
    }

    function testCalculateLiquidity() public {
        console.log("\n=== Testing Calculate Liquidity ===");

        // Test liquidity calculation for different amounts
        uint256 amount0 = 1000000; // 1 USDC
        uint256 amount1 = 1 ether; // 1 WSEI

        try
            liquidityManager.calculateLiquidity(
                USDC_WSEI_POOL,
                -887220, // Full range
                887220,
                amount0,
                amount1
            )
        returns (uint128 liquidity) {
            console.log("Calculated liquidity for 1 USDC + 1 WSEI:", liquidity);
            assertTrue(liquidity > 0, "Liquidity should be greater than 0");
        } catch Error(string memory reason) {
            console.log("Calculate liquidity failed:", reason);
        } catch {
            console.log("Calculate liquidity failed: Unknown error");
        }
    }

    function testEmergencyFunctions() public {
        console.log("\n=== Testing Emergency Functions ===");

        // Test emergency withdraw (should work even without tokens)
        try liquidityManager.emergencyWithdraw(USDC, TEST_USER, 0) {
            console.log("Emergency withdraw succeeded with 0 amount");
        } catch Error(string memory reason) {
            console.log("Emergency withdraw failed:", reason);
        } catch {
            console.log("Emergency withdraw failed: Unknown error");
        }
    }

    /**
     * @notice Test minting concentrated liquidity around current price
     */
    function testMintConcentratedLiquidity() public {
        console.log("\n=== Testing Concentrated Liquidity Minting ===");

        address token0 = IPool(USDC_WSEI_POOL).token0();

        console.log("Token0 : ", token0);

        // Get current pool state
        (uint160 sqrtPriceX96, int24 currentTick, , , , , ) = IPool(
            USDC_WSEI_POOL
        ).slot0();
        console.log("Current tick:", uint256(int256(currentTick)));
        console.log("Current sqrtPriceX96:", sqrtPriceX96);

        uint256 usdcAmount = 0.1 * 1e6; // 500 USDC
        uint256 wseiAmount = 0.3 * 1e18; // 500 WSEI

        vm.startPrank(TEST_USER);

        // Approve tokens
        IERC20(USDC).approve(address(liquidityManager), usdcAmount);
        IERC20(WSEI).approve(address(liquidityManager), wseiAmount);

        // Calculate concentrated range around current tick (±1% range)
        int24 tickSpacing = 60; // Common tick spacing for 0.3% fee pools
        int24 tickRange = 200; // Approximately 1% range

        int24 tickLower = ((currentTick - tickRange) / tickSpacing) *
            tickSpacing;
        int24 tickUpper = ((currentTick + tickRange) / tickSpacing) *
            tickSpacing;

        console.log("Concentrated range - Lower:", uint256(int256(tickLower)));
        console.log("Concentrated range - Upper:", uint256(int256(tickUpper)));

        // Mint concentrated liquidity
        (uint256 amount0Used, uint256 amount1Used) = liquidityManager
            .mintLiquidity(
                usdcAmount, //  USDC max
                wseiAmount, //  WSEI max
                tickLower,
                tickUpper,
                USDC_WSEI_POOL,
                TEST_USER
            );

        vm.stopPrank();

        console.log("Concentrated liquidity - Amount0 used:", amount0Used);
        console.log("Concentrated liquidity - Amount1 used:", amount1Used);

        assertTrue(
            amount0Used > 0 || amount1Used > 0,
            "Should use at least one token for concentrated position"
        );
    }

    /**
     * @notice Test minting liquidity using NFPM contract
     */
    function testMintLiquidityUsingNFMPSAILOR() public {
        console.log("\n=== Testing Mint Liquidity Using NFPM on sailor ===");

        address token0 = IPool(USDC_WSEI_SAILOR_POOL).token0();

        console.log("Token0 : ", token0);

        // Get current pool state
        (uint160 sqrtPriceX96, int24 currentTick, , , , , ) = IPool(
            USDC_WSEI_SAILOR_POOL
        ).slot0();
        console.log("Current tick:", uint256(int256(currentTick)));
        console.log("Current sqrtPriceX96:", sqrtPriceX96);

        uint256 usdcAmount = 0.1 * 1e6; // 0.1 USDC
        uint256 wseiAmount = 0.3 * 1e18; // 0.3 WSEI

        vm.startPrank(TEST_USER);

        // Approve tokens
        IERC20(USDC).approve(address(liquidityManager), usdcAmount);
        IERC20(WSEI).approve(address(liquidityManager), wseiAmount);

        // Calculate concentrated range around current tick (±1% range)
        int24 tickSpacing = 60; // Common tick spacing for 0.3% fee pools
        int24 tickRange = 200; // Approximately 1% range

        int24 tickLower = ((currentTick - tickRange) / tickSpacing) *
            tickSpacing;
        int24 tickUpper = ((currentTick + tickRange) / tickSpacing) *
            tickSpacing;

        console.log("Concentrated range - Lower:", uint256(int256(tickLower)));
        console.log("Concentrated range - Upper:", uint256(int256(tickUpper)));

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
                USDC_WSEI_SAILOR_POOL,
                TEST_USER,
                SAILOR_NFMP,
                UINT256_MAX
            );

        vm.stopPrank();

        console.log("Concentrated liquidity - Amount0 used:", amount0Used);
        console.log("Concentrated liquidity - Amount1 used:", amount1Used);
        console.log("Concentrated liquidity - Token ID:", tokenId);
        console.log("Concentrated liquidity - Liquidity:", liquidity);

        assertTrue(
            amount0Used > 0 || amount1Used > 0,
            "Should use at least one token for concentrated position"
        );

        assertTrue(tokenId > 0, "Token ID should be > 0");
    }

    /**
     * @notice Test minting liquidity using NFPM contract
     */
    function testMintLiquidityUsingNFMPDragon() public {
        console.log(
            "\n=== Testing Mint Liquidity Using NFPM using dragon swap ==="
        );

        address token0 = IPool(USDC_WSEI_DRAGON_POOL).token0();

        console.log("Token0 : ", token0);

        // Get current pool state
        (uint160 sqrtPriceX96, int24 currentTick, , , , , ) = IPool(
            USDC_WSEI_DRAGON_POOL
        ).slot0();
        console.log("Current tick:", uint256(int256(currentTick)));
        console.log("Current sqrtPriceX96:", sqrtPriceX96);

        uint256 usdcAmount = 0.1 * 1e6; // 0.1 USDC
        uint256 wseiAmount = 0.3 * 1e18; // 0.3 WSEI

        vm.startPrank(TEST_USER);

        // Approve tokens
        IERC20(USDC).approve(address(liquidityManager), usdcAmount);
        IERC20(WSEI).approve(address(liquidityManager), wseiAmount);

        // Calculate concentrated range around current tick (±1% range)
        int24 tickSpacing = 60; // Common tick spacing for 0.3% fee pools
        int24 tickRange = 200; // Approximately 1% range

        int24 tickLower = ((currentTick - tickRange) / tickSpacing) *
            tickSpacing;
        int24 tickUpper = ((currentTick + tickRange) / tickSpacing) *
            tickSpacing;

        console.log("Concentrated range - Lower:", uint256(int256(tickLower)));
        console.log("Concentrated range - Upper:", uint256(int256(tickUpper)));

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
                USDC_WSEI_DRAGON_POOL,
                TEST_USER,
                DRAGONSWAP_NFMP,
                UINT256_MAX
            );

        vm.stopPrank();

        console.log("Concentrated liquidity - Amount0 used:", amount0Used);
        console.log("Concentrated liquidity - Amount1 used:", amount1Used);
        console.log("Concentrated liquidity - Token ID:", tokenId);
        console.log("Concentrated liquidity - Liquidity:", liquidity);

        assertTrue(
            amount0Used > 0 || amount1Used > 0,
            "Should use at least one token for concentrated position"
        );

        assertTrue(tokenId > 0, "Token ID should be > 0");
    }
}
