import { useState, useEffect } from 'react'
import { tokenService } from '@/services/tokenService'
import { Token } from '@/types/token'

export const useToken = (tokenAddress: string | null) => {
    const [token, setToken] = useState<Token | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!tokenAddress) {
            setLoading(false)
            return
        }

        const fetchToken = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await tokenService.fetchToken(tokenAddress)
                setToken(data)
            } catch (err) {
                console.error('Error fetching token:', err)
                setError(err instanceof Error ? err.message : 'Failed to fetch token data')
            } finally {
                setLoading(false)
            }
        }

        fetchToken()
    }, [tokenAddress])

    return { token, loading, error }
}