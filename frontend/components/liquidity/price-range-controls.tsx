"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings, Info } from "lucide-react"

interface PriceRangeControlsProps {
    priceRange: number[]
    isFullRange: boolean
    validCurrentPrice: number
    pool: any
    tickLower: number
    tickUpper: number
    getTickSpacing: (feeTier: number) => number
    onPriceRangeChange: (newRange: number[]) => void
    onToggleFullRange: () => void
    formatPrice: (price: number) => string
}

export function PriceRangeControls({
    priceRange,
    isFullRange,
    validCurrentPrice,
    pool,
    tickLower,
    tickUpper,
    getTickSpacing,
    onPriceRangeChange,
    onToggleFullRange,
    formatPrice
}: PriceRangeControlsProps) {
    const priceRangePresets = {
        wide: [validCurrentPrice * 0.1, validCurrentPrice * 10],
        medium: [validCurrentPrice * 0.5, validCurrentPrice * 2],
        tight10: [validCurrentPrice * 0.9, validCurrentPrice * 1.1],
        tight25: [validCurrentPrice * 0.75, validCurrentPrice * 1.25],
        tight50: [validCurrentPrice * 0.5, validCurrentPrice * 1.5],
    }

    return (
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-white flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-orange-400" />
                    Price Range Configuration
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Full Range Toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="fullRange"
                                checked={isFullRange}
                                onChange={onToggleFullRange}
                                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <label htmlFor="fullRange" className="text-white font-medium">
                                Full Range
                            </label>
                        </div>
                        <div className="text-xs text-gray-400">
                            (Entire price spectrum)
                        </div>
                    </div>
                    {isFullRange && (
                        <div className="flex items-center space-x-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            <span className="text-green-400 text-xs font-medium">Active</span>
                        </div>
                    )}
                </div>

                {!isFullRange && (
                    <>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-300">Price Range</span>
                            <div className="flex items-center space-x-4">
                                <div className="text-sm">
                                    <span className="text-gray-400">Min: </span>
                                    <span className="text-white font-semibold">${formatPrice(priceRange[0])}</span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-gray-400">Max: </span>
                                    <span className="text-white font-semibold">${formatPrice(priceRange[1])}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Min Price</label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={priceRange[0]}
                                    onChange={(e) => {
                                        const newMin = parseFloat(e.target.value) || 0
                                        if (newMin < priceRange[1]) {
                                            onPriceRangeChange([newMin, priceRange[1]])
                                        }
                                    }}
                                    className="bg-gray-800/50 border-gray-700 text-white"
                                    placeholder={formatPrice(priceRange[0])}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Max Price</label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={priceRange[1]}
                                    onChange={(e) => {
                                        const newMax = parseFloat(e.target.value) || 0
                                        if (newMax > priceRange[0]) {
                                            onPriceRangeChange([priceRange[0], newMax])
                                        }
                                    }}
                                    className="bg-gray-800/50 border-gray-700 text-white"
                                    placeholder={formatPrice(priceRange[1])}
                                />
                            </div>
                        </div>

                        {/* Quick preset buttons */}
                        <div className="flex flex-wrap gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onPriceRangeChange(priceRangePresets.wide)}
                                className="text-xs"
                            >
                                Wide (10x)
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onPriceRangeChange(priceRangePresets.tight10)}
                                className="text-xs"
                            >
                                ±10%
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onPriceRangeChange(priceRangePresets.tight25)}
                                className="text-xs"
                            >
                                ±25%
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onPriceRangeChange(priceRangePresets.tight50)}
                                className="text-xs"
                            >
                                ±50%
                            </Button>
                        </div>
                    </>
                )}

                {/* Full Range Info */}
                {isFullRange && (
                    <div className="p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                        <div className="flex items-start space-x-2">
                            <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                                <p className="text-blue-300 font-medium mb-1">Full Range Position</p>
                                <p className="text-gray-300 text-xs">
                                    Your liquidity will be active across all possible prices.
                                    This behaves similar to a traditional AMM but with lower fees.
                                </p>
                                <div className="mt-2 text-xs text-gray-400">
                                    <div>Tick Range: {tickLower} to {tickUpper}</div>
                                    <div>Fee Tier: {pool.fee_tier}%</div>
                                    <div>Tick Spacing: {getTickSpacing(pool.fee_tier)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}