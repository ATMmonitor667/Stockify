"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, type TooltipProps } from "recharts"
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"

// Mock data for the chart
const generateData = () => {
  const data = []
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  let value = 10000

  for (let i = 0; i < 30; i++) {
    const change = Math.random() * 500 - 250
    value += change
    data.push({
      date: `${months[i % 12]} ${Math.floor(i / 12) + 1}`,
      value: Math.max(value, 8000),
    })
  }

  return data
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-900 p-2 shadow-sm">
        <p className="text-sm font-medium text-gray-300">{label}</p>
        <p className="text-sm font-semibold text-green-400">${Number(payload[0].value).toFixed(2)}</p>
      </div>
    )
  }

  return null
}

export function StockChart() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    setData(generateData())
  }, [])

  return (
    <div className="h-[400px] w-full bg-gray-900 p-4 rounded-xl">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" strokeOpacity={0.3} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "#bbb" }}
            tickMargin={10}
            minTickGap={10}
          />
          <YAxis
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            domain={["dataMin - 1000", "dataMax + 1000"]}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "#bbb" }}
            tickMargin={10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#4ade80" // Bright green for visibility
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0, fill: "#4ade80" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
