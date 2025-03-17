"use client"
import { ArrowDown, ArrowUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for stocks
const stocksData = {
  popular: [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 182.63,
      change: 3.45,
      percentChange: 1.92,
      volume: "45.2M",
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corp.",
      price: 415.32,
      change: 2.87,
      percentChange: 0.69,
      volume: "22.1M",
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corp.",
      price: 950.02,
      change: 39.23,
      percentChange: 4.32,
      volume: "35.7M",
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      price: 177.29,
      change: -5.67,
      percentChange: -3.1,
      volume: "98.3M",
    },
    {
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      price: 178.75,
      change: -1.25,
      percentChange: -0.69,
      volume: "32.5M",
    },
    {
      symbol: "GOOG",
      name: "Alphabet Inc.",
      price: 147.68,
      change: 1.23,
      percentChange: 0.84,
      volume: "18.9M",
    },
    {
      symbol: "META",
      name: "Meta Platforms Inc.",
      price: 485.58,
      change: -3.21,
      percentChange: -0.66,
      volume: "15.3M",
    },
    {
      symbol: "NFLX",
      name: "Netflix Inc.",
      price: 605.88,
      change: -2.12,
      percentChange: -0.35,
      volume: "5.7M",
    },
  ],
  gainers: [
    {
      symbol: "NVDA",
      name: "NVIDIA Corp.",
      price: 950.02,
      change: 39.23,
      percentChange: 4.32,
      volume: "35.7M",
    },
    {
      symbol: "AMD",
      name: "Advanced Micro Devices, Inc.",
      price: 178.63,
      change: 7.45,
      percentChange: 4.35,
      volume: "45.2M",
    },
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 182.63,
      change: 3.45,
      percentChange: 1.92,
      volume: "45.2M",
    },
    {
      symbol: "GOOG",
      name: "Alphabet Inc.",
      price: 147.68,
      change: 1.23,
      percentChange: 0.84,
      volume: "18.9M",
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corp.",
      price: 415.32,
      change: 2.87,
      percentChange: 0.69,
      volume: "22.1M",
    },
  ],
  losers: [
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      price: 177.29,
      change: -5.67,
      percentChange: -3.1,
      volume: "98.3M",
    },
    {
      symbol: "META",
      name: "Meta Platforms Inc.",
      price: 485.58,
      change: -3.21,
      percentChange: -0.66,
      volume: "15.3M",
    },
    {
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      price: 178.75,
      change: -1.25,
      percentChange: -0.69,
      volume: "32.5M",
    },
    {
      symbol: "NFLX",
      name: "Netflix Inc.",
      price: 605.88,
      change: -2.12,
      percentChange: -0.35,
      volume: "5.7M",
    },
  ],
  tech: [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 182.63,
      change: 3.45,
      percentChange: 1.92,
      volume: "45.2M",
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corp.",
      price: 415.32,
      change: 2.87,
      percentChange: 0.69,
      volume: "22.1M",
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corp.",
      price: 950.02,
      change: 39.23,
      percentChange: 4.32,
      volume: "35.7M",
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      price: 177.29,
      change: -5.67,
      percentChange: -3.1,
      volume: "98.3M",
    },
    {
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      price: 178.75,
      change: -1.25,
      percentChange: -0.69,
      volume: "32.5M",
    },
    {
      symbol: "GOOG",
      name: "Alphabet Inc.",
      price: 147.68,
      change: 1.23,
      percentChange: 0.84,
      volume: "18.9M",
    },
  ],
  finance: [
    {
      symbol: "JPM",
      name: "JPMorgan Chase & Co.",
      price: 198.47,
      change: 1.23,
      percentChange: 0.62,
      volume: "8.7M",
    },
    {
      symbol: "BAC",
      name: "Bank of America Corp.",
      price: 37.12,
      change: 0.45,
      percentChange: 1.23,
      volume: "32.1M",
    },
    {
      symbol: "WFC",
      name: "Wells Fargo & Co.",
      price: 57.89,
      change: -0.32,
      percentChange: -0.55,
      volume: "15.3M",
    },
    {
      symbol: "GS",
      name: "Goldman Sachs Group Inc.",
      price: 456.78,
      change: 3.45,
      percentChange: 0.76,
      volume: "2.3M",
    },
    {
      symbol: "MS",
      name: "Morgan Stanley",
      price: 89.45,
      change: 0.67,
      percentChange: 0.75,
      volume: "5.6M",
    },
  ],
}

export function StocksTable({ type = "popular" }: { type?: "popular" | "gainers" | "losers" | "tech" | "finance" }) {
  const data = stocksData[type] || stocksData.popular

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Change</TableHead>
            <TableHead className="text-right">Volume</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((stock) => (
            <TableRow key={stock.symbol}>
              <TableCell className="font-medium">{stock.symbol}</TableCell>
              <TableCell>{stock.name}</TableCell>
              <TableCell className="text-right">${stock.price.toFixed(2)}</TableCell>
              <TableCell className="text-right">
                <div
                  className={`flex items-center justify-end gap-1 ${
                    stock.change >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stock.change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  <span>
                    {stock.change >= 0 ? "+" : ""}
                    {stock.change.toFixed(2)} ({stock.percentChange.toFixed(2)}%)
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">{stock.volume}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline">
                    Buy
                  </Button>
                  <Button size="sm" variant="outline">
                    Sell
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}