import { ethers } from "ethers";
import type { TxParams, WalletStrategy } from "../../types/wallet";
import type { NetworkConfig } from "../../types/wallet";

export class MetaMaskWallet implements WalletStrategy {
    private provider: ethers.BrowserProvider | null = null;
    private signer: ethers.JsonRpcSigner | null = null;


    isInstalled() {
        return !!(window as any).ethereum?.isMetaMask;
    }

    async connect(network: NetworkConfig): Promise<string> {
        this.provider = new ethers.BrowserProvider((window as any).ethereum);
        await this.provider.send("eth_requestAccounts", []);

        try {
            await this.provider.send("wallet_switchEthereumChain", [{ chainId: network.evmChainId }]);
        } catch (err: any) {
            if (err.error.code == 4902) {
                const metaParams = {
                    chainId: network.evmChainId,
                    chainName: network.name,
                    nativeCurrency: network.currency,
                    rpcUrls: [network.rpcEndpointEvm],
                    blockExplorerUrls: [network.blockExplorer],
                };
                await this.provider.send("wallet_addEthereumChain", [metaParams]);

                await this.provider.send("wallet_switchEthereumChain", [{ chainId: network.evmChainId }]);
            } else {
                throw err;
            }
        }

        this.signer = await this.provider.getSigner();
        return this.signer.getAddress();
    }
    async restoreConnection(): Promise<boolean> {
        if (!this.isInstalled()) return false;
        try {
            this.provider = new ethers.BrowserProvider((window as any).ethereum);
            this.signer = await this.provider.getSigner();
            return !!(this.provider && this.signer);
        } catch (error) {
            return false;
        }
    }

    async getAddress(): Promise<string> {
        if (!this.signer) throw new Error("Not connected");
        return await this.signer.getAddress();
    }

    async signMessage(address: string, message: string): Promise<string> {
        if (!this.signer) throw new Error("Not connected");
        return await this.signer.signMessage(message);
    }

    async switchNetwork(network: NetworkConfig): Promise<string> {
        if (!this.provider) throw new Error("Provider not initialized")

        try {
            await this.provider.send("wallet_switchEthereumChain", [{ chainId: network.evmChainId }])
        } catch (err: any) {
            const metaParams = {
                chainId: network.evmChainId,
                chainName: network.name,
                nativeCurrency: network.currency,
                rpcUrls: [network.rpcEndpointEvm],
                blockExplorerUrls: [network.blockExplorer],
            };

            if (err.code === 4902) {
                await this.provider.send("wallet_addEthereumChain", [metaParams])
                await this.provider.send("wallet_switchEthereumChain", [
                    { chainId: metaParams.chainId },
                ]);
            } else {
                throw err
            }
        }
        this.signer = await this.provider.getSigner();
        return this.signer.getAddress();
    }

    getSigner(): ethers.JsonRpcSigner {
        if (!this.signer) throw new Error("Not connected")
        return this.signer
    }


    async sendTransaction(p: TxParams): Promise<any> {
        if (!this.signer) throw new Error("Not connected");

        if (p.type === "native") {
            const tx = await this.signer.sendTransaction({
                to: p.recipient,
                value: ethers.parseEther(p.amount),
            });
            return await tx.wait();
        } else if (p.type === "contract") {
            const contract = new ethers.Contract(p.contract, p.abi, this.signer);
            return await contract[p.method](...p.args, { value: p.value ? ethers.parseEther(p.value) : undefined });
        } else {
            throw new Error("Unsupported transaction type");
        }
    }



}
