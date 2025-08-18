import { TOKEN_LOGOS } from '../constants/tokens'

export const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(2)}M`
    } else if (value >= 1000) {
        return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(2)}`
}

export const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`
}

export const getTokenLogo = (symbol: string): string => {
    return TOKEN_LOGOS[symbol] || '❓'
}