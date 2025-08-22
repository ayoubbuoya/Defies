import { Pool } from "@/types/pool"

export class PollAdapter {
    private baseUrl: string

    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''
    }

    async fetchPools(): Promise<Pool[]> {
        const response = await fetch(`${this.baseUrl}/data/pools`)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
    }
}

