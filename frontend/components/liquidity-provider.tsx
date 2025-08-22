"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useCurrentPrice } from "@/hooks/useCurrentPrice"
import { useWallet } from "@/contexts/wallet/WalletProvider"
import { useLiquidityManager } from "@/hooks/useLiquidityManager"
import { usePool } from "@/hooks/usePool"
import { useLiquidityCalculation } from "@/hooks/useLiquidityCalculation"
import { ErrorDisplay } from "./ui/error-display"
import { LoadingSpinner } from "./ui/loading-spinner"
import { PoolHeader } from "./pool-header"
import { PoolStats } from "./pool-stats"
import { AnalyticsChart } from "./liquidity/analytics-chart-props"
import { PriceRangeControls } from "./liquidity/price-range-controls"
import { TokenAmountInputs } from "./liquidity/token-amount-props"
import { ethers } from "ethers"

export function LiquidityProvider() {
    const searchParams = useSearchParams()
    const { isConnected, setShowConnectionModal, wallet } = useWallet()
    const {
        mintLiquidity,
        isLoading: isLoadingLiquidityManager,
        error,
        txHash,
        clearError,
        clearTxHash,
        priceToTick,
        getTokenBalance
    } = useLiquidityManager()

    const poolId = searchParams.get("pool")
    const { pool, loading: isLoadingPool, error: poolError } = usePool(poolId)

    const rangeParamMaxPrice = searchParams.get("maxPrice")
    const rangeParamMinPrice = searchParams.get("minPrice")

    // Initialize state with query params or defaults
    const [priceRange, setPriceRange] = useState<number[]>(() => {
        if (rangeParamMaxPrice && rangeParamMinPrice) {
            try {
                const max = Number(rangeParamMaxPrice)
                const min = Number(rangeParamMinPrice)
                if (!isNaN(min) && !isNaN(max) && min < max) {
                    return [min, max]
                }
            } catch (err) {
                console.warn(`Invalid range parameter: ${rangeParamMinPrice} - ${rangeParamMaxPrice}`)
            }
        }
        return [0.005, 0.02] // Default range
    })

    const [token0Amount, setToken0Amount] = useState("")
    const [token1Amount, setToken1Amount] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [activeChart, setActiveChart] = useState<"price" | "liquidity">("liquidity")
    const [token0Balance, setToken0Balance] = useState<string>("")
    const [token1Balance, setToken1Balance] = useState<string>("")
    const [isFullRange, setIsFullRange] = useState<boolean>(false)

    // Use the current price hook
    const {
        currentPrice,
        refetch: refetchPrice
    } = useCurrentPrice(
        pool?.token0.symbol || '',
        pool?.token1.symbol || ''
    )

    // Validate and correct current price
    const validCurrentPrice = useMemo(() => {
        if (!currentPrice || currentPrice <= 0) {
            console.warn('Invalid current price, using fallback:', currentPrice)
            return 0.01 // Reasonable fallback for most token pairs
        }

        // Additional validation for extreme values
        if (currentPrice > 1000000 || currentPrice < 0.000001) {
            console.warn('Extreme current price detected, using fallback:', currentPrice)
            return 0.01
        }

        return currentPrice
    }, [currentPrice])

    // Get tick spacing based on fee tier
    const getTickSpacing = useCallback((feeTier: number): number => {
        switch (feeTier) {
            case 0.01: return 1      // 0.01% fee tier
            case 0.05: return 10     // 0.05% fee tier
            case 0.3: return 60      // 0.3% fee tier
            case 1.0: return 200     // 1% fee tier
            default: return 60       // Default to 0.3% spacing
        }
    }, [])

    // Calculate properly aligned ticks
    const { tickLower, tickUpper } = useMemo(() => {
        if (!pool) {
            return { tickLower: -887220, tickUpper: 887220 }
        }

        // Handle full range
        if (isFullRange) {
            const tickSpacing = getTickSpacing(pool.fee_tier)
            const MIN_TICK = -887272
            const MAX_TICK = 887272

            // Align to tick spacing for full range
            const alignedMinTick = Math.ceil(MIN_TICK / tickSpacing) * tickSpacing
            const alignedMaxTick = Math.floor(MAX_TICK / tickSpacing) * tickSpacing

            return {
                tickLower: alignedMinTick,
                tickUpper: alignedMaxTick
            }
        }

        if (!priceRange[0] || !priceRange[1]) {
            return { tickLower: 0, tickUpper: 0 }
        }

        const tickSpacing = getTickSpacing(pool.fee_tier)

        // Convert prices to raw ticks
        const rawTickLower = priceToTick(priceRange[0], pool.token0.decimals, pool.token1.decimals, tickSpacing)
        const rawTickUpper = priceToTick(priceRange[1], pool.token0.decimals, pool.token1.decimals, tickSpacing)

        // Align ticks to tick spacing
        const alignedTickLower = Math.floor(rawTickLower / tickSpacing) * tickSpacing
        const alignedTickUpper = Math.ceil(rawTickUpper / tickSpacing) * tickSpacing

        // Validate tick bounds
        const MIN_TICK = -887272
        const MAX_TICK = 887272

        const boundedTickLower = Math.max(MIN_TICK, Math.min(MAX_TICK, alignedTickLower))
        const boundedTickUpper = Math.max(MIN_TICK, Math.min(MAX_TICK, alignedTickUpper))

        // Ensure valid range
        const finalTickLower = boundedTickLower
        const finalTickUpper = boundedTickUpper <= finalTickLower ? finalTickLower + tickSpacing : boundedTickUpper

        return {
            tickLower: finalTickLower,
            tickUpper: finalTickUpper
        }
    }, [priceRange, pool, priceToTick, isFullRange, getTickSpacing])

    // Check if position is in range
    const isInRange = useMemo(() => {
        if (isFullRange) return true
        return validCurrentPrice >= priceRange[0] && validCurrentPrice <= priceRange[1]
    }, [validCurrentPrice, priceRange, isFullRange])

    // Price formatting helper
    const formatPrice = (price: number): string => {
        if (price >= 1000) {
            return price.toLocaleString('en-US', { maximumFractionDigits: 2 })
        } else if (price >= 1) {
            return price.toFixed(4)
        } else if (price >= 0.001) {
            return price.toFixed(6)
        } else {
            return price.toExponential(2)
        }
    }

    const { calculateConcentratedLiquidityAmounts } = useLiquidityCalculation(
        validCurrentPrice,
        priceRange,
        isFullRange,
        pool
    )

    // Load token balances
    useEffect(() => {
        const loadBalances = async () => {
            if (!pool || !wallet) return

            try {
                const [balance0, balance1] = await Promise.all([
                    getTokenBalance(pool.token0.address),
                    getTokenBalance(pool.token1.address)
                ])

                if (balance0) {
                    const decimals0 = typeof pool.token0.decimals === 'string'
                        ? parseInt(pool.token0.decimals)
                        : pool.token0.decimals
                    setToken0Balance(ethers.formatUnits(balance0, decimals0))
                }
                if (balance1) {
                    const decimals1 = typeof pool.token1.decimals === 'string'
                        ? parseInt(pool.token1.decimals)
                        : pool.token1.decimals
                    setToken1Balance(ethers.formatUnits(balance1, decimals1))
                }
            } catch (err) {
                console.error('Error loading balances:', err)
            }
        }

        loadBalances()
    }, [pool, wallet, getTokenBalance])

    const handleAddLiquidity = async () => {
        if (!isConnected) {
            setShowConnectionModal(true)
            return
        }

        if (!pool) {
            return
        }

        if (!token0Amount && !token1Amount) {
            return
        }

        clearError()
        clearTxHash()

        try {
            await mintLiquidity({
                pool,
                amount0: token0Amount || "0",
                amount1: token1Amount || "0",
                tickLower,
                tickUpper
            })

            // Reset form on success
            if (txHash) {
                setToken0Amount("")
                setToken1Amount("")
            }
        } catch (err) {
            console.error('Error in handleAddLiquidity:', err)
        }
    }

    const setMaxToken0 = useCallback(() => {
        if (token0Balance) {
            const result = calculateConcentratedLiquidityAmounts(token0Balance, true)
            setToken0Amount(result.token0Amount)
            setToken1Amount(result.token1Amount)
        }
    }, [token0Balance, calculateConcentratedLiquidityAmounts])

    const setMaxToken1 = useCallback(() => {
        if (token1Balance) {
            const result = calculateConcentratedLiquidityAmounts(token1Balance, false)
            setToken0Amount(result.token0Amount)
            setToken1Amount(result.token1Amount)
        }
    }, [token1Balance, calculateConcentratedLiquidityAmounts])

    const handlePriceRangeChange = useCallback((newRange: number[]) => {
        setPriceRange(newRange)
        setIsFullRange(false) // Reset full range when manually changing
        // Clear amounts to force recalculation
        setToken0Amount("")
        setToken1Amount("")
    }, [])

    const setFullRange = useCallback(() => {
        setIsFullRange(fullRange => !fullRange)
        // Clear amounts to force recalculation
        setToken0Amount("")
        setToken1Amount("")
    }, [])

    const handleToken0AmountChange = useCallback((value: string) => {
        setToken0Amount(value)
        setToken1Amount("")
        if (value) {
            const result = calculateConcentratedLiquidityAmounts(value, true)
            setToken1Amount(result.token1Amount)
        }
    }, [calculateConcentratedLiquidityAmounts])

    const handleToken1AmountChange = useCallback((value: string) => {
        setToken1Amount(value)
        setToken0Amount("")
        if (value) {
            const result = calculateConcentratedLiquidityAmounts(value, false)
            setToken0Amount(result.token0Amount)
        }
    }, [calculateConcentratedLiquidityAmounts])

    if (poolError) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
                <ErrorDisplay
                    title="Pool Not Found"
                    message={poolError}
                    className="max-w-2xl"
                />
            </div>
        )
    }

    if (isLoadingPool) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <LoadingSpinner message="Loading pool data..." />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950">
            <div className="max-w-7xl mx-auto p-6">
                <div className="space-y-8">
                    {/* Header with Complete Pool Information */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="text-center lg:text-left space-y-4">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Enhanced Liquidity Provider
                            </h1>
                            <p className="text-gray-300 text-lg">
                                Advanced liquidity provision with real-time analytics and price history
                            </p>
                        </div>

                        <div className="flex flex-col items-center lg:items-end gap-4">
                            {pool && <PoolHeader pool={pool} />}
                            {pool && <PoolStats pool={pool} />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Split Layout */}
            {!isLoadingPool && pool && validCurrentPrice && (
                <div className="max-w-7xl mx-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Charts and Price Range */}
                        <div className="space-y-6">
                            <AnalyticsChart
                                activeChart={activeChart}
                                validCurrentPrice={validCurrentPrice}
                                priceRange={priceRange as [number, number]}
                                pool={pool}
                                onChartChange={setActiveChart}
                            />

                            <PriceRangeControls
                                priceRange={priceRange}
                                isFullRange={isFullRange}
                                validCurrentPrice={validCurrentPrice}
                                pool={pool}
                                tickLower={tickLower}
                                tickUpper={tickUpper}
                                getTickSpacing={getTickSpacing}
                                onPriceRangeChange={handlePriceRangeChange}
                                onToggleFullRange={setFullRange}
                                formatPrice={formatPrice}
                            />
                        </div>

                        {/* Right Column - Deposit Amounts */}
                        <div className="space-y-6">
                            <TokenAmountInputs
                                pool={pool}
                                token0Amount={token0Amount}
                                token1Amount={token1Amount}
                                token0Balance={token0Balance}
                                token1Balance={token1Balance}
                                priceRange={priceRange}
                                isFullRange={isFullRange}
                                isInRange={isInRange}
                                tickLower={tickLower}
                                tickUpper={tickUpper}
                                validCurrentPrice={validCurrentPrice}
                                error={error}
                                txHash={txHash}
                                isLoadingLiquidityManager={isLoadingLiquidityManager}
                                getTickSpacing={getTickSpacing}
                                formatPrice={formatPrice}
                                onToken0AmountChange={handleToken0AmountChange}
                                onToken1AmountChange={handleToken1AmountChange}
                                onSetMaxToken0={setMaxToken0}
                                onSetMaxToken1={setMaxToken1}
                                onAddLiquidity={handleAddLiquidity}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}