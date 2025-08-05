export interface Pool {
    id: string
    protocol: string
    token0_symbol: string
    token1_symbol: string
    tvl: number
    daily_volume: number
    apr: number
    fee_tier: number
}

export interface TokenPair {
    token0: string
    token1: string
    symbol0: string
    symbol1: string
    logo0: string
    logo1: string
}
