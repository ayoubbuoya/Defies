"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, TrendingUp, TrendingDown, DollarSign, Percent, Volume2, Filter, X } from "lucide-react"
import { TopNavigation } from "@/components/top-navigation"

interface Pool {
    id: string
    dex: string
    pair: string
    token0: string
    token1: string
    feeTier: number
    tvl: number
    apy: number
    volume24h: number
    fees24h: number
    priceChange24h: number
}

const mockPools: Pool[] = [
    {
        id: "1",
        dex: "Dragonswap",
        pair: "SEI/USDC",
        token0: "SEI",
        token1: "USDC",
        feeTier: 0.3,
        tvl: 2450000,
        apy: 12.5,
        volume24h: 890000,
        fees24h: 2670,
        priceChange24h: 5.2,
    },
    {
        id: "2",
        dex: "Astroport",
        pair: "SEI/USDT",
        token0: "SEI",
        token1: "USDT",
        feeTier: 0.25,
        tvl: 1890000,
        apy: 15.8,
        volume24h: 650000,
        fees24h: 1625,
        priceChange24h: -2.1,
    },
    {
        id: "3",
        dex: "Dragonswap",
        pair: "WETH/USDC",
        token0: "WETH",
        token1: "USDC",
        feeTier: 0.05,
        tvl: 3200000,
        apy: 8.9,
        volume24h: 1200000,
        fees24h: 600,
        priceChange24h: 1.8,
    },
    {
        id: "4",
        dex: "Astroport",
        pair: "WBTC/SEI",
        token0: "WBTC",
        token1: "SEI",
        feeTier: 0.3,
        tvl: 1560000,
        apy: 18.2,
        volume24h: 420000,
        fees24h: 1260,
        priceChange24h: 3.7,
    },
    {
        id: "5",
        dex: "Fin",
        pair: "SEI/ATOM",
        token0: "SEI",
        token1: "ATOM",
        feeTier: 0.3,
        tvl: 980000,
        apy: 22.1,
        volume24h: 280000,
        fees24h: 840,
        priceChange24h: -1.5,
    },
    {
        id: "6",
        dex: "Dragonswap",
        pair: "USDC/USDT",
        token0: "USDC",
        token1: "USDT",
        feeTier: 0.01,
        tvl: 5600000,
        apy: 3.2,
        volume24h: 2100000,
        fees24h: 210,
        priceChange24h: 0.1,
    },
    {
        id: "7",
        dex: "Astroport",
        pair: "WETH/WBTC",
        token0: "WETH",
        token1: "WBTC",
        feeTier: 0.05,
        tvl: 2800000,
        apy: 11.4,
        volume24h: 750000,
        fees24h: 375,
        priceChange24h: 2.3,
    },
    {
        id: "8",
        dex: "Fin",
        pair: "OSMO/SEI",
        token0: "OSMO",
        token1: "SEI",
        feeTier: 0.3,
        tvl: 720000,
        apy: 19.8,
        volume24h: 190000,
        fees24h: 570,
        priceChange24h: -0.8,
    },
]

const dexOptions = ["All DEXs", "Dragonswap", "Astroport", "Fin"]
const feeTierOptions = ["All Fees", "0.01%", "0.05%", "0.25%", "0.3%"]
const pairOptions = [
    "All Pairs",
    "SEI/USDC",
    "SEI/USDT",
    "WETH/USDC",
    "WBTC/SEI",
    "SEI/ATOM",
    "USDC/USDT",
    "WETH/WBTC",
    "OSMO/SEI",
]

export function PoolsPage() {
    const [selectedDex, setSelectedDex] = useState("All DEXs")
    const [selectedFeeTier, setSelectedFeeTier] = useState("All Fees")
    const [selectedPair, setSelectedPair] = useState("All Pairs")
    const [searchQuery, setSearchQuery] = useState("")

    const filteredPools = useMemo(() => {
        return mockPools.filter((pool) => {
            const matchesDex = selectedDex === "All DEXs" || pool.dex === selectedDex
            const matchesFeeTier = selectedFeeTier === "All Fees" || `${pool.feeTier}%` === selectedFeeTier
            const matchesPair = selectedPair === "All Pairs" || pool.pair === selectedPair
            const matchesSearch =
                searchQuery === "" ||
                pool.pair.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pool.dex.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pool.token0.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pool.token1.toLowerCase().includes(searchQuery.toLowerCase())

            return matchesDex && matchesFeeTier && matchesPair && matchesSearch
        })
    }, [selectedDex, selectedFeeTier, selectedPair, searchQuery])

    const formatCurrency = (value: number) => {
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(2)}M`
        } else if (value >= 1000) {
            return `$${(value / 1000).toFixed(1)}K`
        }
        return `$${value.toFixed(2)}`
    }

    const formatPercentage = (value: number) => {
        return `${value.toFixed(2)}%`
    }

    const clearFilters = () => {
        setSelectedDex("All DEXs")
        setSelectedFeeTier("All Fees")
        setSelectedPair("All Pairs")
        setSearchQuery("")
    }

    const hasActiveFilters =
        selectedDex !== "All DEXs" || selectedFeeTier !== "All Fees" || selectedPair !== "All Pairs" || searchQuery !== ""

    const totalTVL = filteredPools.reduce((sum, pool) => sum + pool.tvl, 0)
    const totalVolume24h = filteredPools.reduce((sum, pool) => sum + pool.volume24h, 0)
    const totalFees24h = filteredPools.reduce((sum, pool) => sum + pool.fees24h, 0)
    const avgAPY =
        filteredPools.length > 0 ? filteredPools.reduce((sum, pool) => sum + pool.apy, 0) / filteredPools.length : 0

    return (
        <div className="min-h-screen bg-gray-950">

            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Liquidity Pools</h1>
                    <p className="text-gray-400">Discover and analyze concentrated liquidity pools across all DEXs</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-gray-900 border-gray-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-400">Total TVL</p>
                                    <p className="text-2xl font-bold text-white">{formatCurrency(totalTVL)}</p>
                                </div>
                                <DollarSign className="w-8 h-8 text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-900 border-gray-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-400">24h Volume</p>
                                    <p className="text-2xl font-bold text-white">{formatCurrency(totalVolume24h)}</p>
                                </div>
                                <Volume2 className="w-8 h-8 text-green-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-900 border-gray-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-400">24h Fees</p>
                                    <p className="text-2xl font-bold text-white">{formatCurrency(totalFees24h)}</p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="bg-gray-900 border-gray-800 mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-white flex items-center gap-2">
                                <Filter className="w-5 h-5" />
                                Filters
                            </CardTitle>
                            {hasActiveFilters && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="text-gray-400 border-gray-700 hover:bg-gray-800 bg-transparent"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Clear All
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Search pools, tokens, or DEXs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                            />
                        </div>

                        {/* Filter Buttons */}
                        <div className="space-y-4">
                            {/* DEX Filter */}
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-2 block">DEX</label>
                                <div className="flex flex-wrap gap-2">
                                    {dexOptions.map((dex) => (
                                        <Button
                                            key={dex}
                                            variant={selectedDex === dex ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setSelectedDex(dex)}
                                            className={
                                                selectedDex === dex
                                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                                    : "text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white bg-gray-800 hover:border-gray-500"
                                            }
                                        >
                                            {dex}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Fee Tier Filter */}
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-2 block">Fee Tier</label>
                                <div className="flex flex-wrap gap-2">
                                    {feeTierOptions.map((fee) => (
                                        <Button
                                            key={fee}
                                            variant={selectedFeeTier === fee ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setSelectedFeeTier(fee)}
                                            className={
                                                selectedFeeTier === fee
                                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                                    : "text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white bg-gray-800 hover:border-gray-500"
                                            }
                                        >
                                            {fee}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Pair Filter */}
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-2 block">Trading Pair</label>
                                <div className="flex flex-wrap gap-2">
                                    {pairOptions.map((pair) => (
                                        <Button
                                            key={pair}
                                            variant={selectedPair === pair ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setSelectedPair(pair)}
                                            className={
                                                selectedPair === pair
                                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                                    : "text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white bg-gray-800 hover:border-gray-500"
                                            }
                                        >
                                            {pair}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pools Table */}
                <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-white">Pools ({filteredPools.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-gray-800">
                                        <TableHead className="text-gray-300">DEX</TableHead>
                                        <TableHead className="text-gray-300">Pair</TableHead>
                                        <TableHead className="text-gray-300">Fee Tier</TableHead>
                                        <TableHead className="text-gray-300">TVL</TableHead>
                                        <TableHead className="text-gray-300">APY</TableHead>
                                        <TableHead className="text-gray-300">24h Volume</TableHead>
                                        <TableHead className="text-gray-300">24h Fees</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPools.map((pool) => (
                                        <TableRow key={pool.id} className="border-gray-800 hover:bg-gray-800/50">
                                            <TableCell>
                                                <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                                    {pool.dex}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium text-white">{pool.pair}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                                    {pool.feeTier}%
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-white font-medium">{formatCurrency(pool.tvl)}</TableCell>
                                            <TableCell className="text-green-400 font-medium">{formatPercentage(pool.apy)}</TableCell>
                                            <TableCell className="text-white">{formatCurrency(pool.volume24h)}</TableCell>
                                            <TableCell className="text-white">{formatCurrency(pool.fees24h)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {filteredPools.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-gray-400 mb-4">No pools found matching your criteria</div>
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
                                    className="text-gray-300 border-gray-700 hover:bg-gray-800 bg-transparent"
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
