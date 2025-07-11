"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { date: "2024-01-01", inflow: 500, outflow: 200 },
  { date: "2024-01-02", inflow: 800, outflow: 300 },
  { date: "2024-01-03", inflow: 300, outflow: 600 },
  { date: "2024-01-04", inflow: 1200, outflow: 400 },
  { date: "2024-01-05", inflow: 900, outflow: 700 },
  { date: "2024-01-06", inflow: 600, outflow: 200 },
  { date: "2024-01-07", inflow: 1500, outflow: 800 },
]

export function WalletBehaviorChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="date"
          stroke="#9CA3AF"
          fontSize={12}
          tickFormatter={(value) => new Date(value).toLocaleDateString()}
        />
        <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `$${value}`} />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "8px",
            color: "#F9FAFB",
            backdropFilter: "blur(10px)",
          }}
          formatter={(value: any, name: string) => [`$${value}`, name === "inflow" ? "Inflow" : "Outflow"]}
          labelFormatter={(label) => new Date(label).toLocaleDateString()}
        />
        <Line
          type="monotone"
          dataKey="inflow"
          stroke="#10B981"
          strokeWidth={2}
          dot={{ fill: "#10B981", strokeWidth: 2, r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="outflow"
          stroke="#EF4444"
          strokeWidth={2}
          dot={{ fill: "#EF4444", strokeWidth: 2, r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
