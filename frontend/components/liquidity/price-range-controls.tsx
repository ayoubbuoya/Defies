"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings, Info, AlertTriangle } from "lucide-react"
import { useState } from "react"

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
    const [priceError, setPriceError] = useState<string>("")

    // Simple validation for negative values
    const handleMinPriceChange = (value: string) => {
        const numValue = parseFloat(value)

        // Clear error first
        setPriceError("")

        // Check for negative values
        if (numValue < 0) {
            setPriceError("Price cannot be negative")
            return
        }

        // Check if min >= max
        if (numValue >= priceRange[1]) {
            setPriceError("Min price must be less than max price")
            return
        }

        // Valid input - update price range
        onPriceRangeChange([numValue, priceRange[1]])
    }

    const handleMaxPriceChange = (value: string) => {
        const numValue = parseFloat(value)

        // Clear error first
        setPriceError("")

        // Check for negative values
        if (numValue < 0) {
            setPriceError("Price cannot be negative")
            return
        }

        // Check if max <= min
        if (numValue <= priceRange[0]) {
            setPriceError("Max price must be greater than min price")
            return
        }

        // Valid input - update price range
        onPriceRangeChange([priceRange[0], numValue])
    }

    // Safe preset ranges - properly typed as tuples
    const priceRangePresets: Record<string, [number, number]> = {
        wide: [Math.max(validCurrentPrice * 0.1, 0.000001), validCurrentPrice * 10],
        medium: [Math.max(validCurrentPrice * 0.5, 0.000001), validCurrentPrice * 2],
        tight10: [Math.max(validCurrentPrice * 0.9, 0.000001), validCurrentPrice * 1.1],
        tight25: [Math.max(validCurrentPrice * 0.75, 0.000001), validCurrentPrice * 1.25],
        tight50: [Math.max(validCurrentPrice * 0.5, 0.000001), validCurrentPrice * 1.5],
    }

    const handlePresetSelect = (preset: [number, number]) => {
        setPriceError("")
        onPriceRangeChange(preset)
    }

    return (
        <Card className="bg-gray-800/80 border-gray-700/50 backdrop-blur-sm shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
            <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center text-xl">
                    <Settings className="w-6 h-6 mr-3 text-blue-400" />
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-bold">
                        Price Range Configuration
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Error Display */}
                {priceError && (
                    <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg backdrop-blur-sm">
                        <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                            <p className="text-red-300 text-sm font-medium">{priceError}</p>
                        </div>
                    </div>
                )}

                {/* Full Range Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600/50 hover:bg-gray-700/70 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                id="fullRange"
                                checked={isFullRange}
                                onChange={() => {
                                    setPriceError("")
                                    onToggleFullRange()
                                }}
                                className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                            />
                            <label htmlFor="fullRange" className="text-white font-semibold text-lg cursor-pointer">
                                Full Range
                            </label>
                        </div>
                        <div className="text-sm text-gray-300">
                            (Entire price spectrum)
                        </div>
                    </div>
                    {isFullRange && (
                        <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
                            <span className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></span>
                            <span className="text-blue-300 text-sm font-semibold">Active</span>
                        </div>
                    )}
                </div>

                {!isFullRange && (
                    <>
                        <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                            <span className="text-gray-300 text-lg font-medium">Price Range</span>
                            <div className="flex items-center space-x-6">
                                <div className="text-base">
                                    <span className="text-gray-400">Min: </span>
                                    <span className="text-blue-400 font-bold">${formatPrice(priceRange[0])}</span>
                                </div>
                                <div className="text-base">
                                    <span className="text-gray-400">Max: </span>
                                    <span className="text-purple-400 font-bold">${formatPrice(priceRange[1])}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-base font-semibold text-gray-300 mb-3">
                                    Min Price
                                </label>
                                <Input
                                    type="number"
                                    step="any"
                                    min="0"
                                    value={priceRange[0]}
                                    onChange={(e) => handleMinPriceChange(e.target.value)}
                                    className={`bg-gray-700/50 border-gray-600/50 text-white text-lg py-3 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 ${priceError && priceError.includes("negative") ? "border-red-500/50" : ""
                                        }`}
                                    placeholder="0.000001"
                                />
                            </div>
                            <div>
                                <label className="block text-base font-semibold text-gray-300 mb-3">
                                    Max Price
                                </label>
                                <Input
                                    type="number"
                                    step="any"
                                    min="0"
                                    value={priceRange[1]}
                                    onChange={(e) => handleMaxPriceChange(e.target.value)}
                                    className={`bg-gray-700/50 border-gray-600/50 text-white text-lg py-3 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 ${priceError && priceError.includes("negative") ? "border-red-500/50" : ""
                                        }`}
                                    placeholder="1.0"
                                />
                            </div>
                        </div>

                        {/* Quick preset buttons */}
                        <div className="space-y-3">
                            <div className="text-sm text-gray-400 font-medium">Quick Presets:</div>
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => handlePresetSelect(priceRangePresets.wide)}
                                    className="text-gray-300 border-gray-600/50 hover:bg-gray-700/50 hover:text-white bg-gray-700/30 hover:border-gray-500 transition-all duration-300 text-sm px-4 py-2"
                                >
                                    Wide (10x)
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => handlePresetSelect(priceRangePresets.tight10)}
                                    className="text-gray-300 border-gray-600/50 hover:bg-gray-700/50 hover:text-white bg-gray-700/30 hover:border-gray-500 transition-all duration-300 text-sm px-4 py-2"
                                >
                                    ±10%
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => handlePresetSelect(priceRangePresets.tight25)}
                                    className="text-gray-300 border-gray-600/50 hover:bg-gray-700/50 hover:text-white bg-gray-700/30 hover:border-gray-500 transition-all duration-300 text-sm px-4 py-2"
                                >
                                    ±25%
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => handlePresetSelect(priceRangePresets.tight50)}
                                    className="text-gray-300 border-gray-600/50 hover:bg-gray-700/50 hover:text-white bg-gray-700/30 hover:border-gray-500 transition-all duration-300 text-sm px-4 py-2"
                                >
                                    ±50%
                                </Button>
                            </div>
                        </div>
                    </>
                )}

                {/* Full Range Info */}
                {isFullRange && (
                    <div className="p-4 bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-pink-900/30 border border-blue-500/30 rounded-lg backdrop-blur-sm">
                        <div className="flex items-start space-x-3">
                            <Info className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-blue-300 font-semibold text-lg mb-2">Full Range Position</p>
                                <p className="text-gray-300 text-base leading-relaxed mb-3">
                                    Your liquidity will be active across all possible prices.
                                    This behaves similar to a traditional AMM but with lower fees.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                                    <div className="p-2 bg-gray-700/30 rounded border border-gray-600/30">
                                        <span className="text-gray-400">Tick Range:</span>
                                        <div className="text-white font-mono font-semibold">{tickLower} to {tickUpper}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}