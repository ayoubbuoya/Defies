// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "../src/LiquidityManager.sol";
import "../src/interfaces/IERC20.sol";

/**
 * @title MintLiquidityExample
 * @dev Example contract showing how to use the simplified mintLiquidity function
 */
contract MintLiquidityExample {
    LiquidityManager public immutable liquidityManager;
    
    // SEI mainnet token addresses
    address constant USDC = 0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1;
    address constant WSEI = 0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7;
    
    // SEI mainnet pool address (USDC/WSEI)
    address constant USDC_WSEI_POOL = 0x882f62fe8E9594470D1da0f70Bc85096F6c60423;
    
    constructor(address _liquidityManager) {
        liquidityManager = LiquidityManager(_liquidityManager);
    }
    
    /**
     * @notice Example: Mint liquidity with equal amounts of USDC and WSEI
     * @dev This function demonstrates the simplified mintLiquidity interface
     */
    function mintEqualLiquidity() external {
        uint256 usdcAmount = 1000000; // 1 USDC (6 decimals)
        uint256 wseiAmount = 1 ether;  // 1 WSEI (18 decimals)
        
        // Approve tokens
        IERC20(USDC).approve(address(liquidityManager), usdcAmount);
        IERC20(WSEI).approve(address(liquidityManager), wseiAmount);
        
        // Mint liquidity with simplified interface
        (uint256 amount0Used, uint256 amount1Used) = liquidityManager.mintLiquidity(
            usdcAmount,    // amount0Max - maximum USDC to use
            wseiAmount,    // amount1Max - maximum WSEI to use
            -887220,       // tickLower - full range lower bound
            887220,        // tickUpper - full range upper bound
            USDC_WSEI_POOL, // pool - the pool address
            msg.sender     // recipient - who receives the liquidity position
        );
        
        // The function automatically:
        // 1. Calculates optimal liquidity based on current pool price
        // 2. Uses the minimum required amounts from amount0Max and amount1Max
        // 3. Refunds any excess tokens back to the user
        
        emit LiquidityMinted(msg.sender, amount0Used, amount1Used);
    }
    
    /**
     * @notice Example: Mint liquidity with only USDC (single-sided)
     * @dev When current price is below the range, only token0 is needed
     */
    function mintUSDCOnlyLiquidity() external {
        uint256 usdcAmount = 1000000; // 1 USDC
        
        // Approve USDC
        IERC20(USDC).approve(address(liquidityManager), usdcAmount);
        
        // Mint liquidity with only USDC
        // Set amount1Max to 0 since we only want to use USDC
        (uint256 amount0Used, uint256 amount1Used) = liquidityManager.mintLiquidity(
            usdcAmount,     // amount0Max - USDC amount
            0,              // amount1Max - no WSEI
            -887220,        // tickLower - range below current price
            -443610,        // tickUpper - range below current price
            USDC_WSEI_POOL, // pool
            msg.sender      // recipient
        );
        
        emit LiquidityMinted(msg.sender, amount0Used, amount1Used);
    }
    
    /**
     * @notice Example: Mint liquidity with only WSEI (single-sided)
     * @dev When current price is above the range, only token1 is needed
     */
    function mintWSEIOnlyLiquidity() external {
        uint256 wseiAmount = 1 ether; // 1 WSEI
        
        // Approve WSEI
        IERC20(WSEI).approve(address(liquidityManager), wseiAmount);
        
        // Mint liquidity with only WSEI
        // Set amount0Max to 0 since we only want to use WSEI
        (uint256 amount0Used, uint256 amount1Used) = liquidityManager.mintLiquidity(
            0,              // amount0Max - no USDC
            wseiAmount,     // amount1Max - WSEI amount
            443610,         // tickLower - range above current price
            887220,         // tickUpper - range above current price
            USDC_WSEI_POOL, // pool
            msg.sender      // recipient
        );
        
        emit LiquidityMinted(msg.sender, amount0Used, amount1Used);
    }
    
    /**
     * @notice Example: Mint concentrated liquidity around current price
     * @dev Provides liquidity in a tight range around current price for higher fees
     */
    function mintConcentratedLiquidity() external {
        uint256 usdcAmount = 1000000; // 1 USDC
        uint256 wseiAmount = 1 ether;  // 1 WSEI
        
        // Approve tokens
        IERC20(USDC).approve(address(liquidityManager), usdcAmount);
        IERC20(WSEI).approve(address(liquidityManager), wseiAmount);
        
        // Mint concentrated liquidity (smaller tick range = more concentrated)
        (uint256 amount0Used, uint256 amount1Used) = liquidityManager.mintLiquidity(
            usdcAmount,     // amount0Max
            wseiAmount,     // amount1Max
            -60,            // tickLower - tight range around current price
            60,             // tickUpper - tight range around current price
            USDC_WSEI_POOL, // pool
            msg.sender      // recipient
        );
        
        emit LiquidityMinted(msg.sender, amount0Used, amount1Used);
    }
    
    /**
     * @notice Example: Mint liquidity for multiple pools in one transaction
     * @dev Uses the multicall functionality to mint in multiple pools
     */
    function mintMultiPoolLiquidity(
        address pool1,
        address pool2,
        uint256 amount0_1,
        uint256 amount1_1,
        uint256 amount0_2,
        uint256 amount1_2
    ) external {
        // Prepare multicall data
        bytes[] memory calls = new bytes[](2);
        
        calls[0] = abi.encodeWithSelector(
            liquidityManager.mintLiquidity.selector,
            amount0_1,   // amount0Max for pool1
            amount1_1,   // amount1Max for pool1
            -887220,     // tickLower
            887220,      // tickUpper
            pool1,       // pool1
            msg.sender   // recipient
        );
        
        calls[1] = abi.encodeWithSelector(
            liquidityManager.mintLiquidity.selector,
            amount0_2,   // amount0Max for pool2
            amount1_2,   // amount1Max for pool2
            -887220,     // tickLower
            887220,      // tickUpper
            pool2,       // pool2
            msg.sender   // recipient
        );
        
        // Execute multicall
        liquidityManager.multicall(calls);
        
        emit MultiPoolLiquidityMinted(msg.sender, pool1, pool2);
    }
    
    // Events
    event LiquidityMinted(address indexed user, uint256 amount0, uint256 amount1);
    event MultiPoolLiquidityMinted(address indexed user, address pool1, address pool2);
}

/**
 * @title Usage Examples in JavaScript/TypeScript
 * 
 * // Example 1: Basic liquidity minting
 * const tx = await liquidityManager.mintLiquidity(
 *   ethers.utils.parseUnits("1", 6),    // 1 USDC (6 decimals)
 *   ethers.utils.parseEther("1"),       // 1 WSEI (18 decimals)
 *   -887220,                            // tickLower (full range)
 *   887220,                             // tickUpper (full range)
 *   "0x882f62fe8E9594470D1da0f70Bc85096F6c60423", // USDC/WSEI pool
 *   userAddress                         // recipient
 * );
 * 
 * // Example 2: Single-sided liquidity (USDC only)
 * const tx = await liquidityManager.mintLiquidity(
 *   ethers.utils.parseUnits("1000", 6), // 1000 USDC
 *   0,                                   // No WSEI
 *   -887220,                            // tickLower
 *   -443610,                            // tickUpper (below current price)
 *   poolAddress,
 *   userAddress
 * );
 * 
 * // Example 3: Concentrated liquidity
 * const tx = await liquidityManager.mintLiquidity(
 *   ethers.utils.parseUnits("100", 6),  // 100 USDC
 *   ethers.utils.parseEther("100"),     // 100 WSEI
 *   -60,                                // Tight range around current price
 *   60,                                 // Tight range around current price
 *   poolAddress,
 *   userAddress
 * );
 */
