import { useState, useEffect } from 'react'
import { PricePoint } from '../types/pricePoint'
import { priceHistoryService } from '../services/priceHistoryService'

export const usePriceChart = (token0: string, token1: string, interval: number, limit: number) => {
    const [pricePoints, setPricePoints] = useState<PricePoint[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    const fetchPricePoints = async (token0: string, token1: string, interval: number, limit: number) => {
        try {
            setLoading(true)
            setError(null)
            const data = await priceHistoryService.fetchPricePoints(token0, token1, interval, limit)
            setPricePoints(data)
            setLastUpdated(new Date())
        } catch (err) {
            console.error('Error fetching price points:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch price points data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPricePoints(token0, token1, interval, limit)
    }, [token0, token1, interval, limit])

    return {
        pricePoints,
        loading,
        error,
        lastUpdated,
        refetch: fetchPricePoints
    }
}