"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/contexts/wallet/wallet-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Wallet, Send, User, Sparkles, Mic, MicOff, Stars, Brain, ExternalLink } from "lucide-react"
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  liquidityAction?: {
    pair: string
    dex: string
    fee: number
    minPrice: number
    maxPrice: number
    amount0?: string
    amount1?: string
  }
}

export function ChatInterface() {
  const { isConnected, setShowConnectionModal } = useWallet()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Speech recognition setup
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition()

  useEffect(() => {
    if (!listening && transcript) {
      setInputValue(transcript)
    }
  }, [listening, transcript])

  const startListening = () => {
    resetTranscript()
    SpeechRecognition.startListening({ continuous: false, language: "en-US" })
  }

  const stopListening = () => {
    SpeechRecognition.stopListening()
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    if (isConnected && messages.length === 0) {
      const welcomeMessage: Message = {
        id: "welcome",
        type: "ai",
        content:
          "Welcome to SeiMind! I'm your AI-powered Web3 intelligence assistant. I can help you navigate the blockchain world, answer questions about cryptocurrencies, DeFi, and provide insights into the Sei ecosystem. I can also help you set up liquidity positions with optimal parameters. How can I assist you today?",
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [isConnected, messages.length])

  const handleLiquidityAction = (liquidityAction: Message["liquidityAction"]) => {
    if (!liquidityAction) return

    const params = new URLSearchParams({
      pair: liquidityAction.pair,
      dex: liquidityAction.dex,
      fee: liquidityAction.fee.toString(),
      minPrice: liquidityAction.minPrice.toString(),
      maxPrice: liquidityAction.maxPrice.toString(),
      from: "chat",
    })

    if (liquidityAction.amount0) params.set("amount0", liquidityAction.amount0)
    if (liquidityAction.amount1) params.set("amount1", liquidityAction.amount1)

    router.push(`/liquidity?${params.toString()}`)
  }

  const generateAIResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase()

    if (input.includes("hello") || input.includes("hi")) {
      return {
        id: Date.now().toString(),
        type: "ai",
        content: "Hello! I'm SeiMind, your AI companion for Web3 intelligence. What would you like to explore today?",
        timestamp: new Date(),
      }
    }

    if (input.includes("liquidity") || input.includes("provide liquidity") || input.includes("lp")) {
      return {
        id: Date.now().toString(),
        type: "ai",
        content:
          "🌊 I can help you set up a liquidity position! Based on current market conditions, I recommend:\n\n• **SEI/USDC pair** on Sailor V2\n• **0.3% fee tier** (highest volume)\n• **Price range**: $0.008 - $0.015 (±25% from current)\n• **Estimated APR**: 12.5%\n\nWould you like me to set this up for you with these optimal parameters?",
        timestamp: new Date(),
        liquidityAction: {
          pair: "SEI-USDC",
          dex: "sailor-v2",
          fee: 0.3,
          minPrice: 0.008,
          maxPrice: 0.015,
        },
      }
    }

    if (input.includes("sei") && input.includes("usdc")) {
      return {
        id: Date.now().toString(),
        type: "ai",
        content:
          "📊 SEI/USDC is one of the most liquid pairs on Sei Network! Here's what I recommend:\n\n• **Current Price**: $0.0105\n• **24h Volume**: $3.8M\n• **Best DEX**: Sailor V2 (lowest slippage)\n• **Optimal Fee Tier**: 0.3%\n• **Suggested Range**: $0.009 - $0.013\n\nThis range captures 80% of recent price action. Ready to provide liquidity?",
        timestamp: new Date(),
        liquidityAction: {
          pair: "SEI-USDC",
          dex: "sailor-v2",
          fee: 0.3,
          minPrice: 0.009,
          maxPrice: 0.013,
        },
      }
    }

    if (input.includes("defi") || input.includes("yield") || input.includes("farming")) {
      return {
        id: Date.now().toString(),
        type: "ai",
        content:
          "🌾 Great DeFi opportunities on Sei right now:\n\n• **Liquidity Providing**: 8-15% APR\n• **SEI Staking**: 8.5% APR (Low risk)\n• **Lending**: 6.8% APR\n\nFor liquidity providing, I recommend starting with SEI/USDC - it's stable and profitable. Want me to set up an optimal position?",
        timestamp: new Date(),
        liquidityAction: {
          pair: "SEI-USDC",
          dex: "sailor-v2",
          fee: 0.3,
          minPrice: 0.008,
          maxPrice: 0.015,
        },
      }
    }

    // Default response
    return {
      id: Date.now().toString(),
      type: "ai",
      content:
        "🤔 I understand you're asking about Web3 and DeFi. I can help you with:\n\n• 📊 Market analysis and insights\n• 🌊 Liquidity provision strategies\n• 🔄 Token swaps and trading\n• 🌾 DeFi opportunities and staking\n• 📈 Portfolio optimization\n\nCould you be more specific about what you'd like to know or do?",
      timestamp: new Date(),
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim() || !isConnected) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    const aiResponse = generateAIResponse(userMessage.content)
    setMessages((prev) => [...prev, aiResponse])
    setIsTyping(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!browserSupportsSpeechRecognition) {
    return <p className="text-red-500 text-center">Browser doesn't support speech recognition.</p>
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-8 max-w-2xl">
          {/* SeiMind Logo */}
          <div className="relative group">
            <div className="w-32 h-32 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-cyan-500/25">
              <svg viewBox="0 0 24 24" className="w-16 h-16 text-white animate-pulse" fill="currentColor">
                <path d="M12 2C10.5 2 9.2 2.8 8.5 4C7.8 2.8 6.5 2 5 2C3.3 2 2 3.3 2 5C2 6.5 2.8 7.8 4 8.5C2.8 9.2 2 10.5 2 12C2 13.5 2.8 14.8 4 15.5C2.8 16.2 2 17.5 2 19C2 20.7 3.3 22 5 22C6.5 22 7.8 21.2 8.5 20C9.2 21.2 10.5 22 12 22C13.5 22 14.8 21.2 15.5 20C16.2 21.2 17.5 22 19 22C20.7 22 22 20.7 22 19C22 17.5 21.2 16.2 20 15.5C21.2 14.8 22 13.5 22 12C22 10.5 21.2 9.2 20 8.5C21.2 7.8 22 6.5 22 5C22 3.3 20.7 2 19 2C17.5 2 16.2 2.8 15.5 4C14.8 2.8 13.5 2 12 2M12 6C13.1 6 14 6.9 14 8S13.1 10 12 10 10 9.1 10 8 10.9 6 12 6M8 10C9.1 10 10 10.9 10 12S9.1 14 8 14 6 13.1 6 12 6.9 10 8 10M16 10C17.1 10 18 10.9 18 12S17.1 14 16 14 14 13.1 14 12 14.9 10 16 10M12 14C13.1 14 14 14.9 14 16S13.1 18 12 18 10 17.1 10 16 10.9 14 12 14Z" />
              </svg>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full opacity-20 blur-2xl animate-pulse"></div>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Welcome to SeiMind
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              Your AI-powered Web3 intelligence companion. Connect your wallet to unlock personalized insights, smart
              analysis, and expert guidance for your blockchain journey.
            </p>
          </div>

          <Button
            onClick={() => setShowConnectionModal(true)}
            size="lg"
            className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white px-12 py-4 text-xl rounded-xl shadow-2xl shadow-cyan-500/25 hover:scale-105 transition-all duration-300"
          >
            <Wallet className="w-6 h-6 mr-3" />
            Connect Wallet to Start
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-gray-800/50 p-6 bg-gray-950/80 backdrop-blur-xl">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div className="w-14 h-14 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/25">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
                  <path d="M12 2C10.5 2 9.2 2.8 8.5 4C7.8 2.8 6.5 2 5 2C3.3 2 2 3.3 2 5C2 6.5 2.8 7.8 4 8.5C2.8 9.2 2 10.5 2 12C2 13.5 2.8 14.8 4 15.5C2.8 16.2 2 17.5 2 19C2 20.7 3.3 22 5 22C6.5 22 7.8 21.2 8.5 20C9.2 21.2 10.5 22 12 22C13.5 22 14.8 21.2 15.5 20C16.2 21.2 17.5 22 19 22C20.7 22 22 20.7 22 19C22 17.5 21.2 16.2 20 15.5C21.2 14.8 22 13.5 22 12C22 10.5 21.2 9.2 20 8.5C21.2 7.8 22 6.5 22 5C22 3.3 20.7 2 19 2C17.5 2 16.2 2.8 15.5 4C14.8 2.8 13.5 2 12 2M12 6C13.1 6 14 6.9 14 8S13.1 10 12 10 10 9.1 10 8 10.9 6 12 6M8 10C9.1 10 10 10.9 10 12S9.1 14 8 14 6 13.1 6 12 6.9 10 8 10M16 10C17.1 10 18 10.9 18 12S17.1 14 16 14 14 13.1 14 12 14.9 10 16 10M12 14C13.1 14 14 14.9 14 16S13.1 18 12 18 10 17.1 10 16 10.9 14 12 14Z" />
                </svg>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl opacity-20 blur-lg group-hover:opacity-30 transition-opacity duration-300"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                SeiMind AI
              </h1>
              <p className="text-sm text-gray-400 flex items-center">
                <Brain className="w-3 h-3 mr-1 text-cyan-400" />
                Your Web3 Intelligence Partner
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="relative z-10 flex-1 overflow-hidden">
        <ScrollArea className="h-full p-6">
          <div className="space-y-8 max-w-4xl mx-auto pb-6">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-4 duration-500`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`flex items-start space-x-4 max-w-[85%] ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${message.type === "user"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 shadow-purple-500/25"
                        : "bg-gradient-to-r from-cyan-500 to-blue-500 shadow-cyan-500/25"
                      }`}
                  >
                    {message.type === "user" ? (
                      <User className="w-6 h-6 text-white" />
                    ) : (
                      <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                        <path d="M12 2C10.5 2 9.2 2.8 8.5 4C7.8 2.8 6.5 2 5 2C3.3 2 2 3.3 2 5C2 6.5 2.8 7.8 4 8.5C2.8 9.2 2 10.5 2 12C2 13.5 2.8 14.8 4 15.5C2.8 16.2 2 17.5 2 19C2 20.7 3.3 22 5 22C6.5 22 7.8 21.2 8.5 20C9.2 21.2 10.5 22 12 22C13.5 22 14.8 21.2 15.5 20C16.2 21.2 17.5 22 19 22C20.7 22 22 20.7 22 19C22 17.5 21.2 16.2 20 15.5C21.2 14.8 22 13.5 22 12C22 10.5 21.2 9.2 20 8.5C21.2 7.8 22 6.5 22 5C22 3.3 20.7 2 19 2C17.5 2 16.2 2.8 15.5 4C14.8 2.8 13.5 2 12 2M12 6C13.1 6 14 6.9 14 8S13.1 10 12 10 10 9.1 10 8 10.9 6 12 6M8 10C9.1 10 10 10.9 10 12S9.1 14 8 14 6 13.1 6 12 6.9 10 8 10M16 10C17.1 10 18 10.9 18 12S17.1 14 16 14 14 13.1 14 12 14.9 10 16 10M12 14C13.1 14 14 14.9 14 16S13.1 18 12 18 10 17.1 10 16 10.9 14 12 14Z" />
                      </svg>
                    )}
                  </div>
                  <div
                    className={`rounded-3xl p-6 backdrop-blur-sm border shadow-xl ${message.type === "user"
                        ? "bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white border-purple-500/30 shadow-purple-500/20"
                        : "bg-gray-800/90 text-gray-100 border-gray-700/50 shadow-gray-900/50"
                      }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed text-base">{message.content}</p>

                    {/* Liquidity Action Button */}
                    {message.liquidityAction && (
                      <div className="mt-4 pt-4 border-t border-gray-600/30">
                        <Button
                          onClick={() => handleLiquidityAction(message.liquidityAction)}
                          className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white text-sm px-4 py-2 rounded-lg shadow-lg hover:scale-105 transition-all duration-300"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Set Up Liquidity Position
                        </Button>
                      </div>
                    )}

                    <div className="text-xs text-gray-400 mt-4 flex items-center">
                      <Stars className="w-3 h-3 mr-1" />
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                      <path d="M12 2C10.5 2 9.2 2.8 8.5 4C7.8 2.8 6.5 2 5 2C3.3 2 2 3.3 2 5C2 6.5 2.8 7.8 4 8.5C2.8 9.2 2 10.5 2 12C2 13.5 2.8 14.8 4 15.5C2.8 16.2 2 17.5 2 19C2 20.7 3.3 22 5 22C6.5 22 7.8 21.2 8.5 20C9.2 21.2 10.5 22 12 22C13.5 22 14.8 21.2 15.5 20C16.2 21.2 17.5 22 19 22C20.7 22 22 20.7 22 19C22 17.5 21.2 16.2 20 15.5C21.2 14.8 22 13.5 22 12C22 10.5 21.2 9.2 20 8.5C21.2 7.8 22 6.5 22 5C22 3.3 20.7 2 19 2C17.5 2 16.2 2.8 15.5 4C14.8 2.8 13.5 2 12 2M12 6C13.1 6 14 6.9 14 8S13.1 10 12 10 10 9.1 10 8 10.9 6 12 6M8 10C9.1 10 10 10.9 10 12S9.1 14 8 14 6 13.1 6 12 6.9 10 8 10M16 10C17.1 10 18 10.9 18 12S17.1 14 16 14 14 13.1 14 12 14.9 10 16 10M12 14C13.1 14 14 14.9 14 16S13.1 18 12 18 10 17.1 10 16 10.9 14 12 14Z" />
                    </svg>
                  </div>
                  <div className="bg-gray-800/90 backdrop-blur-sm rounded-3xl p-6 border border-gray-700/50 shadow-xl shadow-gray-900/50">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" />
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-100" />
                      <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="relative z-10 border-t border-gray-800/50 p-6 bg-gray-950/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-4">
            <div className="flex-1 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-focus-within:blur-2xl transition-all duration-300"></div>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask SeiMind about Web3, blockchain, or Sei network..."
                className="relative bg-gray-800/80 backdrop-blur-sm border-gray-700/50 text-white placeholder-gray-400 py-6 text-base rounded-2xl pr-16 shadow-2xl shadow-gray-900/50 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
              />

              {/* Enhanced Mic Button */}
              <Button
                onClick={listening ? stopListening : startListening}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-12 w-12 p-0 rounded-full transition-all duration-500 border-0 shadow-2xl ${listening
                    ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-red-500/50 animate-pulse scale-110"
                    : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-cyan-500/50 hover:scale-110"
                  }`}
              >
                <div className="relative">
                  {listening ? (
                    <MicOff className="w-6 h-6 text-white animate-pulse" />
                  ) : (
                    <Mic className="w-6 h-6 text-white" />
                  )}
                  {listening && <div className="absolute inset-0 rounded-full bg-red-400/30 animate-ping"></div>}
                </div>
              </Button>
            </div>

            <Button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 text-white border-0 px-8 py-6 rounded-2xl shadow-2xl shadow-cyan-500/50 hover:scale-105 transition-all duration-300 disabled:hover:scale-100"
            >
              <Send className="w-6 h-6" />
            </Button>
          </div>

          {listening && (
            <div className="mt-6 flex items-center justify-center space-x-4 animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-3 h-3 bg-red-400 rounded-full animate-bounce delay-200"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                  <Mic className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg text-red-400 font-semibold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                  SeiMind is listening...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
