"use client"

import {
  Cell,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { Chart, ChartArea, ChartBar, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

import { StockData } from "./stock-data"

export function AreaChart() {
  return (
    <Chart className="h-[300px]">
      <ChartTooltip content={<ChartTooltipContent />} />
      <ChartArea
        data={StockData.portfolioHistory}
        x="date"
        y="value"
        yAxisWidth={65}
        categories={["value"]}
        colors={["emerald"]}
        valueFormatter={(value: number) => `$${value.toLocaleString()}`}
        className="h-[300px]"
      />
    </Chart>
  )
}

export function BarChart() {
  return (
    <Chart className="h-[300px]">
      <ChartTooltip content={<ChartTooltipContent />} />
      <ChartBar
        data={StockData.monthlyReturns}
        x="month"
        y="value"
        yAxisWidth={65}
        categories={["value"]}
        colors={["emerald"]}
        valueFormatter={(value: number) => `$${value.toLocaleString()}`}
        className="h-[300px]"
      />
    </Chart>
  )
}

export function LineChartComponent({ data, color = "#10b981" }: { data: any[]; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={50}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

export function PieChartComponent() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <RechartsPieChart>
        <Pie
          data={StockData.sectors}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
        >
          {StockData.sectors.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [`$${value.toLocaleString()}`, "Value"]}
          labelFormatter={(index) => StockData.sectors[index].name}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}

