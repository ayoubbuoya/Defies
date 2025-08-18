import { PricePoint } from '../types/pricePoint'

class PriceHistoryService {
    private baseUrl: string

    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''
    }

    async fetchPricePoints(token0: string, token1: string, interval: number, limit: number): Promise<PricePoint[]> {
        const response = await fetch(`${this.baseUrl}/data/price-chart/${token0}/${token1}?interval=${interval}&limit=${limit}`)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
    }
}

export const priceHistoryService = new PriceHistoryService()
