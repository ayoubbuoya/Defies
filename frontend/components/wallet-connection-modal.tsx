"use client"

import { useState } from "react"
import { useWallet } from "@/contexts/wallet/WalletProvider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ExternalLink, AlertCircle, CheckCircle } from "lucide-react"

const walletDownloadLinks = {
  metamask: "https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn",
  walletconnect: "https://walletconnect.com/",
  coinbase: "https://chrome.google.com/webstore/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad",
  trustwallet: "https://chrome.google.com/webstore/detail/trust-wallet/egjidjbpglichdcondbcbdnbeeppgdph"
}

export function WalletConnectionModal() {
  const { showConnectionModal, setShowConnectionModal, connectWallet, isConnecting, availableWallets, connectionError, setConnectionError } = useWallet()
  const [connectingWalletId, setConnectingWalletId] = useState<string | null>(null)

  const handleConnect = async (walletId: string) => {
    setConnectionError(null)
    setConnectingWalletId(walletId)

    try {
      await connectWallet(walletId)
    } catch (error: any) {
      setConnectionError(error.message || "Failed to connect wallet")
    } finally {
      setConnectingWalletId(null)
    }
  }

  const handleDialogChange = (open: boolean) => {
    if (!isConnecting) {
      setShowConnectionModal(open)
      if (!open) {
        setConnectionError(null)
        setConnectingWalletId(null)
      }
    }
  }

  const openWalletDownload = (walletId: string) => {
    const url = walletDownloadLinks[walletId as keyof typeof walletDownloadLinks]
    if (url) {
      window.open(url, "_blank")
    }
  }

  // Separate installed and not installed wallets
  const installedWallets = availableWallets.filter(wallet => wallet.installed)
  const notInstalledWallets = availableWallets.filter(wallet => !wallet.installed)

  return (
    <Dialog open={showConnectionModal} onOpenChange={handleDialogChange}>
      <DialogContent
        className="sm:max-w-md bg-gray-900 border-gray-700"
        aria-describedby="wallet-dialog-description"
      >
        <DialogHeader>
          <DialogTitle className="text-white text-center text-xl">
            Connect to Sei Network
          </DialogTitle>
          <DialogDescription
            id="wallet-dialog-description"
            className="text-sm text-gray-400 text-center"
          >
            Choose a wallet to connect to Sei EVM. DeFies will automatically configure the Sei network for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {connectionError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  {connectionError.includes("cancelled") ? "❌" :
                    connectionError.includes("not installed") ? "🦊" :
                      connectionError.includes("network") ? "🔗" :
                        connectionError.includes("Authentication") ? "🔐" : "⚠️"}
                </div>
                <div className="flex-1">
                  <h4 className="text-red-400 font-medium mb-1">
                    {connectionError.includes("cancelled") ? "Connection Cancelled" :
                      connectionError.includes("not installed") ? "MetaMask Not Found" :
                        connectionError.includes("network") ? "Network Setup Issue" :
                          connectionError.includes("Authentication") ? "Authentication Failed" :
                            "Connection Failed"}
                  </h4>
                  <p className="text-red-300 text-sm mb-3">{connectionError}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setConnectionError(null)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors"
                    >
                      Try Again
                    </button>
                    {connectionError.includes("not installed") && (
                      <button
                        onClick={() => window.open("https://metamask.io/download/", "_blank")}
                        className="px-3 py-1.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm rounded-md transition-colors"
                      >
                        Install MetaMask
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-3">
            {installedWallets.length > 0 ? (
              installedWallets.map((wallet) => (
                <Card
                  key={wallet.id}
                  className={`p-4 bg-gray-800 border-gray-700 hover:border-gray-600 cursor-pointer transition-all duration-300 ${isConnecting && connectingWalletId === wallet.id ? "opacity-50" : "hover:bg-gray-750"
                    }`}
                  onClick={() => !isConnecting && handleConnect(wallet.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Connect with ${wallet.name}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      if (!isConnecting) handleConnect(wallet.id)
                    }
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${wallet.gradient} rounded-xl flex items-center justify-center text-2xl`}
                      role="img"
                      aria-hidden="true"
                    >
                      {wallet.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-white text-lg">{wallet.name}</h3>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Installed
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400">{wallet.description}</p>
                    </div>
                    {isConnecting && connectingWalletId === wallet.id && (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-400" aria-label="Connecting..." />
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-6">
                <div className="text-gray-400 mb-4">No EVM wallets detected</div>
                <div className="text-sm text-gray-500 mb-4">Please install MetaMask or another EVM-compatible wallet:</div>
                <div className="space-y-2">
                  {notInstalledWallets.map((wallet) => (
                    <Button
                      key={wallet.id}
                      variant="outline"
                      onClick={() => openWalletDownload(wallet.id)}
                      className="w-full justify-between border-gray-600 text-gray-300 hover:bg-gray-700"
                      aria-label={`Install ${wallet.name} wallet`}
                    >
                      <span className="flex items-center">
                        <span className="mr-2" role="img" aria-hidden="true">{wallet.icon}</span>
                        Install {wallet.name}
                      </span>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="text-xs text-gray-400 bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="flex items-start space-x-2">
              <div className="text-blue-400">ℹ️</div>
              <div>
                <strong className="text-blue-400">Sei Network Setup:</strong> DeFies will automatically add Sei Pacific-1 network to your wallet with the correct RPC endpoints and chain configuration.
              </div>
            </div>
            <div className="flex items-start space-x-2 mt-2">
              <div className="text-green-400">🔒</div>
              <div>
                <strong className="text-green-400">Security:</strong> This application is non-custodial. We never store or have access to your private keys.
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}