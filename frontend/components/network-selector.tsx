"use client"

import { useWallet } from "@/contexts/wallet/wallet-context"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Globe, Wifi, WifiOff, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

export function NetworkSelector() {
    const { selectedNetwork, availableNetworks, switchNetwork, isConnecting, isConnected } = useWallet()
    const [isOpen, setIsOpen] = useState(false)

    const handleNetworkSwitch = async (network: any) => {
        try {
            setIsOpen(false)
            await switchNetwork(network)
        } catch (error) {
            console.error("Network switch failed:", error)
        }
    }

    // Mock data if wallet context doesn't provide it
    const mockSelectedNetwork = selectedNetwork || {
        name: "Sei Mainnet",
        chainId: "pacific-1",
        isTestnet: false,
    }

    const mockAvailableNetworks = availableNetworks || [
        { name: "Sei Mainnet", chainId: "pacific-1", isTestnet: false },
        { name: "Sei Testnet", chainId: "atlantic-2", isTestnet: true },
    ]

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="flex items-center space-x-2 bg-gray-800 border-gray-700 text-white hover:bg-gray-700 transition-all duration-200 min-w-0 relative group"
                    disabled={isConnecting}
                >
                    {isConnecting ? (
                        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                    ) : (
                        <Globe className="w-4 h-4 flex-shrink-0 group-hover:text-blue-400 transition-colors" />
                    )}

                    <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                        <span className="hidden sm:inline truncate font-medium">{mockSelectedNetwork.name}</span>
                        <span className="sm:hidden text-xs font-medium truncate">
                            {mockSelectedNetwork.isTestnet ? "Test" : "Main"}
                        </span>

                        {mockSelectedNetwork.isTestnet && (
                            <Badge
                                variant="outline"
                                className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs px-1.5 py-0.5 hidden sm:inline-flex flex-shrink-0 font-medium animate-pulse"
                            >
                                TEST
                            </Badge>
                        )}
                    </div>

                    <ChevronDown
                        className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="bg-gray-900 border-gray-700 min-w-[220px] shadow-xl shadow-black/20"
                align="end"
                sideOffset={8}
            >
                <div className="p-2">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                        Available Networks
                    </div>

                    {mockAvailableNetworks.map((network) => (
                        <DropdownMenuItem
                            key={network.chainId}
                            onClick={() => handleNetworkSwitch(network)}
                            className={`cursor-pointer hover:bg-gray-800 transition-all duration-200 rounded-md p-3 ${mockSelectedNetwork.chainId === network.chainId
                                ? "bg-gray-800 text-white border border-gray-700"
                                : "text-gray-300 hover:text-white"
                                }`}
                            disabled={isConnecting}
                        >
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center space-x-3 min-w-0 flex-1">
                                    {isConnected ? (
                                        <Wifi className="w-4 h-4 text-green-400 flex-shrink-0" />
                                    ) : (
                                        <WifiOff className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <span className="font-medium truncate block">{network.name}</span>
                                        <span className="text-xs text-gray-500 truncate block">{network.chainId}</span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 flex-shrink-0">
                                    {network.isTestnet && (
                                        <Badge
                                            variant="outline"
                                            className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs px-1.5 py-0.5 font-medium"
                                        >
                                            TEST
                                        </Badge>
                                    )}
                                    {mockSelectedNetwork.chainId === network.chainId && (
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    )}
                                </div>
                            </div>
                        </DropdownMenuItem>
                    ))}
                </div>

                <div className="border-t border-gray-700 p-2">
                    <div className="text-xs text-gray-500 px-2 py-1">{isConnected ? "🟢 Connected" : "🔴 Disconnected"}</div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
