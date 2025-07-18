"use client"

import { useWallet } from "@/contexts/wallet/wallet-context"
import { NetworkSelector } from "@/components/network-selector"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Wallet, LogOut, Copy, Home, MessageSquare, Sparkles, Droplets } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

interface TopNavigationProps {
  activeView: string
  setActiveView: (view: string) => void
}

export function TopNavigation({ activeView, setActiveView }: TopNavigationProps) {
  const { isConnected, address, walletType, disconnectWallet, setShowConnectionModal } = useWallet()
  const [copied, setCopied] = useState(false)
  const [logoError, setLogoError] = useState(false)

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`
  }

  const navigationItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "chat", label: "AI Chat", icon: MessageSquare },
    { id: "liquidity", label: "Liquidity", icon: Droplets },
  ]

  return (
    <header className="border-b border-gray-800 bg-gray-950/90 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        {/* Use CSS Grid for perfect 3-column layout */}
        <div className="grid grid-cols-3 items-center gap-4">
          {/* Left Column - Logo */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center overflow-hidden">
                {!logoError ? (
                  <Image
                    src="/logo.png"
                    alt="SeiMind Logo"
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                    onError={() => setLogoError(true)}
                    priority
                  />
                ) : (
                  // Fallback icon if logo fails to load
                  <Sparkles className="w-6 h-6 text-white" />
                )}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                SeiMind
              </h1>
              <p className="text-xs text-gray-500">AI-Powered Web3</p>
            </div>
          </div>

          {/* Center Column - Navigation Items (Always Centered) */}
          <nav className="flex items-center justify-center space-x-4">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant={activeView === item.id ? "secondary" : "ghost"}
                onClick={() => setActiveView(item.id)}
                className={`${activeView === item.id
                  ? "bg-gray-800 text-white border border-gray-700 shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  } px-6 py-2 transition-all duration-200`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Right Column - Network Selector + Wallet */}
          <div className="flex items-center justify-end space-x-3">
            {/* Network Selector */}
            <NetworkSelector />

            {/* Wallet Section */}
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1 animate-pulse">
                  🟢 {walletType}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAddress}
                  className="text-gray-300 border-gray-600 hover:bg-gray-700 bg-gray-800 transition-all duration-200"
                >
                  {copied ? "✅ Copied!" : truncateAddress(address!)}
                  <Copy className="w-3 h-3 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnectWallet}
                  className="text-red-400 border-red-500/50 hover:bg-red-500/20 bg-gray-800 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setShowConnectionModal(true)}
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 transition-all duration-200 hover:scale-105"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}