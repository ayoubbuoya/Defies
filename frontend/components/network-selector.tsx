"use client"

import { useWallet } from "@/contexts/wallet/WalletProvider"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Globe, Wifi, WifiOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function NetworkSelector() {
    const { selectedNetwork, availableNetworks, switchNetwork, isConnecting, isConnected } = useWallet()

    const handleNetworkSwitch = async (network: any) => {
        try {
            await switchNetwork(network)
        } catch (error) {
            console.error("Network switch failed:", error)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="flex items-center space-x-2 bg-gray-800 border-gray-700 text-white hover:bg-gray-700 w-full lg:w-auto justify-between lg:justify-start"
                    disabled={isConnecting}
                >
                    <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden sm:inline truncate">{selectedNetwork.name}</span>
                        <span className="sm:hidden text-sm">{selectedNetwork.isTestnet ? "Test" : "Main"}</span>
                        {selectedNetwork.isTestnet && (
                            <Badge
                                variant="outline"
                                className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs px-1 py-0 hidden sm:inline-flex"
                            >
                                TEST
                            </Badge>
                        )}
                    </div>
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-900 border-gray-700 w-56">
                {availableNetworks.map((network) => (
                    <DropdownMenuItem
                        key={network.chainId}
                        onClick={() => handleNetworkSwitch(network)}
                        className={`cursor-pointer hover:bg-gray-800 ${selectedNetwork.chainId === network.chainId ? "bg-gray-800 text-white" : "text-gray-300"
                            }`}
                        disabled={isConnecting}
                    >
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-2">
                                {isConnected ? (
                                    <Wifi className="w-4 h-4 text-green-400 flex-shrink-0" />
                                ) : (
                                    <WifiOff className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                )}
                                <span className="truncate">{network.name}</span>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                                {network.isTestnet && (
                                    <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                                        TEST
                                    </Badge>
                                )}
                                {selectedNetwork.chainId === network.chainId && (
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                )}
                            </div>
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
