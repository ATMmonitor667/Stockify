import { ArrowDown, ArrowUp } from "lucide-react"

// Mock data for top performing stocks
const topStocks = [
    {
      symbol: "NVDA",
      name: "NVIDIA Corp.",
      price: 950.02,
      change: 5.23,
      percentChange: 4.32,
    },
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 182.63,
      change: 3.45,
      percentChange: 1.92,
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corp.",
      price: 415.32,
      change: 2.87,
      percentChange: 0.69,
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      price: 145.76,
      change: -1.23,
      percentChange: -0.84,
    },
    {
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      price: 176.39,
      change: 4.56,
      percentChange: 2.66,
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      price: 623.84,
      change: -12.45,
      percentChange: -1.95,
    }
  ];
  

// Mock data for bottom performing stocks
const bottomStocks = [
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 177.29,
    change: -5.67,
    percentChange: -3.1,
  },
  {
    symbol: "META",
    name: "Meta Platforms Inc.",
    price: 485.58,
    change: -3.21,
    percentChange: -0.66,
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 178.75,
    change: -1.25,
    percentChange: -0.69,
  },
  {
    symbol: "NFLX",
    name: "Netflix Inc.",
    price: 605.88,
    change: -2.12,
    percentChange: -0.35,
  },
]

export function TopStocks({ type = "top" }: { type?: "top" | "bottom" }) {
  const stocks = type === "top" ? topStocks : bottomStocks

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {stocks.map((stock) => (
          <div key={stock.symbol} className="flex items-center justify-between space-y-0 pb-2">
            <div className="space-y-0.5">
              <p className="text-sm font-medium lg:text-lg">{stock.symbol}</p>
              <p className="text-xs text-muted-foreground">{stock.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium lg: text-large">${stock.price}</p>
              <div
                className={`flex items-center justify-end gap-1 text-xs ${
                  stock.change >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {stock.change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                <span>
                  {stock.change >= 0 ? "+" : ""}
                  {stock.change.toFixed(2)} ({stock.percentChange.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
