import { LiquidityResponse, BackendLiquidityResponse } from '../types/liquidity'
import { LiquidityDataAdapter } from '../adapters/liquidity/liquidityAdapter'
import { Pool } from '@/types/pool'

export interface LiquidityServiceOptions {
    priceField?: 'price0' | 'price1'
    minPrice?: number
    maxPrice?: number
    transformType?: 'default' | 'histogram' | 'topLiquidity'
    numBins?: number
}

class ConcentratedLiquidityService {
    private baseUrl: string

    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''
    }

    async fetchLiquidityData(
        pool: Pool,
        options: LiquidityServiceOptions = {
            priceField: 'price0',
            minPrice: 0,
            maxPrice: Infinity,
            transformType: 'default',
            numBins: 50
        }
    ): Promise<LiquidityResponse> {
        const response = await fetch(`${this.baseUrl}/data/liquidity-chart?pool_address=${pool.id}`)

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const backendData: BackendLiquidityResponse = await response.json()

        switch (options.transformType) {
            case 'histogram':
                return LiquidityDataAdapter.transformForHistogram(backendData, pool.token0.decimals, pool.token1.decimals, options.numBins ? options.numBins : 50, options.priceField ? options.priceField : 'price0')

            case 'topLiquidity':
                return LiquidityDataAdapter.transformTopLiquidity(backendData, pool.token0.decimals, pool.token1.decimals, options.numBins ? options.numBins : 50, options.priceField ? options.priceField : 'price0')

            default:
                throw new Error(`Unknown transform type: ${options.transformType}`)
        }
    }

    // Legacy method for backward compatibility
    async fetchRawLiquidityData(poolAddress: string): Promise<BackendLiquidityResponse> {
        const response = await fetch(`${this.baseUrl}/data/liquidity-chart?pool_address=${poolAddress}`)

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return response.json()
    }
}

export const concentratedLiquidityService = new ConcentratedLiquidityService()