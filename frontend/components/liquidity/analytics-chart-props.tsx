"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, BarChart, TrendingUp } from "lucide-react"
import { PoolPriceHistoryChart } from "@/components/pool-price-history-chart"
import { LiquidityDistributionChart } from "@/components/liquidity-distribution-chart"

interface AnalyticsChartProps {
    activeChart: "price" | "liquidity"
    validCurrentPrice: number
    priceRange: [number, number]
    pool: any
    onChartChange: (chart: "price" | "liquidity") => void
}

export function AnalyticsChart({
    activeChart,
    validCurrentPrice,
    priceRange,
    pool,
    onChartChange
}: AnalyticsChartProps) {
    return (
        <Card className="bg-gray-800/80 border-gray-700/50 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Analytics Dashboard
                        </span>
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant={activeChart === "liquidity" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => onChartChange("liquidity")}
                            className={
                                activeChart === "liquidity"
                                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 border-0 shadow-lg shadow-blue-500/25 text-xs px-3 py-1 h-auto"
                                    : "text-gray-300 hover:bg-gray-600/50 hover:text-white bg-transparent text-xs px-3 py-1 h-auto"
                            }
                        >
                            <BarChart className="w-3 h-3 mr-1" />
                            Liquidity
                        </Button>
                        <Button
                            variant={activeChart === "price" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => onChartChange("price")}
                            className={
                                activeChart === "price"
                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border-0 shadow-lg shadow-purple-500/25 text-xs px-3 py-1 h-auto"
                                    : "text-gray-300 hover:bg-gray-600/50 hover:text-white bg-transparent text-xs px-3 py-1 h-auto"
                            }
                        >
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Price History
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {/* Fixed height container for consistent sizing */}
                <div className="h-[500px] overflow-hidden">
                    {activeChart === "liquidity" ? (
                        <div className="p-6 h-full">
                            <LiquidityDistributionChart
                                currentPrice={validCurrentPrice}
                                priceRange={priceRange}
                                pool={pool}
                            />
                        </div>
                    ) : (
                        <PoolPriceHistoryChart
                            currentPrice={validCurrentPrice}
                            token0={pool.token0.symbol}
                            token1={pool.token1.symbol}
                            priceRange={priceRange}
                            compact={true} // Add compact mode
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    )
}