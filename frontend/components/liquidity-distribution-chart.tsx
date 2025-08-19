// components/LiquidityDistributionChart.tsx
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
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl">
                    <p className="text-white font-semibold">Price: {formatPrice(data.price)}</p>
                    <p className="text-purple-400">Liquidity: {formatLiquidity(data.liquidity)}</p>
                    {data.inRange && <p className="text-green-400 text-xs">✓ In selected range</p>}
                </div>
            )
        }
        return null
    }

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-2">Failed to load liquidity data</p>
                    <button
                        onClick={refetch}
                        className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-full">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                    Liquidity Distribution ({priceField === 'price0' ? 'Token0' : 'Token1'} Price)
                </h3>
                <div className="text-sm text-gray-400">
                    Range: ${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                        <linearGradient id="liquidityGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.3} />
                        </linearGradient>
                        <linearGradient id="selectedLiquidityGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.9} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.4} />
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

                    <YAxis
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickFormatter={formatLiquidity}
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
                        stroke="#F59E0B"
                        strokeWidth={3}
                        strokeDasharray="none"
                        label={{ value: "Current Price", position: "top", fill: "#F59E0B" }}
                    />

                    {/* Price Range Boundaries */}
                    <ReferenceLine
                        x={priceRange[0]}
                        stroke="#10B981"
                        strokeWidth={2}
                        strokeDasharray="8 4"
                        label={{ value: "Min", position: "topLeft", fill: "#10B981" }}
                    />

                    <ReferenceLine
                        x={priceRange[1]}
                        stroke="#10B981"
                        strokeWidth={2}
                        strokeDasharray="8 4"
                        label={{ value: "Max", position: "topRight", fill: "#10B981" }}
                    />

                    <Bar dataKey="liquidityFormatted" radius={[2, 2, 0, 0]} opacity={0.8}>
                        {chartData.map((entry, idx) => (
                            <Cell
                                key={`cell-${idx}`}
                                fill={entry.inRange ? "url(#selectedLiquidityGradient)" : "url(#liquidityGradient)"}
                                stroke={entry.inRange ? "#10B981" : "#06B6D4"}
                                strokeWidth={1}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-cyan-400 rounded"></div>
                    <span className="text-gray-300">Available Liquidity</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded"></div>
                    <span className="text-gray-300">Selected Range</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                    <span className="text-gray-300">Current Price</span>
                </div>
            </div>

            {/* Status indicator */}
            {liquidity?.status && (
                <div className="mt-2 text-xs text-gray-500 text-center">
                    Status: {liquidity.status}
                </div>
            )}
        </div>
    )
}

