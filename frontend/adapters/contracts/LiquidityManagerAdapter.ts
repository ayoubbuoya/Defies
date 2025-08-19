import { ethers } from 'ethers'
import { Pool } from '@/types/pool'
import { WalletStrategy } from "@/types/wallet"
import { LIQUIDITY_MANAGER_ABI, ERC20_ABI, LIQUIDITY_MANAGER_ADDRESS } from '../../constants/contracts'

export class LiquidityManagerAdapter {
    private contractAddress: string
    private wallet: WalletStrategy

    constructor(wallet: WalletStrategy) {
        this.contractAddress = LIQUIDITY_MANAGER_ADDRESS
        this.wallet = wallet
    }

    async mintLiquidity(
        pool: Pool,
        amount0: string,
        amount1: string,
        tickLower: number,
        tickUpper: number,
    ) {
        const recipientAddress = await this.wallet.getAddress();

        const decimals0 = Number(pool.token0.decimals)
        const decimals1 = Number(pool.token1.decimals)

        const amount0Parsed = ethers.parseUnits(amount0, decimals0)
        const amount1Parsed = ethers.parseUnits(amount1, decimals1)

        console.log('Minting liquidity with params:', {
            poolId: pool.id,
            amount0: amount0Parsed,
            amount1: amount1Parsed,
            tickLower,
            tickUpper,
            recipient: recipientAddress
        })

        return await this.wallet.sendTransaction({
            type: "contract",
            contract: this.contractAddress,
            abi: LIQUIDITY_MANAGER_ABI,
            method: "mintLiquidity",
            args: [
                amount0Parsed,
                amount1Parsed,
                tickLower,
                tickUpper,
                pool.id,
                recipientAddress
            ]
        })
    }

    async calculateLiquidity(
        pool: Pool,
        amount0: string,
        amount1: string,
        tickLower: number,
        tickUpper: number
    ): Promise<bigint> {
        const decimals0 = Number(pool.token0.decimals)
        const decimals1 = Number(pool.token1.decimals)

        const amount0Parsed = ethers.parseUnits(amount0, decimals0)
        const amount1Parsed = ethers.parseUnits(amount1, decimals1)

        // Use signer for read operations
        const signer = this.wallet.getSigner()
        const contract = new ethers.Contract(this.contractAddress, LIQUIDITY_MANAGER_ABI, signer)

        return await contract.calculateLiquidity(
            pool.id,
            tickLower,
            tickUpper,
            amount0Parsed,
            amount1Parsed
        )
    }

    async getPosition(
        pool: Pool,
        owner: string,
        tickLower: number,
        tickUpper: number
    ) {
        const signer = this.wallet.getSigner()
        const contract = new ethers.Contract(this.contractAddress, LIQUIDITY_MANAGER_ABI, signer)

        return await contract.getPosition(
            pool.id,
            owner,
            tickLower,
            tickUpper
        )
    }

    async collectFees(
        pool: Pool,
        tickLower: number,
        tickUpper: number,
        amount0Max = ethers.MaxUint256,
        amount1Max = ethers.MaxUint256,
        recipient?: string
    ) {
        const recipientAddress = await this.wallet.getAddress()

        return await this.wallet.sendTransaction({
            type: "contract",
            contract: this.contractAddress,
            abi: LIQUIDITY_MANAGER_ABI,
            method: "collectFees",
            args: [
                pool.id,
                recipientAddress,
                tickLower,
                tickUpper,
                amount0Max,
                amount1Max
            ]
        })
    }

    async approveToken(tokenAddress: string, amount: string, decimals: number) {
        const amountParsed = ethers.parseUnits(amount, decimals)

        return await this.wallet.sendTransaction({
            type: "contract",
            contract: tokenAddress,
            abi: ERC20_ABI,
            method: "approve",
            args: [this.contractAddress, amountParsed]
        })
    }

    async checkAllowance(tokenAddress: string): Promise<bigint> {
        const userAddress = await this.wallet.getAddress()

        // Use signer for read operations
        const signer = this.wallet.getSigner()
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer)

        return await contract.allowance(userAddress, this.contractAddress)
    }

    async getTokenBalance(tokenAddress: string): Promise<bigint> {
        const userAddress = await this.wallet.getAddress()

        // Use signer for read operations  
        const signer = this.wallet.getSigner()
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer)

        return await contract.balanceOf(userAddress)
    }
}