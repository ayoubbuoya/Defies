import { LiquidityManagerAdapter } from '@/adapters/contracts/LiquidityManagerAdapter'
import { CollectFeesParams, LiquidityPosition, MintLiquidityParams } from '@/types/addLiquidity'
import { Pool } from '@/types/pool'
import { WalletStrategy } from '@/types/wallet'
import { ethers } from 'ethers'



export class LiquidityManagerService {
    private adapter: LiquidityManagerAdapter

    constructor(wallet: WalletStrategy) {
        this.adapter = new LiquidityManagerAdapter(wallet)
    }

    async mintLiquidity(params: MintLiquidityParams): Promise<any> {
        const { pool, amount0, amount1, tickLower, tickUpper } = params

        // First check and approve tokens if needed
        await this.ensureTokenApprovals(pool, amount0, amount1)

        // Then mint liquidity
        return await this.adapter.mintLiquidity(
            pool,
            amount0,
            amount1,
            tickLower,
            tickUpper
        )
    }

    async calculateLiquidity(
        pool: Pool,
        amount0: string,
        amount1: string,
        tickLower: number,
        tickUpper: number
    ): Promise<bigint> {
        return await this.adapter.calculateLiquidity(
            pool,
            amount0,
            amount1,
            tickLower,
            tickUpper
        )
    }

    async getPosition(
        pool: Pool,
        owner: string,
        tickLower: number,
        tickUpper: number
    ): Promise<LiquidityPosition> {
        return await this.adapter.getPosition(pool, owner, tickLower, tickUpper)
    }

    async collectFees(params: CollectFeesParams): Promise<any> {
        const { pool, tickLower, tickUpper, amount0Max, amount1Max, recipient } = params

        return await this.adapter.collectFees(
            pool,
            tickLower,
            tickUpper,
            amount0Max,
            amount1Max,
            recipient
        )
    }

    async getTokenBalance(tokenAddress: string): Promise<bigint> {
        return await this.adapter.getTokenBalance(tokenAddress)
    }

    async checkTokenAllowance(tokenAddress: string): Promise<bigint> {
        return await this.adapter.checkAllowance(tokenAddress)
    }

    async approveToken(tokenAddress: string, amount: string, decimals: number): Promise<any> {
        return await this.adapter.approveToken(tokenAddress, amount, decimals)
    }

    private async ensureTokenApprovals(pool: Pool, amount0: string, amount1: string): Promise<void> {
        // Check and approve token0 if needed
        if (amount0 && parseFloat(amount0) > 0) {
            const currentAllowance0 = await this.checkTokenAllowance(pool.token0.address)
            const requiredAmount0 = ethers.parseUnits(amount0, Number(pool.token0.decimals))

            if (currentAllowance0 < requiredAmount0) {
                console.log(`Approving ${amount0} ${pool.token0.symbol}...`)
                const tx0 = await this.approveToken(pool.token0.address, amount0, Number(pool.token0.decimals))
                await tx0.wait() // Wait for confirmation
                console.log(`${pool.token0.symbol} approval confirmed`)
            }
        }

        // Check and approve token1 if needed
        if (amount1 && parseFloat(amount1) > 0) {
            const currentAllowance1 = await this.checkTokenAllowance(pool.token1.address)
            const requiredAmount1 = ethers.parseUnits(amount1, Number(pool.token1.decimals))

            if (currentAllowance1 < requiredAmount1) {
                console.log(`Approving ${amount1} ${pool.token1.symbol}...`)
                const tx1 = await this.approveToken(pool.token1.address, amount1, Number(pool.token1.decimals))
                await tx1.wait() // Wait for confirmation
                console.log(`${pool.token1.symbol} approval confirmed`)
            }
        }
    }

    // Utility method to convert price to tick (you might want to move this to a separate utility)
    priceToTick(price: number, tickSpacing: number = 60): number {
        if (price <= 0) return -887272; // Min tick

        // Calculate raw tick
        const rawTick = Math.floor(Math.log(price) / Math.log(1.0001));

        // Align to tick spacing
        const alignedTick = Math.floor(rawTick / tickSpacing) * tickSpacing;

        // Ensure bounds
        const MIN_TICK = -887272;
        const MAX_TICK = 887272;

        return Math.max(MIN_TICK, Math.min(MAX_TICK, alignedTick));
    }


    // Utility method to convert tick to price
    tickToPrice(tick: number): number {
        return Math.pow(1.0001, tick)
    }
}