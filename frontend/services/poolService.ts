import { Pool } from '../types/pool'

class PoolService {
    private baseUrl: string

    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''
    }

    async fetchPools(): Promise<Pool[]> {
        const response = await fetch(`${this.baseUrl}/data/pools`)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
    }

    async fetchPoolById(poolId: string): Promise<Pool> {
        const pools = await this.fetchPools()
        const pool = pools.find(p => p.id === poolId)

        if (!pool) {
            throw new Error(`Pool with id ${poolId} not found`)
        }

        return pool
    }
}

export const poolService = new PoolService()
