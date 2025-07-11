"use client"

import { DynamicWidget } from "@dynamic-labs/sdk-react-core"

export function DynamicWalletButton() {
  return (
    <DynamicWidget
      variant="modal"
      buttonClassName="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 px-6 py-2 rounded-lg font-medium transition-all duration-200"
    />
  )
}
