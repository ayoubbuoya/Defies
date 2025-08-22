import { NetworkConfig } from "../types/wallet"

export const NETWORKS: NetworkConfig[] = [
    {
        chainId: 'pacific-1',
        name: 'Sei Mainnet',
        rpcEndpoint: 'https://rpc.pacific-1.sei.io',
        rpcEndpointEvm: 'https://evm-rpc.sei-apis.com',
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
        name: 'Sei V2 Testnet',
        rpcEndpoint: 'https://rpc-testnet.sei-apis.com',
        rpcEndpointEvm: 'https://evm-rpc-testnet.sei-apis.com',
        isTestnet: true,
        evmChainId: '0x530',
        currency: {
            name: 'sei',
            symbol: 'SEI',
            decimals: 18,
        },
        blockExplorer: "https://sei.explorers.guru/",
    },
]
