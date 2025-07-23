"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { useWallet } from "@/contexts/wallet/wallet-context"
import {
    Droplets,
    Info,
    Settings,
    Wallet,
    BarChart3,
    DollarSign,
    Percent,
    TrendingUp,
    BarChart,
    Activity,
    Volume2,
    Network,
    Building2,
} from "lucide-react"
import { PoolPriceHistoryChart } from "@/components/pool-price-history-chart"
import { LiquidityDistributionChart } from "@/components/liquidity-distribution-chart"

interface TokenPair {
    token0: string
    token1: string
    symbol0: string
    symbol1: string
    logo0: string
    logo1: string
}

interface FeeTier {
    fee: number
    tvl: string
    volume24h: string
    recommended?: boolean
}

export function EnhancedLiquidityProvider() {
    const searchParams = useSearchParams()
    const { isConnected, setShowConnectionModal } = useWallet()

    // Static values - cannot be changed
    const selectedNetwork = "sei"
    const selectedDex = "sailor-v2"
    const selectedPair: TokenPair = {
        token0: "SEI",
        token1: "USDC",
        symbol0: "SEI",
        symbol1: "USDC",
        logo0: "",
        logo1: "",
    }
    const selectedFeeTier = 0.3

    const [poolId, setPoolId] = useState<string | null>(null)
    const [priceRange, setPriceRange] = useState<number[]>([0.005, 0.02])
    const [token0Amount, setToken0Amount] = useState("")
    const [token1Amount, setToken1Amount] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [activeChart, setActiveChart] = useState<"price" | "liquidity">("liquidity")

    const networks = [
        { id: "sei", name: "Sei Network", logo: "🔷" },
        { id: "ethereum", name: "Ethereum", logo: "⟠" },
        { id: "polygon", name: "Polygon", logo: "🟣" },
    ]

    const dexes = [
        { id: "sailor-v2", name: "Sailor V2", logo: "⛵" },
        { id: "uniswap-v3", name: "Uniswap V3", logo: "🦄" },
        { id: "pancakeswap-v3", name: "PancakeSwap V3", logo: "🥞" },
    ]

    const tokenPairs = [
        { token0: "SEI", token1: "USDC", symbol0: "SEI", symbol1: "USDC", logo0: "🔷", logo1: "💵" },
        { token0: "SEI", token1: "WETH", symbol0: "SEI", symbol1: "WETH", logo0: "🔷", logo1: "⟠" },
        { token0: "USDC", token1: "WETH", symbol0: "USDC", symbol1: "WETH", logo0: "💵", logo1: "⟠" },
    ]

    const feeTiers: FeeTier[] = [
        { fee: 0.01, tvl: "$2.1M", volume24h: "$450K" },
        { fee: 0.05, tvl: "$8.7M", volume24h: "$1.2M" },
        { fee: 0.3, tvl: "$15.3M", volume24h: "$3.8M", recommended: true },
        { fee: 1.0, tvl: "$5.2M", volume24h: "$890K" },
    ]

    const currentPrice = 0.01

    // Pool statistics for the selected pair and fee tier
    const poolStats = {
        tvl: "$15.3M",
        volume24h: "$3.8M",
        fees24h: "$11.4K",
        apy: "12.5%",
    }

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
        const pool = searchParams.get("pool")
        const min = searchParams.get("minPrice") || "0.005"
        const max = searchParams.get("maxPrice") || "100"
        setPoolId(pool)
        setPriceRange([Number.parseFloat(min), Number.parseFloat(max)])
    }, [searchParams])

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

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
                <div className="text-center space-y-8 max-w-2xl">
                    <div className="w-32 h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/25">
                        <Droplets className="w-16 h-16 text-white animate-pulse" />
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Enhanced Liquidity Provider
                        </h1>
                        <p className="text-xl text-gray-300 leading-relaxed">
                            Connect your wallet to start providing liquidity with advanced analytics and real-time data visualization.
                        </p>
                    </div>

                    <Button
                        onClick={() => setShowConnectionModal(true)}
                        size="lg"
                        className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-12 py-4 text-xl rounded-xl shadow-2xl shadow-blue-500/25 hover:scale-105 transition-all duration-300"
                    >
                        <Wallet className="w-6 h-6 mr-3" />
                        Connect Wallet to Continue
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950">
            <div className="max-w-7xl mx-auto p-6">
                <div className="space-y-8">
                    {/* Header with Complete Pool Information */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        {/* Left side - Title */}
                        <div className="text-center lg:text-left space-y-4">
                            <div className="flex items-center justify-center lg:justify-start space-x-3">
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Enhanced Liquidity Provider
                                </h1>
                            </div>
                            <p className="text-gray-300 text-lg">
                                Advanced liquidity provision with real-time analytics and price history
                            </p>
                        </div>

                        {/* Right side - Complete Pool Information */}
                        <div className="flex flex-col items-center lg:items-end gap-4">
                            {/* Pair Display with Network, DEX, and Fee Tier */}
                            <div className="flex items-center space-x-4 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl px-6 py-4 shadow-lg">
                                {/* Network */}
                                <div className="flex items-center space-x-2 px-3 py-1 bg-gray-800/50 rounded-lg">
                                    <Network className="w-4 h-4 text-blue-400" />
                                    <span className="text-blue-400 text-sm font-medium">Sei</span>
                                </div>

                                {/* DEX */}
                                <div className="flex items-center space-x-2 px-3 py-1 bg-gray-800/50 rounded-lg">
                                    <Building2 className="w-4 h-4 text-purple-400" />
                                    <span className="text-purple-400 text-sm font-medium">Sailor V2</span>
                                </div>

                                {/* Pair */}
                                <div className="flex items-center space-x-2">
                                    <span className="text-2xl">{selectedPair.logo0}</span>
                                    <span className="text-xl font-bold text-white">{selectedPair.symbol0}</span>
                                    <div className="text-gray-400 text-lg">/</div>
                                    <span className="text-2xl">{selectedPair.logo1}</span>
                                    <span className="text-xl font-bold text-white">{selectedPair.symbol1}</span>
                                </div>

                                {/* Fee Tier */}
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1">
                                    <Percent className="w-3 h-3 mr-1" />
                                    {selectedFeeTier}%
                                </Badge>
                            </div>

                            {/* Pool Statistics */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-3 text-center backdrop-blur-sm">
                                    <div className="flex items-center justify-center mb-1">
                                        <DollarSign className="w-4 h-4 text-blue-400 mr-1" />
                                    </div>
                                    <div className="text-lg font-bold text-white">{poolStats.tvl}</div>
                                    <div className="text-xs text-gray-400">TVL</div>
                                </div>

                                <div className="bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-3 text-center backdrop-blur-sm">
                                    <div className="flex items-center justify-center mb-1">
                                        <Volume2 className="w-4 h-4 text-purple-400 mr-1" />
                                    </div>
                                    <div className="text-lg font-bold text-white">{poolStats.volume24h}</div>
                                    <div className="text-xs text-gray-400">24h Volume</div>
                                </div>

                                <div className="bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-3 text-center backdrop-blur-sm">
                                    <div className="flex items-center justify-center mb-1">
                                        <Activity className="w-4 h-4 text-green-400 mr-1" />
                                    </div>
                                    <div className="text-lg font-bold text-white">{poolStats.fees24h}</div>
                                    <div className="text-xs text-gray-400">24h Fees</div>
                                </div>

                                <div className="bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-3 text-center backdrop-blur-sm">
                                    <div className="flex items-center justify-center mb-1">
                                        <TrendingUp className="w-4 h-4 text-pink-400 mr-1" />
                                    </div>
                                    <div className="text-lg font-bold text-green-400">{poolStats.apy}</div>
                                    <div className="text-xs text-gray-400">Est. APY</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Split Layout */}
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
                                                tokenPair={`${selectedPair.symbol0}/${selectedPair.symbol1}`}
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
                                                {selectedPair.symbol0} Amount
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
                                                    <span className="text-lg">{selectedPair.logo0}</span>
                                                    <span className="text-white font-medium">{selectedPair.symbol0}</span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">Balance: 1,234.56 {selectedPair.symbol0}</div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                {selectedPair.symbol1} Amount
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
                                                    <span className="text-lg">{selectedPair.logo1}</span>
                                                    <span className="text-white font-medium">{selectedPair.symbol1}</span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">Balance: 500.00 {selectedPair.symbol1}</div>
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
                                                <span className="text-white">{selectedFeeTier}%</span>
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
                                                <span className="text-green-400 font-semibold">12.5%</span>
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
                </div>
            </div>
        </div>
    )
}
