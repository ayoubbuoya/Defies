import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Footer } from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sei AI Nexus - Web3 Intelligence Hub",
  description: "AI-powered Web3 assistant for Sei blockchain",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-950`}>
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
