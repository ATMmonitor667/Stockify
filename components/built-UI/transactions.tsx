import { ArrowDown, ArrowUp } from "lucide-react"

// Mock data for recent transactions
const transactions = [
  {
    id: 1,
    type: "buy",
    symbol: "AAPL",
    name: "Apple Inc.",
    shares: 5,
    price: 182.63,
    total: 913.15,
    date: "Today, 10:45 AM",
  },
  {
    id: 2,
    type: "sell",
    symbol: "MSFT",
    name: "Microsoft Corp.",
    shares: 2,
    price: 415.32,
    total: 830.64,
    date: "Today, 9:30 AM",
  },
  {
    id: 3,
    type: "buy",
    symbol: "TSLA",
    name: "Tesla Inc.",
    shares: 3,
    price: 177.29,
    total: 531.87,
    date: "Yesterday, 3:15 PM",
  },
  {
    id: 4,
    type: "buy",
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    shares: 1,
    price: 950.02,
    total: 950.02,
    date: "Yesterday, 11:20 AM",
  },
  {
    id: 5,
    type: "sell",
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    shares: 4,
    price: 178.75,
    total: 715.0,
    date: "Mar 12, 2:45 PM",
  },
]

export function RecentTransactions() {
  return (
    <div className="h-[400px] w-full space-y-4">
      <div className="space-y-2">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2 lg:pb-2 lg:text-2xl">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full  ${
                  transaction.type === "buy" ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {transaction.type === "buy" ? (
                  <ArrowDown className={`h-4 w-4 text-green-600`} />
                ) : (
                  <ArrowUp className={`h-4 w-4 text-red-600`} />
                )}
              </div>
              <div className="space-y-0.5">
                <p className="text-sm lg:text-lg font-medium">
                  {transaction.type === "buy" ? "Bought" : "Sold"} {transaction.symbol}
                </p>
                <p className="text-xs text-muted-foreground">
                  {transaction.shares} shares at ${transaction.price}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">${transaction.total.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">{transaction.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}