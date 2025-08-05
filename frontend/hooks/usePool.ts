import { useState, useEffect } from 'react'
import { Pool } from '../types/pool'
import { poolService } from '../services/poolService'

export const usePool = (poolId: string | null) => {
    const [pool, setPool] = useState<Pool | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!poolId) {
            setLoading(false)
            return
        }

        const fetchPool = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await poolService.fetchPoolById(poolId)
                setPool(data)
            } catch (err) {
                console.error('Error fetching pool:', err)
                setError(err instanceof Error ? err.message : 'Failed to fetch pool data')
            } finally {
                setLoading(false)
            }
        }

        fetchPool()
    }, [poolId])

    return { pool, loading, error }
}