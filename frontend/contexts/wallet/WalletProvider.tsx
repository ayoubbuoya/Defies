
"use client"
import { WalletStrategy, TxParams } from "./types"
import React, { useEffect, useState } from "react"
import { WalletContext } from "./wallet-context"
import { NETWORKS } from "./networks"
import type { NetworkConfig, WalletContextType, WalletInfo } from "./types"
import { getWalletStrategy } from "./Factory";

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [isConnecting, setIsConnecting] = useState(false)
    const [showConnectionModal, setShowConnectionModal] = useState(false)
    const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([])
    const [selectedNetwork, setSelectedNetwork] = useState<NetworkConfig>(NETWORKS[0])
    const [address, setAddress] = useState<string | null>(null)
    const [walletType, setWalletType] = useState<string | null>(null)
    const [strategy, setStrategy] = useState<WalletStrategy | null>(null)

    const isConnected = !!address && !!walletType

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
        setStrategy(null)
        setAddress(null)
        setWalletType(null)
    }

    const sendTransaction = async (p: TxParams) => {
        if (!strategy) throw new Error("No wallet connected")

        return await strategy.sendTransaction(p)
    }


    const value: WalletContextType = {
        isConnected,
        address,
        walletType,
        isConnecting,
        showConnectionModal,
        availableWallets,
        selectedNetwork,
        availableNetworks: NETWORKS,
        connectWallet,
        disconnectWallet,
        setShowConnectionModal,
        switchNetwork,
        sendTransaction,
    }

    return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}
