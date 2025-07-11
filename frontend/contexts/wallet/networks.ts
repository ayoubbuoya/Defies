import { NetworkConfig } from "./types"

export const NETWORKS: NetworkConfig[] = [
    {
        chainId: 'pacific-1',
        name: 'Sei Mainnet',
        rpcEndpoint: 'https://sei-rpc.polkachu.com',
        isTestnet: false,
        evmChainId: '0x531',
        currency: {
            name: 'SEI',
            symbol: 'SEI',
            decimals: 18,
        },
        blockExplorer: 'https://seistream.app',
    },
    {
        chainId: 'atlantic-2',
        name: 'Sei Testnet',
        rpcEndpoint: 'https://sei-testnet-rpc.polkachu.com',
        isTestnet: true,
        evmChainId: '0x530',
        currency: {
            name: 'SEI',
            symbol: 'SEI',
            decimals: 18,
        },
        blockExplorer: 'https://seistream.app',
    },
]
