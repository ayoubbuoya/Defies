import { MetaMaskWallet } from "./MetaMaskWallet";
import type { WalletStrategy } from "../../types/wallet";

export const getWalletStrategy = (walletId: string): WalletStrategy => {
    switch (walletId) {
        case "metamask":
            return new MetaMaskWallet();
        default:
            throw new Error("Unsupported wallet");
    }
};
