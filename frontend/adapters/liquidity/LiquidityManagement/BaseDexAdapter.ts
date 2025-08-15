import { DEXConfig, PositionParams } from '@/types/dex';
import { DEX_REGISTRY, TransactionResult } from '@/config/dex';

export abstract class BaseDEXAdapter {
    protected dexKey: string;
    protected config: DEXConfig;
    protected chainId: number;

    constructor(dexKey: string, chainId: number) {
        this.dexKey = dexKey;
        this.chainId = chainId;
        this.config = DEX_REGISTRY[dexKey];

        if (!this.config) {
            throw new Error(`DEX ${dexKey} not found in registry`);
        }

        if (!this.config.contracts[chainId]) {
            throw new Error(`DEX ${dexKey} not supported on chain ${chainId}`);
        }
    }

    protected getContracts() {
        return this.config.contracts[this.chainId];
    }

    // Abstract methods that each DEX must implement
    abstract openPosition(params: PositionParams, userAddress: string): Promise<TransactionResult>;

}
