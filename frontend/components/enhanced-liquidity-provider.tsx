"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { useWallet } from "@/contexts/wallet/wallet-context"
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

export function EnhancedLiquidityProvider() {
    const searchParams = useSearchParams()
    const { isConnected, setShowConnectionModal } = useWallet()

    const poolId = searchParams.get("pool")
    const { pool, loading: isLoadingPool, error: poolError } = usePool(poolId)

    const [priceRange, setPriceRange] = useState<number[]>([0.005, 0.02])
    const [token0Amount, setToken0Amount] = useState("")
    const [token1Amount, setToken1Amount] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [activeChart, setActiveChart] = useState<"price" | "liquidity">("liquidity")

    const currentPrice = 0.01

    const calculateTokenAmounts = () => {
        if (token0Amount && !token1Amount) {
            const amount = Number.parseFloat(token0Amount)
            const ratio = currentPrice
            setToken1Amount((amount * ratio).toFixed(6))
        } else if (token1Amount && !token0Amount) {
            const amount = Number.parseFloat(token1Amount)
            const ratio = currentPrice
            setToken0Amount((amount / ratio).toFixed(6))
        }
    }

    useEffect(() => {
        calculateTokenAmounts()
    }, [token0Amount, token1Amount])

    const handleAddLiquidity = async () => {
        if (!isConnected) {
            setShowConnectionModal(true)
            return
        }
        setIsLoading(true)
        await new Promise((resolve) => setTimeout(resolve, 2000))
        setIsLoading(false)
    }

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

    // Loading state
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

            {/* Loading state for pool data */}
            {isLoadingPool && (
                <div className="flex items-center justify-center py-8">
                    <div className="flex items-center space-x-2 text-white">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading pool data...</span>
                    </div>
                </div>
            )}

            {/* Main Content - Split Layout */}
            {!isLoadingPool && pool && (
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
                                            currentPrice={currentPrice}
                                            priceRange={priceRange as [number, number]}
                                        />
                                    ) : (
                                        <PoolPriceHistoryChart
                                            currentPrice={currentPrice}
                                            token0={pool.token0_symbol}
                                            token1={pool.token1_symbol}
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
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-300">Price Range</span>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-sm">
                                            <span className="text-gray-400">Min: </span>
                                            <span className="text-white font-semibold">${priceRange[0].toFixed(4)}</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-gray-400">Max: </span>
                                            <span className="text-white font-semibold">${priceRange[1].toFixed(4)}</span>
                                        </div>
                                    </div>
                                </div>

                                <Slider
                                    value={priceRange}
                                    onValueChange={setPriceRange}
                                    min={0.001}
                                    max={0.1}
                                    step={0.001}
                                    className="w-full"
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Min Price</label>
                                        <Input
                                            type="number"
                                            value={priceRange[0].toFixed(4)}
                                            onChange={(e) => setPriceRange([Number.parseFloat(e.target.value) || 0, priceRange[1]])}
                                            className="bg-gray-800/50 border-gray-700 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Max Price</label>
                                        <Input
                                            type="number"
                                            value={priceRange[1].toFixed(4)}
                                            onChange={(e) => setPriceRange([priceRange[0], Number.parseFloat(e.target.value) || 0])}
                                            className="bg-gray-800/50 border-gray-700 text-white"
                                        />
                                    </div>
                                </div>
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
                                            {pool?.token0_symbol} Amount
                                        </label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                placeholder="0.0"
                                                value={token0Amount}
                                                onChange={(e) => {
                                                    setToken0Amount(e.target.value)
                                                    setToken1Amount("")
                                                }}
                                                className="bg-gray-800/50 border-gray-700 text-white pr-16 h-12 text-lg"
                                            />
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                                                <span className="text-lg">{ }</span>
                                                <span className="text-white font-medium">{pool.token0_symbol}</span>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">Balance: 1,234.56 {pool.token0_symbol}</div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            {pool.token1_symbol} Amount
                                        </label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                placeholder="0.0"
                                                value={token1Amount}
                                                onChange={(e) => {
                                                    setToken1Amount(e.target.value)
                                                    setToken0Amount("")
                                                }}
                                                className="bg-gray-800/50 border-gray-700 text-white pr-16 h-12 text-lg"
                                            />
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                                                <span className="text-lg">{ }</span>
                                                <span className="text-white font-medium">{pool.token1_symbol}</span>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">Balance: 500.00 {pool.token1_symbol}</div>
                                    </div>
                                </div>

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
                                            <span className="text-gray-400">Price Range:</span>
                                            <span className="text-white">
                                                ${priceRange[0].toFixed(4)} - ${priceRange[1].toFixed(4)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Current Price:</span>
                                            <span className="text-white">${currentPrice.toFixed(4)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Est. APR:</span>
                                            <span className="text-green-400 font-semibold">{pool.apr}</span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleAddLiquidity}
                                    disabled={!token0Amount || !token1Amount || isLoading}
                                    className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 text-white py-4 text-lg font-semibold rounded-xl shadow-2xl shadow-blue-500/25 hover:scale-105 transition-all duration-300 disabled:hover:scale-100"
                                >
                                    {isLoading ? (
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
            )}
        </div>
    )
}