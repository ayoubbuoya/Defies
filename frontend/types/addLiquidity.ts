import { Pool } from "./pool"

export interface LiquidityPosition {
    liquidity: bigint
    feeGrowthInside0LastX128: bigint
    feeGrowthInside1LastX128: bigint
    tokensOwed0: bigint
    tokensOwed1: bigint
}

export interface MintLiquidityParams {
    pool: Pool
    amount0: string
    amount1: string
    tickLower: number
    tickUpper: number
}

export interface CollectFeesParams {
    pool: Pool
    tickLower: number
    tickUpper: number
    amount0Max?: bigint
    amount1Max?: bigint
    recipient?: string
}