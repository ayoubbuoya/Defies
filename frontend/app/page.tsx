"use client"

import { useState } from "react"
import { WalletProvider } from "@/contexts/wallet/WalletProvider"
import { TopNavigation } from "@/components/top-navigation"
import { HomePage } from "@/components/home-page"
import { ChatInterface } from "@/components/chat-interface"
import { WalletConnectionModal } from "@/components/wallet-connection-modal"

export default function Home() {
  const [activeView, setActiveView] = useState("home")

  const renderContent = () => {
    switch (activeView) {
      case "home":
        return <HomePage setActiveView={setActiveView} />
      case "chat":
        return <ChatInterface />
      default:
        return <HomePage setActiveView={setActiveView} />
    }
  }

  return (
    <WalletProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900">
        <TopNavigation activeView={activeView} setActiveView={setActiveView} />
        <main className="container mx-auto px-6 py-8">{renderContent()}</main>
        <WalletConnectionModal />
      </div>
    </WalletProvider>
  )
}