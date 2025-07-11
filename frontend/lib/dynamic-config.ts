import { CosmosWalletConnectors } from "@dynamic-labs/cosmos"

// ⚠️  READ ME ────────────────────────────────────────────────────────────
// Dynamic **must** receive a valid Environment ID (a UUID you get
//   from the Dynamic dashboard).  If it’s missing, the SDK will throw
//   “Failed to fetch” because it can’t build a proper API URL.
//
//   1. Go to https://dashboard.dynamic.xyz --> create / open a project
//   2. Copy the **Environment ID** (looks like:  b4ab3c1e-d2…)
//   3. Add it to your local env:  NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=…
//   4. Restart `npm run dev`
//
//-----------------------------------------------------------------------
export const dynamicConfig = {
  /**
   * You get an Environment ID from https://dashboard.dynamic.xyz
   * In dev/preview we allow the build to proceed with Dynamic’s
   * public demo environment so the app doesn’t crash.
   *
   * ⚠️  Replace `demo-environment` with your own ID in production!
   */
  environmentId: (() => {
    const id = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID
    if (!id) {
      // eslint-disable-next-line no-console
      console.warn(
        "[Dynamic SDK] ⚠️  NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID missing – using Dynamic’s public demo environment.\n" +
          "Create your own environment at https://dashboard.dynamic.xyz and add it to .env.local",
      )
      return "demo-environment" // Dynamic’s open demo env (read-only)
    }
    return id
  })(),
  walletConnectors: [CosmosWalletConnectors],
  overrides: {
    views: [
      {
        type: "wallet-list" as const,
        tabs: {
          items: [
            {
              label: {
                text: "Recommended",
              },
            },
            {
              label: {
                text: "All wallets",
              },
            },
          ],
        },
      },
    ],
  },
  cssOverrides: `
    .dynamic-widget-card {
      background: rgb(17 24 39) !important;
      border: 1px solid rgb(55 65 81) !important;
    }
    
    .dynamic-widget-button {
      background: linear-gradient(to right, rgb(59 130 246), rgb(147 51 234)) !important;
      border: none !important;
    }
    
    .dynamic-widget-button:hover {
      background: linear-gradient(to right, rgb(37 99 235), rgb(126 34 206)) !important;
    }
    
    .dynamic-widget-text {
      color: rgb(243 244 246) !important;
    }
    
    .dynamic-widget-modal {
      background: rgb(17 24 39) !important;
      border: 1px solid rgb(55 65 81) !important;
    }
  `,
  chains: [
    {
      blockExplorerUrls: ["https://www.seiscan.app"],
      chainId: "sei-pacific-1",
      chainName: "Sei Network",
      iconUrls: ["https://assets.coingecko.com/coins/images/28205/large/Sei_Logo_-_Transparent.png"],
      name: "Sei",
      nativeCurrency: {
        decimals: 6,
        name: "SEI",
        symbol: "SEI",
      },
      networkId: "sei-pacific-1",
      rpcUrls: ["https://rpc.sei-apis.com"],
      vanityName: "Sei Network",
    },
  ],
}
