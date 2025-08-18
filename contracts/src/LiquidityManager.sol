// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./interfaces/IPool.sol";
import "./interfaces/IERC20.sol";

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
        // Validate inputs
        if (pool == address(0)) revert InvalidPool();
        if (tickLower >= tickUpper) revert InvalidTickRange();
        if (amount0Max == 0 && amount1Max == 0) revert InsufficientLiquidity();

        IPool poolContract = IPool(pool);

        // Get pool tokens
        address token0 = poolContract.token0();
        address token1 = poolContract.token1();

        // Calculate optimal liquidity based on amounts and current price
        uint128 liquidity = _calculateOptimalLiquidity(
            pool,
            tickLower,
            tickUpper,
            amount0Max,
            amount1Max
        );

        if (liquidity == 0) revert InsufficientLiquidity();

        // Store mint data for callback
        MintCallbackData memory data = MintCallbackData({
            token0: token0,
            token1: token1,
            payer: msg.sender,
            amount0Max: amount0Max,
            amount1Max: amount1Max
        });

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
    ) external override {
        // Decode callback data
        MintCallbackData memory mintData = abi.decode(data, (MintCallbackData));

        // Basic verification: check that the caller has the expected tokens
        // In production, you should implement more robust pool verification
        IPool pool = IPool(msg.sender);
        require(pool.token0() == mintData.token0, "Invalid token0");
        require(pool.token1() == mintData.token1, "Invalid token1");

        // Transfer the required amounts from the payer to the pool
        if (amount0Owed > 0) {
            _safeTransferFrom(mintData.token0, mintData.payer, msg.sender, amount0Owed);
        }

        if (amount1Owed > 0) {
            _safeTransferFrom(mintData.token1, mintData.payer, msg.sender, amount1Owed);
        }
    }

    /**
     * @notice Burns liquidity for a given pool and tick range
     * @param params The parameters for burning liquidity
     * @return amount0 The amount of token0 that was collected
     * @return amount1 The amount of token1 that was collected
     */
    function burnLiquidity(BurnParams calldata params)
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
        (amount0, amount1) = pool.burn(params.tickLower, params.tickUpper, params.liquidity);

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
        bytes32 positionKey = keccak256(abi.encodePacked(owner, tickLower, tickUpper));

        return poolContract.positions(positionKey);
    }

    /**
     * @notice Multicall function to execute multiple operations in a single transaction
     * @param data Array of encoded function calls
     * @return results Array of return data from each call
     */
    function multicall(bytes[] calldata data) external returns (bytes[] memory results) {
        results = new bytes[](data.length);
        for (uint256 i = 0; i < data.length; i++) {
            (bool success, bytes memory result) = address(this).delegatecall(data[i]);
            require(success, "Multicall failed");
            results[i] = result;
        }
    }

    // Internal utility functions
    function _safeTransfer(address token, address to, uint256 amount) internal {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(IERC20.transfer.selector, to, amount)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Transfer failed");
    }

    function _safeTransferFrom(address token, address from, address to, uint256 amount) internal {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, amount)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "TransferFrom failed");
    }

    function _safeApprove(address token, address spender, uint256 amount) internal {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(IERC20.approve.selector, spender, amount)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Approve failed");
    }

    /**
     * @notice Emergency function to recover stuck tokens
     * @param token The token address to recover
     * @param to The recipient address
     * @param amount The amount to recover
     */
    function emergencyWithdraw(address token, address to, uint256 amount) external {
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
    function getPoolInfo(address pool)
        external
        view
        returns (
            address token0,
            address token1,
            uint24 fee,
            int24 tickSpacing
        )
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

        // This is a simplified calculation - in production, you'd want to use
        // the actual Uniswap V3 math libraries for precise calculations
        IPool poolContract = IPool(pool);
        (uint160 sqrtPriceX96, , , , , , ) = poolContract.slot0();

        // Simplified liquidity calculation
        // In production, use proper math libraries like Uniswap's LiquidityAmounts
        uint160 sqrtRatioAX96 = _getSqrtRatioAtTick(tickLower);
        uint160 sqrtRatioBX96 = _getSqrtRatioAtTick(tickUpper);

        if (sqrtPriceX96 <= sqrtRatioAX96) {
            liquidity = _getLiquidityForAmount0(sqrtRatioAX96, sqrtRatioBX96, amount0);
        } else if (sqrtPriceX96 < sqrtRatioBX96) {
            uint128 liquidity0 = _getLiquidityForAmount0(sqrtPriceX96, sqrtRatioBX96, amount0);
            uint128 liquidity1 = _getLiquidityForAmount1(sqrtRatioAX96, sqrtPriceX96, amount1);
            liquidity = liquidity0 < liquidity1 ? liquidity0 : liquidity1;
        } else {
            liquidity = _getLiquidityForAmount1(sqrtRatioAX96, sqrtRatioBX96, amount1);
        }
    }

    /**
     * @notice Calculate optimal liquidity based on token amounts and current pool price
     * @param pool The pool address
     * @param tickLower The lower tick
     * @param tickUpper The upper tick
     * @param amount0Max Maximum amount of token0
     * @param amount1Max Maximum amount of token1
     * @return liquidity The calculated liquidity amount
     */
    function _calculateOptimalLiquidity(
        address pool,
        int24 tickLower,
        int24 tickUpper,
        uint256 amount0Max,
        uint256 amount1Max
    ) internal view returns (uint128 liquidity) {
        IPool poolContract = IPool(pool);
        (uint160 sqrtPriceX96, , , , , , ) = poolContract.slot0();

        uint160 sqrtRatioAX96 = _getSqrtRatioAtTick(tickLower);
        uint160 sqrtRatioBX96 = _getSqrtRatioAtTick(tickUpper);

        if (sqrtPriceX96 <= sqrtRatioAX96) {
            // Current price is below the range, only token0 needed
            liquidity = _getLiquidityForAmount0(sqrtRatioAX96, sqrtRatioBX96, amount0Max);
        } else if (sqrtPriceX96 < sqrtRatioBX96) {
            // Current price is within the range, both tokens needed
            uint128 liquidity0 = _getLiquidityForAmount0(sqrtPriceX96, sqrtRatioBX96, amount0Max);
            uint128 liquidity1 = _getLiquidityForAmount1(sqrtRatioAX96, sqrtPriceX96, amount1Max);
            liquidity = liquidity0 < liquidity1 ? liquidity0 : liquidity1;
        } else {
            // Current price is above the range, only token1 needed
            liquidity = _getLiquidityForAmount1(sqrtRatioAX96, sqrtRatioBX96, amount1Max);
        }
    }

    // Uniswap V3 Math Helper Functions
    function _getSqrtRatioAtTick(int24 tick) internal pure returns (uint160 sqrtPriceX96) {
        uint256 absTick = tick < 0 ? uint256(-int256(tick)) : uint256(int256(tick));
        require(absTick <= uint256(int256(887272)), 'T');

        uint256 ratio = absTick & 0x1 != 0 ? 0xfffcb933bd6fad37aa2d162d1a594001 : 0x100000000000000000000000000000000;
        if (absTick & 0x2 != 0) ratio = (ratio * 0xfff97272373d413259a46990580e213a) >> 128;
        if (absTick & 0x4 != 0) ratio = (ratio * 0xfff2e50f5f656932ef12357cf3c7fdcc) >> 128;
        if (absTick & 0x8 != 0) ratio = (ratio * 0xffe5caca7e10e4e61c3624eaa0941cd0) >> 128;
        if (absTick & 0x10 != 0) ratio = (ratio * 0xffcb9843d60f6159c9db58835c926644) >> 128;
        if (absTick & 0x20 != 0) ratio = (ratio * 0xff973b41fa98c081472e6896dfb254c0) >> 128;
        if (absTick & 0x40 != 0) ratio = (ratio * 0xff2ea16466c96a3843ec78b326b52861) >> 128;
        if (absTick & 0x80 != 0) ratio = (ratio * 0xfe5dee046a99a2a811c461f1969c3053) >> 128;
        if (absTick & 0x100 != 0) ratio = (ratio * 0xfcbe86c7900a88aedcffc83b479aa3a4) >> 128;
        if (absTick & 0x200 != 0) ratio = (ratio * 0xf987a7253ac413176f2b074cf7815e54) >> 128;
        if (absTick & 0x400 != 0) ratio = (ratio * 0xf3392b0822b70005940c7a398e4b70f3) >> 128;
        if (absTick & 0x800 != 0) ratio = (ratio * 0xe7159475a2c29b7443b29c7fa6e889d9) >> 128;
        if (absTick & 0x1000 != 0) ratio = (ratio * 0xd097f3bdfd2022b8845ad8f792aa5825) >> 128;
        if (absTick & 0x2000 != 0) ratio = (ratio * 0xa9f746462d870fdf8a65dc1f90e061e5) >> 128;
        if (absTick & 0x4000 != 0) ratio = (ratio * 0x70d869a156d2a1b890bb3df62baf32f7) >> 128;
        if (absTick & 0x8000 != 0) ratio = (ratio * 0x31be135f97d08fd981231505542fcfa6) >> 128;
        if (absTick & 0x10000 != 0) ratio = (ratio * 0x9aa508b5b7a84e1c677de54f3e99bc9) >> 128;
        if (absTick & 0x20000 != 0) ratio = (ratio * 0x5d6af8dedb81196699c329225ee604) >> 128;
        if (absTick & 0x40000 != 0) ratio = (ratio * 0x2216e584f5fa1ea926041bedfe98) >> 128;
        if (absTick & 0x80000 != 0) ratio = (ratio * 0x48a170391f7dc42444e8fa2) >> 128;

        if (tick > 0) ratio = type(uint256).max / ratio;

        // this divides by 1<<32 rounding up to go from a Q128.128 to a Q128.96.
        // we then downcast because we know the result always fits within 160 bits due to our tick input constraint
        // we round up in the division so getTickAtSqrtRatio of the output price is always consistent
        sqrtPriceX96 = uint160((ratio >> 32) + (ratio % (1 << 32) == 0 ? 0 : 1));
    }

    function _getLiquidityForAmount0(uint160 sqrtRatioAX96, uint160 sqrtRatioBX96, uint256 amount0)
        internal
        pure
        returns (uint128 liquidity)
    {
        if (sqrtRatioAX96 > sqrtRatioBX96) (sqrtRatioAX96, sqrtRatioBX96) = (sqrtRatioBX96, sqrtRatioAX96);
        uint256 intermediate = _mulDiv(sqrtRatioAX96, sqrtRatioBX96, 1 << 96);
        return _toUint128(_mulDiv(amount0, intermediate, sqrtRatioBX96 - sqrtRatioAX96));
    }

    function _getLiquidityForAmount1(uint160 sqrtRatioAX96, uint160 sqrtRatioBX96, uint256 amount1)
        internal
        pure
        returns (uint128 liquidity)
    {
        if (sqrtRatioAX96 > sqrtRatioBX96) (sqrtRatioAX96, sqrtRatioBX96) = (sqrtRatioBX96, sqrtRatioAX96);
        return _toUint128(_mulDiv(amount1, 1 << 96, sqrtRatioBX96 - sqrtRatioAX96));
    }

    // Math utility functions
    function _mulDiv(uint256 a, uint256 b, uint256 denominator) internal pure returns (uint256 result) {
        // Handle overflow
        uint256 prod0; // Least significant 256 bits of the product
        uint256 prod1; // Most significant 256 bits of the product
        assembly {
            let mm := mulmod(a, b, not(0))
            prod0 := mul(a, b)
            prod1 := sub(sub(mm, prod0), lt(mm, prod0))
        }

        // Handle non-overflow cases, 256 by 256 division
        if (prod1 == 0) {
            require(denominator > 0);
            assembly {
                result := div(prod0, denominator)
            }
            return result;
        }

        // Make sure the result is less than 2**256.
        // Also prevents denominator == 0
        require(denominator > prod1);

        ///////////////////////////////////////////////
        // 512 by 256 division.
        ///////////////////////////////////////////////

        // Make division exact by subtracting the remainder from [prod1 prod0]
        // Compute remainder using mulmod
        uint256 remainder;
        assembly {
            remainder := mulmod(a, b, denominator)
        }
        // Subtract 256 bit number from 512 bit number
        assembly {
            prod1 := sub(prod1, gt(remainder, prod0))
            prod0 := sub(prod0, remainder)
        }

        // Factor powers of two out of denominator
        // Compute largest power of two divisor of denominator.
        // Always >= 1.
        uint256 twos = (type(uint256).max - denominator + 1) & denominator;
        // Divide denominator by power of two
        assembly {
            denominator := div(denominator, twos)
        }

        // Divide [prod1 prod0] by the factors of two
        assembly {
            prod0 := div(prod0, twos)
        }
        // Shift in bits from prod1 into prod0. For this we need
        // to flip `twos` such that it is 2**256 / twos.
        // If twos is zero, then it becomes one
        assembly {
            twos := add(div(sub(0, twos), twos), 1)
        }
        prod0 |= prod1 * twos;

        // Invert denominator mod 2**256
        // Now that denominator is an odd number, it has an inverse
        // modulo 2**256 such that denominator * inv = 1 mod 2**256.
        // Compute the inverse by starting with a seed that is correct
        // correct for four bits. That is, denominator * inv = 1 mod 2**4
        uint256 inv = (3 * denominator) ^ 2;
        // Now use Newton-Raphson iteration to improve the precision.
        // Thanks to Hensel's lifting lemma, this also works in modular
        // arithmetic, doubling the correct bits in each step.
        inv *= 2 - denominator * inv; // inverse mod 2**8
        inv *= 2 - denominator * inv; // inverse mod 2**16
        inv *= 2 - denominator * inv; // inverse mod 2**32
        inv *= 2 - denominator * inv; // inverse mod 2**64
        inv *= 2 - denominator * inv; // inverse mod 2**128
        inv *= 2 - denominator * inv; // inverse mod 2**256

        // Because the division is now exact we can divide by multiplying
        // with the modular inverse of denominator. This will give us the
        // correct result modulo 2**256. Since the precoditions guarantee
        // that the outcome is less than 2**256, this is the final result.
        // We don't need to compute the high bits of the result and prod1
        // is no longer required.
        result = prod0 * inv;
        return result;
    }

    function _toUint128(uint256 x) internal pure returns (uint128 y) {
        require(x <= type(uint128).max);
        y = uint128(x);
    }
}