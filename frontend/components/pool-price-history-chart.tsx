"use client"

import { useState, useEffect, useMemo } from "react"
import { ResponsiveContainer, CartesianGrid, Tooltip, ReferenceLine, Area, AreaChart, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { Clock, TrendingUp, TrendingDown, BarChart2, RefreshCw } from 'lucide-react'
import { PoolPriceHistoryChartProps } from "@/types/pricePoint"
import { usePriceChart } from "@/hooks/usePriceChart"

type TimeInterval = 15 | 60 | 240 | 1440
const limits: { value: number; label: string }[] = [
    { value: 10, label: "10" },
    { value: 50, label: "50" },
    { value: 100, label: "100" },
]

interface ExtendedPoolPriceHistoryChartProps extends PoolPriceHistoryChartProps {
    compact?: boolean
}

export function PoolPriceHistoryChart({
    data,
    currentPrice = 0.001028,
    token0 = "ETH",
    token1 = "USDC",
    priceRange = [0.0008, 0.0012],
    compact = false,
}: ExtendedPoolPriceHistoryChartProps) {
    const [selectedInterval, setSelectedInterval] = useState<TimeInterval>(60)
    const [selectedLimit, setSelectedLimit] = useState<number>(20)
    const { pricePoints, loading, error, lastUpdated, refetch } = usePriceChart(token0, token1, selectedInterval, selectedLimit)

    // Use hook data if available, fallback to props data
    const chartData = useMemo(() => {
        const dataToUse = pricePoints && pricePoints.length > 0 ? pricePoints : (data || [])

        // Process backend data format
        if (dataToUse.length > 0) {
            return dataToUse.map((item: any) => ({
                timestamp: new Date(item.tick * 1000).toISOString(),
                tick: item.tick,
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close,
                volume: item.volume || 0
            }))
        }

        // Generate mock data with some variation if no real data
        const mockData = []
        const basePrice = currentPrice
        const now = new Date()

        for (let i = 23; i >= 0; i--) {
            const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
            const volatility = Math.random() * 0.02 - 0.01
            const open = basePrice * (1 + volatility)
            const close = open * (1 + (Math.random() * 0.04 - 0.02))
            const high = Math.max(open, close) * (1 + Math.random() * 0.01)
            const low = Math.min(open, close) * (1 - Math.random() * 0.01)

            mockData.push({
                timestamp: timestamp.toISOString(),
                tick: Math.floor(timestamp.getTime() / 1000),
                open,
                high,
                low,
                close,
                volume: Math.floor(Math.random() * 1000000) + 100000
            })
        }
        return mockData
    }, [pricePoints, data, currentPrice])

    const intervals: { value: TimeInterval; label: string }[] = [
        { value: 15, label: "15m" },
        { value: 60, label: "1h" },
        { value: 240, label: "4h" },
        { value: 1440, label: "1d" },
    ]

    const tokenPair = `${token0}/${token1}`

    // Calculate 24h statistics
    const stats = useMemo(() => {
        if (chartData.length < 2) return { change: 0, volume: 0, high24h: currentPrice, low24h: currentPrice }

        const firstPrice = chartData[0].close
        const lastPrice = chartData[chartData.length - 1].close
        const change = ((lastPrice - firstPrice) / firstPrice) * 100
        const volume = chartData.reduce((sum, item) => sum + item.volume, 0)
        const high24h = Math.max(...chartData.map(item => item.high))
        const low24h = Math.min(...chartData.map(item => item.low))

        return { change, volume, high24h, low24h }
    }, [chartData, currentPrice])

    const formatTime = (timestamp: string, intervalMinutes: TimeInterval) => {
        const date = new Date(timestamp)
        switch (intervalMinutes) {
            case 15:
            case 60:
                return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
            case 240:
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit" })
            case 1440:
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
            default:
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        }
    }

    const formatPrice = (price: number) => {
        if (price < 0.001) {
            return price.toExponential(3)
        }
        return price.toFixed(6)
    }

    const formatVolume = (volume: number) => {
        if (volume >= 1000000) {
            return `${(volume / 1000000).toFixed(1)}M`
        } else if (volume >= 1000) {
            return `${(volume / 1000).toFixed(1)}K`
        }
        return volume.toString()
    }

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            const isGreen = data.close >= data.open
            const change = (((data.close - data.open) / data.open) * 100).toFixed(2)

            return (
                <div className="bg-gray-800/95 border border-gray-600/50 rounded-lg p-4 shadow-xl backdrop-blur-sm">
                    <p className="text-white font-semibold text-sm mb-3 border-b border-gray-600/50 pb-2">
                        {formatTime(label, selectedInterval)}
                    </p>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center gap-6">
                            <span className="text-gray-300">Open:</span>
                            <span className="text-white font-mono">{formatPrice(data.open)}</span>
                        </div>
                        <div className="flex justify-between items-center gap-6">
                            <span className="text-gray-300">High:</span>
                            <span className="text-blue-400 font-mono">{formatPrice(data.high)}</span>
                        </div>
                        <div className="flex justify-between items-center gap-6">
                            <span className="text-gray-300">Low:</span>
                            <span className="text-purple-400 font-mono">{formatPrice(data.low)}</span>
                        </div>
                        <div className="flex justify-between items-center gap-6">
                            <span className="text-gray-300">Close:</span>
                            <span className={`font-mono font-semibold ${isGreen ? "text-blue-400" : "text-pink-400"}`}>
                                {formatPrice(data.close)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center gap-6 border-t border-gray-600/50 pt-2">
                            <span className="text-gray-300">Change:</span>
                            <span className={`font-mono font-semibold ${isGreen ? "text-blue-400" : "text-pink-400"}`}>
                                {isGreen ? "+" : ""}{change}%
                            </span>
                        </div>
                        {!compact && (
                            <div className="flex justify-between items-center gap-6">
                                <span className="text-gray-300">Volume:</span>
                                <span className="text-purple-400 font-mono">{formatVolume(data.volume)}</span>
                            </div>
                        )}
                    </div>
                </div>
            )
        }
        return null
    }

    const handleRefresh = () => {
        refetch(token0, token1, selectedInterval, selectedLimit)
    }

    if (error) {
        return (
            <div className={`w-full ${compact ? 'h-full' : 'min-h-[500px]'} bg-gray-800/80 border border-gray-700/50 backdrop-blur-sm rounded-xl p-6 flex items-center justify-center`}>
                <div className="text-center space-y-4">
                    <div className="text-pink-400 text-lg font-semibold">Error loading chart data</div>
                    <p className="text-gray-300">{error}</p>
                    <Button
                        onClick={handleRefresh}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-blue-500/25"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                    </Button>
                </div>
            </div>
        )
    }

    // Compact mode - simplified layout
    if (compact) {
        return (
            <div className="w-full h-full bg-transparent">
                {/* Compact Header */}
                <div className="px-6 py-3 border-b border-gray-700/50">
                    <div className="flex items-center justify-between">
                        {/* Title and Price */}
                        <div className="flex items-center space-x-4">
                            <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                {tokenPair}
                            </h3>
                            <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-mono">
                                ${formatPrice(currentPrice)}
                            </div>
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-semibold ${stats.change >= 0
                                    ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300"
                                    : "bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300"
                                }`}>
                                {stats.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                <span>{stats.change >= 0 ? "+" : ""}{stats.change.toFixed(2)}%</span>
                            </div>
                        </div>

                        {/* Compact Controls */}
                        <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1 bg-gray-700/50 rounded p-1">
                                {intervals.map((interval) => (
                                    <Button
                                        key={interval.value}
                                        variant={selectedInterval === interval.value ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setSelectedInterval(interval.value)}
                                        className={
                                            selectedInterval === interval.value
                                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border-0 text-xs px-2 py-1 h-auto font-mono"
                                                : "text-gray-300 hover:bg-gray-600/50 hover:text-white bg-transparent text-xs px-2 py-1 h-auto font-mono"
                                        }
                                    >
                                        {interval.label}
                                    </Button>
                                ))}
                            </div>
                            <Button
                                onClick={handleRefresh}
                                disabled={loading}
                                size="sm"
                                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 px-2 py-1 h-auto"
                            >
                                <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Chart Area */}
                <div className="relative px-6 py-4 flex-1" style={{ height: 'calc(100% - 80px)' }}>
                    {loading && (
                        <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                            <div className="flex items-center space-x-3 text-white">
                                <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                                <span>Loading...</span>
                            </div>
                        </div>
                    )}

                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                        >
                            <defs>
                                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                                    <stop offset="50%" stopColor="#8B5CF6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#EC4899" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="2 2" stroke="#4B5563" opacity={0.3} />

                            <XAxis
                                dataKey="timestamp"
                                stroke="#9CA3AF"
                                fontSize={10}
                                tickFormatter={(value) => formatTime(value, selectedInterval)}
                                axisLine={false}
                                tickLine={false}
                                interval="preserveStartEnd"
                            />

                            <YAxis
                                stroke="#9CA3AF"
                                fontSize={10}
                                tickFormatter={formatPrice}
                                domain={['dataMin - dataMin*0.001', 'dataMax + dataMax*0.001']}
                                orientation="right"
                                axisLine={false}
                                tickLine={false}
                                width={60}
                            />

                            <Tooltip content={<CustomTooltip />} />

                            <Area
                                type="monotone"
                                dataKey="close"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                fill="url(#priceGradient)"
                            />

                            <ReferenceLine
                                y={priceRange[0]}
                                stroke="#3B82F6"
                                strokeWidth={1}
                                strokeDasharray="4 4"
                                strokeOpacity={0.7}
                            />
                            <ReferenceLine
                                y={priceRange[1]}
                                stroke="#8B5CF6"
                                strokeWidth={1}
                                strokeDasharray="4 4"
                                strokeOpacity={0.7}
                            />
                            <ReferenceLine
                                y={currentPrice}
                                stroke="#EC4899"
                                strokeWidth={2}
                                strokeDasharray="6 6"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        )
    }

    // Full mode - original layout (unchanged)
    return (
        <div className="w-full bg-gray-800/80 border border-gray-700/50 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-700/50">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Title and Stats */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center space-x-3">
                            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                {tokenPair}
                            </h3>
                            <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-semibold ${stats.change >= 0
                                    ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30"
                                    : "bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border border-pink-500/30"
                                }`}>
                                {stats.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                <span>{stats.change >= 0 ? "+" : ""}{stats.change.toFixed(2)}%</span>
                            </div>
                        </div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-mono">
                            ${formatPrice(currentPrice)}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        {/* Limit Selector */}
                        <div className="flex items-center space-x-1 bg-gray-700/50 rounded-lg p-1">
                            <BarChart2 className="w-4 h-4 text-gray-300 mx-2" />
                            {limits.map((limit) => (
                                <Button
                                    key={limit.value}
                                    variant={selectedLimit === limit.value ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setSelectedLimit(limit.value)}
                                    className={
                                        selectedLimit === limit.value
                                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 border-0 shadow-lg shadow-blue-500/25 text-xs px-3 py-1 h-auto font-mono"
                                            : "text-gray-300 hover:bg-gray-600/50 hover:text-white bg-transparent text-xs px-3 py-1 h-auto font-mono"
                                    }
                                    title={`Show ${limit.label} data points`}
                                >
                                    {limit.label}
                                </Button>
                            ))}
                        </div>

                        {/* Time Interval Selector */}
                        <div className="flex items-center space-x-1 bg-gray-700/50 rounded-lg p-1">
                            <Clock className="w-4 h-4 text-gray-300 mx-2" />
                            {intervals.map((interval) => (
                                <Button
                                    key={interval.value}
                                    variant={selectedInterval === interval.value ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setSelectedInterval(interval.value)}
                                    className={
                                        selectedInterval === interval.value
                                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border-0 shadow-lg shadow-purple-500/25 text-xs px-3 py-1 h-auto font-mono"
                                            : "text-gray-300 hover:bg-gray-600/50 hover:text-white bg-transparent text-xs px-3 py-1 h-auto font-mono"
                                    }
                                >
                                    {interval.label}
                                </Button>
                            ))}
                        </div>

                        {/* Refresh Button */}
                        <Button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-blue-500/25 px-3 py-1 h-auto"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Chart Container - Ensured proper height */}
            <div className="relative p-6">
                {loading && (
                    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                        <div className="flex items-center space-x-3 text-white">
                            <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
                            <span className="text-lg">Loading chart data...</span>
                        </div>
                    </div>
                )}

                <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 20, right: 70, left: 20, bottom: 20 }}
                        >
                            <defs>
                                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                                    <stop offset="50%" stopColor="#8B5CF6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#EC4899" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="2 2" stroke="#4B5563" opacity={0.3} />

                            <XAxis
                                dataKey="timestamp"
                                stroke="#9CA3AF"
                                fontSize={11}
                                tickFormatter={(value) => formatTime(value, selectedInterval)}
                                axisLine={false}
                                tickLine={false}
                                interval="preserveStartEnd"
                            />

                            <YAxis
                                stroke="#9CA3AF"
                                fontSize={11}
                                tickFormatter={formatPrice}
                                domain={['dataMin - dataMin*0.001', 'dataMax + dataMax*0.001']}
                                orientation="right"
                                axisLine={false}
                                tickLine={false}
                                width={70}
                            />

                            <Tooltip content={<CustomTooltip />} />

                            <Area
                                type="monotone"
                                dataKey="close"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                fill="url(#priceGradient)"
                            />

                            {/* Reference Lines with home page colors */}
                            <ReferenceLine
                                y={priceRange[0]}
                                stroke="#3B82F6"
                                strokeWidth={1}
                                strokeDasharray="4 4"
                                strokeOpacity={0.7}
                            />
                            <ReferenceLine
                                y={priceRange[1]}
                                stroke="#8B5CF6"
                                strokeWidth={1}
                                strokeDasharray="4 4"
                                strokeOpacity={0.7}
                            />
                            <ReferenceLine
                                y={currentPrice}
                                stroke="#EC4899"
                                strokeWidth={2}
                                strokeDasharray="6 6"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Footer Stats */}
            <div className="px-6 py-4 border-t border-gray-700/50 bg-gray-700/30">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-6 text-sm">
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-300">24h Volume:</span>
                            <span className="text-blue-400 font-mono font-semibold">${formatVolume(stats.volume)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-300">24h High:</span>
                            <span className="text-purple-400 font-mono font-semibold">${formatPrice(stats.high24h)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-300">24h Low:</span>
                            <span className="text-pink-400 font-mono font-semibold">${formatPrice(stats.low24h)}</span>
                        </div>
                    </div>
                    {lastUpdated && (
                        <div className="flex items-center space-x-2 text-sm">
                            <span className="text-gray-300">Last Updated:</span>
                            <span className="text-white font-mono">{lastUpdated.toLocaleTimeString()}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}