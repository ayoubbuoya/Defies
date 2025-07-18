"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { useWallet } from "@/contexts/wallet/wallet-context"
import {
    Droplets,
    Info,
    Settings,
    ArrowUpDown,
    Wallet,
    BarChart3,
    DollarSign,
    Percent,
    TrendingUp,
    BarChart,
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
    const { isConnected, setShowConnectionModal } = useWallet()
    const [selectedNetwork, setSelectedNetwork] = useState("sei")
    const [selectedDex, setSelectedDex] = useState("sailor-v2")
    const [selectedPair, setSelectedPair] = useState<TokenPair>({
        token0: "SEI",
        token1: "USDC",
        symbol0: "SEI",
        symbol1: "USDC",
        logo0: "🔷",
        logo1: "💵",
    })
    const [selectedFeeTier, setSelectedFeeTier] = useState(0.3)
    const [priceRange, setPriceRange] = useState([0.005, 0.05])
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

    if (!isConnected) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6">
                <div className="text-center space-y-8 max-w-2xl">
                    <div className="w-32 h-32 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-cyan-500/25">
                        <Droplets className="w-16 h-16 text-white animate-pulse" />
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Enhanced Liquidity Provider
                        </h1>
                        <p className="text-xl text-gray-400 leading-relaxed">
                            Connect your wallet to start providing liquidity with advanced analytics and real-time data visualization.
                        </p>
                    </div>

                    <Button
                        onClick={() => setShowConnectionModal(true)}
                        size="lg"
                        className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white px-12 py-4 text-xl rounded-xl shadow-2xl shadow-cyan-500/25 hover:scale-105 transition-all duration-300"
                    >
                        <Wallet className="w-6 h-6 mr-3" />
                        Connect Wallet to Continue
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                        <Droplets className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Enhanced Liquidity Provider
                    </h1>
                </div>
                <p className="text-gray-400 text-lg">Advanced liquidity provision with real-time analytics and price history</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Configuration */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Network & DEX Selection */}
                    <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center">
                                <Settings className="w-5 h-5 mr-2 text-cyan-400" />
                                Network & Exchange
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Network</label>
                                <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-800 border-gray-700">
                                        {networks.map((network) => (
                                            <SelectItem key={network.id} value={network.id} className="text-white">
                                                <div className="flex items-center space-x-2">
                                                    <span>{network.logo}</span>
                                                    <span>{network.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">DEX</label>
                                <Select value={selectedDex} onValueChange={setSelectedDex}>
                                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-800 border-gray-700">
                                        {dexes.map((dex) => (
                                            <SelectItem key={dex.id} value={dex.id} className="text-white">
                                                <div className="flex items-center space-x-2">
                                                    <span>{dex.logo}</span>
                                                    <span>{dex.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Token Pair Selection */}
                    <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center">
                                <ArrowUpDown className="w-5 h-5 mr-2 text-purple-400" />
                                Token Pair
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select
                                value={`${selectedPair.token0}-${selectedPair.token1}`}
                                onValueChange={(value) => {
                                    const pair = tokenPairs.find((p) => `${p.token0}-${p.token1}` === value)
                                    if (pair) setSelectedPair(pair)
                                }}
                            >
                                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700">
                                    {tokenPairs.map((pair) => (
                                        <SelectItem
                                            key={`${pair.token0}-${pair.token1}`}
                                            value={`${pair.token0}-${pair.token1}`}
                                            className="text-white"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <span>{pair.logo0}</span>
                                                <span>{pair.symbol0}</span>
                                                <span className="text-gray-400">/</span>
                                                <span>{pair.logo1}</span>
                                                <span>{pair.symbol1}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* Fee Tier Selection */}
                    <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center">
                                <Percent className="w-5 h-5 mr-2 text-green-400" />
                                Fee Tier
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {feeTiers.map((tier) => (
                                <div
                                    key={tier.fee}
                                    onClick={() => setSelectedFeeTier(tier.fee)}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${selectedFeeTier === tier.fee
                                        ? "border-cyan-500 bg-cyan-500/10"
                                        : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-white font-semibold">{tier.fee}%</span>
                                            {tier.recommended && (
                                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                                    Recommended
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-gray-400">TVL</div>
                                            <div className="text-white font-medium">{tier.tvl}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400">24h Volume</div>
                                            <div className="text-white font-medium">{tier.volume24h}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Charts & Inputs */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Chart Toggle */}
                    <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm">
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
                                    <LiquidityDistributionChart currentPrice={currentPrice} priceRange={priceRange as [number, number]} />
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
                    <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm">
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
                                        className="bg-gray-800 border-gray-700 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Max Price</label>
                                    <Input
                                        type="number"
                                        value={priceRange[1].toFixed(4)}
                                        onChange={(e) => setPriceRange([priceRange[0], Number.parseFloat(e.target.value) || 0])}
                                        className="bg-gray-800 border-gray-700 text-white"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Token Amounts */}
                    <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center">
                                <DollarSign className="w-5 h-5 mr-2 text-yellow-400" />
                                Deposit Amounts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">{selectedPair.symbol0} Amount</label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            placeholder="0.0"
                                            value={token0Amount}
                                            onChange={(e) => {
                                                setToken0Amount(e.target.value)
                                                setToken1Amount("")
                                            }}
                                            className="bg-gray-800 border-gray-700 text-white pr-16"
                                        />
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                                            <span className="text-lg">{selectedPair.logo0}</span>
                                            <span className="text-white font-medium">{selectedPair.symbol0}</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">Balance: 1,234.56 {selectedPair.symbol0}</div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">{selectedPair.symbol1} Amount</label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            placeholder="0.0"
                                            value={token1Amount}
                                            onChange={(e) => {
                                                setToken1Amount(e.target.value)
                                                setToken0Amount("")
                                            }}
                                            className="bg-gray-800 border-gray-700 text-white pr-16"
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
                            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                <h4 className="text-white font-semibold mb-3 flex items-center">
                                    <Info className="w-4 h-4 mr-2 text-cyan-400" />
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
                                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 text-white py-4 text-lg font-semibold rounded-xl shadow-2xl shadow-cyan-500/25 hover:scale-105 transition-all duration-300 disabled:hover:scale-100"
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
    )
}
