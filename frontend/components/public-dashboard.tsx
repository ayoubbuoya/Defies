"use client"

import { useState } from "react"
import { useAddress } from "@/contexts/address-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, TrendingUp, Activity, DollarSign, PieChart, Eye, Wallet } from "lucide-react"
import { PortfolioChart } from "@/components/portfolio-chart"
import { AssetAllocation } from "@/components/asset-allocation"

const mockAssets = [
  { symbol: "SEI", name: "Sei", balance: "1,234.56", value: "$987.65", change: "+12.5%", positive: true },
  { symbol: "USDC", name: "USD Coin", balance: "500.00", value: "$500.00", change: "+0.1%", positive: true },
  { symbol: "WETH", name: "Wrapped Ethereum", balance: "0.5", value: "$1,200.00", change: "-2.3%", positive: false },
  { symbol: "ATOM", name: "Cosmos", balance: "1,000.00", value: "$8,500.00", change: "+8.7%", positive: true },
]

const mockTransactions = [
  { type: "Received", asset: "SEI", amount: "+100.00", time: "2 hours ago", hash: "0x1234...5678" },
  { type: "Swap", asset: "USDC → SEI", amount: "50.00", time: "1 day ago", hash: "0xabcd...efgh" },
  { type: "Sent", asset: "ATOM", amount: "-25.00", time: "2 days ago", hash: "0x9876...5432" },
]

export function PublicDashboard() {
  const { watchedAddress, setWatchedAddress, isValidAddress } = useAddress()
  const [inputAddress, setInputAddress] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    if (isValidAddress(inputAddress)) {
      setIsAnalyzing(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setWatchedAddress(inputAddress)
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Address Input Section */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Eye className="w-5 h-5 mr-2 text-purple-400" />🔍 Wallet Explorer
          </CardTitle>
          <p className="text-gray-300 text-sm">
            Enter any Sei wallet address to analyze its portfolio, transactions, and activity patterns
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-3">
            <div className="flex-1">
              <Input
                placeholder="sei1abc123def456ghi789jkl012mno345pqr678stu..."
                value={inputAddress}
                onChange={(e) => setInputAddress(e.target.value)}
                className="bg-black/30 border-white/20 text-white placeholder-gray-400 backdrop-blur-sm"
              />
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={!isValidAddress(inputAddress) || isAnalyzing}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
          {inputAddress && !isValidAddress(inputAddress) && (
            <p className="text-red-400 text-sm mt-2">Please enter a valid Sei address (starts with 'sei1')</p>
          )}
        </CardContent>
      </Card>

      {watchedAddress ? (
        <>
          {/* Watched Address Info */}
          <Card className="glass-card border-green-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Currently Analyzing</p>
                  <p className="font-mono text-white text-sm">{watchedAddress}</p>
                </div>
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                  🟢 Live Data
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass-card border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">$11,187.65</div>
                <p className="text-xs text-green-400 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12.5% from last week
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">24h Change</CardTitle>
                <Activity className="h-4 w-4 text-pink-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">+$234.12</div>
                <p className="text-xs text-green-400 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +2.1%
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Assets</CardTitle>
                <PieChart className="h-4 w-4 text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">4</div>
                <p className="text-xs text-gray-400">Different tokens</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Transactions</CardTitle>
                <Activity className="h-4 w-4 text-cyan-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">127</div>
                <p className="text-xs text-gray-400">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">📈 Portfolio Value</CardTitle>
              </CardHeader>
              <CardContent>
                <PortfolioChart />
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">🥧 Asset Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <AssetAllocation />
              </CardContent>
            </Card>
          </div>

          {/* Assets and Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">💎 Assets Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAssets.map((asset) => (
                    <div
                      key={asset.symbol}
                      className="flex items-center justify-between p-3 bg-black/20 rounded-lg backdrop-blur-sm border border-white/10"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{asset.symbol[0]}</span>
                        </div>
                        <div>
                          <div className="font-medium text-white">{asset.symbol}</div>
                          <div className="text-sm text-gray-400">{asset.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-white">{asset.balance}</div>
                        <div className="text-sm text-gray-400">{asset.value}</div>
                      </div>
                      <Badge
                        className={`ml-2 border-0 ${
                          asset.positive
                            ? "bg-gradient-to-r from-green-500 to-emerald-500"
                            : "bg-gradient-to-r from-red-500 to-pink-500"
                        }`}
                      >
                        {asset.change}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">⚡ Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTransactions.map((tx, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-black/20 rounded-lg backdrop-blur-sm border border-white/10"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            tx.type === "Received"
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : tx.type === "Sent"
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          }`}
                        >
                          {tx.type === "Received" ? "↓" : tx.type === "Sent" ? "↑" : "↔"}
                        </div>
                        <div>
                          <div className="font-medium text-white">{tx.type}</div>
                          <div className="text-sm text-gray-400">{tx.asset}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-white">{tx.amount}</div>
                        <div className="text-sm text-gray-400">{tx.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card className="glass-card border-white/10">
          <CardContent className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="text-center space-y-4">
              <Wallet className="w-16 h-16 text-purple-400 mx-auto" />
              <h2 className="text-2xl font-bold text-white">🔍 Explore Any Sei Wallet</h2>
              <p className="text-gray-400 max-w-md">
                Enter any Sei wallet address above to analyze its portfolio, transaction patterns, and asset allocation
                in real-time.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
