"use client"

import { useWallet } from "@/contexts/wallet/wallet-context"
import { NetworkSelector } from "@/components/network-selector"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, LogOut, Copy, Home, MessageSquare, Sparkles, Droplets, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"

interface TopNavigationProps {
  activeView: string
  setActiveView: (view: string) => void
}

export function TopNavigation({ activeView, setActiveView }: TopNavigationProps) {
  const { isConnected, address, walletType, disconnectWallet, setShowConnectionModal } = useWallet()
  const [copied, setCopied] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Close mobile menu when clicking outside or on navigation
  useEffect(() => {
    const handleClickOutside = () => {
      if (mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }
  }, [mobileMenuOpen])

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const truncateAddress = (addr: string) => {
    return isMobile ? `${addr.slice(0, 4)}...${addr.slice(-3)}` : `${addr.slice(0, 8)}...${addr.slice(-6)}`
  }

  const navigationItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "chat", label: "AI Chat", icon: MessageSquare },
    { id: "liquidity", label: "Liquidity", icon: Droplets },
  ]

  const handleNavigation = (viewId: string) => {
    setActiveView(viewId)
    setMobileMenuOpen(false)
  }

  return (
    <header className="border-b border-gray-800 bg-gray-950/95 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Desktop Layout (lg and above) */}
        <div className="hidden lg:grid grid-cols-3 items-center gap-6 py-4">
          {/* Left Column - Logo */}
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300">
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
              <p className="text-xs text-gray-500 font-medium">AI-Powered Web3 Intelligence</p>
            </div>
          </div>

          {/* Center Column - Navigation Items */}
          <nav className="flex items-center justify-center space-x-2">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant={activeView === item.id ? "secondary" : "ghost"}
                onClick={() => setActiveView(item.id)}
                className={`${activeView === item.id
                  ? "bg-gray-800 text-white border border-gray-700 shadow-lg shadow-gray-800/50"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  } px-6 py-2.5 transition-all duration-200 font-medium`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Right Column - Network Selector + Wallet */}
          <div className="flex items-center justify-end space-x-3">
            <NetworkSelector />
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1.5 animate-pulse font-medium">
                  🟢 {walletType}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAddress}
                  className="text-gray-300 border-gray-600 hover:bg-gray-700 bg-gray-800 transition-all duration-200 font-mono"
                >
                  {copied ? "✅ Copied!" : truncateAddress(address!)}
                  <Copy className="w-3 h-3 ml-2" />
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
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 transition-all duration-200 hover:scale-105 shadow-lg shadow-blue-500/25 font-medium"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>

        {/* Mobile/Tablet Layout (below lg) */}
        <div className="lg:hidden py-3">
          <div className="flex items-center justify-between">
            {/* Left - Logo (Compact) */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center overflow-hidden shadow-md shadow-blue-500/20">
                  {!logoError ? (
                    <Image
                      src="/logo.png"
                      alt="SeiMind Logo"
                      width={24}
                      height={24}
                      className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                      onError={() => setLogoError(true)}
                      priority
                    />
                  ) : (
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  )}
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full animate-pulse flex items-center justify-center">
                    <Sparkles className="w-1.5 h-1.5 text-white" />
                  </div>
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent truncate">
                  SeiMind
                </h1>
                <p className="text-xs text-gray-500 font-medium hidden sm:block">AI-Powered Web3</p>
              </div>
            </div>

            {/* Right - Controls */}
            <div className="flex items-center space-x-1.5">
              {/* Network Selector - Hidden on very small screens */}
              <div className="hidden md:block">
                <NetworkSelector />
              </div>

              {/* Wallet Section - Ultra Compact */}
              {isConnected ? (
                <div className="flex items-center space-x-1">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-2 py-1 text-xs animate-pulse font-medium hidden sm:flex">
                    🟢 {walletType}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyAddress}
                    className="text-gray-300 border-gray-600 hover:bg-gray-700 bg-gray-800 transition-all duration-200 text-xs px-2 py-1.5 font-mono min-w-0"
                  >
                    <span className="truncate">{copied ? "✅" : truncateAddress(address!)}</span>
                    <Copy className="w-3 h-3 ml-1 flex-shrink-0" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectWallet}
                    className="text-red-400 border-red-500/50 hover:bg-red-500/20 bg-gray-800 transition-all duration-200 px-2 py-1.5"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowConnectionModal(true)}
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 transition-all duration-200 text-xs px-3 py-1.5 font-medium shadow-md shadow-blue-500/20"
                >
                  <Wallet className="w-3 h-3 mr-1" />
                  <span className="hidden xs:inline">Connect</span>
                  <span className="xs:hidden">Wallet</span>
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setMobileMenuOpen(!mobileMenuOpen)
                }}
                className="text-gray-400 hover:text-white hover:bg-gray-800/50 p-2 transition-all duration-200"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div
              className="mt-4 pb-4 border-t border-gray-800 animate-in slide-in-from-top-2 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pt-4 space-y-4">
                {/* Navigation Items */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 px-2 mb-3">
                    <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Navigation</p>
                  </div>
                  <div className="space-y-1">
                    {navigationItems.map((item) => (
                      <Button
                        key={item.id}
                        variant={activeView === item.id ? "secondary" : "ghost"}
                        onClick={() => handleNavigation(item.id)}
                        className={`${activeView === item.id
                          ? "bg-gray-800 text-white border border-gray-700 shadow-md"
                          : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                          } w-full justify-start transition-all duration-200 font-medium py-3`}
                      >
                        <item.icon className="w-4 h-4 mr-3" />
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Network Selector for small screens */}
                <div className="md:hidden space-y-2">
                  <div className="flex items-center space-x-2 px-2 mb-3">
                    <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Network</p>
                  </div>
                  <div className="px-2">
                    <NetworkSelector />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
