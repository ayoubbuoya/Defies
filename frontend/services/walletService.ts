import { WalletStrategy, TxParams } from "@/types/wallet";

export class WalletService {
    protected strategy: WalletStrategy | null = null;

    setStrategy(strategy: WalletStrategy) {
        this.strategy = strategy;
    }

    async sendTransaction(params: TxParams): Promise<any> {
        if (!this.strategy) {
            throw new Error("No wallet strategy set");
        }
        return await this.strategy.sendTransaction(params);
    }

    async getAddress(): Promise<string> {
        if (!this.strategy) {
            throw new Error("No wallet strategy set");
        }
        return await this.strategy.getAddress();
    }

    async signMessage(address: string, message: string): Promise<string> {
        if (!this.strategy) {
            throw new Error("No wallet strategy set");
        }
        return await this.strategy.signMessage(address, message);
    }
}

