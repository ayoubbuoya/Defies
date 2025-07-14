import { MetaMaskWallet } from "./MetaMaskWallet";
//import { KeplrWallet } from "./KeplrWallet";
import type { WalletStrategy } from "./types";

export const getWalletStrategy = (walletId: string): WalletStrategy => {
    switch (walletId) {
        case "metamask":
            return new MetaMaskWallet();
        // case "keplr":
        // case "leap":
        // case "compass":
        //     return new KeplrWallet(walletId);
        default:
            throw new Error("Unsupported wallet");
    }
};
