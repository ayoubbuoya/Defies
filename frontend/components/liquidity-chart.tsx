"use client"

import { useMemo } from "react"
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    ReferenceArea,
    LineChart,
} from "recharts"

interface LiquidityData {
    tick: string
    price: number
    liquidity: string
}

interface LiquidityResponse {
    status: string
    active_liquidity: LiquidityData[]
}

interface PriceHistoryData {
    timestamp: string
    price: number
    volume: number
}

interface LiquidityChartProps {
    data: {
        currentPrice: number
        minPrice: number
        maxPrice: number
        liquidity: Array<{ price: number; liquidity: number }>
        priceHistory: Array<{ time: string; price: number }>
    }
    priceRange: [number, number]
    onPriceRangeChange: (range: [number, number]) => void
    chartType?: "liquidity" | "price"
}

// Your actual liquidity data
const realLiquidityData: LiquidityResponse = {
    status: "success",
    active_liquidity: [
        { tick: "-887220", price: 2.9542784186117494e-51, liquidity: "1" },
        { tick: "69060", price: 9.97901648659141e-10, liquidity: "54982543567674420" },
        { tick: "92100", price: 9.991994793082927e-9, liquidity: "134825197" },
        { tick: "138120", price: 9.958077003966317e-7, liquidity: "506" },
        { tick: "161160", price: 0.000009971028077411003, liquidity: "16" },
        { tick: "207240", price: 0.0009996980777138356, liquidity: "16061728" },
        { tick: "223320", price: 0.0049909069037356564, liquidity: "250981157" },
        { tick: "230400", price: 0.009999999999999998, liquidity: "1000000000" },
        { tick: "237480", price: 0.019999999999999997, liquidity: "500000000" },
        { tick: "244560", price: 0.039999999999999994, liquidity: "250000000" },
        { tick: "251640", price: 0.07999999999999999, liquidity: "125000000" },
        { tick: "258720", price: 0.15999999999999998, liquidity: "62500000" },
    ],
}

// Mock price history data
const mockPriceHistory: PriceHistoryData[] = [
    { timestamp: "2024-01-01T00:00:00Z", price: 0.008, volume: 125000 },
    { timestamp: "2024-01-01T04:00:00Z", price: 0.0085, volume: 180000 },
    { timestamp: "2024-01-01T08:00:00Z", price: 0.009, volume: 220000 },
    { timestamp: "2024-01-01T12:00:00Z", price: 0.0095, volume: 195000 },
    { timestamp: "2024-01-01T16:00:00Z", price: 0.01, volume: 165000 },
    { timestamp: "2024-01-01T20:00:00Z", price: 0.0105, volume: 140000 },
    { timestamp: "2024-01-02T00:00:00Z", price: 0.011, volume: 175000 },
    { timestamp: "2024-01-02T04:00:00Z", price: 0.0108, volume: 210000 },
    { timestamp: "2024-01-02T08:00:00Z", price: 0.0112, volume: 185000 },
    { timestamp: "2024-01-02T12:00:00Z", price: 0.0115, volume: 230000 },
]

export function LiquidityChart({ data, priceRange, onPriceRangeChange, chartType = "liquidity" }: LiquidityChartProps) {
    const processedLiquidityData = useMemo(() => {
        return realLiquidityData.active_liquidity
            .map((item) => ({
                tick: Number.parseInt(item.tick),
                price: item.price,
                liquidity: Number.parseFloat(item.liquidity),
                liquidityFormatted: Number.parseFloat(item.liquidity) / 1e6, // Convert to millions
                inRange: item.price >= priceRange[0] && item.price <= priceRange[1],
            }))
            .filter((item) => item.price > 1e-20 && item.price < 1) // Filter extreme values
            .sort((a, b) => a.price - b.price)
    }, [priceRange])

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
        })
    }

    const formatPrice = (price: number) => {
        if (price < 0.001) {
            return price.toExponential(2)
        }
        return price.toFixed(4)
    }

    const formatLiquidity = (liquidity: number) => {
        if (liquidity >= 1e9) {
            return `${(liquidity / 1e9).toFixed(1)}B`
        } else if (liquidity >= 1e6) {
            return `${(liquidity / 1e6).toFixed(1)}M`
        } else if (liquidity >= 1e3) {
            return `${(liquidity / 1e3).toFixed(1)}K`
        }
        return liquidity.toFixed(0)
    }

    const LiquidityTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl">
                    <p className="text-white font-semibold">Price: ${formatPrice(data.price)}</p>
                    <p className="text-cyan-400">Liquidity: {formatLiquidity(data.liquidity)}</p>
                    <p className="text-purple-400">Tick: {data.tick}</p>
                    {data.inRange && <p className="text-green-400 text-xs">✓ In selected range</p>}
                </div>
            )
        }
        return null
    }

    const PriceTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl">
                    <p className="text-white font-semibold">{formatTime(label)}</p>
                    <p className="text-cyan-400">Price: ${formatPrice(data.price)}</p>
                    <p className="text-purple-400">Volume: ${data.volume?.toLocaleString()}</p>
                </div>
            )
        }
        return null
    }

    if (chartType === "price") {
        return (
            <div className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockPriceHistory} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <defs>
                            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="timestamp" stroke="#9CA3AF" fontSize={12} tickFormatter={formatTime} />
                        <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={formatPrice} />
                        <Tooltip content={<PriceTooltip />} />

                        <ReferenceLine
                            y={data.currentPrice}
                            stroke="#F59E0B"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            label={{ value: "Current Price", position: "topRight" }}
                        />

                        <Line
                            type="monotone"
                            dataKey="price"
                            stroke="#06B6D4"
                            strokeWidth={3}
                            dot={{ fill: "#06B6D4", strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, fill: "#0891B2", stroke: "#fff", strokeWidth: 2 }}
                            fill="url(#priceGradient)"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        )
    }

    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={processedLiquidityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                        <linearGradient id="liquidityGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.2} />
                        </linearGradient>
                        <linearGradient id="selectedLiquidityGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.9} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.3} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />

                    <XAxis
                        dataKey="price"
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickFormatter={formatPrice}
                        type="number"
                        scale="log"
                        domain={["dataMin", "dataMax"]}
                    />

                    <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={formatLiquidity} />

                    <Tooltip content={<LiquidityTooltip />} />

                    {/* Selected Range Highlight */}
                    <ReferenceArea
                        x1={priceRange[0]}
                        x2={priceRange[1]}
                        fill="url(#selectedLiquidityGradient)"
                        fillOpacity={0.1}
                        stroke="#10B981"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                    />

                    {/* Current Price Line */}
                    <ReferenceLine
                        x={data.currentPrice}
                        stroke="#F59E0B"
                        strokeWidth={3}
                        strokeDasharray="none"
                        label={{ value: "Current Price", position: "top" }}
                    />

                    {/* Range Boundaries */}
                    <ReferenceLine
                        x={priceRange[0]}
                        stroke="#10B981"
                        strokeWidth={2}
                        strokeDasharray="8 4"
                        label={{ value: "Min", position: "topLeft" }}
                    />

                    <ReferenceLine
                        x={priceRange[1]}
                        stroke="#10B981"
                        strokeWidth={2}
                        strokeDasharray="8 4"
                        label={{ value: "Max", position: "topRight" }}
                    />

                    <Bar dataKey="liquidityFormatted" fill="url(#liquidityGradient)" radius={[2, 2, 0, 0]} opacity={0.8} />
                </ComposedChart>
            </ResponsiveContainer>

            {/* Interactive Range Controls */}
            <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-cyan-400 rounded"></div>
                        <span className="text-gray-300">Available Liquidity</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-400 rounded"></div>
                        <span className="text-gray-300">Your Range</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                        <span className="text-gray-300">Current Price</span>
                    </div>
                </div>

                <div className="text-gray-400">
                    Range: {(((priceRange[1] - priceRange[0]) / data.currentPrice) * 100).toFixed(1)}% around current price
                </div>
            </div>
        </div>
    )
}
