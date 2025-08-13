export interface LiquidityData {
    tick: string
    price: number
    liquidity: string
}

// Backend response interfaces
export interface BackendLiquidityItem {
    tick_idx: string
    liquidity_net: string
    price0: string
    price1: string
}

export interface BackendLiquidityResponse {
    status: string
    active_liquidity: any[] // Legacy field, might be empty
    data: BackendLiquidityItem[]
}

export interface LiquidityResponse {
    status: string
    active_liquidity: LiquidityData[]
}