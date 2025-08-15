"use client"

import { useState } from "react"
import { useWallet } from "@/contexts/wallet/WalletProvider"
import {
  Dialog,
  DialogContent,
  DialogDescription,  // Add this import
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ExternalLink, AlertCircle, CheckCircle } from "lucide-react"

const walletDownloadLinks = {
  compass: "https://chrome.google.com/webstore/detail/compass-wallet/anokgmphncpekkhclmingpimjmcooifb",
  keplr: "https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap",
  leap: "https://chrome.google.com/webstore/detail/leap-cosmos-wallet/fcfcfllfndlomdhbehjjcoimbgofdncg",
  metamask: "https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?utm_source=www.google.com",
}

export function WalletConnectionModal() {
  const { showConnectionModal, setShowConnectionModal, connectWallet, isConnecting, availableWallets } = useWallet()
  const [connectionError, setConnectionError] = useState<string | null>(null)
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
            Connect Cosmos Wallet
          </DialogTitle>
          <DialogDescription
            id="wallet-dialog-description"
            className="text-sm text-gray-400 text-center"
          >
            Choose a wallet to connect to the Cosmos ecosystem. Your private keys never leave your wallet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {connectionError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-400">{connectionError}</div>
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
                <div className="text-gray-400 mb-4">No Cosmos wallets detected</div>
                <div className="text-sm text-gray-500 mb-4">Please install one of the supported wallets:</div>
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
            <strong className="text-green-400">🔒 Security Notice:</strong> This application is non-custodial. We never
            store or have access to your private keys.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}