import { createContext, useContext } from "react"
import { WalletContextType } from "./types"

export const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) throw new Error("useWallet must be used within a WalletProvider")
  return context
}
