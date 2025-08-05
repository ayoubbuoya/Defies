import { Badge } from "@/components/ui/badge"
import { Network, Building2, Percent } from "lucide-react"
import { Pool } from "../types/pool"
import { getTokenLogo } from "../utils/formatters"

interface PoolHeaderProps {
    pool: Pool
    className?: string
}

export const PoolHeader = ({ pool, className = "" }: PoolHeaderProps) => (
    <div className={`flex items-center space-x-4 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl px-6 py-4 shadow-lg ${className}`}>
        {/* Network */}
        <div className="flex items-center space-x-2 px-3 py-1 bg-gray-800/50 rounded-lg">
            <Network className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">Sei</span>
        </div>

        {/* DEX */}
        <div className="flex items-center space-x-2 px-3 py-1 bg-gray-800/50 rounded-lg">
            <Building2 className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 text-sm font-medium">{pool.protocol}</span>
        </div>

        {/* Pair */}
        <div className="flex items-center space-x-2">
            <span className="text-2xl">{getTokenLogo(pool.token0_symbol)}</span>
            <span className="text-xl font-bold text-white">{pool.token0_symbol}</span>
            <div className="text-gray-400 text-lg">/</div>
            <span className="text-2xl">{getTokenLogo(pool.token1_symbol)}</span>
            <span className="text-xl font-bold text-white">{pool.token1_symbol}</span>
        </div>

        {/* Fee Tier */}
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1">
            <Percent className="w-3 h-3 mr-1" />
            {pool.fee_tier}%
        </Badge>
    </div>
) 