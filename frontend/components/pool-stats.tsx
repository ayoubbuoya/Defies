import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Volume2, Activity, TrendingUp } from "lucide-react"
import { Pool } from "../types/pool"
import { formatCurrency, formatPercentage } from "../utils/formatters"

interface PoolStatsProps {
    pool: Pool
    className?: string
}

export const PoolStats = ({ pool, className = "" }: PoolStatsProps) => {
    const stats = {
        tvl: formatCurrency(pool.tvl),
        volume24h: formatCurrency(pool.daily_volume),
        fees24h: formatCurrency((pool.daily_volume * pool.fee_tier) / 100),
        apy: formatPercentage(pool.apr),
    }

    return (
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
            <Card className="bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-3 text-center backdrop-blur-sm">
                <CardContent className="p-0">
                    <div className="flex items-center justify-center mb-1">
                        <DollarSign className="w-4 h-4 text-blue-400 mr-1" />
                    </div>
                    <div className="text-lg font-bold text-white">{stats.tvl}</div>
                    <div className="text-xs text-gray-400">TVL</div>
                </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-3 text-center backdrop-blur-sm">
                <CardContent className="p-0">
                    <div className="flex items-center justify-center mb-1">
                        <Volume2 className="w-4 h-4 text-purple-400 mr-1" />
                    </div>
                    <div className="text-lg font-bold text-white">{stats.volume24h}</div>
                    <div className="text-xs text-gray-400">24h Volume</div>
                </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-3 text-center backdrop-blur-sm">
                <CardContent className="p-0">
                    <div className="flex items-center justify-center mb-1">
                        <Activity className="w-4 h-4 text-green-400 mr-1" />
                    </div>
                    <div className="text-lg font-bold text-white">{stats.fees24h}</div>
                    <div className="text-xs text-gray-400">24h Fees</div>
                </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-3 text-center backdrop-blur-sm">
                <CardContent className="p-0">
                    <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="w-4 h-4 text-pink-400 mr-1" />
                    </div>
                    <div className="text-lg font-bold text-green-400">{stats.apy}</div>
                    <div className="text-xs text-gray-400">Est. APY</div>
                </CardContent>
            </Card>
        </div>
    )
}