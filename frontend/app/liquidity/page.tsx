"use client"

import { Suspense } from "react"
import { TopNavigation } from "@/components/top-navigation"
import { EnhancedLiquidityProvider } from "@/components/enhanced-liquidity-provider"
import { useWallet } from "@/contexts/wallet/wallet-context"
import { Simple404 } from "@/components/not-connected-404"

function LiquidityPageContent() {
    const { isConnected } = useWallet()

    if (!isConnected) {
        return <Simple404 />
    }

    return <EnhancedLiquidityProvider />
}

export default function LiquidityPage() {
    return (
        <div className="min-h-screen bg-gray-950 flex flex-col">
            <TopNavigation activeView="liquidity" setActiveView={() => { }} />
            <main className="flex-1">
                <div className="container mx-auto px-6 py-8">
                    <Suspense
                        fallback={
                            <div className="flex items-center justify-center min-h-[400px]">
                                <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        }
                    >
                        <LiquidityPageContent />
                    </Suspense>
                </div>
            </main>
        </div>
    )
}
