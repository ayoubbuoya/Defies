import { ethers } from "ethers"

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
    rpcEndpointEvm: string
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
    isRestoring: boolean
    address: string | null
    walletType: string | null
    isConnecting: boolean
    showConnectionModal: boolean
    availableWallets: WalletInfo[]
    selectedNetwork: NetworkConfig
    availableNetworks: NetworkConfig[]
    wallet: WalletStrategy | null
    connectionError: string | null
    connectWallet: (walletId: string) => Promise<void>
    disconnectWallet: () => void
    setShowConnectionModal: (show: boolean) => void
    setConnectionError: (error: string | null) => void
    switchNetwork: (network: NetworkConfig) => Promise<void>
    sendTransaction: (p: TxParams) => Promise<any>
}

export interface WalletStrategy {
    restoreConnection(): Promise<boolean>;
    isInstalled(): boolean;
    connect(selectedNetwork: NetworkConfig): Promise<string>; // returns address
    getAddress(): Promise<string>; // returns address
    signMessage(address: string, message: string): Promise<string>;
    switchNetwork(network: NetworkConfig): Promise<string>; // returns address
    sendTransaction(p: TxParams): Promise<any>; // returns transaction result
    getSigner(): ethers.JsonRpcSigner
}

export type TxParams =
    | { type?: "native"; recipient: string; amount: string }                // default
    | { type: "contract"; contract: string; abi: any[]; method: string; args: any[]; value?: string };
