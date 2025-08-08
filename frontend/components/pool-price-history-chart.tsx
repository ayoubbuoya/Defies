"use client"

import { useState, useEffect, useMemo } from "react"
import { ResponsiveContainer, CartesianGrid, Tooltip, ReferenceLine, Area, AreaChart } from "recharts"
import { Button } from "@/components/ui/button"
import { Clock, TrendingUp, TrendingDown, BarChart2, RefreshCw } from 'lucide-react'
import { PoolPriceHistoryChartProps } from "@/types/pricePoint"
import { usePriceChart } from "@/hooks/usePriceChart"
import { XAxis, YAxis } from "recharts";

type TimeInterval = 15 | 60 | 240 | 1440
const limits: { value: number; label: string }[] = [
    { value: 10, label: "10" },
    { value: 50, label: "50" },
    { value: 100, label: "100" },
]

export function PoolPriceHistoryChart({
    data,
    currentPrice = 0.001028,
    token0 = "ETH",
    token1 = "USDC",
    priceRange = [0.0008, 0.0012],
}: PoolPriceHistoryChartProps) {
    const [selectedInterval, setSelectedInterval] = useState<TimeInterval>(60)
    const [selectedLimit, setSelectedLimit] = useState<number>(20)
    const { pricePoints, loading, error, lastUpdated, refetch } = usePriceChart(token0, token1, selectedInterval, selectedLimit)

    // Use hook data if available, fallback to props data
    const chartData = useMemo(() => {
        const dataToUse = pricePoints && pricePoints.length > 0 ? pricePoints : (data || [])

        // Process backend data format
        if (dataToUse.length > 0) {
            return dataToUse.map((item: any) => ({
                timestamp: new Date(item.tick * 1000).toISOString(), // Convert tick to timestamp
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
            const volatility = Math.random() * 0.02 - 0.01 // ±1% volatility
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
                <div className="bg-gray-900/95 border border-gray-600 rounded-lg p-3 shadow-xl backdrop-blur-sm">
                    <p className="text-white font-semibold text-sm mb-2 border-b border-gray-700 pb-1">
                        {formatTime(label, selectedInterval)}
                    </p>
                    <div className="space-y-1 text-xs">
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-gray-400">Open:</span>
                            <span className="text-white font-mono">{formatPrice(data.open)}</span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-gray-400">High:</span>
                            <span className="text-green-400 font-mono">{formatPrice(data.high)}</span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-gray-400">Low:</span>
                            <span className="text-red-400 font-mono">{formatPrice(data.low)}</span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-gray-400">Close:</span>
                            <span className={`font-mono font-semibold ${isGreen ? "text-green-400" : "text-red-400"}`}>
                                {formatPrice(data.close)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center gap-4 border-t border-gray-700 pt-1">
                            <span className="text-gray-400">Change:</span>
                            <span className={`font-mono font-semibold ${isGreen ? "text-green-400" : "text-red-400"}`}>
                                {isGreen ? "+" : ""}{change}%
                            </span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <span className="text-gray-400">Volume:</span>
                            <span className="text-blue-400 font-mono">{formatVolume(data.volume)}</span>
                        </div>
                    </div>
                </div>
            )
        }
        return null
    }

    const handleRefresh = () => {
        refetch(token0, token1, selectedInterval, 20)
    }

    if (error) {
        return (
            <div className="w-full h-full bg-gray-900/50 rounded-lg p-4 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-2">Error loading chart data</p>
                    <p className="text-gray-400 text-sm mb-4">{error}</p>
                    <Button onClick={handleRefresh} variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-full bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700/50 overflow-hidden">
            {/* Header - Compact */}
            <div className="p-4 border-b border-gray-700/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-bold text-white">{tokenPair}</h3>
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ${stats.change >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                                }`}>
                                {stats.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                <span>{stats.change >= 0 ? "+" : ""}{stats.change.toFixed(2)}%</span>
                            </div>
                        </div>
                        <div className="text-lg font-bold text-white font-mono">
                            ${formatPrice(currentPrice)}
                        </div>
                    </div>

                    {/* Limit Selector */}
                    <div className="flex items-center space-x-1 bg-gray-800/50 rounded-lg p-1">
                        <BarChart2 className="w-3 h-3 text-gray-400 mx-1" />
                        {limits.map((limit) => (
                            <Button
                                key={limit.value}
                                variant={selectedLimit === limit.value ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setSelectedLimit(limit.value)}
                                className="text-xs px-2 py-1 h-auto font-mono"
                                title={`Show ${limit.label} data points`}
                            >
                                {limit.label}
                            </Button>
                        ))}
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Time Interval Selector */}
                        <div className="flex items-center space-x-1 bg-gray-800/50 rounded-lg p-1">
                            <Clock className="w-3 h-3 text-gray-400 mx-1" />
                            {intervals.map((interval) => (
                                <Button
                                    key={interval.value}
                                    variant={selectedInterval === interval.value ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setSelectedInterval(interval.value)}
                                    className="text-xs px-2 py-1 h-auto font-mono"
                                >
                                    {interval.label}
                                </Button>
                            ))}
                        </div>

                        {/* Refresh Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={loading}
                            className="px-2 py-1 h-auto"
                        >
                            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Chart Container - Fixed sizing */}
            <div className="relative h-96 p-4">
                {loading && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                        <div className="flex items-center space-x-2 text-white">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Loading chart data...</span>
                        </div>
                    </div>
                )}

                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 60, left: 10, bottom: 20 }}
                    >
                        <defs>
                            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#00D4AA" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="2 2" stroke="#374151" opacity={0.3} />

                        <XAxis
                            dataKey="timestamp"
                            stroke="#6B7280"
                            fontSize={10}
                            tickFormatter={(value) => formatTime(value, selectedInterval)}
                            axisLine={false}
                            tickLine={false}
                            interval="preserveStartEnd"
                        />

                        <YAxis
                            stroke="#6B7280"
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
                            stroke="#00D4AA"
                            strokeWidth={2}
                            fill="url(#priceGradient)"
                        />

                        {/* Reference Lines */}
                        <ReferenceLine
                            y={priceRange[0]}
                            stroke="#10B981"
                            strokeWidth={1}
                            strokeDasharray="3 3"
                            strokeOpacity={0.6}
                        />
                        <ReferenceLine
                            y={priceRange[1]}
                            stroke="#10B981"
                            strokeWidth={1}
                            strokeDasharray="3 3"
                            strokeOpacity={0.6}
                        />
                        <ReferenceLine
                            y={currentPrice}
                            stroke="#F59E0B"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                        />
                    </AreaChart>
                </ResponsiveContainer>


            </div>

            {/* Footer Stats - Compact */}
            <div className="px-4 py-2 border-t border-gray-700/50 flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center space-x-4">
                    <span>24h Vol: <span className="text-blue-400 font-mono">${formatVolume(stats.volume)}</span></span>
                    <span>High: <span className="text-green-400 font-mono">${formatPrice(stats.high24h)}</span></span>
                    <span>Low: <span className="text-red-400 font-mono">${formatPrice(stats.low24h)}</span></span>
                </div>
                {lastUpdated && (
                    <span>Updated: <span className="text-white font-mono">{lastUpdated.toLocaleTimeString()}</span></span>
                )}
            </div>
        </div>
    )
}
