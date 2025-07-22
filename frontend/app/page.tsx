"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { TopNavigation } from "@/components/top-navigation"
import { HomePage } from "@/components/home-page"
import { ChatInterface } from "@/components/chat-interface"
import { EnhancedLiquidityProvider } from "@/components/enhanced-liquidity-provider"
import { Footer } from "@/components/footer"

export default function Page() {
  const searchParams = useSearchParams()
  const viewParam = searchParams.get("view")

  const [activeView, setActiveView] = useState("home")

  // Update active view on first load (or URL change)
  useEffect(() => {
    if (viewParam) {
      setActiveView(viewParam)
      document.getElementById(viewParam)?.scrollIntoView({ behavior: "smooth" })
    }
  }, [viewParam])

  const renderActiveView = () => {
    switch (activeView) {
      case "home":
        return <HomePage setActiveView={setActiveView} />
      case "chat":
        return <ChatInterface />
      case "pools":
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
