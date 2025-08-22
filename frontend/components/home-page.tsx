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
  Layers,
  Cpu,
  Network,
  Bot,
  Rocket,
  Globe,
  ChevronDown,
  Star,
  Users,
  TrendingDown,
  Volume2,
  Lock,
  CheckCircle,
  ArrowUpRight,
  Database,
  Workflow,
  Lightbulb
} from "lucide-react"

interface HomePageProps {
  setActiveView: (view: string) => void
}

export function HomePage({ setActiveView }: HomePageProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const features = [
    {
      id: "ai-chat",
      title: "AI DeFi Assistant",
      description: "Ask questions about DeFi strategies, concentrated liquidity ranges, and get AI-powered insights based on real blockchain data from SEI ecosystem.",
      icon: Brain,
      gradient: "from-blue-500 to-cyan-500",
      onClick: () => setActiveView("chat"),
      capabilities: ["Natural Language DeFi Queries", "SEI Blockchain Integration", "Strategy Recommendations"],
      highlight: "🧠 AI-Powered"
    },
    {
      id: "sei-mcp",
      title: "SEI MCP Integration",
      description: "Direct integration with SEI's Model Context Protocol server, providing real-time access to blockchain data, balances, and transaction information.",
      icon: Network,
      gradient: "from-emerald-500 to-teal-500",
      onClick: () => setActiveView("chat"),
      capabilities: ["Real-time Blockchain Data", "Balance Checking", "Token Information"],
      highlight: "⚡ SEI Native"
    },
    {
      id: "concentrated-liquidity",
      title: "Liquidity Range Advisor",
      description: "Get intelligent suggestions for concentrated liquidity position ranges based on historical price data analysis and market patterns.",
      icon: Target,
      gradient: "from-purple-500 to-pink-500",
      onClick: () => setActiveView("pools"),
      capabilities: ["Price History Analysis", "Range Optimization", "Pool Data Insights"],
      highlight: "🎯 Data-Driven"
    },
    {
      id: "multi-dex",
      title: "Multi-DEX Support",
      description: "Access liquidity pools from Sailor and DragonSwap DEXs through a unified interface, with the ability to compare and analyze opportunities.",
      icon: Layers,
      gradient: "from-orange-500 to-red-500",
      onClick: () => setActiveView("pools"),
      capabilities: ["Sailor DEX Integration", "DragonSwap Support", "Pool Comparison"],
      highlight: "🌊 Multiple DEXs"
    },
    {
      id: "analytics",
      title: "Pool Analytics",
      description: "Comprehensive analysis of liquidity pools with price history, volume data, and mathematical models for position optimization.",
      icon: BarChart3,
      gradient: "from-indigo-500 to-purple-500",
      onClick: () => setActiveView("pools"),
      capabilities: ["Historical Analysis", "Mathematical Models", "Performance Metrics"],
      highlight: "📊 Analytics Engine"
    },
    {
      id: "liquidity-tools",
      title: "Liquidity Management",
      description: "Tools for providing liquidity to different DEXs on SEI blockchain with position tracking and yield calculation features.",
      icon: Droplets,
      gradient: "from-teal-500 to-blue-500",
      onClick: () => setActiveView("pools"),
      capabilities: ["Position Management", "Yield Calculation", "DEX Integration"],
      highlight: "💧 Liquidity Tools"
    },
  ]

  const technicalFeatures = [
    {
      title: "SEI MCP Server Integration",
      description: "Built on SEI's official Model Context Protocol",
      icon: Database
    },
    {
      title: "Rust Backend API",
      description: "High-performance backend with clean architecture",
      icon: Zap
    },
    {
      title: "Multi-DEX Support",
      description: "Sailor and DragonSwap integration",
      icon: Network
    },
    {
      title: "AI Agent System",
      description: "AI agent with specialized tools",
      icon: Bot
    }
  ]

  const capabilities = [
    { icon: Brain, title: "AI-Powered Analysis", description: "Intelligent DeFi insights" },
    { icon: Network, title: "Blockchain Integration", description: "Real-time SEI data access" },
    { icon: Target, title: "Range Optimization", description: "Data-driven positioning" },
    { icon: Shield, title: "Open Source", description: "Transparent development" }
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,119,198,0.1),transparent_50%)]" />

        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
              DeFi Intelligence
              <br />
              for SEI
            </h1>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
              An AI agent that helps you navigate DeFi on SEI blockchain. Ask questions, analyze pools, and get
              <span className="text-blue-400 font-semibold"> intelligent recommendations</span> for
              <span className="text-purple-400 font-semibold"> concentrated liquidity positions</span> powered by
              <span className="text-pink-400 font-semibold"> real blockchain data</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => setActiveView("chat")}
                size="lg"
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 px-8 py-4 text-lg font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
              >
                <Brain className="w-5 h-5 mr-2" />
                Try AI Assistant
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <Button
                onClick={() => setActiveView("pools")}
                variant="outline"
                size="lg"
                className="bg-gray-900/50 border-gray-600 hover:bg-gray-800/80 text-white px-8 py-4 text-lg backdrop-blur-sm shadow-xl hover:scale-105 transition-all duration-300"
              >
                <Droplets className="w-5 h-5 mr-2" />
                Explore Pools
              </Button>
            </div>

            {/* Technical indicators */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-6 opacity-80">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>SEI MCP Integration</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                <span>Multi-DEX Support</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-purple-400" />
                <span>Open Source</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Features Section */}
      <section className="py-16 px-6 border-t border-gray-800/50 bg-gray-900/20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Built on Solid Technology</h3>
            <p className="text-gray-400">Core technical components powering the platform</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {technicalFeatures.map((feature, index) => (
              <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-blue-400 group-hover:text-blue-300" />
                  </div>
                </div>
                <div className="text-lg font-semibold text-white mb-2">{feature.title}</div>
                <div className="text-sm text-gray-400">{feature.description}</div>
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
              Explore the features we've built to help you navigate DeFi on SEI blockchain with
              <span className="text-blue-400"> AI assistance</span> and
              <span className="text-purple-400"> data-driven insights</span>.
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
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                <CardHeader className="pb-4 relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge className="bg-gray-800/50 text-gray-300 text-xs px-2 py-1">
                      {feature.highlight}
                    </Badge>
                  </div>
                  <CardTitle className="text-white text-lg group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300 mb-2">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300 mb-4">
                    {feature.description}
                  </CardDescription>

                  <div className="space-y-2 mb-4">
                    {feature.capabilities.map((capability, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-500 group-hover:text-gray-400 transition-colors duration-300">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-400" />
                        {capability}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Try this feature
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowUpRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-gray-900/50 via-gray-900/30 to-gray-900/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">Platform Capabilities</h3>
            <p className="text-xl text-gray-400">What makes this platform unique</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {capabilities.map((capability, index) => (
              <div key={index} className="text-center group hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gradient-to-r group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300">
                  <capability.icon className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h4 className="text-white font-semibold mb-2 group-hover:text-blue-400 transition-colors duration-300">{capability.title}</h4>
                <p className="text-gray-400 text-sm">{capability.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_70%)]" />

        <div className="container mx-auto text-center relative z-10">

          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Try It Out</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience AI-powered DeFi assistance on SEI blockchain. Ask questions, analyze pools,
            and explore concentrated liquidity opportunities.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setActiveView("chat")}
              size="lg"
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 px-8 py-4 text-lg font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Ask AI Assistant
            </Button>
            <Button
              onClick={() => setActiveView("pools")}
              variant="outline"
              size="lg"
              className="bg-gray-900/50 border-gray-600 hover:bg-gray-800/80 text-white px-8 py-4 text-lg backdrop-blur-sm shadow-xl hover:scale-105 transition-all duration-300"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Analyze Pools
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}