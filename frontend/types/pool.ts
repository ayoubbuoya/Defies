import { Token } from "./token"

export interface Pool {
    id: string
    protocol: string
    token0: Token
    token1: Token
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
