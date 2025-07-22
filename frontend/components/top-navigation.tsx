"use client"

import { useWallet } from "@/contexts/wallet/wallet-context"
import { NetworkSelector } from "@/components/network-selector"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Wallet, LogOut, Copy, Home, MessageSquare, Sparkles, Droplets, Menu } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"


interface TopNavigationProps {
  activeView: string
  setActiveView: (view: string) => void
}

export function TopNavigation({ activeView, setActiveView }: TopNavigationProps) {
  const { isConnected, address, walletType, disconnectWallet, setShowConnectionModal } = useWallet()
  const [copied, setCopied] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const pathname = usePathname()
  const isHomePage = pathname === "/"

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const navigationItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "chat", label: "AI Chat", icon: MessageSquare },
    { id: "pools", label: "Pools", icon: Droplets },
  ]

  const handleNavItemClick = (viewId: string) => {
    setActiveView(viewId)
    setMobileMenuOpen(false)
  }

  return (
    <header className="border-b border-gray-800 bg-gray-950/90 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        {/* Desktop Layout - Single Row */}
        <div className="hidden lg:flex items-center justify-between">
          {/* Left Side - Logo + Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center overflow-hidden">
                  {!logoError ? (
                    <Image
                      src="/logo.png"
                      alt="SeiMind Logo"
                      width={24}
                      height={24}
                      className="w-6 h-6 object-contain"
                      onError={() => setLogoError(true)}
                      priority
                    />
                  ) : (
                    <Sparkles className="w-5 h-5 text-white" />
                  )}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse flex items-center justify-center">
                    <Sparkles className="w-1.5 h-1.5 text-white" />
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  SeiMind
                </h1>
                <p className="text-xs text-gray-500 leading-none">AI-Powered Web3</p>
              </div>
            </div>

            {/* Navigation Items */}
            {/* Navigation Items */}
            <nav className="flex items-center space-x-2">
              {navigationItems.map((item) => {
                const isActive = activeView === item.id
                const button = (
                  <Button
                    key={item.id}
                    variant={isActive ? "secondary" : "ghost"}
                    onClick={() => isHomePage && setActiveView(item.id)}
                    className={`${isActive
                      ? "bg-gray-800 text-white border border-gray-700 shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                      } px-4 py-2 transition-all duration-200`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                )

                return isHomePage ? (
                  <div key={item.id}>{button}</div>
                ) : (
                  <Link key={item.id} href={`/?view=${item.id}`}>
                    {button}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right Side - Wallet Controls */}
          <div className="flex items-center space-x-3">
            {isConnected ? (
              <>
                <NetworkSelector />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAddress}
                  className="text-gray-300 border-gray-600 hover:bg-gray-700 bg-gray-800 transition-all duration-200"
                >
                  {copied ? "✅" : truncateAddress(address!)}
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
              </>
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

        {/* Mobile Layout - Visible on small screens only */}
        <div className="lg:hidden py-3">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center overflow-hidden">
                  {!logoError ? (
                    <Image
                      src="/logo.png"
                      alt="SeiMind Logo"
                      width={24}
                      height={24}
                      className="w-6 h-6 object-contain"
                      onError={() => setLogoError(true)}
                      priority
                    />
                  ) : (
                    <Sparkles className="w-5 h-5 text-white" />
                  )}
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full animate-pulse flex items-center justify-center">
                    <Sparkles className="w-1.5 h-1.5 text-white" />
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  SeiMind
                </h1>
                <p className="text-xs text-gray-500 leading-none">AI-Powered Web3</p>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 p-2 relative"
                >
                  <Menu className="w-5 h-5" />
                  {isConnected && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-gray-950 border-gray-800 p-0">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-lg font-semibold text-white">Menu</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6 space-y-8">
                    {/* Navigation Section */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Navigation</h3>
                      <div className="space-y-2">
                        {navigationItems.map((item) => {
                          const isActive = activeView === item.id

                          const button = (
                            <Button
                              variant={isActive ? "secondary" : "ghost"}
                              onClick={() => isHomePage ? handleNavItemClick(item.id) : undefined}
                              className={`w-full justify-start ${isActive
                                ? "bg-gray-800 text-white border border-gray-700"
                                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                                } h-12 px-4 transition-all duration-200`}
                            >
                              <item.icon className="w-5 h-5 mr-3" />
                              {item.label}
                            </Button>
                          )

                          // If on homepage, just a button with onClick, else wrap with Link
                          return isHomePage ? (
                            <div key={item.id}>{button}</div>
                          ) : (
                            <Link key={item.id} href={`/?view=${item.id}`} onClick={() => setMobileMenuOpen(false)}>
                              {button}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                    {/* Wallet Section */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Wallet & Network</h3>
                      {isConnected ? (
                        <div className="space-y-4">
                          {/* Wallet Status */}
                          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-2 py-1">
                                🟢 Connected
                              </Badge>
                              <span className="text-sm text-gray-400">{walletType}</span>
                            </div>
                            <div className="text-xs text-gray-500 mb-2">Wallet Address</div>
                            <div className="text-sm text-white font-mono">{truncateAddress(address!)}</div>
                          </div>

                          {/* Network Selection */}
                          <div className="space-y-2">
                            <label className="text-sm text-gray-400">Network</label>
                            <NetworkSelector />
                          </div>

                          {/* Action Buttons */}
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              onClick={copyAddress}
                              className="w-full text-gray-300 border-gray-600 hover:bg-gray-700 bg-gray-800 h-12"
                            >
                              {copied ? "✅ Address Copied!" : "📋 Copy Address"}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                disconnectWallet()
                                setMobileMenuOpen(false)
                              }}
                              className="w-full text-red-400 border-red-500/50 hover:bg-red-500/20 bg-gray-800 h-12"
                            >
                              <LogOut className="w-4 h-4 mr-2" />
                              Disconnect Wallet
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 text-center">
                            <Wallet className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-400 mb-3">Connect your wallet to access all features</p>
                          </div>
                          <Button
                            onClick={() => {
                              setShowConnectionModal(true)
                              setMobileMenuOpen(false)
                            }}
                            className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 h-12"
                          >
                            <Wallet className="w-4 h-4 mr-2" />
                            Connect Wallet
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
