"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  TrendingUp,
  Shield,
  Zap,
  MessageSquare,
  BarChart3,
  Droplets,
  Target,
  ArrowRight,
  Sparkles,
  Activity,
  DollarSign,
  PieChart,
  LineChart,
} from "lucide-react"

interface HomePageProps {
  setActiveView: (view: string) => void
}

export function HomePage({ setActiveView }: HomePageProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const features = [
    {
      id: "ai-chat",
      title: "AI-Powered Chat Assistant",
      description: "Get instant answers about DeFi, trading strategies, and blockchain analytics with our advanced AI.",
      icon: Brain,
      gradient: "from-blue-500 to-cyan-500",
      onClick: () => setActiveView("chat"),
    },
    {
      id: "liquidity-provider",
      title: "Smart Liquidity Management",
      description: "Optimize your liquidity positions with AI-driven insights and automated range suggestions.",
      icon: Droplets,
      gradient: "from-purple-500 to-pink-500",
      onClick: () => setActiveView("liquidity"),
    },
    {
      id: "concentrated-liquidity",
      title: "Concentrated Liquidity Advisor",
      description:
        "Get AI-powered advice on the best price ranges for your concentrated liquidity positions to maximize returns.",
      icon: Target,
      gradient: "from-green-500 to-emerald-500",
      onClick: () => setActiveView("liquidity"),
    },
    {
      id: "analytics",
      title: "Smart Analytics & Insights",
      description: "Advanced market analysis, portfolio optimization, and risk assessment powered by machine learning.",
      icon: BarChart3,
      gradient: "from-orange-500 to-red-500",
      onClick: () => setActiveView("chat"),
    },
    {
      id: "portfolio",
      title: "Portfolio Tracking",
      description: "Monitor your DeFi positions, track performance, and get personalized recommendations.",
      icon: PieChart,
      gradient: "from-indigo-500 to-purple-500",
      onClick: () => setActiveView("chat"),
    },
    {
      id: "market-insights",
      title: "Real-time Market Data",
      description: "Access live market data, price feeds, and trading signals across multiple DEXs and protocols.",
      icon: LineChart,
      gradient: "from-teal-500 to-blue-500",
      onClick: () => setActiveView("chat"),
    },
  ]

  const stats = [
    { label: "Active Users", value: "10K+", icon: Activity },
    { label: "Total Volume", value: "$50M+", icon: DollarSign },
    { label: "Protocols Supported", value: "25+", icon: Shield },
    { label: "AI Accuracy", value: "95%", icon: Brain },
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />

        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30 px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Web3 Intelligence
              </Badge>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
              The Future of
              <br />
              DeFi Intelligence
            </h1>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
              Harness the power of AI to optimize your DeFi strategies, manage liquidity positions, and make smarter
              trading decisions on the Sei blockchain.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => setActiveView("chat")}
                size="lg"
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 px-8 py-4 text-lg font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Start AI Chat
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <Button
                onClick={() => setActiveView("pools")}
                variant="outline"
                size="lg"
                className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg rounded-xl shadow-2xl shadow-blue-500/30 hover:scale-105 transition-all duration-300"
              >
                <Droplets className="w-5 h-5 mr-2" />
                Find your Pool
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 border-t border-gray-800/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              What You Can Do
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Discover powerful AI-driven tools designed to enhance your DeFi experience and maximize your returns
              through intelligent automation and insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card
                key={feature.id}
                className={`bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all duration-300 cursor-pointer group ${hoveredCard === feature.id ? "scale-105 shadow-2xl" : ""
                  }`}
                onMouseEnter={() => setHoveredCard(feature.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={feature.onClick}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center shadow-lg`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                        {feature.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    {feature.description}
                  </CardDescription>
                  <div className="mt-4 flex items-center text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Learn more
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to Get Started?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of DeFi users who are already using AI to optimize their strategies and maximize returns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setActiveView("chat")}
              size="lg"
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 px-8 py-4 text-lg font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
            >
              <Zap className="w-5 h-5 mr-2" />
              Get Started Now
            </Button>
            <Button
              onClick={() => setActiveView("liquidity")}
              variant="outline"
              size="lg"
              className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg rounded-xl shadow-2xl shadow-blue-500/30 hover:scale-105 transition-all duration-300"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Track Liquidity
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
