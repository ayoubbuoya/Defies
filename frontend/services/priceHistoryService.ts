import { PriceAdapter } from '@/adapters/price/PriceAdapter'
import { PricePoint } from '../types/pricePoint'

class PriceHistoryService {
    private priceAdapter: PriceAdapter

    constructor() {
        this.priceAdapter = new PriceAdapter()
    }

    async fetchPricePoints(token0: string, token1: string, interval: number, limit: number): Promise<PricePoint[]> {
        return this.priceAdapter.fetchPricePoints(token0, token1, interval, limit)
    }

}

export const priceHistoryService = new PriceHistoryService()
