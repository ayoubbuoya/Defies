// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./interfaces/IPool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./libraries/LiquidityAmounts.sol";
import "./libraries/TickMath.sol";
import "forge-std/console.sol";

/**
 * @title LiquidityManager
 * @dev A contract that manages liquidity across multiple pools
 * @notice This contract allows users to mint and burn liquidity positions across different pools
 */
contract LiquidityManager is IUniswapV3MintCallback {
    // Events
    event LiquidityMinted(
        address indexed pool,
        address indexed recipient,
        int24 tickLower,
        int24 tickUpper,
        uint128 liquidity,
        uint256 amount0,
        uint256 amount1
    );

    event LiquidityBurned(
        address indexed pool,
        address indexed owner,
        int24 tickLower,
        int24 tickUpper,
        uint128 liquidity,
        uint256 amount0,
        uint256 amount1
    );

    // Errors
    error InvalidPool();
    error InvalidTickRange();
    error InsufficientLiquidity();
    error TransferFailed();
    error SlippageExceeded();

    // Struct to hold mint parameters (kept for backward compatibility in other functions)
    struct MintParams {
        address pool;
        address recipient;
        int24 tickLower;
        int24 tickUpper;
        uint128 liquidity;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        uint256 deadline;
    }

    // Struct to hold burn parameters
    struct BurnParams {
        address pool;
        int24 tickLower;
        int24 tickUpper;
        uint128 liquidity;
        uint256 amount0Min;
        uint256 amount1Min;
        uint256 deadline;
    }

    // Struct to hold mint callback data
    struct MintCallbackData {
        address token0;
        address token1;
        address payer;
        uint256 amount0Max;
        uint256 amount1Max;
    }

    // Modifier to check deadline
    modifier checkDeadline(uint256 deadline) {
        require(block.timestamp <= deadline, "Transaction too old");
        _;
    }

    /**
     * @notice Mints liquidity for a given pool and tick range
     * @param amount0Max Maximum amount of token0 to use
     * @param amount1Max Maximum amount of token1 to use
     * @param tickLower Lower tick of the position
     * @param tickUpper Upper tick of the position
     * @param pool Address of the pool
     * @param recipient Address to receive the liquidity position
     * @return amount0 The amount of token0 that was paid to mint the liquidity
     * @return amount1 The amount of token1 that was paid to mint the liquidity
     */
    function mintLiquidity(
        uint256 amount0Max,
        uint256 amount1Max,
        int24 tickLower,
        int24 tickUpper,
        address pool,
        address recipient
    ) external returns (uint256 amount0, uint256 amount1) {
        console.log("Start mintLiquidity");

        // Validate inputs
        if (pool == address(0)) revert InvalidPool();
        if (tickLower >= tickUpper) revert InvalidTickRange();
        if (amount0Max == 0 && amount1Max == 0) revert InsufficientLiquidity();

        IPool poolContract = IPool(pool);

        // Get pool tokens
        address token0 = poolContract.token0();
        address token1 = poolContract.token1();

        // Calculate optimal liquidity based on amounts and current price
        uint128 liquidity = _liquidityForAmounts(
            tickLower,
            tickUpper,
            amount0Max,
            amount1Max,
            pool
        );

        if (liquidity == 0) revert InsufficientLiquidity();

        console.log("Minting liquidity:", liquidity);

        // Store mint data for callback
        MintCallbackData memory data = MintCallbackData({
            token0: token0,
            token1: token1,
            payer: msg.sender,
            amount0Max: amount0Max,
            amount1Max: amount1Max
        });

        console.log("Minting liquidity 2 :", liquidity);
        // Mint liquidity - this will trigger the callback
        (amount0, amount1) = poolContract.mint(
            recipient,
            tickLower,
            tickUpper,
            liquidity,
            abi.encode(data)
        );

        emit LiquidityMinted(
            pool,
            recipient,
            tickLower,
            tickUpper,
            liquidity,
            amount0,
            amount1
        );
    }

    /**
     * @notice Uniswap V3 mint callback
     * @dev This function is called by the pool during mint to collect the tokens
     * @param amount0Owed The amount of token0 owed to the pool
     * @param amount1Owed The amount of token1 owed to the pool
     * @param data The data passed through from the mint call
     */
    function uniswapV3MintCallback(
        uint256 amount0Owed,
        uint256 amount1Owed,
        bytes calldata data
    ) public {
        console.log("Start uniswapV3MintCallback");
        // Decode callback data
        MintCallbackData memory mintData = abi.decode(data, (MintCallbackData));
        address payer = mintData.payer;

        if (payer == address(this)) {
            if (amount0Owed > 0)
                _safeTransfer(mintData.token0, msg.sender, amount0Owed);
            if (amount1Owed > 0)
                _safeTransfer(mintData.token1, msg.sender, amount1Owed);
        } else {
            if (amount0Owed > 0)
                _safeTransferFrom(
                    mintData.token0,
                    mintData.payer,
                    msg.sender,
                    amount0Owed
                );

            if (amount1Owed > 0)
                _safeTransferFrom(
                    mintData.token1,
                    mintData.payer,
                    msg.sender,
                    amount1Owed
                );
        }
    }

    function dragonswapV2MintCallback(
        uint256 amount0Owed,
        uint256 amount1Owed,
        bytes calldata data
    ) public {
        console.log("Start DragonswapCallback");
        // Decode callback data
        MintCallbackData memory mintData = abi.decode(data, (MintCallbackData));
        address payer = mintData.payer;

        console.log("Payer:", payer);
        console.log("Amount0 Owed:", amount0Owed);
        console.log("Amount1 Owed:", amount1Owed);

        if (payer == address(this)) {
            if (amount0Owed > 0)
                _safeTransfer(mintData.token0, msg.sender, amount0Owed);
            if (amount1Owed > 0)
                _safeTransfer(mintData.token1, msg.sender, amount1Owed);
        } else {
            if (amount0Owed > 0)
                _safeTransferFrom(
                    mintData.token0,
                    mintData.payer,
                    msg.sender,
                    amount0Owed
                );

            if (amount1Owed > 0)
                _safeTransferFrom(
                    mintData.token1,
                    mintData.payer,
                    msg.sender,
                    amount1Owed
                );
        }
    }

    /**
     * @notice Burns liquidity for a given pool and tick range
     * @param params The parameters for burning liquidity
     * @return amount0 The amount of token0 that was collected
     * @return amount1 The amount of token1 that was collected
     */
    function burnLiquidity(
        BurnParams calldata params
    )
        external
        checkDeadline(params.deadline)
        returns (uint256 amount0, uint256 amount1)
    {
        // Validate inputs
        if (params.pool == address(0)) revert InvalidPool();
        if (params.tickLower >= params.tickUpper) revert InvalidTickRange();
        if (params.liquidity == 0) revert InsufficientLiquidity();

        IPool pool = IPool(params.pool);

        // Burn liquidity
        (amount0, amount1) = pool.burn(
            params.tickLower,
            params.tickUpper,
            params.liquidity
        );

        // Check slippage
        if (amount0 < params.amount0Min || amount1 < params.amount1Min) {
            revert SlippageExceeded();
        }

        // Collect the tokens
        (uint256 collect0, uint256 collect1) = pool.collect(
            msg.sender,
            params.tickLower,
            params.tickUpper,
            uint128(amount0),
            uint128(amount1)
        );

        emit LiquidityBurned(
            params.pool,
            msg.sender,
            params.tickLower,
            params.tickUpper,
            params.liquidity,
            collect0,
            collect1
        );

        return (collect0, collect1);
    }

    /**
     * @notice Collects fees from a position
     * @param pool The pool address
     * @param recipient The recipient of the collected fees
     * @param tickLower The lower tick of the position
     * @param tickUpper The upper tick of the position
     * @param amount0Max The maximum amount of token0 to collect
     * @param amount1Max The maximum amount of token1 to collect
     * @return amount0 The amount of token0 collected
     * @return amount1 The amount of token1 collected
     */
    function collectFees(
        address pool,
        address recipient,
        int24 tickLower,
        int24 tickUpper,
        uint128 amount0Max,
        uint128 amount1Max
    ) external returns (uint256 amount0, uint256 amount1) {
        if (pool == address(0)) revert InvalidPool();
        if (tickLower >= tickUpper) revert InvalidTickRange();

        IPool poolContract = IPool(pool);

        (amount0, amount1) = poolContract.collect(
            recipient,
            tickLower,
            tickUpper,
            amount0Max,
            amount1Max
        );
    }

    /**
     * @notice Gets the position info for a given pool and tick range
     * @param pool The pool address
     * @param owner The owner of the position
     * @param tickLower The lower tick of the position
     * @param tickUpper The upper tick of the position
     * @return liquidity The amount of liquidity in the position
     * @return feeGrowthInside0LastX128 The fee growth inside the position for token0
     * @return feeGrowthInside1LastX128 The fee growth inside the position for token1
     * @return tokensOwed0 The amount of token0 owed to the position
     * @return tokensOwed1 The amount of token1 owed to the position
     */
    function getPosition(
        address pool,
        address owner,
        int24 tickLower,
        int24 tickUpper
    )
        external
        view
        returns (
            uint128 liquidity,
            uint256 feeGrowthInside0LastX128,
            uint256 feeGrowthInside1LastX128,
            uint128 tokensOwed0,
            uint128 tokensOwed1
        )
    {
        if (pool == address(0)) revert InvalidPool();

        IPool poolContract = IPool(pool);
        bytes32 positionKey = keccak256(
            abi.encodePacked(owner, tickLower, tickUpper)
        );

        return poolContract.positions(positionKey);
    }

    /**
     * @notice Multicall function to execute multiple operations in a single transaction
     * @param data Array of encoded function calls
     * @return results Array of return data from each call
     */
    function multicall(
        bytes[] calldata data
    ) external returns (bytes[] memory results) {
        results = new bytes[](data.length);
        for (uint256 i = 0; i < data.length; i++) {
            (bool success, bytes memory result) = address(this).delegatecall(
                data[i]
            );
            require(success, "Multicall failed");
            results[i] = result;
        }
    }

    // Internal utility functions
    function _safeTransfer(address token, address to, uint256 amount) internal {
        SafeERC20.safeTransfer(IERC20(token), to, amount);
        if (IERC20(token).balanceOf(to) < amount) {
            revert TransferFailed();
        }
    }

    function _safeTransferFrom(
        address token,
        address from,
        address to,
        uint256 amount
    ) internal {
        SafeERC20.safeTransferFrom(IERC20(token), from, to, amount);
    }

    /**
     * @notice Emergency function to recover stuck tokens
     * @param token The token address to recover
     * @param to The recipient address
     * @param amount The amount to recover
     */
    function emergencyWithdraw(
        address token,
        address to,
        uint256 amount
    ) external {
        // In a production environment, this should have proper access control
        // For now, anyone can call it - add onlyOwner modifier in production
        _safeTransfer(token, to, amount);
    }

    /**
     * @notice Get pool information
     * @param pool The pool address
     * @return token0 The first token of the pool
     * @return token1 The second token of the pool
     * @return fee The fee tier of the pool
     * @return tickSpacing The tick spacing of the pool
     */
    function getPoolInfo(
        address pool
    )
        external
        view
        returns (address token0, address token1, uint24 fee, int24 tickSpacing)
    {
        if (pool == address(0)) revert InvalidPool();

        IPool poolContract = IPool(pool);
        token0 = poolContract.token0();
        token1 = poolContract.token1();
        fee = poolContract.fee();
        tickSpacing = poolContract.tickSpacing();
    }

    /**
     * @notice Calculate the amount of liquidity for given token amounts
     * @param pool The pool address
     * @param tickLower The lower tick
     * @param tickUpper The upper tick
     * @param amount0 The amount of token0
     * @param amount1 The amount of token1
     * @return liquidity The calculated liquidity amount
     */
    function calculateLiquidity(
        address pool,
        int24 tickLower,
        int24 tickUpper,
        uint256 amount0,
        uint256 amount1
    ) external view returns (uint128 liquidity) {
        if (pool == address(0)) revert InvalidPool();
        if (tickLower >= tickUpper) revert InvalidTickRange();

        liquidity = _liquidityForAmounts(
            tickLower,
            tickUpper,
            amount0,
            amount1,
            pool
        );
    }

    /**
     @notice Calculates amount of liquidity in a position for given token0 and token1 amounts
     @param tickLower The lower tick of the liquidity position
     @param tickUpper The upper tick of the liquidity position
     @param amount0 token0 amount
     @param amount1 token1 amount
     */
    function _liquidityForAmounts(
        int24 tickLower,
        int24 tickUpper,
        uint256 amount0,
        uint256 amount1,
        address pool
    ) internal view returns (uint128) {
        (uint160 sqrtRatioX96, , , , , , ) = IPool(pool).slot0();
        return
            getLiquidityForAmounts(
                sqrtRatioX96,
                getSqrtRatioAtTick(tickLower),
                getSqrtRatioAtTick(tickUpper),
                amount0,
                amount1
            );
    }

    function getSqrtRatioAtTick(
        int24 currentTick
    ) public pure returns (uint160 sqrtPriceX96) {
        sqrtPriceX96 = TickMath.getSqrtRatioAtTick(currentTick);
    }

    function getLiquidityForAmounts(
        uint160 sqrtRatioX96,
        uint160 sqrtRatioAX96,
        uint160 sqrtRatioBX96,
        uint256 amount0,
        uint256 amount1
    ) public pure returns (uint128 liquidity) {
        liquidity = LiquidityAmounts.getLiquidityForAmounts(
            sqrtRatioX96,
            sqrtRatioAX96,
            sqrtRatioBX96,
            amount0,
            amount1
        );
    }

    function _toUint128(uint256 x) internal pure returns (uint128 y) {
        require(x <= type(uint128).max);
        y = uint128(x);
    }
}
