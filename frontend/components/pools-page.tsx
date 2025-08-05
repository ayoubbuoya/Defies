"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, TrendingUp, DollarSign, Percent, Volume2, Filter, X, Loader2, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { usePools } from "@/hooks/usePools"
import { formatCurrency, formatPercentage } from "../utils/formatters"

export function PoolsPage() {

    const { pools, loading: isLoadingPool, error: poolError } = usePools()
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    // Filter states
    const [selectedProtocol, setSelectedProtocol] = useState("All Protocols")
    const [selectedFeeTier, setSelectedFeeTier] = useState("All Fees")
    const [selectedPair, setSelectedPair] = useState("All Pairs")
    const [searchQuery, setSearchQuery] = useState("")

    const router = useRouter()

    // Generate dynamic filter options from actual data
    const protocolOptions = useMemo(() => {
        const protocols = [...new Set(pools.map(pool => pool.protocol))]
        return ["All Protocols", ...protocols.sort()]
    }, [pools])

    const feeTierOptions = useMemo(() => {
        const feeTiers = [...new Set(pools.map(pool => pool.fee_tier))]
        return ["All Fees", ...feeTiers.sort((a, b) => a - b).map(tier => `${tier}%`)]
    }, [pools])

    const pairOptions = useMemo(() => {
        const pairs = [...new Set(pools.map(pool => `${pool.token0_symbol}/${pool.token1_symbol}`))]
        return ["All Pairs", ...pairs.sort()]
    }, [pools])

    // Filter pools based on current filters
    const filteredPools = useMemo(() => {
        return pools.filter((pool) => {
            const pair = `${pool.token0_symbol}/${pool.token1_symbol}`

            const matchesProtocol = selectedProtocol === "All Protocols" || pool.protocol === selectedProtocol
            const matchesFeeTier = selectedFeeTier === "All Fees" || `${pool.fee_tier}%` === selectedFeeTier
            const matchesPair = selectedPair === "All Pairs" || pair === selectedPair
            const matchesSearch =
                searchQuery === "" ||
                pair.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pool.protocol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pool.token0_symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pool.token1_symbol.toLowerCase().includes(searchQuery.toLowerCase())

            return matchesProtocol && matchesFeeTier && matchesPair && matchesSearch
        })
    }, [pools, selectedProtocol, selectedFeeTier, selectedPair, searchQuery])

    const clearFilters = () => {
        setSelectedProtocol("All Protocols")
        setSelectedFeeTier("All Fees")
        setSelectedPair("All Pairs")
        setSearchQuery("")
    }

    const hasActiveFilters =
        selectedProtocol !== "All Protocols" ||
        selectedFeeTier !== "All Fees" ||
        selectedPair !== "All Pairs" ||
        searchQuery !== ""

    // Calculate stats from filtered pools
    const totalTVL = filteredPools.reduce((sum, pool) => sum + pool.tvl, 0)
    const totalVolume24h = filteredPools.reduce((sum, pool) => sum + pool.daily_volume, 0)
    const totalFees24h = filteredPools.reduce((sum, pool) => sum + (pool.daily_volume * pool.fee_tier / 100), 0)
    const avgAPR = filteredPools.length > 0 ? filteredPools.reduce((sum, pool) => sum + pool.apr, 0) / filteredPools.length : 0

    return (
        <div className="min-h-screen bg-gray-950">
            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Liquidity Pools</h1>
                            <p className="text-gray-400">Discover and analyze concentrated liquidity pools across all DEXs</p>
                            {lastUpdated && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Last updated: {lastUpdated.toLocaleTimeString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error State */}
                {poolError && (
                    <Card className="bg-red-900/20 border-red-800 mb-8">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <div className="text-red-400">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-red-400 font-medium">Error loading pools data</p>
                                    <p className="text-red-300 text-sm">{poolError}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Loading State */}
                {isLoadingPool && pools.length === 0 && (
                    <div className="text-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
                        <p className="text-gray-400">Loading pools data...</p>
                    </div>
                )}

                {/* Stats Cards */}
                {!isLoadingPool && pools.length > 0 && (
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
                                        <p className="text-sm font-medium text-gray-400">Est. 24h Fees</p>
                                        <p className="text-2xl font-bold text-white">{formatCurrency(totalFees24h)}</p>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-purple-400" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gray-900 border-gray-800">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-400">Avg APR</p>
                                        <p className="text-2xl font-bold text-white">{formatPercentage(avgAPR)}</p>
                                    </div>
                                    <Percent className="w-8 h-8 text-cyan-400" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Filters */}
                {!isLoadingPool && pools.length > 0 && (
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
                                    placeholder="Search pools, tokens, or protocols..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                                />
                            </div>

                            {/* Filter Buttons */}
                            <div className="space-y-4">
                                {/* Protocol Filter */}
                                <div>
                                    <label className="text-sm font-medium text-gray-300 mb-2 block">Protocol</label>
                                    <div className="flex flex-wrap gap-2">
                                        {protocolOptions.map((protocol) => (
                                            <Button
                                                key={protocol}
                                                variant={selectedProtocol === protocol ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setSelectedProtocol(protocol)}
                                                className={
                                                    selectedProtocol === protocol
                                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                                        : "text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white bg-gray-800 hover:border-gray-500"
                                                }
                                            >
                                                {protocol}
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
                )}

                {/* Pools Table */}
                {!isLoadingPool && pools.length > 0 && (
                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader>
                            <CardTitle className="text-white">Pools ({filteredPools.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-gray-800">
                                            <TableHead className="text-gray-300">Protocol</TableHead>
                                            <TableHead className="text-gray-300">Pair</TableHead>
                                            <TableHead className="text-gray-300">Fee Tier</TableHead>
                                            <TableHead className="text-gray-300">TVL</TableHead>
                                            <TableHead className="text-gray-300">APR</TableHead>
                                            <TableHead className="text-gray-300">24h Volume</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPools.map((pool) => (
                                            <TableRow key={pool.id}
                                                className="border-gray-800 hover:bg-gray-800/50"
                                                onClick={() => router.push(`/liquidity?pool=${pool.id}`)}>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                                        {pool.protocol}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium text-white">
                                                    {pool.token0_symbol}/{pool.token1_symbol}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                                        {pool.fee_tier}%
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-white font-medium">{formatCurrency(pool.tvl)}</TableCell>
                                                <TableCell className="text-green-400 font-medium">{formatPercentage(pool.apr)}</TableCell>
                                                <TableCell className="text-white">{formatCurrency(pool.daily_volume)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {filteredPools.length === 0 && !isLoadingPool && (
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
                )}
            </div>
        </div>
    )
}