"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  transactionProposal?: {
    type: string
    from: string
    to: string
    amount: string
    token: string
    estimatedReceived?: string
  }
}

interface ChatSession {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messageCount: number
  isActive: boolean
  messages: Message[]
}

interface ChatContextType {
  sessions: ChatSession[]
  currentSession: ChatSession | null
  messages: Message[]
  isTyping: boolean
  hasHistory: boolean
  createNewSession: (title?: string) => string
  switchToSession: (sessionId: string) => void
  deleteSession: (sessionId: string) => void
  updateSessionTitle: (sessionId: string, title: string) => void
  sendMessage: (content: string) => Promise<void>
  confirmTransaction: (messageId: string) => Promise<void>
  cancelTransaction: (messageId: string) => void
  loadChatHistory: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [hasHistory, setHasHistory] = useState(false)

  // Load sessions from localStorage on mount
  useEffect(() => {
    loadChatHistory()
  }, [])

  // Update messages when current session changes
  useEffect(() => {
    if (currentSession) {
      setMessages(currentSession.messages)
    } else {
      setMessages([])
    }
  }, [currentSession])

  const loadChatHistory = () => {
    const savedSessions = localStorage.getItem("sei-ai-chat-sessions")
    const activeSessionId = localStorage.getItem("sei-ai-active-session")

    if (savedSessions) {
      const parsedSessions: ChatSession[] = JSON.parse(savedSessions).map((session: any) => ({
        ...session,
        timestamp: new Date(session.timestamp),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }))

      setSessions(parsedSessions)
      setHasHistory(true)

      // Set active session
      if (activeSessionId) {
        const activeSession = parsedSessions.find((s) => s.id === activeSessionId)
        if (activeSession) {
          setCurrentSession(activeSession)
        }
      } else if (parsedSessions.length > 0) {
        // Set first session as active if no active session saved
        setCurrentSession(parsedSessions[0])
      }
    } else {
      // Create initial welcome session
      const welcomeSession = createInitialSession()
      setSessions([welcomeSession])
      setCurrentSession(welcomeSession)
    }
  }

  const createInitialSession = (): ChatSession => {
    const welcomeMessage: Message = {
      id: "welcome",
      type: "ai",
      content:
        "Welcome to Sei AI Nexus! I'm your AI assistant for managing your Sei blockchain assets. I can help you check balances, analyze your portfolio, execute transactions, and answer questions about DeFi opportunities. How can I assist you today?",
      timestamp: new Date(),
    }

    return {
      id: "session_welcome",
      title: "Welcome Chat",
      lastMessage: welcomeMessage.content,
      timestamp: new Date(),
      messageCount: 1,
      isActive: true,
      messages: [welcomeMessage],
    }
  }

  const saveSessionsToStorage = (updatedSessions: ChatSession[], activeSessionId?: string) => {
    localStorage.setItem("sei-ai-chat-sessions", JSON.stringify(updatedSessions))
    if (activeSessionId) {
      localStorage.setItem("sei-ai-active-session", activeSessionId)
    }
    setHasHistory(true)
  }

  const createNewSession = (title?: string): string => {
    const newSessionId = `session_${Date.now()}`
    const newSession: ChatSession = {
      id: newSessionId,
      title: title || "New Conversation",
      lastMessage: "",
      timestamp: new Date(),
      messageCount: 0,
      isActive: true,
      messages: [],
    }

    const updatedSessions = sessions.map((s) => ({ ...s, isActive: false })).concat(newSession)
    setSessions(updatedSessions)
    setCurrentSession(newSession)
    saveSessionsToStorage(updatedSessions, newSessionId)

    return newSessionId
  }

  const switchToSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId)
    if (session) {
      // Update active status
      const updatedSessions = sessions.map((s) => ({
        ...s,
        isActive: s.id === sessionId,
      }))

      setSessions(updatedSessions)
      setCurrentSession(session)
      saveSessionsToStorage(updatedSessions, sessionId)
    }
  }

  const deleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter((s) => s.id !== sessionId)
    setSessions(updatedSessions)

    // If deleting current session, switch to another one
    if (currentSession?.id === sessionId) {
      if (updatedSessions.length > 0) {
        const newActiveSession = updatedSessions[0]
        setCurrentSession(newActiveSession)
        saveSessionsToStorage(
          updatedSessions.map((s) => ({
            ...s,
            isActive: s.id === newActiveSession.id,
          })),
          newActiveSession.id,
        )
      } else {
        // Create new session if no sessions left
        const newSessionId = createNewSession("New Chat")
        return
      }
    } else {
      saveSessionsToStorage(updatedSessions)
    }
  }

  const updateSessionTitle = (sessionId: string, title: string) => {
    const updatedSessions = sessions.map((s) => (s.id === sessionId ? { ...s, title } : s))
    setSessions(updatedSessions)

    if (currentSession?.id === sessionId) {
      setCurrentSession({ ...currentSession, title })
    }

    saveSessionsToStorage(updatedSessions, currentSession?.id)
  }

  const updateCurrentSession = (updatedMessages: Message[]) => {
    if (!currentSession) return

    const lastMessage = updatedMessages[updatedMessages.length - 1]
    const updatedSession: ChatSession = {
      ...currentSession,
      messages: updatedMessages,
      lastMessage: lastMessage?.content || "",
      messageCount: updatedMessages.length,
      timestamp: new Date(),
    }

    const updatedSessions = sessions.map((s) => (s.id === currentSession.id ? updatedSession : s))

    setSessions(updatedSessions)
    setCurrentSession(updatedSession)
    setMessages(updatedMessages)
    saveSessionsToStorage(updatedSessions, currentSession.id)
  }

  const sendMessage = async (content: string) => {
    if (!currentSession) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    }

    const newMessages = [...messages, userMessage]
    updateCurrentSession(newMessages)
    setIsTyping(true)

    // Simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate AI response based on content
    const aiResponse = generateAIResponse(content)
    const finalMessages = [...newMessages, aiResponse]

    updateCurrentSession(finalMessages)
    setIsTyping(false)

    // Auto-update session title based on first user message
    if (currentSession.messageCount === 0 && content.length > 0) {
      const autoTitle = content.length > 30 ? content.substring(0, 30) + "..." : content
      updateSessionTitle(currentSession.id, autoTitle)
    }
  }

  const confirmTransaction = async (messageId: string) => {
    if (!currentSession) return

    setIsTyping(true)

    // Simulate transaction processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const confirmationMessage: Message = {
      id: Date.now().toString(),
      type: "ai",
      content:
        "🎉 Transaction confirmed! Hash: 0x1234567890abcdef... Your transaction has been submitted to the Sei network and should be confirmed shortly. You can track its progress on the Sei explorer.",
      timestamp: new Date(),
    }

    const newMessages = [...messages, confirmationMessage]
    updateCurrentSession(newMessages)
    setIsTyping(false)
  }

  const cancelTransaction = (messageId: string) => {
    if (!currentSession) return

    const cancelMessage: Message = {
      id: Date.now().toString(),
      type: "ai",
      content:
        "❌ Transaction cancelled. No changes have been made to your wallet. Is there anything else I can help you with?",
      timestamp: new Date(),
    }

    const newMessages = [...messages, cancelMessage]
    updateCurrentSession(newMessages)
  }

  return (
    <ChatContext.Provider
      value={{
        sessions,
        currentSession,
        messages,
        isTyping,
        hasHistory,
        createNewSession,
        switchToSession,
        deleteSession,
        updateSessionTitle,
        sendMessage,
        confirmTransaction,
        cancelTransaction,
        loadChatHistory,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

function generateAIResponse(userInput: string): Message {
  const input = userInput.toLowerCase()

  if (input.includes("balance") || input.includes("portfolio")) {
    return {
      id: Date.now().toString(),
      type: "ai",
      content:
        "💰 Your current portfolio balance is 1,234.56 SEI ($987.65). You also hold:\n\n• 500 USDC ($500.00)\n• 0.5 WETH ($1,200.00)\n• 1,000 ATOM ($8,500.00)\n\n📈 Your portfolio has increased by 12.5% this week! Would you like me to show you a detailed breakdown or suggest some optimization strategies?",
      timestamp: new Date(),
    }
  }

  if (input.includes("swap") || input.includes("trade")) {
    return {
      id: Date.now().toString(),
      type: "ai",
      content:
        "🔄 I can help you swap tokens! Based on current market conditions and liquidity, here's a suggested swap:",
      timestamp: new Date(),
      transactionProposal: {
        type: "swap",
        from: "100 SEI",
        to: "USDC",
        amount: "100",
        token: "SEI",
        estimatedReceived: "~85.2 USDC",
      },
    }
  }

  if (input.includes("nft")) {
    return {
      id: Date.now().toString(),
      type: "ai",
      content:
        '🖼️ I can see you have 3 NFTs in your wallet:\n\n• "Sei Punks #1234" - Floor: 150 SEI (+15% this week)\n• "Cosmos Cat #567" - Floor: 75 SEI (-5% this week)\n• "Sei Dragons #890" - Floor: 200 SEI (+25% this week)\n\nYour collection value has increased significantly! Would you like me to analyze market trends or help you list one for sale?',
      timestamp: new Date(),
    }
  }

  if (input.includes("defi") || input.includes("stake") || input.includes("yield")) {
    return {
      id: Date.now().toString(),
      type: "ai",
      content:
        "🌾 Great DeFi opportunities available on Sei right now:\n\n• **Sei Staking**: 8.5% APY (Low risk)\n• **SEI/USDC LP**: 12.3% APY (Medium risk)\n• **Lending Protocol**: 6.8% APY (Low risk)\n\nBased on your 1,234 SEI balance, I recommend staking 500 SEI for stable returns. This would earn you ~42.5 SEI annually. Would you like me to help you stake?",
      timestamp: new Date(),
    }
  }

  if (input.includes("meme") || input.includes("shib") || input.includes("doge")) {
    return {
      id: Date.now().toString(),
      type: "ai",
      content:
        "🚀 Meme coin analysis! I can see some interesting activity:\n\n• Recent meme coins on Sei are showing high volatility\n• Check the Meme Tracker tab for real-time price feeds\n• I can help you analyze any specific meme coin's inflows/outflows\n\nWhich meme coin are you interested in? I can provide detailed analytics and trading suggestions!",
      timestamp: new Date(),
    }
  }

  // Default response
  return {
    id: Date.now().toString(),
    type: "ai",
    content:
      "🤔 I understand you're asking about your crypto assets. I can help you with:\n\n• 📊 Portfolio analysis and insights\n• 🔄 Token swaps and trading\n• 🌾 DeFi opportunities and staking\n• 🖼️ NFT management and market analysis\n• 📈 Transaction history and patterns\n• 🚀 Meme coin tracking and alerts\n\nCould you be more specific about what you'd like to know or do?",
    timestamp: new Date(),
  }
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
