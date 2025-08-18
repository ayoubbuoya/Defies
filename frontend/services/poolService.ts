import { PollAdapter } from '@/adapters/pool/pollAdapter'
import { Pool } from '../types/pool'

class PoolService {
    private pollAdapter: PollAdapter

    constructor() {
        this.pollAdapter = new PollAdapter()
    }

    async fetchPools(): Promise<Pool[]> {
        return this.pollAdapter.fetchPools()
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
