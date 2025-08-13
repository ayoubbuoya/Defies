import { Token } from "@/types/token"

class TokenService {
    private baseUrl: string

    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''
    }

    async fetchToken(token_address: string): Promise<Token> {
        const response = await fetch(`${this.baseUrl}/data/token/${token_address}`)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
    }
}

export const tokenService = new TokenService()
