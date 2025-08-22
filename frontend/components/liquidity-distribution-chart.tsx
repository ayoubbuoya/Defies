"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts"
import { useLiquidityChart } from '../hooks/useLiquidityChart'
import { Pool } from "@/types/pool"

interface LiquidityDistributionChartProps {
    pool: Pool | null
    currentPrice: number
    priceRange?: [number, number]
    priceField?: 'price0' | 'price1'
    numBins?: number
}

export function LiquidityDistributionChart({
    pool,
    currentPrice,
    priceRange = [0.005, 0.05],
    priceField = 'price0',
    numBins = 10
}: LiquidityDistributionChartProps) {

    // Use the hook with topLiquidity transformation options
    const { liquidity, loading, error, refetch } = useLiquidityChart(pool, {
        transformType: 'topLiquidity',
        priceField,
        numBins
    })

    // Helper formatters
    const formatPrice = (price: number) => {
        if (price < 0.001) return price.toExponential(2)
        return price.toFixed(4)
    }

    const formatLiquidity = (liquidity: number) => {
        if (liquidity >= 1e9) return `${(liquidity / 1e9).toFixed(1)}B`
        if (liquidity >= 1e6) return `${(liquidity / 1e6).toFixed(1)}M`
        if (liquidity >= 1e3) return `${(liquidity / 1e3).toFixed(1)}K`
        return liquidity.toFixed(0)
    }

    // Transform data for chart display
    const chartData = liquidity?.active_liquidity.map(item => ({
        price: item.price,
        liquidity: Number(item.liquidity),
        liquidityFormatted: Number(item.liquidity) / 1e6,
        inRange: item.price >= priceRange[0] && item.price <= priceRange[1],
        tick: item.tick
    })) || []

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
                <div className="bg-gray-800/95 border border-gray-600/50 rounded-lg p-3 shadow-xl backdrop-blur-sm">
                    <p className="text-white font-semibold">Price: {formatPrice(data.price)}</p>
                    <p className="text-purple-400">Liquidity: {formatLiquidity(data.liquidity)}</p>
                    {data.inRange && <p className="text-blue-400 text-xs">✓ In selected range</p>}
                </div>
            )
        }
        return null
    }

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="flex items-center space-x-3 text-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                    <span>Loading liquidity data...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center space-y-3">
                    <p className="text-pink-400 font-semibold">Failed to load liquidity data</p>
                    <button
                        onClick={refetch}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all duration-300"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-full flex flex-col">
            {/* Header - reduced padding */}
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Liquidity Distribution ({priceField === 'price0' ? 'Token0' : 'Token1'} Price)
                </h3>
                <div className="text-sm text-gray-400">
                    Range: ${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}
                </div>
            </div>

            {/* Chart Container - optimized height */}
            <div className="flex-1 min-h-0" style={{ height: 'calc(100% - 120px)' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 15, right: 25, left: 15, bottom: 15 }}>
                        <defs>
                            <linearGradient id="liquidityGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.3} />
                            </linearGradient>
                            <linearGradient id="selectedLiquidityGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.9} />
                                <stop offset="95%" stopColor="#EC4899" stopOpacity={0.4} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="2 2" stroke="#4B5563" opacity={0.3} />

                        <XAxis
                            dataKey="price"
                            stroke="#9CA3AF"
                            fontSize={10}
                            tickFormatter={formatPrice}
                            type="number"
                            scale="log"
                            domain={["dataMin", "dataMax"]}
                            axisLine={false}
                            tickLine={false}
                        />

                        <YAxis
                            stroke="#9CA3AF"
                            fontSize={10}
                            tickFormatter={formatLiquidity}
                            axisLine={false}
                            tickLine={false}
                            label={{
                                value: "Liquidity",
                                angle: -90,
                                position: "insideLeft",
                                style: { textAnchor: "middle", fill: "#9CA3AF" },
                            }}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        {/* Current Price Reference Line */}
                        <ReferenceLine
                            x={currentPrice}
                            stroke="#EC4899"
                            strokeWidth={2}
                            strokeDasharray="6 6"
                            label={{ value: "Current Price", position: "top", fill: "#EC4899" }}
                        />

                        {/* Price Range Boundaries */}
                        <ReferenceLine
                            x={priceRange[0]}
                            stroke="#3B82F6"
                            strokeWidth={1}
                            strokeDasharray="4 4"
                            strokeOpacity={0.7}
                            label={{ value: "Min", position: "topLeft", fill: "#3B82F6" }}
                        />

                        <ReferenceLine
                            x={priceRange[1]}
                            stroke="#8B5CF6"
                            strokeWidth={1}
                            strokeDasharray="4 4"
                            strokeOpacity={0.7}
                            label={{ value: "Max", position: "topRight", fill: "#8B5CF6" }}
                        />

                        <Bar dataKey="liquidityFormatted" radius={[2, 2, 0, 0]} opacity={0.8}>
                            {chartData.map((entry, idx) => (
                                <Cell
                                    key={`cell-${idx}`}
                                    fill={entry.inRange ? "url(#selectedLiquidityGradient)" : "url(#liquidityGradient)"}
                                    stroke={entry.inRange ? "#3B82F6" : "#8B5CF6"}
                                    strokeWidth={1}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Legend - compact */}
            <div className="mt-3 flex items-center justify-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded"></div>
                    <span className="text-gray-300">Available</span>
                </div>
                <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded"></div>
                    <span className="text-gray-300">Selected</span>
                </div>
                <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-pink-400 rounded"></div>
                    <span className="text-gray-300">Current</span>
                </div>
            </div>

            {/* Status indicator - compact */}
            {liquidity?.status && (
                <div className="mt-1 text-xs text-gray-500 text-center">
                    Status: {liquidity.status}
                </div>
            )}
        </div>
    )
}