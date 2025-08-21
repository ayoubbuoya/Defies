"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DollarSign, Info, Droplets } from "lucide-react"

interface TokenAmountInputsProps {
    pool: any
    token0Amount: string
    token1Amount: string
    token0Balance: string
    token1Balance: string
    priceRange: number[]
    isFullRange: boolean
    isInRange: boolean
    tickLower: number
    tickUpper: number
    validCurrentPrice: number
    error: string | null
    txHash: string | null
    isLoadingLiquidityManager: boolean
    getTickSpacing: (feeTier: number) => number
    formatPrice: (price: number) => string
    onToken0AmountChange: (value: string) => void
    onToken1AmountChange: (value: string) => void
    onSetMaxToken0: () => void
    onSetMaxToken1: () => void
    onAddLiquidity: () => void
}

export function TokenAmountInputs({
    pool,
    token0Amount,
    token1Amount,
    token0Balance,
    token1Balance,
    priceRange,
    isFullRange,
    isInRange,
    tickLower,
    tickUpper,
    validCurrentPrice,
    error,
    txHash,
    isLoadingLiquidityManager,
    getTickSpacing,
    formatPrice,
    onToken0AmountChange,
    onToken1AmountChange,
    onSetMaxToken0,
    onSetMaxToken1,
    onAddLiquidity
}: TokenAmountInputsProps) {
    return (
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm h-full">
            <CardHeader>
                <CardTitle className="text-white flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-yellow-400" />
                    Deposit Amounts
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            {pool?.token0.symbol} Amount
                        </label>
                        <div className="relative">
                            <Input
                                type="number"
                                placeholder="0.0"
                                value={token0Amount}
                                onChange={(e) => onToken0AmountChange(e.target.value)}
                                className="bg-gray-800/50 border-gray-700 text-white pr-20 h-12 text-lg"
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={onSetMaxToken0}
                                    className="text-xs text-blue-400 hover:text-blue-300 p-1 h-auto"
                                >
                                    MAX
                                </Button>
                                <span className="text-white font-medium">{pool.token0.symbol}</span>
                            </div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            Balance: {parseFloat(token0Balance || "0").toFixed(6)} {pool.token0.symbol}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            {pool.token1.symbol} Amount
                        </label>
                        <div className="relative">
                            <Input
                                type="number"
                                placeholder="0.0"
                                value={token1Amount}
                                onChange={(e) => onToken1AmountChange(e.target.value)}
                                className="bg-gray-800/50 border-gray-700 text-white pr-20 h-12 text-lg"
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={onSetMaxToken1}
                                    className="text-xs text-blue-400 hover:text-blue-300 p-1 h-auto"
                                >
                                    MAX
                                </Button>
                                <span className="text-white font-medium">{pool.token1.symbol}</span>
                            </div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            Balance: {parseFloat(token1Balance || "0").toFixed(6)} {pool.token1.symbol}
                        </div>
                    </div>
                </div>

                {/* Validation warnings */}
                <div className="space-y-2">
                    {!isFullRange && priceRange[0] >= priceRange[1] && (
                        <div className="p-2 bg-red-900/30 border border-red-700/50 rounded text-xs">
                            <span className="text-red-400">⚠ Min price must be less than max price</span>
                        </div>
                    )}
                    {!isInRange && !isFullRange && (
                        <div className="p-2 bg-yellow-900/30 border border-yellow-700/50 rounded text-xs">
                            <span className="text-yellow-400">
                                ⚠ Your position is out of range. Consider adjusting the price range or use Full Range option.
                            </span>
                        </div>
                    )}
                    {parseFloat(token0Amount || "0") > parseFloat(token0Balance || "0") && (
                        <div className="p-2 bg-red-900/30 border border-red-700/50 rounded text-xs">
                            <span className="text-red-400">⚠ Insufficient {pool.token0.symbol} balance</span>
                        </div>
                    )}
                    {parseFloat(token1Amount || "0") > parseFloat(token1Balance || "0") && (
                        <div className="p-2 bg-red-900/30 border border-red-700/50 rounded text-xs">
                            <span className="text-red-400">⚠ Insufficient {pool.token1.symbol} balance</span>
                        </div>
                    )}
                </div>

                {/* Error Display */}
                {error && (
                    <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Success Display */}
                {txHash && (
                    <div className="p-3 bg-green-900/50 border border-green-700 rounded-lg">
                        <p className="text-green-400 text-sm">
                            Liquidity added successfully!
                            <a
                                href={`https://seitrace.com/tx/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline ml-1"
                            >
                                View transaction
                            </a>
                        </p>
                    </div>
                )}

                {/* Transaction Summary */}
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 backdrop-blur-sm">
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                        <Info className="w-4 h-4 mr-2 text-blue-400" />
                        Position Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Fee Tier:</span>
                            <span className="text-white">{pool.fee_tier}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Position Type:</span>
                            <span className={isFullRange ? "text-blue-400" : "text-white"}>
                                {isFullRange ? 'Full Range' : 'Concentrated'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Tick Spacing:</span>
                            <span className="text-white">{getTickSpacing(pool.fee_tier)}</span>
                        </div>
                        {!isFullRange && (
                            <div className="flex justify-between">
                                <span className="text-gray-400">Price Range:</span>
                                <span className="text-white">
                                    ${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-gray-400">Current Price:</span>
                            <span className="text-white">${formatPrice(validCurrentPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Est. APR:</span>
                            <span className="text-green-400 font-semibold">{pool.apr || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Tick Range:</span>
                            <span className="text-white">{tickLower} to {tickUpper}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">In Range:</span>
                            <span className={isInRange ? "text-green-400" : "text-yellow-400"}>
                                {isInRange ? "✓ Yes" : "⚠ No"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Tick Alignment:</span>
                            <span className={
                                tickLower % getTickSpacing(pool.fee_tier) === 0 &&
                                    tickUpper % getTickSpacing(pool.fee_tier) === 0
                                    ? "text-green-400" : "text-red-400"
                            }>
                                {tickLower % getTickSpacing(pool.fee_tier) === 0 &&
                                    tickUpper % getTickSpacing(pool.fee_tier) === 0
                                    ? "✓ Aligned" : "✗ Not Aligned"}
                            </span>
                        </div>
                        {isFullRange && (
                            <div className="pt-2 border-t border-gray-700">
                                <div className="text-xs text-gray-400">
                                    <p>• Liquidity active at all prices</p>
                                    <p>• Lower capital efficiency</p>
                                    <p>• Reduced impermanent loss risk</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <Button
                    onClick={onAddLiquidity}
                    disabled={
                        (!token0Amount && !token1Amount) ||
                        isLoadingLiquidityManager ||
                        (parseFloat(token0Amount || "0") > parseFloat(token0Balance || "0")) ||
                        (parseFloat(token1Amount || "0") > parseFloat(token1Balance || "0")) ||
                        (!isFullRange && priceRange[0] >= priceRange[1])
                    }
                    className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 text-white py-4 text-lg font-semibold rounded-xl shadow-2xl shadow-blue-500/25 hover:scale-105 transition-all duration-300 disabled:hover:scale-100"
                >
                    {isLoadingLiquidityManager ? (
                        <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Adding Liquidity...</span>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <Droplets className="w-5 h-5" />
                            <span>Add Liquidity</span>
                        </div>
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}