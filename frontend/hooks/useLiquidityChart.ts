import { useState, useEffect } from 'react'
import { concentratedLiquidityService, LiquidityServiceOptions } from '../services/concentratedLiquidityService'
import { LiquidityResponse } from '@/types/liquidity'
import { Pool } from '@/types/pool'

export const useLiquidityChart = (
    pool: Pool | null,
    options: LiquidityServiceOptions = {}
) => {
    const [liquidity, setLiquidity] = useState<LiquidityResponse>()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchLiquidityData = async (pool: Pool) => {
        try {
            setLoading(true)
            setError(null)
            const data = await concentratedLiquidityService.fetchLiquidityData(pool, options)
            setLiquidity(data)
        } catch (err) {
            console.error('Error fetching pool:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch pool data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!pool) {
            setLoading(false)
            return
        }

        fetchLiquidityData(pool)
    }, [pool, JSON.stringify(options)]) // Re-fetch when options change

    return {
        liquidity,
        loading,
        error,
        refetch: () => pool && fetchLiquidityData(pool)
    }
}