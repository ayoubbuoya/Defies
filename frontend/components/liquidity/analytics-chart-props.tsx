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
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                        Analytics Dashboard
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant={activeChart === "liquidity" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => onChartChange("liquidity")}
                            className="text-xs"
                        >
                            <BarChart className="w-3 h-3 mr-1" />
                            Liquidity Histogram
                        </Button>
                        <Button
                            variant={activeChart === "price" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => onChartChange("price")}
                            className="text-xs"
                        >
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Price Candlesticks
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-96">
                    {activeChart === "liquidity" ? (
                        <LiquidityDistributionChart
                            currentPrice={validCurrentPrice}
                            priceRange={priceRange}
                            pool={pool}
                        />
                    ) : (
                        <PoolPriceHistoryChart
                            currentPrice={validCurrentPrice}
                            token0={pool.token0.symbol}
                            token1={pool.token1.symbol}
                            priceRange={priceRange}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    )
}