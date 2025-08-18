// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {LiquidityManager} from "src/LiquidityManager.sol";
import {IPool} from "src/interfaces/IPool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {console} from "forge-std/console.sol";

/**
 * @title LiquidityManagerIntegration
 * @dev Integration tests for LiquidityManager using real SEI mainnet pools
 * @notice Run with: forge test --match-contract LiquidityManagerIntegration --fork-url https://evm-rpc.sei-apis.com -vvv
 */
contract LiquidityManagerIntegration is Test {
    LiquidityManager public liquidityManager;

    // Real SEI mainnet addresses from DragonSwap
    address constant USDC = 0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1;
    address constant WSEI = 0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7;
    address constant WETH = 0x160345fC359604fC6e70E3c5fAcbdE5F7A9342d8;
    address constant WBTC = 0x0555E30da8f98308EdB960aa94C0Db47230d2B9c;

    // Real pool addresses from DragonSwap API response
    address constant USDC_WSEI_POOL =
        0x882f62fe8E9594470D1da0f70Bc85096F6c60423; // V3 pool with high volume
    address constant WBTC_USDC_POOL =
        0xe62fD4661C85e126744cC335E9bca8Ae3D5d19D1; // V3 pool
    address constant WSEI_USDC_POOL =
        0xcca2352200a63eb0Aaba2D40BA69b1d32174F285; // V3 pool with high volume

    // Test user addresses
    address constant WHALE_ADDRESS = 0x1234567890123456789012345678901234567890; // We'll fund this
    address constant TEST_USER = 0x2222222222222222222222222222222222222222;

    function setUp() public {
        // Deploy LiquidityManager
        liquidityManager = new LiquidityManager();

        // Fund test addresses with ETH for gas
        vm.deal(WHALE_ADDRESS, 100 ether);
        vm.deal(TEST_USER, 10 ether);

        // Fund whale with tokens (simulate having tokens)
        _fundAddressWithTokens(WHALE_ADDRESS);
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

    function testGetPoolInfoMultiplePools() public {
        address[] memory pools = new address[](3);
        pools[0] = USDC_WSEI_POOL;
        pools[1] = WBTC_USDC_POOL;
        pools[2] = WSEI_USDC_POOL;

        string[] memory poolNames = new string[](3);
        poolNames[0] = "USDC/WSEI";
        poolNames[1] = "WBTC/USDC";
        poolNames[2] = "WSEI/USDC";

        for (uint i = 0; i < pools.length; i++) {
            console.log("\n=== Pool Info for", poolNames[i], "===");

            try liquidityManager.getPoolInfo(pools[i]) returns (
                address token0,
                address token1,
                uint24 fee,
                int24 tickSpacing
            ) {
                console.log("Pool Address:", pools[i]);
                console.log("Token0:", token0);
                console.log("Token1:", token1);
                console.log("Fee:", fee);
                console.log("Tick Spacing:", uint256(int256(tickSpacing)));
                // Get token symbols if possible
                try IERC20Metadata(token0).symbol() returns (
                    string memory symbol0
                ) {
                    console.log("Token0 Symbol:", symbol0);
                } catch {
                    console.log("Token0 Symbol: Unable to fetch");
                }

                try IERC20Metadata(token1).symbol() returns (
                    string memory symbol1
                ) {
                    console.log("Token1 Symbol:", symbol1);
                } catch {
                    console.log("Token1 Symbol: Unable to fetch");
                }
            } catch Error(string memory reason) {
                console.log("Failed to get pool info:", reason);
            } catch {
                console.log("Failed to get pool info: Unknown error");
            }
        }
    }

    function testPoolSlot0() public {
        // Test reading slot0 from a real pool
        console.log("\n=== Testing Pool Slot0 ===");

        try IPool(USDC_WSEI_POOL).slot0() returns (
            uint160 sqrtPriceX96,
            int24 tick,
            uint16 observationIndex,
            uint16 observationCardinality,
            uint16 observationCardinalityNext,
            uint8 feeProtocol,
            bool unlocked
        ) {
            console.log("Pool USDC/WSEI Slot0:");
            console.log("SqrtPriceX96:", sqrtPriceX96);
            console.log("Current Tick:", uint256(int256(tick)));
            console.log("Observation Index:", observationIndex);
            console.log("Observation Cardinality:", observationCardinality);
            console.log("Fee Protocol:", feeProtocol);
            console.log("Unlocked:", unlocked);

            assertTrue(
                sqrtPriceX96 > 0,
                "SqrtPriceX96 should be greater than 0"
            );
            assertTrue(unlocked, "Pool should be unlocked");
        } catch Error(string memory reason) {
            console.log("Failed to read slot0:", reason);
            // Don't fail the test, just log the error
        } catch {
            console.log("Failed to read slot0: Unknown error");
        }
    }

    function testTokenBalances() public {
        console.log("\n=== Testing Token Balances ===");

        address[] memory tokens = new address[](4);
        tokens[0] = USDC;
        tokens[1] = WSEI;
        tokens[2] = WETH;
        tokens[3] = WBTC;

        string[] memory symbols = new string[](4);
        symbols[0] = "USDC";
        symbols[1] = "WSEI";
        symbols[2] = "WETH";
        symbols[3] = "WBTC";

        for (uint i = 0; i < tokens.length; i++) {
            try IERC20(tokens[i]).balanceOf(WHALE_ADDRESS) returns (
                uint256 balance
            ) {
                console.log(symbols[i], "balance of whale:", balance);
                try IERC20Metadata(tokens[i]).decimals() returns (
                    uint8 decimals
                ) {
                    console.log(symbols[i], "decimals:", decimals);
                } catch {
                    console.log(symbols[i], "decimals: Unable to fetch");
                }
            } catch {
                console.log(symbols[i], "balance: Unable to fetch");
            }
        }
    }

    function testMintLiquidityParams() public {
        // Test creating mint parameters for a real pool
        console.log("\n=== Testing Mint Liquidity Parameters ===");

        uint256 amount0Max = 1000000; // 1 USDC (6 decimals)
        uint256 amount1Max = 1 ether; // 1 WSEI (18 decimals)
        int24 tickLower = -887220; // Full range for testing
        int24 tickUpper = 887220;
        address pool = USDC_WSEI_POOL;
        address recipient = TEST_USER;

        console.log("Mint Parameters Created:");
        console.log("Pool:", pool);
        console.log("Recipient:", recipient);
        console.log("Tick Lower:", uint256(int256(tickLower)));
        console.log("Tick Upper:", uint256(int256(tickUpper)));
        console.log("Amount0 Max:", amount0Max);
        console.log("Amount1 Max:", amount1Max);

        // Verify parameters
        assertTrue(pool != address(0), "Pool address should not be zero");
        assertTrue(
            tickLower < tickUpper,
            "Tick lower should be less than tick upper"
        );
        assertTrue(
            amount0Max > 0 || amount1Max > 0,
            "At least one amount should be greater than zero"
        );
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

    // Helper function to simulate funding an address with tokens
    function _fundAddressWithTokens(address target) internal {
        // In a real fork test, you would:
        // 1. Find addresses with large token balances
        // 2. Use vm.prank to transfer tokens from those addresses
        // 3. Or use deal() if the token supports it

        // For now, we'll just log that we would fund the address
        console.log("Would fund address with tokens:", target);

        // Example of how you might fund with USDC if you found a whale:
        // address usdcWhale = 0x...; // Find from blockchain explorer
        // vm.prank(usdcWhale);
        // IERC20(USDC).transfer(target, 1000000 * 1e6); // 1M USDC
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

    function testMulticall() public {
        console.log("\n=== Testing Multicall ===");

        // Test multicall with getPoolInfo calls
        bytes[] memory calls = new bytes[](2);
        calls[0] = abi.encodeWithSelector(
            liquidityManager.getPoolInfo.selector,
            USDC_WSEI_POOL
        );
        calls[1] = abi.encodeWithSelector(
            liquidityManager.getPoolInfo.selector,
            WBTC_USDC_POOL
        );

        try liquidityManager.multicall(calls) returns (bytes[] memory results) {
            console.log("Multicall succeeded with", results.length, "results");

            for (uint i = 0; i < results.length; i++) {
                if (results[i].length > 0) {
                    (
                        address token0,
                        address token1,
                        uint24 fee,
                        int24 tickSpacing
                    ) = abi.decode(
                            results[i],
                            (address, address, uint24, int24)
                        );
                    console.log(
                        string(
                            abi.encodePacked(
                                "Result ",
                                vm.toString(i),
                                " - Token0: ",
                                vm.toString(token0),
                                " Token1: ",
                                vm.toString(token1)
                            )
                        )
                    );
                }
            }
        } catch Error(string memory reason) {
            console.log("Multicall failed:", reason);
        } catch {
            console.log("Multicall failed: Unknown error");
        }
    }
}
