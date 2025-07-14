import { JsonRpcProvider, formatUnits } from "ethers";
import { env } from "../../config/env.js";

/**
 * Minimal infrastructure adapter – just native SEI balance.
 */
export default class SeiEvmClient {
  constructor() {
    this.provider = new JsonRpcProvider(env.evmRpc);
  }

  /** Returns `[ { denom, amount } ]` – amount is human‑readable (18 decimals). */
  async getBalances(address) {
    const wei    = await this.provider.getBalance(address);
    const amount = formatUnits(wei, 18);
    return [{ denom: env.symbol, amount }];
  }
}
