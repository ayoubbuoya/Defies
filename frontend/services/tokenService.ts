import { Token } from "@/types/token"
import { TokenAdapter } from "@/adapters/apis/tokenAdapter"

export class TokenService {
    private tokenAdapter: TokenAdapter

    constructor() {
        this.tokenAdapter = new TokenAdapter()
    }

    async fetchToken(token_address: string): Promise<Token> {
        return this.tokenAdapter.fetchToken(token_address)
    }
}

export const tokenService = new TokenService()
