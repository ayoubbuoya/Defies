import { PriceAdapter } from '@/adapters/apis/PriceAdapter'
import { PricePoint } from '../types/pricePoint'

class PriceHistoryService {
    private priceAdapter: PriceAdapter

    constructor() {
        this.priceAdapter = new PriceAdapter()
    }

    async fetchPricePoints(token0: string, token1: string, interval: number, limit: number): Promise<PricePoint[]> {
        return this.priceAdapter.fetchPricePoints(token0, token1, interval, limit)
    }

    async fetchCurrentPrice(token0: string, token1: string): Promise<PricePoint> {
        const pricePoints = await this.priceAdapter.fetchPricePoints(token0, token1, 1, 1)
        return pricePoints[0]
    }

}

export const priceHistoryService = new PriceHistoryService()
