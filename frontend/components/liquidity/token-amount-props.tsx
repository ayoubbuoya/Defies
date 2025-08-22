"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DollarSign, Info, Droplets, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react"

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
        <Card className="bg-gray-800/80 border-gray-700/50 backdrop-blur-sm shadow-lg hover:shadow-blue-500/25 transition-all duration-300 h-full">
            <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center text-xl">
                    <DollarSign className="w-6 h-6 mr-3 text-blue-400" />
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-bold">
                        Deposit Amounts
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-8">
                    {/* Token 0 Input */}
                    <div>
                        <label className="block text-base font-semibold text-gray-300 mb-3">
                            {pool?.token0.symbol} Amount
                        </label>
                        <div className="relative">
                            <Input
                                type="number"
                                placeholder="0.0"
                                value={token0Amount}
                                onChange={(e) => onToken0AmountChange(e.target.value)}
                                className="bg-gray-700/50 border-gray-600/50 text-white pr-24 h-14 text-lg py-4 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-3">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={onSetMaxToken0}
                                    className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 px-2 py-1 h-auto font-semibold rounded transition-all duration-300"
                                >
                                    MAX
                                </Button>
                                <span className="text-white font-bold text-lg">{pool.token0.symbol}</span>
                            </div>
                        </div>
                        <div className="text-sm text-gray-400 mt-2 flex items-center justify-between">
                            <span>Balance: <span className="text-white font-semibold">{parseFloat(token0Balance || "0").toFixed(6)}</span> {pool.token0.symbol}</span>
                            {parseFloat(token0Amount || "0") > parseFloat(token0Balance || "0") && (
                                <span className="text-red-400 text-xs flex items-center">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Insufficient
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Token 1 Input */}
                    <div>
                        <label className="block text-base font-semibold text-gray-300 mb-3">
                            {pool.token1.symbol} Amount
                        </label>
                        <div className="relative">
                            <Input
                                type="number"
                                placeholder="0.0"
                                value={token1Amount}
                                onChange={(e) => onToken1AmountChange(e.target.value)}
                                className="bg-gray-700/50 border-gray-600/50 text-white pr-24 h-14 text-lg py-4 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-3">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={onSetMaxToken1}
                                    className="text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 px-2 py-1 h-auto font-semibold rounded transition-all duration-300"
                                >
                                    MAX
                                </Button>
                                <span className="text-white font-bold text-lg">{pool.token1.symbol}</span>
                            </div>
                        </div>
                        <div className="text-sm text-gray-400 mt-2 flex items-center justify-between">
                            <span>Balance: <span className="text-white font-semibold">{parseFloat(token1Balance || "0").toFixed(6)}</span> {pool.token1.symbol}</span>
                            {parseFloat(token1Amount || "0") > parseFloat(token1Balance || "0") && (
                                <span className="text-red-400 text-xs flex items-center">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Insufficient
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Validation warnings */}
                <div className="space-y-3">
                    {!isFullRange && priceRange[0] >= priceRange[1] && (
                        <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg backdrop-blur-sm">
                            <div className="flex items-center space-x-2">
                                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                <span className="text-red-300 text-sm font-medium">Min price must be less than max price</span>
                            </div>
                        </div>
                    )}
                    {!isInRange && !isFullRange && (
                        <div className="p-3 bg-yellow-900/30 border border-yellow-500/30 rounded-lg backdrop-blur-sm">
                            <div className="flex items-start space-x-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-yellow-300 text-sm font-medium">Position Out of Range</p>
                                    <p className="text-yellow-200 text-xs mt-1">
                                        Consider adjusting the price range or use Full Range option.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Error Display */}
                {error && (
                    <div className="p-4 bg-red-900/30 border border-red-500/30 rounded-lg backdrop-blur-sm">
                        <div className="flex items-center space-x-3">
                            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                            <div>
                                <p className="text-red-300 font-semibold text-base">Transaction Error</p>
                                <p className="text-red-200 text-sm mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Display */}
                {txHash && (
                    <div className="p-4 bg-green-900/30 border border-green-500/30 rounded-lg backdrop-blur-sm">
                        <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-green-300 font-semibold text-base">Liquidity Added Successfully!</p>
                                <a
                                    href={`https://seitrace.com/tx/${txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-200 text-sm hover:text-green-100 transition-colors duration-200 flex items-center mt-1"
                                >
                                    View transaction on explorer
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Transaction Summary */}
                <div className="p-6 bg-gray-700/50 rounded-lg border border-gray-600/50 backdrop-blur-sm">
                    <h4 className="text-white font-bold text-lg mb-4 flex items-center">
                        <Info className="w-5 h-5 mr-3 text-blue-400" />
                        <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Position Summary
                        </span>
                    </h4>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center py-1">
                            <span className="text-gray-300 font-medium">Fee Tier:</span>
                            <span className="text-white font-semibold">{pool.fee_tier}%</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                            <span className="text-gray-300 font-medium">Position Type:</span>
                            <span className={`font-semibold ${isFullRange ? "text-blue-400" : "text-purple-400"}`}>
                                {isFullRange ? 'Full Range' : 'Concentrated'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                            <span className="text-gray-300 font-medium">Tick Spacing:</span>
                            <span className="text-white font-semibold">{getTickSpacing(pool.fee_tier)}</span>
                        </div>
                        {!isFullRange && (
                            <div className="flex justify-between items-center py-1">
                                <span className="text-gray-300 font-medium">Price Range:</span>
                                <span className="text-white font-semibold font-mono">
                                    ${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between items-center py-1">
                            <span className="text-gray-300 font-medium">Current Price:</span>
                            <span className="text-blue-400 font-bold font-mono">${formatPrice(validCurrentPrice)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                            <span className="text-gray-300 font-medium">Est. APR:</span>
                            <span className="text-green-400 font-bold">{pool.apr || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                            <span className="text-gray-300 font-medium">Tick Range:</span>
                            <span className="text-white font-semibold font-mono">{tickLower} to {tickUpper}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                            <span className="text-gray-300 font-medium">In Range:</span>
                            <div className={`flex items-center space-x-1 ${isInRange ? "text-green-400" : "text-yellow-400"}`}>
                                {isInRange ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                <span className="font-semibold">{isInRange ? "Yes" : "No"}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center py-1">
                            <span className="text-gray-300 font-medium">Tick Alignment:</span>
                            <div className={`flex items-center space-x-1 ${tickLower % getTickSpacing(pool.fee_tier) === 0 &&
                                    tickUpper % getTickSpacing(pool.fee_tier) === 0
                                    ? "text-green-400" : "text-red-400"
                                }`}>
                                {tickLower % getTickSpacing(pool.fee_tier) === 0 &&
                                    tickUpper % getTickSpacing(pool.fee_tier) === 0
                                    ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                <span className="font-semibold">
                                    {tickLower % getTickSpacing(pool.fee_tier) === 0 &&
                                        tickUpper % getTickSpacing(pool.fee_tier) === 0
                                        ? "Aligned" : "Not Aligned"}
                                </span>
                            </div>
                        </div>
                        {isFullRange && (
                            <div className="pt-3 border-t border-gray-600/50">
                                <div className="text-xs text-gray-300 space-y-1">
                                    <p className="flex items-center">
                                        <span className="w-1 h-1 bg-blue-400 rounded-full mr-2"></span>
                                        Liquidity active at all prices
                                    </p>
                                    <p className="flex items-center">
                                        <span className="w-1 h-1 bg-purple-400 rounded-full mr-2"></span>
                                        Lower capital efficiency
                                    </p>
                                    <p className="flex items-center">
                                        <span className="w-1 h-1 bg-pink-400 rounded-full mr-2"></span>
                                        Reduced impermanent loss risk
                                    </p>
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
                    className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 text-white py-6 text-xl font-bold rounded-xl shadow-2xl shadow-blue-500/25 hover:scale-105 transition-all duration-300 disabled:hover:scale-100"
                >
                    {isLoadingLiquidityManager ? (
                        <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Adding Liquidity...</span>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-3">
                            <Droplets className="w-6 h-6" />
                            <span>Add Liquidity</span>
                        </div>
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}