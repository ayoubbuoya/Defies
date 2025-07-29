"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Home, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface Simple404Props {
    title?: string
    message?: string
    showBackButton?: boolean
}

export function Simple404({
    title = "Page Not Found",
    message = "The page you're looking for doesn't exist.",
    showBackButton = true,
}: Simple404Props) {
    const router = useRouter()

    return (
        <div className="flex items-center justify-center min-h-[60vh] px-4">
            <Card className="bg-slate-800 border-slate-700 max-w-md w-full">
                <CardContent className="text-center py-12 space-y-6">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-slate-400" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-white">404</h1>
                        <h2 className="text-lg font-semibold text-white">{title}</h2>
                        <p className="text-gray-400 text-sm">{message}</p>
                    </div>

                    <div className="space-y-3">
                        {showBackButton && (
                            <Button
                                onClick={() => router.back()}
                                variant="outline"
                                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Go Back
                            </Button>
                        )}

                        <Button
                            onClick={() => router.push("/")}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Go Home
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
