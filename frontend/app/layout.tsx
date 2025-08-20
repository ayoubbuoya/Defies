// app/layout.tsx

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { WalletProvider } from "@/contexts/wallet/WalletProvider"
import { WalletConnectionModal } from "@/components/wallet-connection-modal"
import { PwaInstaller } from "@/components/pwa-installer";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sei AI Nexus - Web3 Intelligence Hub",
  description: "AI-powered Web3 assistant for Sei blockchain",
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
           <PwaInstaller />
          {children}
          <WalletConnectionModal />
        </WalletProvider>
      </body>
    </html>
  )
}
