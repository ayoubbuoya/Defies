"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts"

interface LiquidityData {
    tick: string
    price: number
    liquidity: string
}

interface LiquidityResponse {
    status: string
    active_liquidity: LiquidityData[]
}

interface LiquidityDistributionChartProps {
    data?: LiquidityResponse
    currentPrice?: number
    priceRange?: [number, number]
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

export function LiquidityDistributionChart({
    data = realLiquidityData,
    currentPrice = 0.01,
    priceRange = [0.005, 0.05],
}: LiquidityDistributionChartProps) {
    // ------------------------
    //  Helper formatters first
    // ------------------------
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

    // ----------------------------------
    //  Create histogram bins (log scale)
    // ----------------------------------
    const createHistogramBins = (rows: LiquidityData[], numBins = 20) => {
        const valid = rows
            .map((r) => ({ price: r.price, liquidity: Number(r.liquidity) }))
            .filter((r) => r.price > 1e-10 && r.price < 1 && r.liquidity > 0)
            .sort((a, b) => a.price - b.price)

        if (!valid.length) return []

        const logMin = Math.log10(valid[0].price)
        const logMax = Math.log10(valid[valid.length - 1].price)
        const step = (logMax - logMin) / numBins

        return Array.from({ length: numBins }).flatMap((_, i) => {
            const start = 10 ** (logMin + i * step)
            const end = 10 ** (logMin + (i + 1) * step)
            const center = Math.sqrt(start * end)

            const liquiditySum = valid.filter((d) => d.price >= start && d.price < end).reduce((s, d) => s + d.liquidity, 0)

            return liquiditySum
                ? [
                    {
                        priceRange: `${formatPrice(start)} – ${formatPrice(end)}`,
                        price: center,
                        liquidity: liquiditySum,
                        liquidityFormatted: liquiditySum / 1e6,
                        inRange: center >= priceRange[0] && center <= priceRange[1],
                    },
                ]
                : []
        })
    }

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl">
                    <p className="text-white font-semibold">Price Range:</p>
                    <p className="text-cyan-400 text-sm">{data.priceRange}</p>
                    <p className="text-purple-400">Liquidity: {formatLiquidity(data.liquidity)}</p>
                    {data.inRange && <p className="text-green-400 text-xs">✓ In selected range</p>}
                </div>
            )
        }
        return null
    }

    const histogramData = createHistogramBins(data.active_liquidity)

    return (
        <div className="w-full h-full">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Liquidity Distribution (Histogram)</h3>
                <div className="text-sm text-gray-400">
                    Range: ${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histogramData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                        {histogramData.map((entry, idx) => (
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
        </div>
    )
}
