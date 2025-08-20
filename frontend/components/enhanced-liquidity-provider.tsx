"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useCurrentPrice } from "@/hooks/useCurrentPrice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useWallet } from "@/contexts/wallet/WalletProvider"
import { useLiquidityManager } from "@/hooks/useLiquidityManager"
import {
    Droplets,
    Info,
    Settings,
    BarChart3,
    DollarSign,
    TrendingUp,
    BarChart,
} from "lucide-react"
import { PoolPriceHistoryChart } from "@/components/pool-price-history-chart"
import { LiquidityDistributionChart } from "@/components/liquidity-distribution-chart"
import { usePool } from "@/hooks/usePool"
import { ErrorDisplay } from "./ui/error-display"
import { LoadingSpinner } from "./ui/loading-spinner"
import { PoolHeader } from "./pool-header"
import { PoolStats } from "./pool-stats"
import { ethers } from "ethers"

export function EnhancedLiquidityProvider() {
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

        console.log('✅ Tick calculation:', {
            feeTier: pool.fee_tier,
            tickSpacing,
            priceRange,
            rawTickLower,
            rawTickUpper,
            alignedTickLower,
            alignedTickUpper,
            finalTickLower,
            finalTickUpper,
            isFullRange,
            isValidRange: finalTickLower < finalTickUpper,
            isAlignedLower: finalTickLower % tickSpacing === 0,
            isAlignedUpper: finalTickUpper % tickSpacing === 0
        })

        return {
            tickLower: finalTickLower,
            tickUpper: finalTickUpper
        }
    }, [priceRange, pool, priceToTick, isFullRange, getTickSpacing])

    // Price range presets
    const priceRangePresets = useMemo(() => {
        const center = validCurrentPrice

        return {
            wide: [center * 0.1, center * 10], // 10x range each direction
            medium: [center * 0.5, center * 2], // 2x range each direction
            tight10: [center * 0.9, center * 1.1], // ±10%
            tight25: [center * 0.75, center * 1.25], // ±25%
            tight50: [center * 0.5, center * 1.5], // ±50%
        }
    }, [validCurrentPrice])

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

    // CORRECTED: Proper Uniswap V3 concentrated liquidity calculation
    const calculateConcentratedLiquidityAmounts = useCallback((inputAmount: string, isToken0Input: boolean) => {
        if (!validCurrentPrice || !inputAmount || inputAmount === "0" || !pool) {
            return
        }

        const amount = parseFloat(inputAmount)
        if (isNaN(amount) || amount <= 0) return

        // Handle full range differently - use 50/50 value split
        if (isFullRange) {
            if (isToken0Input) {
                // For full range, calculate token1 amount based on current price
                const token1Amount = amount * validCurrentPrice
                setToken1Amount(token1Amount.toFixed(6))
            } else {
                // For full range, calculate token0 amount based on current price
                const token0Amount = amount / validCurrentPrice
                setToken0Amount(token0Amount.toFixed(6))
            }
            return
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

                console.log('Token0 → Token1 calculation:', {
                    inputAmount: amount,
                    currentPrice,
                    minPrice,
                    maxPrice,
                    sqrtPriceCurrent,
                    sqrtPriceLower,
                    sqrtPriceUpper,
                    token1Amount,
                    scenario: currentPrice <= minPrice ? 'below' : currentPrice >= maxPrice ? 'above' : 'in-range'
                })

                setToken1Amount(Math.max(0, token1Amount).toFixed(6))

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

                console.log('Token1 → Token0 calculation:', {
                    inputAmount: amount,
                    currentPrice,
                    minPrice,
                    maxPrice,
                    sqrtPriceCurrent,
                    sqrtPriceLower,
                    sqrtPriceUpper,
                    token0Amount,
                    scenario: currentPrice <= minPrice ? 'below' : currentPrice >= maxPrice ? 'above' : 'in-range'
                })

                setToken0Amount(Math.max(0, token0Amount).toFixed(6))
            }
        } catch (err) {
            console.error('Error calculating concentrated liquidity amounts:', err)
        }
    }, [validCurrentPrice, priceRange, isFullRange, pool])

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

    // Recalculate amounts when price range or mode changes
    useEffect(() => {
        if (!validCurrentPrice || (!token0Amount && !token1Amount)) return

        if (token0Amount && token0Amount !== "0") {
            calculateConcentratedLiquidityAmounts(token0Amount, true)
        } else if (token1Amount && token1Amount !== "0") {
            calculateConcentratedLiquidityAmounts(token1Amount, false)
        }
    }, [validCurrentPrice, priceRange, isFullRange, calculateConcentratedLiquidityAmounts])

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
            console.log('🚀 Submitting liquidity with params:', {
                pool: pool.id,
                amount0: token0Amount || "0",
                amount1: token1Amount || "0",
                tickLower,
                tickUpper,
                isFullRange
            })

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
            setToken0Amount(token0Balance)
            setToken1Amount("")
            calculateConcentratedLiquidityAmounts(token0Balance, true)
        }
    }, [token0Balance, calculateConcentratedLiquidityAmounts])

    const setMaxToken1 = useCallback(() => {
        if (token1Balance) {
            setToken1Amount(token1Balance)
            setToken0Amount("")
            calculateConcentratedLiquidityAmounts(token1Balance, false)
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
                            {/* Chart Toggle */}
                            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center justify-between">
                                        <div className="flex items-center">
                                            <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                                            Analytics Dashboard
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant={activeChart === "liquidity" ? "secondary" : "ghost"}
                                                size="sm"
                                                onClick={() => setActiveChart("liquidity")}
                                                className="text-xs"
                                            >
                                                <BarChart className="w-3 h-3 mr-1" />
                                                Liquidity Histogram
                                            </Button>
                                            <Button
                                                variant={activeChart === "price" ? "secondary" : "ghost"}
                                                size="sm"
                                                onClick={() => setActiveChart("price")}
                                                className="text-xs"
                                            >
                                                <TrendingUp className="w-3 h-3 mr-1" />
                                                Price Candlesticks
                                            </Button>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-96">
                                        {activeChart === "liquidity" ? (
                                            <LiquidityDistributionChart
                                                currentPrice={validCurrentPrice}
                                                priceRange={priceRange as [number, number]}
                                                pool={pool}
                                            />
                                        ) : (
                                            <PoolPriceHistoryChart
                                                currentPrice={validCurrentPrice}
                                                token0={pool.token0.symbol}
                                                token1={pool.token1.symbol}
                                                priceRange={priceRange as [number, number]}
                                            />
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Price Range Controls */}
                            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center">
                                        <Settings className="w-5 h-5 mr-2 text-orange-400" />
                                        Price Range Configuration
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Full Range Toggle */}
                                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id="fullRange"
                                                    checked={isFullRange}
                                                    onChange={() => setFullRange()}
                                                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                                                />
                                                <label htmlFor="fullRange" className="text-white font-medium">
                                                    Full Range
                                                </label>
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                (Entire price spectrum)
                                            </div>
                                        </div>
                                        {isFullRange && (
                                            <div className="flex items-center space-x-1">
                                                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                                <span className="text-green-400 text-xs font-medium">Active</span>
                                            </div>
                                        )}
                                    </div>

                                    {!isFullRange && (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-300">Price Range</span>
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-sm">
                                                        <span className="text-gray-400">Min: </span>
                                                        <span className="text-white font-semibold">${formatPrice(priceRange[0])}</span>
                                                    </div>
                                                    <div className="text-sm">
                                                        <span className="text-gray-400">Max: </span>
                                                        <span className="text-white font-semibold">${formatPrice(priceRange[1])}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">Min Price</label>
                                                    <Input
                                                        type="number"
                                                        step="any"
                                                        value={priceRange[0]}
                                                        onChange={(e) => {
                                                            const newMin = parseFloat(e.target.value) || 0
                                                            if (newMin < priceRange[1]) {
                                                                handlePriceRangeChange([newMin, priceRange[1]])
                                                            }
                                                        }}
                                                        className="bg-gray-800/50 border-gray-700 text-white"
                                                        placeholder={formatPrice(priceRange[0])}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">Max Price</label>
                                                    <Input
                                                        type="number"
                                                        step="any"
                                                        value={priceRange[1]}
                                                        onChange={(e) => {
                                                            const newMax = parseFloat(e.target.value) || 0
                                                            if (newMax > priceRange[0]) {
                                                                handlePriceRangeChange([priceRange[0], newMax])
                                                            }
                                                        }}
                                                        className="bg-gray-800/50 border-gray-700 text-white"
                                                        placeholder={formatPrice(priceRange[1])}
                                                    />
                                                </div>
                                            </div>

                                            {/* Quick preset buttons */}
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handlePriceRangeChange(priceRangePresets.wide)}
                                                    className="text-xs"
                                                >
                                                    Wide (10x)
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handlePriceRangeChange(priceRangePresets.tight10)}
                                                    className="text-xs"
                                                >
                                                    ±10%
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handlePriceRangeChange(priceRangePresets.tight25)}
                                                    className="text-xs"
                                                >
                                                    ±25%
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handlePriceRangeChange(priceRangePresets.tight50)}
                                                    className="text-xs"
                                                >
                                                    ±50%
                                                </Button>
                                            </div>
                                        </>
                                    )}

                                    {/* Full Range Info */}
                                    {isFullRange && (
                                        <div className="p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                                            <div className="flex items-start space-x-2">
                                                <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                                <div className="text-sm">
                                                    <p className="text-blue-300 font-medium mb-1">Full Range Position</p>
                                                    <p className="text-gray-300 text-xs">
                                                        Your liquidity will be active across all possible prices.
                                                        This behaves similar to a traditional AMM but with lower fees.
                                                    </p>
                                                    <div className="mt-2 text-xs text-gray-400">
                                                        <div>Tick Range: {tickLower} to {tickUpper}</div>
                                                        <div>Fee Tier: {pool.fee_tier}%</div>
                                                        <div>Tick Spacing: {getTickSpacing(pool.fee_tier)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Deposit Amounts */}
                        <div className="space-y-6">
                            {/* Token Amounts */}
                            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm h-full">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center">
                                        <DollarSign className="w-5 h-5 mr-2 text-yellow-400" />
                                        Deposit Amounts
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                {pool?.token0.symbol} Amount
                                            </label>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    placeholder="0.0"
                                                    value={token0Amount}
                                                    onChange={(e) => {
                                                        setToken0Amount(e.target.value)
                                                        setToken1Amount("")
                                                        if (e.target.value) {
                                                            calculateConcentratedLiquidityAmounts(e.target.value, true)
                                                        }
                                                    }}
                                                    className="bg-gray-800/50 border-gray-700 text-white pr-20 h-12 text-lg"
                                                />
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={setMaxToken0}
                                                        className="text-xs text-blue-400 hover:text-blue-300 p-1 h-auto"
                                                    >
                                                        MAX
                                                    </Button>
                                                    <span className="text-white font-medium">{pool.token0.symbol}</span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                Balance: {parseFloat(token0Balance || "0").toFixed(6)} {pool.token0.symbol}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                {pool.token1.symbol} Amount
                                            </label>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    placeholder="0.0"
                                                    value={token1Amount}
                                                    onChange={(e) => {
                                                        setToken1Amount(e.target.value)
                                                        setToken0Amount("")
                                                        if (e.target.value) {
                                                            calculateConcentratedLiquidityAmounts(e.target.value, false)
                                                        }
                                                    }}
                                                    className="bg-gray-800/50 border-gray-700 text-white pr-20 h-12 text-lg"
                                                />
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={setMaxToken1}
                                                        className="text-xs text-blue-400 hover:text-blue-300 p-1 h-auto"
                                                    >
                                                        MAX
                                                    </Button>
                                                    <span className="text-white font-medium">{pool.token1.symbol}</span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                Balance: {parseFloat(token1Balance || "0").toFixed(6)} {pool.token1.symbol}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Validation warnings */}
                                    <div className="space-y-2">
                                        {!isFullRange && priceRange[0] >= priceRange[1] && (
                                            <div className="p-2 bg-red-900/30 border border-red-700/50 rounded text-xs">
                                                <span className="text-red-400">⚠ Min price must be less than max price</span>
                                            </div>
                                        )}
                                        {!isInRange && !isFullRange && (
                                            <div className="p-2 bg-yellow-900/30 border border-yellow-700/50 rounded text-xs">
                                                <span className="text-yellow-400">
                                                    ⚠ Your position is out of range. Consider adjusting the price range or use Full Range option.
                                                </span>
                                            </div>
                                        )}
                                        {parseFloat(token0Amount || "0") > parseFloat(token0Balance || "0") && (
                                            <div className="p-2 bg-red-900/30 border border-red-700/50 rounded text-xs">
                                                <span className="text-red-400">⚠ Insufficient {pool.token0.symbol} balance</span>
                                            </div>
                                        )}
                                        {parseFloat(token1Amount || "0") > parseFloat(token1Balance || "0") && (
                                            <div className="p-2 bg-red-900/30 border border-red-700/50 rounded text-xs">
                                                <span className="text-red-400">⚠ Insufficient {pool.token1.symbol} balance</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Error Display */}
                                    {error && (
                                        <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
                                            <p className="text-red-400 text-sm">{error}</p>
                                        </div>
                                    )}

                                    {/* Success Display */}
                                    {txHash && (
                                        <div className="p-3 bg-green-900/50 border border-green-700 rounded-lg">
                                            <p className="text-green-400 text-sm">
                                                Liquidity added successfully!
                                                <a
                                                    href={`https://seitrace.com/tx/${txHash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="underline ml-1"
                                                >
                                                    View transaction
                                                </a>
                                            </p>
                                        </div>
                                    )}

                                    {/* Transaction Summary */}
                                    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 backdrop-blur-sm">
                                        <h4 className="text-white font-semibold mb-3 flex items-center">
                                            <Info className="w-4 h-4 mr-2 text-blue-400" />
                                            Position Summary
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Fee Tier:</span>
                                                <span className="text-white">{pool.fee_tier}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Position Type:</span>
                                                <span className={isFullRange ? "text-blue-400" : "text-white"}>
                                                    {isFullRange ? 'Full Range' : 'Concentrated'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Tick Spacing:</span>
                                                <span className="text-white">{getTickSpacing(pool.fee_tier)}</span>
                                            </div>
                                            {!isFullRange && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Price Range:</span>
                                                    <span className="text-white">
                                                        ${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Current Price:</span>
                                                <span className="text-white">${formatPrice(validCurrentPrice)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Est. APR:</span>
                                                <span className="text-green-400 font-semibold">{pool.apr || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Tick Range:</span>
                                                <span className="text-white">{tickLower} to {tickUpper}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">In Range:</span>
                                                <span className={isInRange ? "text-green-400" : "text-yellow-400"}>
                                                    {isInRange ? "✓ Yes" : "⚠ No"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Tick Alignment:</span>
                                                <span className={
                                                    tickLower % getTickSpacing(pool.fee_tier) === 0 &&
                                                        tickUpper % getTickSpacing(pool.fee_tier) === 0
                                                        ? "text-green-400" : "text-red-400"
                                                }>
                                                    {tickLower % getTickSpacing(pool.fee_tier) === 0 &&
                                                        tickUpper % getTickSpacing(pool.fee_tier) === 0
                                                        ? "✓ Aligned" : "✗ Not Aligned"}
                                                </span>
                                            </div>
                                            {isFullRange && (
                                                <div className="pt-2 border-t border-gray-700">
                                                    <div className="text-xs text-gray-400">
                                                        <p>• Liquidity active at all prices</p>
                                                        <p>• Lower capital efficiency</p>
                                                        <p>• Reduced impermanent loss risk</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleAddLiquidity}
                                        disabled={
                                            (!token0Amount && !token1Amount) ||
                                            isLoading ||
                                            isLoadingLiquidityManager ||
                                            (parseFloat(token0Amount || "0") > parseFloat(token0Balance || "0")) ||
                                            (parseFloat(token1Amount || "0") > parseFloat(token1Balance || "0")) ||
                                            (!isFullRange && priceRange[0] >= priceRange[1])
                                        }
                                        className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 text-white py-4 text-lg font-semibold rounded-xl shadow-2xl shadow-blue-500/25 hover:scale-105 transition-all duration-300 disabled:hover:scale-100"
                                    >
                                        {isLoadingLiquidityManager ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Adding Liquidity...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <Droplets className="w-5 h-5" />
                                                <span>Add Liquidity</span>
                                            </div>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}