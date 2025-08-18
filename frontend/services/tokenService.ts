import { Token } from "@/types/token"
import { TokenAdapter } from "@/adapters/token/tokenAdapter"
import { WalletService } from "./walletService"

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
