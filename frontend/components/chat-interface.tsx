"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/contexts/wallet/WalletProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Wallet,
  Send,
  User,
  Mic,
  MicOff,
  Stars,
  ExternalLink,
  Brain,

} from "lucide-react"
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  responseType?: "STANDARD" | "POOL_RECOMMENDATION"
  poolRecommendation?: {
    pool_id: string
    min_price: number
    max_price: number
  }
}

// API Response Types
interface StandardResponse {
  type: "STANDARD"
  message: string
}

interface PoolRecommendationResponse {
  type: "POOL_RECOMMENDATION"
  message: string
  pool_id: string
  min_price: number
  max_price: number
}

type AIResponse = StandardResponse | PoolRecommendationResponse

export function ChatInterface() {
  const { isConnected, setShowConnectionModal, address } = useWallet()
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
          "Welcome to Defies! I'm your AI-powered DeFi intelligence assistant. I can help you navigate the blockchain world, answer questions about cryptocurrencies, DeFi, and provide insights into the SEI ecosystem. I can also recommend optimal liquidity pools based on current market conditions. How can I assist you today?",
        timestamp: new Date(),
        responseType: "STANDARD",
      }
      setMessages([welcomeMessage])
    }
  }, [isConnected, messages.length])

  // API call to your backend
  const callAIAgent = async (prompt: string): Promise<AIResponse> => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const response = await fetch(`${backendUrl}/agent/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          address: address
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: AIResponse = await response.json()
      return data
    } catch (error) {
      console.error('Error calling AI agent:', error)
      // Return fallback response
      return {
        type: "STANDARD",
        message: "I'm sorry, I'm having trouble connecting to my AI services right now. Please try again in a moment."
      }
    }
  }

  const handlePoolRecommendation = (poolData: { pool_id: string, min_price: number, max_price: number }) => {
    const params = new URLSearchParams({
      pool: poolData.pool_id,
      minPrice: poolData.min_price.toString(),
      maxPrice: poolData.max_price.toString(),
      from: "chat",
    })

    router.push(`/liquidity?${params.toString()}`)
  }

  const handleSend = async () => {
    if (!inputValue.trim() || !isConnected) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
      responseType: "STANDARD",
    }

    setMessages((prev) => [...prev, userMessage])
    const currentPrompt = inputValue.trim()
    setInputValue("")
    setIsTyping(true)

    try {
      // Call your AI agent
      const aiResponse = await callAIAgent(currentPrompt)

      let aiMessage: Message

      if (aiResponse.type === "POOL_RECOMMENDATION") {
        aiMessage = {
          id: Date.now().toString(),
          type: "ai",
          content: aiResponse.message,
          timestamp: new Date(),
          responseType: "POOL_RECOMMENDATION",
          poolRecommendation: {
            pool_id: aiResponse.pool_id,
            min_price: aiResponse.min_price,
            max_price: aiResponse.max_price
          }
        }
      } else {
        aiMessage = {
          id: Date.now().toString(),
          type: "ai",
          content: aiResponse.message,
          timestamp: new Date(),
          responseType: "STANDARD",
        }
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      // Handle error case
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: "ai",
        content: "I apologize, but I'm experiencing technical difficulties right now. Please try your question again.",
        timestamp: new Date(),
        responseType: "STANDARD",
      }
      setMessages((prev) => [...prev, errorMessage])
    }

    setIsTyping(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const renderPoolRecommendation = (message: Message) => {
    if (!message.poolRecommendation) return null

    return (
      <div className="mt-4 pt-4 border-t border-gray-600/30">
        <div className="bg-gray-800/30 rounded-lg p-4 mb-3">
          <h4 className="text-sm font-semibold text-blue-400 mb-2">Pool Details:</h4>
          <div className="text-sm text-gray-300 space-y-1">
            <div>Pool ID: <span className="font-mono text-xs">{message.poolRecommendation.pool_id}</span></div>
            <div>Price Range: {message.poolRecommendation.min_price} - {message.poolRecommendation.max_price}</div>
          </div>
        </div>
        <Button
          onClick={() => handlePoolRecommendation(message.poolRecommendation!)}
          className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white text-sm px-4 py-2 rounded-lg shadow-lg hover:scale-105 transition-all duration-300"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Open Liquidity Pool
        </Button>
      </div>
    )
  }

  if (!browserSupportsSpeechRecognition) {
    return <p className="text-red-500 text-center">Browser doesn't support speech recognition.</p>
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-950">
        {/* Same background as home page */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,119,198,0.1),transparent_50%)]" />

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
          <div className="text-center space-y-8 max-w-2xl">

            {/* Logo */}
            <div className="relative group">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/25">
                <Brain className="w-16 h-16 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-20 blur-2xl animate-pulse"></div>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
                Welcome to Defies
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
                Your AI-powered DeFi intelligence companion. Connect your wallet to unlock
                <span className="text-blue-400 font-semibold"> intelligent recommendations</span> for
                <span className="text-purple-400 font-semibold"> concentrated liquidity positions</span> powered by
                <span className="text-pink-400 font-semibold"> real blockchain data</span>.
              </p>
            </div>

            <Button
              onClick={() => setShowConnectionModal(true)}
              size="lg"
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 px-8 py-4 text-lg font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
            >
              <Wallet className="w-5 h-5 mr-2" />
              Connect Wallet to Start
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Fixed full-page background - matches home page exactly */}
      <div className="fixed inset-0 bg-gray-950">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,119,198,0.1),transparent_50%)]" />
      </div>

      {/* Chat content */}
      <div className="relative z-10 min-h-screen">
        {/* Chat Messages Area */}
        <div className="min-h-screen pb-32">
          {/* Empty State when no messages */}
          {messages.length === 0 && (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-6">
              <div className="text-center space-y-6 max-w-2xl">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Start Your DeFi Journey
                </h2>
                <p className="text-xl text-gray-400 leading-relaxed">
                  Ask me anything about DeFi, liquidity pools, trading strategies, or the SEI ecosystem.
                  I'm here to help you navigate the blockchain world with
                  <span className="text-blue-400"> AI-powered insights</span>.
                </p>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div className="p-6 pt-12">
              <div className="space-y-8 max-w-4xl mx-auto">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"
                      } animate-in slide-in-from-bottom-4 duration-500`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div
                      className={`flex items-start space-x-4 max-w-[85%] ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""
                        }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${message.type === "user"
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 shadow-purple-500/25"
                          : "bg-gradient-to-r from-blue-500 to-purple-500 shadow-blue-500/25"
                          }`}
                      >
                        {message.type === "user" ? (
                          <User className="w-6 h-6 text-white" />
                        ) : (
                          <Brain className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div
                        className={`rounded-3xl p-6 backdrop-blur-sm border shadow-xl ${message.type === "user"
                          ? "bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white border-purple-500/30 shadow-purple-500/20"
                          : "bg-gray-800/90 text-gray-100 border-gray-700/50 shadow-gray-900/50"
                          }`}
                      >
                        <p className="whitespace-pre-line leading-relaxed text-base">{message.content}</p>

                        {/* Render Pool Recommendation if responseType is "POOL_RECOMMENDATION" */}
                        {message.responseType === "POOL_RECOMMENDATION" && renderPoolRecommendation(message)}

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
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div className="bg-gray-800/90 backdrop-blur-sm rounded-3xl p-6 border border-gray-700/50 shadow-xl shadow-gray-900/50">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" />
                          <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-100" />
                          <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Fixed Input Area at Bottom of Viewport */}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800/50 bg-gray-950/95 backdrop-blur-xl">
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex space-x-4">
                <div className="flex-1 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-focus-within:blur-2xl transition-all duration-300"></div>
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask Defies about pools, prices, or DeFi opportunities..."
                    className="relative bg-gray-800/80 backdrop-blur-sm border-gray-700/50 text-white placeholder-gray-400 py-6 text-base rounded-2xl pr-16 shadow-2xl shadow-gray-900/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  />

                  {/* Enhanced Mic Button */}
                  <Button
                    onClick={listening ? stopListening : startListening}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-12 w-12 p-0 rounded-full transition-all duration-500 border-0 shadow-2xl ${listening
                      ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-red-500/50 animate-pulse scale-110"
                      : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-blue-500/50 hover:scale-110"
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
                  disabled={!inputValue.trim() || isTyping}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 text-white border-0 px-8 py-6 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
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
                      Defies is listening...
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}