import { useState, useCallback, useMemo } from 'react'
import { useWallet } from '@/contexts/wallet/WalletProvider'
import { LiquidityManagerService } from '@/services/liquidityManagerService'
import { Pool } from '@/types/pool'
import { CollectFeesParams, LiquidityPosition, MintLiquidityParams } from '@/types/addLiquidity'


interface UseLiquidityManagerReturn {
    // Service instance
    service: LiquidityManagerService | null

    // State
    isLoading: boolean
    error: string | null
    txHash: string | null

    // Actions
    mintLiquidity: (params: MintLiquidityParams) => Promise<void>
    collectFees: (params: CollectFeesParams) => Promise<void>
    calculateLiquidity: (pool: Pool, amount0: string, amount1: string, tickLower: number, tickUpper: number) => Promise<bigint | null>
    getPosition: (pool: Pool, owner: string, tickLower: number, tickUpper: number) => Promise<LiquidityPosition | null>
    getTokenBalance: (tokenAddress: string) => Promise<bigint | null>
    checkTokenAllowance: (tokenAddress: string) => Promise<bigint | null>
    approveToken: (tokenAddress: string, amount: string, decimals: number) => Promise<void>

    // Utilities
    clearError: () => void
    clearTxHash: () => void
    priceToTick: (price: number, tickSpacing: number) => number
    tickToPrice: (tick: number) => number
}

export function useLiquidityManager(): UseLiquidityManagerReturn {
    const { wallet, isConnected } = useWallet()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [txHash, setTxHash] = useState<string | null>(null)

    // Create service instance
    const service = useMemo(() => {
        if (!wallet || !isConnected) return null
        return new LiquidityManagerService(wallet)
    }, [wallet, isConnected])

    const clearError = useCallback(() => setError(null), [])
    const clearTxHash = useCallback(() => setTxHash(null), [])

    const mintLiquidity = useCallback(async (params: MintLiquidityParams) => {
        if (!service) {
            setError('Wallet not connected')
            return
        }

        setIsLoading(true)
        setError(null)
        setTxHash(null)

        try {
            const receipt = await service.mintLiquidity(params)
            setTxHash(receipt.transactionHash || receipt.hash)
        } catch (err: any) {
            console.error('Error minting liquidity:', err)
            setError(err.message || 'Failed to mint liquidity')
        } finally {
            setIsLoading(false)
        }
    }, [service])

    const collectFees = useCallback(async (params: CollectFeesParams) => {
        if (!service) {
            setError('Wallet not connected')
            return
        }

        setIsLoading(true)
        setError(null)
        setTxHash(null)

        try {
            const receipt = await service.collectFees(params)
            setTxHash(receipt.transactionHash || receipt.hash)
        } catch (err: any) {
            console.error('Error collecting fees:', err)
            setError(err.message || 'Failed to collect fees')
        } finally {
            setIsLoading(false)
        }
    }, [service])

    const calculateLiquidity = useCallback(async (
        pool: Pool,
        amount0: string,
        amount1: string,
        tickLower: number,
        tickUpper: number
    ): Promise<bigint | null> => {
        if (!service) return null

        try {
            return await service.calculateLiquidity(pool, amount0, amount1, tickLower, tickUpper)
        } catch (err: any) {
            console.error('Error calculating liquidity:', err)
            setError(err.message || 'Failed to calculate liquidity')
            return null
        }
    }, [service])

    const getPosition = useCallback(async (
        pool: Pool,
        owner: string,
        tickLower: number,
        tickUpper: number
    ): Promise<LiquidityPosition | null> => {
        if (!service) return null

        try {
            return await service.getPosition(pool, owner, tickLower, tickUpper)
        } catch (err: any) {
            console.error('Error getting position:', err)
            setError(err.message || 'Failed to get position')
            return null
        }
    }, [service])

    const getTokenBalance = useCallback(async (tokenAddress: string): Promise<bigint | null> => {
        if (!service) return null

        try {
            return await service.getTokenBalance(tokenAddress)
        } catch (err: any) {
            console.error('Error getting token balance:', err)
            setError(err.message || 'Failed to get token balance')
            return null
        }
    }, [service])

    const checkTokenAllowance = useCallback(async (tokenAddress: string): Promise<bigint | null> => {
        if (!service) return null

        try {
            return await service.checkTokenAllowance(tokenAddress)
        } catch (err: any) {
            console.error('Error checking allowance:', err)
            setError(err.message || 'Failed to check allowance')
            return null
        }
    }, [service])

    const approveToken = useCallback(async (tokenAddress: string, amount: string, decimals: number) => {
        if (!service) {
            setError('Wallet not connected')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            await service.approveToken(tokenAddress, amount, decimals)
        } catch (err: any) {
            console.error('Error approving token:', err)
            setError(err.message || 'Failed to approve token')
        } finally {
            setIsLoading(false)
        }
    }, [service])

    const priceToTick = useCallback((price: number, tickSpacing: number): number => {
        return service?.priceToTick(price, tickSpacing) || 0
    }, [service])

    const tickToPrice = useCallback((tick: number): number => {
        return service?.tickToPrice(tick) || 0
    }, [service])

    return {
        service,
        isLoading,
        error,
        txHash,
        mintLiquidity,
        collectFees,
        calculateLiquidity,
        getPosition,
        getTokenBalance,
        checkTokenAllowance,
        approveToken,
        clearError,
        clearTxHash,
        priceToTick,
        tickToPrice
    }
}