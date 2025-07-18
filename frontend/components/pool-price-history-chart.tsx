"use client"

import { useState } from "react"
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Bar, ReferenceLine } from "recharts"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

interface CandlestickData {
    timestamp: string
    open: number
    high: number
    low: number
    close: number
    volume: number
}

interface PoolPriceHistoryChartProps {
    data?: CandlestickData[]
    currentPrice?: number
    tokenPair?: string
    priceRange?: [number, number]
}

type TimeInterval = "15m" | "1h" | "4h" | "1d"

// Mock candlestick data for different time intervals
const generateMockData = (interval: TimeInterval): CandlestickData[] => {
    const baseData = [
        {
            timestamp: "2024-01-01T00:00:00Z",
            open: 0.000985,
            high: 0.001005,
            low: 0.000975,
            close: 0.000992,
            volume: 125000,
        },
        {
            timestamp: "2024-01-01T04:00:00Z",
            open: 0.000992,
            high: 0.001015,
            low: 0.000988,
            close: 0.001005,
            volume: 180000,
        },
        {
            timestamp: "2024-01-01T08:00:00Z",
            open: 0.001005,
            high: 0.001025,
            low: 0.000995,
            close: 0.000998,
            volume: 220000,
        },
        {
            timestamp: "2024-01-01T12:00:00Z",
            open: 0.000998,
            high: 0.001018,
            low: 0.000985,
            close: 0.001012,
            volume: 195000,
        },
        {
            timestamp: "2024-01-01T16:00:00Z",
            open: 0.001012,
            high: 0.001035,
            low: 0.001008,
            close: 0.001008,
            volume: 165000,
        },
        {
            timestamp: "2024-01-01T20:00:00Z",
            open: 0.001008,
            high: 0.001022,
            low: 0.000995,
            close: 0.001015,
            volume: 140000,
        },
        {
            timestamp: "2024-01-02T00:00:00Z",
            open: 0.001015,
            high: 0.001028,
            low: 0.00101,
            close: 0.001022,
            volume: 175000,
        },
        {
            timestamp: "2024-01-02T04:00:00Z",
            open: 0.001022,
            high: 0.001045,
            low: 0.001018,
            close: 0.001018,
            volume: 210000,
        },
        {
            timestamp: "2024-01-02T08:00:00Z",
            open: 0.001018,
            high: 0.001032,
            low: 0.001015,
            close: 0.001025,
            volume: 185000,
        },
        {
            timestamp: "2024-01-02T12:00:00Z",
            open: 0.001025,
            high: 0.001038,
            low: 0.00102,
            close: 0.001031,
            volume: 230000,
        },
        {
            timestamp: "2024-01-02T16:00:00Z",
            open: 0.001031,
            high: 0.001045,
            low: 0.001025,
            close: 0.001028,
            volume: 195000,
        },
        {
            timestamp: "2024-01-02T20:00:00Z",
            open: 0.001028,
            high: 0.001035,
            low: 0.001022,
            close: 0.00103,
            volume: 160000,
        },
        {
            timestamp: "2024-01-03T00:00:00Z",
            open: 0.00103,
            high: 0.001042,
            low: 0.001025,
            close: 0.001038,
            volume: 190000,
        },
        {
            timestamp: "2024-01-03T04:00:00Z",
            open: 0.001038,
            high: 0.001055,
            low: 0.001032,
            close: 0.001048,
            volume: 220000,
        },
        {
            timestamp: "2024-01-03T08:00:00Z",
            open: 0.001048,
            high: 0.001065,
            low: 0.001045,
            close: 0.001052,
            volume: 205000,
        },
        {
            timestamp: "2024-01-03T12:00:00Z",
            open: 0.001052,
            high: 0.001068,
            low: 0.001048,
            close: 0.001062,
            volume: 240000,
        },
    ]

    // Simulate different intervals by adjusting timestamps
    switch (interval) {
        case "15m":
            return baseData.map((item, index) => ({
                ...item,
                timestamp: new Date(Date.now() - (baseData.length - index) * 15 * 60 * 1000).toISOString(),
            }))
        case "1h":
            return baseData.map((item, index) => ({
                ...item,
                timestamp: new Date(Date.now() - (baseData.length - index) * 60 * 60 * 1000).toISOString(),
            }))
        case "4h":
            return baseData.map((item, index) => ({
                ...item,
                timestamp: new Date(Date.now() - (baseData.length - index) * 4 * 60 * 60 * 1000).toISOString(),
            }))
        case "1d":
            return baseData.map((item, index) => ({
                ...item,
                timestamp: new Date(Date.now() - (baseData.length - index) * 24 * 60 * 60 * 1000).toISOString(),
            }))
        default:
            return baseData
    }
}

export function PoolPriceHistoryChart({
    data,
    currentPrice = 0.001028,
    tokenPair = "SEI/USDC",
    priceRange = [0.0008, 0.0012],
}: PoolPriceHistoryChartProps) {
    const [selectedInterval, setSelectedInterval] = useState<TimeInterval>("1h")

    const chartData = data || generateMockData(selectedInterval)

    const intervals: { value: TimeInterval; label: string }[] = [
        { value: "15m", label: "15m" },
        { value: "1h", label: "1h" },
        { value: "4h", label: "4h" },
        { value: "1d", label: "1d" },
    ]

    const formatTime = (timestamp: string, interval: TimeInterval) => {
        const date = new Date(timestamp)
        switch (interval) {
            case "15m":
            case "1h":
                return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
            case "4h":
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit" })
            case "1d":
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

    // Enhanced Candlestick Shape for Trading Platform Look
    const CandlestickShape = (props: any) => {
        const { x, y, width, height, payload } = props
        if (!payload || !payload.open || !payload.high || !payload.low || !payload.close) return null

        const { open, high, low, close } = payload
        const isGreen = close >= open
        const color = isGreen ? "#00D4AA" : "#FF6B6B"

        // Make candles much closer together (95% of available width)
        const candleWidth = Math.max(width * 0.95, 2)
        const candleX = x + (width - candleWidth) / 2
        const wickX = x + width / 2

        const openY = y + ((high - open) / (high - low)) * height
        const closeY = y + ((high - close) / (high - low)) * height

        const bodyTop = Math.min(openY, closeY)
        const bodyBottom = Math.max(openY, closeY)
        const bodyHeight = Math.max(bodyBottom - bodyTop, 1)

        return (
            <g>
                {/* High-Low Wick - thinner for cleaner look */}
                <line x1={wickX} y1={y} x2={wickX} y2={y + height} stroke={color} strokeWidth={0.8} />
                {/* Candlestick Body */}
                <rect
                    x={candleX}
                    y={bodyTop}
                    width={candleWidth}
                    height={bodyHeight}
                    fill={isGreen ? color : "#1F2937"}
                    stroke={color}
                    strokeWidth={1}
                    rx={1}
                />
            </g>
        )
    }

    // Enhanced Tooltip for Trading Platform Look
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            const isGreen = data.close >= data.open
            const change = (((data.close - data.open) / data.open) * 100).toFixed(2)

            return (
                <div className="bg-black/90 border border-gray-600 rounded-md p-3 shadow-2xl backdrop-blur-sm">
                    <p className="text-white font-medium text-sm mb-2">{formatTime(label, selectedInterval)}</p>
                    <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Open:</span>
                            <span className="text-white font-mono">{formatPrice(data.open)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">High:</span>
                            <span className="text-green-400 font-mono">{formatPrice(data.high)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Low:</span>
                            <span className="text-red-400 font-mono">{formatPrice(data.low)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Close:</span>
                            <span className={`font-mono ${isGreen ? "text-green-400" : "text-red-400"}`}>
                                {formatPrice(data.close)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Change:</span>
                            <span className={`font-mono ${isGreen ? "text-green-400" : "text-red-400"}`}>
                                {change}%
                            </span>
                        </div>
                        <div className="flex justify-between border-t border-gray-600 pt-1">
                            <span className="text-gray-400">Volume:</span>
                            <span className="text-blue-400 font-mono">{data.volume?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            )
        }
        return null
    }

    return (
        <div className="w-full h-full bg-gray-900/50 rounded-lg p-4">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white">{tokenPair}</h3>
                    <div className="flex items-center space-x-3 text-sm">
                        <span className="text-green-400 font-mono font-semibold">
                            ${formatPrice(currentPrice)}
                        </span>
                        <span className="text-gray-400">
                            24h Vol: ${chartData.reduce((sum, item) => sum + item.volume, 0).toLocaleString()}
                        </span>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div className="flex space-x-1">
                        {intervals.map((interval) => (
                            <Button
                                key={interval.value}
                                variant={selectedInterval === interval.value ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setSelectedInterval(interval.value)}
                                className="text-xs px-3 py-1 h-7 font-mono"
                            >
                                {interval.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Chart */}
            <div className="relative">
                <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart
                        data={chartData}
                        margin={{ top: 10, right: 60, left: 10, bottom: 20 }}
                        barCategoryGap={1}
                    >
                        <defs>
                            <linearGradient id="rangeGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="#10B981" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="1 1" stroke="#374151" opacity={0.3} />

                        <XAxis
                            dataKey="timestamp"
                            stroke="#6B7280"
                            fontSize={11}
                            tickFormatter={(value) => formatTime(value, selectedInterval)}
                            axisLine={false}
                            tickLine={false}
                        />

                        <YAxis
                            yAxisId="price"
                            stroke="#6B7280"
                            fontSize={11}
                            tickFormatter={formatPrice}
                            domain={([dataMin, dataMax]) => [
                                Math.min(dataMin * 0.998, priceRange[0] * 0.995),
                                Math.max(dataMax * 1.002, priceRange[1] * 1.005),
                            ]}
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            width={80}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        {/* Liquidity Range Background */}
                        <ReferenceLine
                            yAxisId="price"
                            y={priceRange[0]}
                            stroke="#10B981"
                            strokeWidth={1}
                            strokeDasharray="2 2"
                            strokeOpacity={0.6}
                        />
                        <ReferenceLine
                            yAxisId="price"
                            y={priceRange[1]}
                            stroke="#10B981"
                            strokeWidth={1}
                            strokeDasharray="2 2"
                            strokeOpacity={0.6}
                        />

                        {/* Current Price Line */}
                        <ReferenceLine
                            yAxisId="price"
                            y={currentPrice}
                            stroke="#F59E0B"
                            strokeWidth={2}
                            strokeDasharray="4 4"
                        />

                        {/* Candlesticks */}
                        <Bar
                            yAxisId="price"
                            dataKey="high"
                            shape={<CandlestickShape />}
                            fill="transparent"
                            maxBarSize={20}
                        />
                    </ComposedChart>
                </ResponsiveContainer>

                {/* Price Range Labels */}
                <div className="absolute top-4 right-4 bg-black/50 rounded p-2 text-xs">
                    <div className="text-green-400 font-mono">
                        Max: ${formatPrice(priceRange[1])}
                    </div>
                    <div className="text-yellow-400 font-mono">
                        Current: ${formatPrice(currentPrice)}
                    </div>
                    <div className="text-green-400 font-mono">
                        Min: ${formatPrice(priceRange[0])}
                    </div>
                </div>
            </div>

            {/* Footer Stats */}
            <div className="mt-3 flex items-center justify-between text-xs text-gray-400 border-t border-gray-700 pt-3">
                <div className="flex items-center space-x-4">
                    <div>
                        <span className="text-green-400">●</span> In Range: ${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}
                    </div>
                    <div>
                        Interval: <span className="text-white font-mono">{selectedInterval}</span>
                    </div>
                </div>
                <div>
                    <span className="text-yellow-400">●</span> Current: ${formatPrice(currentPrice)}
                </div>
            </div>
        </div>
    )
}