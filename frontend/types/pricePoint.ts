export interface PricePoint {
    tick: number
    open: number
    high: number
    low: number
    close: number
    volume: number
}

export interface PoolPriceHistoryChartProps {
    data?: PricePoint[]
    currentPrice?: number
    token0?: string
    token1?: string
    priceRange?: [number, number]
}
