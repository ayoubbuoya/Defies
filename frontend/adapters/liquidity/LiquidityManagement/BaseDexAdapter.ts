import { DEXConfig, PositionParams } from '@/types/dex';
import { DEX_REGISTRY, TransactionResult } from '@/config/dex';
import { WalletService } from '@/services/walletService';
import { TokenService } from '@/services/tokenService';

export abstract class BaseDEXAdapter {
    protected dexKey: string;
    protected config: DEXConfig;
    protected chainId: number;
    protected walletService: WalletService;
    protected tokenService: TokenService;

    constructor(dexKey: string, chainId: number, walletService: WalletService, tokenService: TokenService) {
        this.dexKey = dexKey;
        this.chainId = chainId;
        this.config = DEX_REGISTRY[dexKey];
        this.walletService = walletService;
        this.tokenService = tokenService;

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
