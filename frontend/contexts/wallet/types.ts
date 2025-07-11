export interface WalletInfo {
    id: string
    name: string
    icon: string
    description: string
    gradient: string
    installed: boolean
}

export interface NetworkConfig {
    chainId: string
    name: string
    rpcEndpoint: string
    isTestnet: boolean
    evmChainId: string
    currency: {
        name: string
        symbol: string
        decimals: number
    }
    blockExplorer: string
}

export interface WalletContextType {
    isConnected: boolean
    address: string | null
    walletType: string | null
    isConnecting: boolean
    showConnectionModal: boolean
    availableWallets: WalletInfo[]
    selectedNetwork: NetworkConfig
    availableNetworks: NetworkConfig[]
    connectWallet: (walletId: string) => Promise<void>
    disconnectWallet: () => void
    setShowConnectionModal: (show: boolean) => void
    switchNetwork: (network: NetworkConfig) => Promise<void>
    sendTransaction: (recipientAddress: string, amount: any[]) => Promise<any>
}
