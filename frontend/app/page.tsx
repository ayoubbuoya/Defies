"use client"

import { useState } from "react"
import { TopNavigation } from "@/components/top-navigation"
import { HomePage } from "@/components/home-page"
import { ChatInterface } from "@/components/chat-interface"
import { EnhancedLiquidityProvider } from "@/components/enhanced-liquidity-provider"
import { Footer } from "@/components/footer"

export default function Page() {

  const [activeView, setActiveView] = useState("home")
  const renderActiveView = () => {
    switch (activeView) {
      case "home":
        return <HomePage setActiveView={setActiveView} />
      case "chat":
        return <ChatInterface />
      case "liquidity":
        return <EnhancedLiquidityProvider />
      default:
        return <HomePage setActiveView={setActiveView} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <TopNavigation activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1">{renderActiveView()}</main>
      {activeView === "home" && <Footer />}
    </div>
  )
}
