import { DEXConfig } from "@/types/dex";


export const DEX_REGISTRY: Record<string, DEXConfig> = {
    dragonswap: {
        name: "DragonSwap",
        contracts: {
            "pacific-1": {
                positionManager: "0xa7FDcBe645d6b2B98639EbacbC347e2B575f6F70",
                quoter: "0x38F759cf0Af1D0dcAEd723a3967A3B658738eDe9",
            }
        }
    },
};


export interface TransactionResult {
    success: boolean;
    txHash?: string;
    tokenId?: string;
    error?: string;
    gasUsed?: string;
    blockNumber?: number;
}
