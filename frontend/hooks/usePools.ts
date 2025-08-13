import { useState, useEffect } from 'react'
import { Pool } from '../types/pool'
import { poolService } from '../services/poolService'

export const usePools = () => {
    const [pools, setPools] = useState<Pool[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    const fetchPools = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await poolService.fetchPools()
            setPools(data)
            setLastUpdated(new Date())
        } catch (err) {
            console.error('Error fetching pools:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch pools data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPools()
    }, [])

    return {
        pools,
        loading,
        error,
        lastUpdated,
        refetch: fetchPools
    }
}