"use client"

import React, { useEffect, useState } from "react"
import { SigningStargateClient } from "@cosmjs/stargate"
import { ethers } from "ethers"
import { WalletContext } from "./wallet-context"
import { NETWORKS } from "./networks"
import type { NetworkConfig, WalletContextType, WalletInfo } from "./types"

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [isConnecting, setIsConnecting] = useState(false)
    const [showConnectionModal, setShowConnectionModal] = useState(false)
    const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([])

    const [selectedNetwork, setSelectedNetwork] = useState<NetworkConfig>(NETWORKS[0])
    const [connectedWallet, setConnectedWallet] = useState<any>(null)
    const [evmProvider, setEvmProvider] = useState<ethers.BrowserProvider | null>(null)
    const [evmSigner, setEvmSigner] = useState<ethers.JsonRpcSigner | null>(null)

    const [address, setAddress] = useState<string | null>(null)
    const [walletType, setWalletType] = useState<string | null>(null)

    const isConnected = !!address && !!walletType

    useEffect(() => {
        const checkWallets = () => {
            const wallets: WalletInfo[] = [
                {
                    id: "keplr",
                    name: "Keplr",
                    icon: "🔮",
                    description: "The most popular Cosmos wallet",
                    gradient: "from-purple-500 to-blue-500",
                    installed: !!(window as any).keplr,
                },
                {
                    id: "leap",
                    name: "Leap Wallet",
                    icon: "🦘",
                    description: "Fast and secure Cosmos wallet",
                    gradient: "from-green-500 to-teal-500",
                    installed: !!(window as any).leap,
                },
                {
                    id: "compass",
                    name: "Compass Wallet",
                    icon: "🧭",
                    description: "Cosmos ecosystem wallet",
                    gradient: "from-orange-500 to-red-500",
                    installed: !!(window as any).compass,
                },
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

            if (walletType === "metamask" && evmProvider) {
                try {
                    await evmProvider.send("wallet_switchEthereumChain", [{ chainId: network.evmChainId }])
                } catch (err: any) {
                    if (err.code === 4902) {
                        await evmProvider.send("wallet_addEthereumChain", [{
                            chainId: network.evmChainId,
                            chainName: network.name,
                            nativeCurrency: network.currency,
                            rpcUrls: [network.rpcEndpoint],
                            blockExplorerUrls: [network.blockExplorer],
                        }])
                    } else throw err
                }
            } else if (connectedWallet) {
                await connectedWallet.enable(network.chainId)
                const key = await connectedWallet.getKey(network.chainId)
                setAddress(key.bech32Address)
            }

            setSelectedNetwork(network)
        } catch (error) {
            console.error("Network switch failed", error)
        } finally {
            setIsConnecting(false)
        }
    }

    const signMessage = async (
        wallet: any,
        address: string,
        message: string,
        walletType: string
    ) => {
        if (walletType === "metamask") {
            return await wallet.signMessage(message)
        } else if (["keplr", "leap", "compass"].includes(walletType)) {
            return await wallet.signArbitrary(selectedNetwork.chainId, address, message)
        } else {
            const signDoc = {
                chain_id: selectedNetwork.chainId,
                account_number: "0",
                sequence: "0",
                fee: { gas: "0", amount: [] },
                msgs: [],
                memo: message,
            }
            return await wallet.signAmino(address, signDoc)
        }
    }

    const connectWallet = async (walletId: string) => {
        setIsConnecting(true)
        try {
            switch (walletId) {
                case "keplr":
                case "leap":
                case "compass": {
                    const wallet = (window as any)[walletId]
                    await wallet.enable(selectedNetwork.chainId)
                    const key = await wallet.getKey(selectedNetwork.chainId)
                    const authMessage = `Sign this message to authenticate.\nNetwork: ${selectedNetwork.name}\nTime: ${Date.now()}`
                    await signMessage(wallet, key.bech32Address, authMessage, walletId)

                    setConnectedWallet(wallet)
                    setWalletType(walletId)
                    setAddress(key.bech32Address)
                    setShowConnectionModal(false)
                    break
                }

                case "metamask": {
                    const provider = new ethers.BrowserProvider((window as any).ethereum)
                    await provider.send("eth_requestAccounts", [])

                    try {
                        await provider.send("wallet_switchEthereumChain", [{ chainId: selectedNetwork.evmChainId }])
                    } catch (err: any) {
                        if (err.code === 4902) {
                            await provider.send("wallet_addEthereumChain", [{
                                chainId: selectedNetwork.evmChainId,
                                chainName: selectedNetwork.name,
                                nativeCurrency: selectedNetwork.currency,
                                rpcUrls: [selectedNetwork.rpcEndpoint],
                                blockExplorerUrls: [selectedNetwork.blockExplorer],
                            }])
                        } else throw err
                    }

                    const signer = await provider.getSigner()
                    const evmAddress = await signer.getAddress()
                    await signMessage(signer, evmAddress, `Sign this message to authenticate.\nTime: ${Date.now()}`, "metamask")

                    setEvmProvider(provider)
                    setEvmSigner(signer)
                    setWalletType("metamask")
                    setAddress(evmAddress)
                    setShowConnectionModal(false)
                    break
                }

                default:
                    throw new Error("Unsupported wallet")
            }
        } catch (err) {
            console.error("Connection error", err)
        } finally {
            setIsConnecting(false)
        }
    }

    const disconnectWallet = () => {
        setConnectedWallet(null)
        setAddress(null)
        setWalletType(null)
        setEvmProvider(null)
        setEvmSigner(null)
    }

    const sendTransaction = async (recipientAddress: string, amount: any[]) => {
        if (!address || !walletType) throw new Error("No wallet connected")

        if (walletType === "metamask") {
            if (!evmSigner) throw new Error("No EVM signer")
            const value = ethers.parseEther(amount[0].toString())
            const tx = await evmSigner.sendTransaction({ to: recipientAddress, value })
            return await tx.wait()
        } else {
            const signer = connectedWallet.getOfflineSigner(selectedNetwork.chainId)
            const client = await SigningStargateClient.connectWithSigner(selectedNetwork.rpcEndpoint, signer)
            return await client.sendTokens(address, recipientAddress, amount, "auto")
        }
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
