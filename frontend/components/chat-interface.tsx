"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useWallet } from "@/contexts/wallet/wallet-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Wallet, Send, Bot, User, Sparkles, Mic, MicOff, Stars, Zap } from "lucide-react"
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
}

export function ChatInterface() {
  const { isConnected, setShowConnectionModal } = useWallet()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Speech recognition setup
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition()

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
          "Welcome to Sei AI Nexus! I'm your AI assistant for Web3. I can help answer questions about blockchain, cryptocurrencies, and provide general guidance. How can I assist you today?",
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [isConnected, messages.length])

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()
    if (input.includes("hello") || input.includes("hi")) {
      return "Hello! I'm here to help you with Web3 and blockchain questions. What would you like to know?"
    }
    if (input.includes("sei") || input.includes("blockchain")) {
      return "Sei is a high-performance blockchain optimized for trading. Would you like to know more?"
    }
    if (input.includes("wallet")) {
      return "Wallets let you sign transactions securely. You're connected — great start!"
    }
    if (input.includes("defi") || input.includes("finance")) {
      return "DeFi gives you access to trading, staking, and lending without banks."
    }
    if (input.includes("help")) {
      return "Ask about:\n• Blockchain basics\n• Sei network\n• DeFi\n• Wallets"
    }
    return "That's an interesting question! Let me know if you'd like to learn more."
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

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      type: "ai",
      content: generateAIResponse(userMessage.content),
      timestamp: new Date(),
    }

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
          <div className="w-32 h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-16 h-16 text-white animate-pulse" />
          </div>
          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-white">Welcome to SeiMind</h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              Your intelligent Web3 companion. Connect your wallet to start chatting with our AI assistant and get help
              with blockchain and cryptocurrency questions.
            </p>
          </div>
          <Button
            onClick={() => setShowConnectionModal(true)}
            size="lg"
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-12 py-4 text-xl rounded-xl"
          >
            <Wallet className="w-6 h-6 mr-3" />
            Connect Wallet to Start Chatting
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-gray-800/50 p-6 bg-gray-950/80 backdrop-blur-xl">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
                <Bot className="w-7 h-7 text-white" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI Assistant
              </h1>
              <p className="text-sm text-gray-400 flex items-center">
                <Zap className="w-3 h-3 mr-1 text-yellow-400" />
                Ready to help with your Web3 questions
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
                      : "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-blue-500/25"
                      }`}
                  >
                    {message.type === "user" ? (
                      <User className="w-6 h-6 text-white" />
                    ) : (
                      <Bot className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div
                    className={`rounded-3xl p-6 backdrop-blur-sm border shadow-xl ${message.type === "user"
                      ? "bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white border-purple-500/30 shadow-purple-500/20"
                      : "bg-gray-800/90 text-gray-100 border-gray-700/50 shadow-gray-900/50"
                      }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed text-base">{message.content}</p>
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
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Bot className="w-6 h-6 text-white" />
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
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="relative z-10 border-t border-gray-800/50 p-6 bg-gray-950/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-4">
            <div className="flex-1 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-focus-within:blur-2xl transition-all duration-300"></div>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about Web3, blockchain, or Sei network..."
                className="relative bg-gray-800/80 backdrop-blur-sm border-gray-700/50 text-white placeholder-gray-400 py-6 text-base rounded-2xl pr-16 shadow-2xl shadow-gray-900/50 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
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
              disabled={!inputValue.trim()}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 text-white border-0 px-8 py-6 rounded-2xl shadow-2xl shadow-blue-500/50 hover:scale-105 transition-all duration-300 disabled:hover:scale-100"
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
                  Listening for your voice...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
