import { useEffect, useState } from "react"
import { priceHistoryService } from '../services/priceHistoryService'

export const useCurrentPrice = (token0: string, token1: string) => {
    const [currentPrice, setCurrentPrice] = useState<number>()
    const [loading, setLoading] = useState(false) // Start with false instead of true
    const [error, setError] = useState<string | null>(null)

    const fetchCurrentPrice = async (token0: string, token1: string) => {
        // Don't fetch if either token is empty or undefined
        if (!token0 || !token1 || token0.trim() === '' || token1.trim() === '') {
            console.log('Skipping price fetch - empty tokens:', { token0, token1 })
            setLoading(false)
            setError(null)
            setCurrentPrice(undefined)
            return
        }

        try {
            setLoading(true)
            setError(null)
            console.log('Fetching price for:', token0, '/', token1)

            const price = await priceHistoryService.fetchCurrentPrice(token0, token1)
            setCurrentPrice(price.close) // Assuming 'close' is the current price
        } catch (err) {
            console.error('Error fetching current price:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch current price')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // Only fetch if both tokens are provided and non-empty
        if (token0 && token1 && token0.trim() !== '' && token1.trim() !== '') {
            fetchCurrentPrice(token0, token1)
        } else {
            // Reset state when tokens are invalid
            setLoading(false)
            setError(null)
            setCurrentPrice(undefined)
        }
    }, [token0, token1])

    return { currentPrice, loading, error, refetch: fetchCurrentPrice }
}