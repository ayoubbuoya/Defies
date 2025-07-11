"use client"

import { useWallet } from "@/contexts/wallet/wallet-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Zap, Wallet, Bot, ArrowRight, Sparkles } from "lucide-react"

interface HomePageProps {
  setActiveView: (view: string) => void
}

export function HomePage({ setActiveView }: HomePageProps) {
  const { isConnected, setShowConnectionModal } = useWallet()

  return (
    <div className="min-h-full relative overflow-hidden">
      <div className="relative z-10 text-center py-20 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Logo and Title */}
          <div className="flex items-center justify-center space-x-6 mb-12">
            <div className="relative group">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <Zap className="w-10 h-10 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-pulse flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Sei AI Nexus
              </h1>
              <p className="text-xl text-gray-400 mt-2">The Future of Web3 Intelligence</p>
            </div>
          </div>

          {/* Main Headline */}
          <div className="space-y-8">
            <h2 className="text-5xl font-bold text-white leading-tight">
              Unlock the Power of
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                AI-Driven Web3
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Experience the next generation of blockchain intelligence with our AI-powered platform. Get smart insights
              and assistance for your Web3 journey.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-8 pt-8">
            <Button
              onClick={() => setActiveView("chat")}
              size="lg"
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 px-10 py-5 text-xl rounded-2xl"
            >
              <Bot className="w-6 h-6 mr-3" />
              Start AI Chat
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
            {!isConnected && (
              <Button
                onClick={() => setShowConnectionModal(true)}
                variant="outline"
                size="lg"
                className="border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 px-10 py-5 text-xl rounded-2xl"
              >
                <Wallet className="w-6 h-6 mr-3" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">What You Can Do</h3>
            <p className="text-xl text-gray-400">Simple and powerful Web3 AI assistance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-gray-900/80 border-gray-800 hover:border-gray-700 cursor-pointer transition-all duration-300 hover:scale-105">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-4">AI Assistant</h4>
                <p className="text-gray-400 text-lg">Get intelligent help with your Web3 questions and tasks</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 border-gray-800 hover:border-gray-700 cursor-pointer transition-all duration-300 hover:scale-105">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-4">Wallet Integration</h4>
                <p className="text-gray-400 text-lg">Connect your Sei wallet for personalized assistance</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
