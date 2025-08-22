export interface DexConfig {
    name: string
    nfpmAddress: string
}

export const DEX_CONFIGS: Record<string, DexConfig> = {
    dragonswap: {
        name: "DragonSwap",
        nfpmAddress: process.env.DRAGONSWAP_NFPM_ADDRESS || '0xa7FDcBe645d6b2B98639EbacbC347e2B575f6F70',
    },

    sailor: {
        name: "Sailor",
        nfpmAddress: process.env.SAILOR_NFPM_ADDRESS || '0xe294d5Eb435807cD21017013Bef620ed1AeafbeB',
    },
}

export const getDexConfig = (dexName: string): DexConfig => {
    const config = DEX_CONFIGS[dexName.toLowerCase()]
    if (!config) {
        throw new Error(`DEX configuration not found for: ${dexName}`)
    }
    return config
}
