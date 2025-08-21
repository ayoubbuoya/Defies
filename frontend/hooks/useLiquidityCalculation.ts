import { useMemo, useCallback } from "react"

export function useLiquidityCalculation(
    validCurrentPrice: number,
    priceRange: number[],
    isFullRange: boolean,
    pool: any
) {
    // CORRECTED: Proper Uniswap V3 concentrated liquidity calculation
    const calculateConcentratedLiquidityAmounts = useCallback((inputAmount: string, isToken0Input: boolean) => {
        if (!validCurrentPrice || !inputAmount || inputAmount === "0" || !pool) {
            return { token0Amount: "", token1Amount: "" }
        }

        const amount = parseFloat(inputAmount)
        if (isNaN(amount) || amount <= 0) return { token0Amount: "", token1Amount: "" }

        // Handle full range differently - use 50/50 value split
        if (isFullRange) {
            if (isToken0Input) {
                // For full range, calculate token1 amount based on current price
                const token1Amount = amount * validCurrentPrice
                return { token0Amount: inputAmount, token1Amount: token1Amount.toFixed(6) }
            } else {
                // For full range, calculate token0 amount based on current price
                const token0Amount = amount / validCurrentPrice
                return { token0Amount: token0Amount.toFixed(6), token1Amount: inputAmount }
            }
        }

        const [minPrice, maxPrice] = priceRange
        const currentPrice = validCurrentPrice

        try {
            // Convert prices to sqrt prices for Uniswap V3 math
            const sqrtPriceLower = Math.sqrt(minPrice)
            const sqrtPriceUpper = Math.sqrt(maxPrice)
            const sqrtPriceCurrent = Math.sqrt(currentPrice)

            if (isToken0Input) {
                // Calculate token1 amount based on token0 input
                let token1Amount = 0

                if (currentPrice <= minPrice) {
                    // Price below range - only token0 needed, no token1
                    token1Amount = 0
                } else if (currentPrice >= maxPrice) {
                    // Price above range - calculate equivalent token1 for the range
                    const virtualLiquidity = amount / (1 / sqrtPriceLower - 1 / sqrtPriceUpper)
                    token1Amount = virtualLiquidity * (sqrtPriceUpper - sqrtPriceLower)
                } else {
                    // Price in range - mixed liquidity calculation
                    // Calculate virtual liquidity from token0 portion
                    const liquidityFromToken0 = amount / (1 / sqrtPriceCurrent - 1 / sqrtPriceUpper)

                    // Calculate required token1 amount for this liquidity level
                    token1Amount = liquidityFromToken0 * (sqrtPriceCurrent - sqrtPriceLower)
                }

                return { token0Amount: inputAmount, token1Amount: Math.max(0, token1Amount).toFixed(6) }

            } else {
                // Calculate token0 amount based on token1 input
                let token0Amount = 0

                if (currentPrice <= minPrice) {
                    // Price below range - calculate equivalent token0 for the range
                    const virtualLiquidity = amount / (sqrtPriceUpper - sqrtPriceLower)
                    token0Amount = virtualLiquidity * (1 / sqrtPriceLower - 1 / sqrtPriceUpper)
                } else if (currentPrice >= maxPrice) {
                    // Price above range - only token1 needed, no token0
                    token0Amount = 0
                } else {
                    // Price in range - mixed liquidity calculation
                    // Calculate virtual liquidity from token1 portion
                    const liquidityFromToken1 = amount / (sqrtPriceCurrent - sqrtPriceLower)

                    // Calculate required token0 amount for this liquidity level
                    token0Amount = liquidityFromToken1 * (1 / sqrtPriceCurrent - 1 / sqrtPriceUpper)
                }

                return { token0Amount: Math.max(0, token0Amount).toFixed(6), token1Amount: inputAmount }
            }
        } catch (err) {
            console.error('Error calculating concentrated liquidity amounts:', err)
            return { token0Amount: "", token1Amount: "" }
        }
    }, [validCurrentPrice, priceRange, isFullRange, pool])

    return { calculateConcentratedLiquidityAmounts }
}