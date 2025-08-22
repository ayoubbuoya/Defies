"use client"
import { useState, useEffect } from "react"
import { Wallet, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import Image from "next/image"

interface GlobalLoaderProps {
    message?: string
    submessage?: string
    type?: "loading" | "success" | "error"
    showProgress?: boolean
    duration?: number
}

export default function GlobalLoader({
    message = "Loading...",
    submessage = "Please wait while we connect to your wallet",
    type = "loading",
    showProgress = true,
    duration = 3000,
}: GlobalLoaderProps) {
    const [progress, setProgress] = useState(0)
    const [dots, setDots] = useState("")

    // Animate progress bar
    useEffect(() => {
        if (!showProgress || type !== "loading") return

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) return prev
                return prev + Math.random() * 15
            })
        }, 200)

        return () => clearInterval(interval)
    }, [showProgress, type])

    // Animate dots
    useEffect(() => {
        if (type !== "loading") return

        const interval = setInterval(() => {
            setDots((prev) => {
                if (prev === "...") return ""
                return prev + "."
            })
        }, 500)

        return () => clearInterval(interval)
    }, [type])

    const getIcon = () => {
        switch (type) {
            case "success":
                return <CheckCircle className="w-8 h-8 text-green-400" />
            case "error":
                return <AlertCircle className="w-8 h-8 text-red-400" />
            default:
                return (
                    <div className="relative">
                        <Wallet className="w-8 h-8 text-cyan-400" />
                        <Loader2 className="w-4 h-4 text-cyan-300 absolute -top-1 -right-1 animate-spin" />
                    </div>
                )
        }
    }

    const getColors = () => {
        switch (type) {
            case "success":
                return {
                    primary: "text-green-400",
                    secondary: "text-green-300",
                    accent: "border-green-400",
                    bg: "bg-green-400/10",
                }
            case "error":
                return {
                    primary: "text-red-400",
                    secondary: "text-red-300",
                    accent: "border-red-400",
                    bg: "bg-red-400/10",
                }
            default:
                return {
                    primary: "text-cyan-400",
                    secondary: "text-cyan-300",
                    accent: "border-cyan-400",
                    bg: "bg-cyan-400/10",
                }
        }
    }

    const colors = getColors()

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
                <Image src="/logo.png" alt="Defies" width={100} height={100} className="animate-pulse" />
                {/* Main loader card */}
                <div className="max-w-md w-full">
                    <div className={`${colors.bg} backdrop-blur-sm border ${colors.accent}/20 rounded-2xl p-8 shadow-2xl`}>
                        {/* Icon and spinner */}
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div
                                    className={`w-16 h-16 rounded-full ${colors.bg} border-2 ${colors.accent}/30 flex items-center justify-center`}
                                >
                                    {getIcon()}
                                </div>
                                {type === "loading" && (
                                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 animate-spin" />
                                )}
                            </div>
                        </div>

                        {/* Main message */}
                        <div className="text-center space-y-3">
                            <h2 className={`text-xl font-semibold ${colors.primary}`}>
                                {message}
                                {type === "loading" && <span className="inline-block w-8 text-left">{dots}</span>}
                            </h2>

                            <p className={`text-sm ${colors.secondary} opacity-80`}>{submessage}</p>
                        </div>

                        {/* Progress bar */}
                        {showProgress && type === "loading" && (
                            <div className="mt-6 space-y-2">
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>Connecting</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300 ease-out`}
                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Status indicators */}
                        <div className="mt-6 flex justify-center space-x-2">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${type === "loading"
                                        ? progress > i * 30
                                            ? "bg-cyan-400"
                                            : "bg-gray-600"
                                        : type === "success"
                                            ? "bg-green-400"
                                            : "bg-red-400"
                                        }`}
                                    style={{
                                        animationDelay: `${i * 0.2}s`,
                                        animation: type === "loading" ? "pulse 2s infinite" : "none",
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Additional info */}
                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500">
                            {type === "loading" && "This may take a few seconds"}
                            {type === "success" && "Connection established successfully"}
                            {type === "error" && "Please try again or check your wallet"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
