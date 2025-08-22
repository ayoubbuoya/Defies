
"use client"
import { WalletStrategy, TxParams } from "../../types/wallet"
import React, { useEffect, useState } from "react"
import { NETWORKS } from "../../constants/networks"
import type { NetworkConfig, WalletContextType, WalletInfo } from "../../types/wallet"
import { getWalletStrategy } from "../../adapters/wallet/Factory";
import GlobalLoader from "@/components/GlobalLoader"
import { createContext, useContext } from "react"

export const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [isRestoring, setIsRestoring] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false)
    const [showConnectionModal, setShowConnectionModal] = useState(false)
    const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([])
    const [selectedNetwork, setSelectedNetwork] = useState<NetworkConfig>(NETWORKS[0])
    const [address, setAddress] = useState<string | null>(null)
    const [walletType, setWalletType] = useState<string | null>(null)
    const [strategy, setStrategy] = useState<WalletStrategy | null>(null)

    const isConnected = !!strategy && !!walletType

    useEffect(() => {
        // ✅ NEW effect – restore previous wallet connection
        const restoreWallet = async () => {
            setIsRestoring(true);
            const storedToken = localStorage.getItem("authToken");
            const storedWalletType = localStorage.getItem("walletType");

            if (!storedToken || !storedWalletType) {
                disconnectWallet();
                setIsRestoring(false);
                return;
            }
            try {
                const wallet = getWalletStrategy(storedWalletType);

                if (!wallet.isInstalled()) {
                    disconnectWallet();
                    return;
                }

                if (await wallet.restoreConnection() == false) return; // ✅ If the wallet can restore connection, do it

                const address = await wallet.getAddress();

                setStrategy(wallet);
                setWalletType(storedWalletType);
                setAddress(address);

            } catch (error) {
                console.error("Wallet restoration failed", error);
                disconnectWallet();
            }
            finally {
                setIsRestoring(false); // ✅ Done restoring
            }
        };

        restoreWallet();
    }, []);


    useEffect(() => {
        const checkWallets = () => {
            const wallets: WalletInfo[] = [
                {
                    id: "metamask",
                    name: "MetaMask",
                    icon: "🦊",
                    description: "Popular EVM wallet",
                    gradient: "from-yellow-400 to-orange-500",
                    installed: !!(window as any).ethereum && (window as any).ethereum.isMetaMask,
                },
            ]
            setAvailableWallets(wallets)
        }

        checkWallets()
        window.addEventListener("load", checkWallets)
        return () => window.removeEventListener("load", checkWallets)
    }, [])

    const switchNetwork = async (network: NetworkConfig) => {
        try {
            setIsConnecting(true)

            if (strategy) {
                const userAddress = await strategy.switchNetwork(network)
                setAddress(userAddress)
            }

            setSelectedNetwork(network)
        } catch (error) {
            console.error("Network switch failed", error)
        } finally {
            setIsConnecting(false)
        }
    }

    const connectWallet = async (walletId: string) => {
        setIsConnecting(true);
        try {
            const wallet = getWalletStrategy(walletId);
            if (!wallet.isInstalled()) throw new Error("Wallet not installed");

            const userAddress = await wallet.connect(selectedNetwork);
            const authMessage = `Sign this message to authenticate.\nTime: ${Date.now()}`;
            const signature = await wallet.signMessage(userAddress, authMessage);

            // ⬇️ Send signed message to backend
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
            const res = await fetch(`${backendUrl}/auth/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    address: userAddress,
                    message: authMessage,
                    signature,
                    wallet_type: walletId,
                    pub_key: null // ← only needed for Cosmos-based wallets
                })
            });

            if (!res.ok) {
                alert("Auth failed");
                return;
            }

            const { token } = await res.json();
            //store the token
            localStorage.setItem("authToken", token);
            localStorage.setItem("walletType", walletId);

            setWalletType(walletId);
            setAddress(userAddress);
            setShowConnectionModal(false);
            setStrategy(wallet);
        } catch (err) {
            alert("Auth failed");
        } finally {
            setIsConnecting(false);
        }
    };


    const disconnectWallet = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("walletType");
        setStrategy(null);
        setAddress(null);
        setWalletType(null);
    }


    const sendTransaction = async (p: TxParams) => {
        if (!strategy) throw new Error("No wallet connected")

        return await strategy.sendTransaction(p)
    }




    const value: WalletContextType = {
        isConnected,
        isRestoring,
        address,
        walletType,
        isConnecting,
        showConnectionModal,
        availableWallets,
        selectedNetwork,
        availableNetworks: NETWORKS,
        wallet: strategy,
        connectWallet,
        disconnectWallet,
        setShowConnectionModal,
        switchNetwork,
        sendTransaction,
    }

    if (isRestoring) {
        return <GlobalLoader showProgress={true} />;
    }

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    )

}


export function useWallet() {
    const context = useContext(WalletContext)
    if (!context) throw new Error("useWallet must be used within a WalletProvider")
    return context
}
