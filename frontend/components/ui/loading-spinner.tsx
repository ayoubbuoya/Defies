import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
    message?: string
    className?: string
}

export const LoadingSpinner = ({ message = "Loading...", className = "" }: LoadingSpinnerProps) => (
    <div className={`flex items-center space-x-2 text-white ${className}`}>
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>{message}</span>
    </div>
)