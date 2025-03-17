import { ArrowDown, ArrowUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const portfolioData = [
  { symbol: "AAPL", name: "Apple Inc.", shares: 15, avgPrice: 165.23, currentPrice: 182.63, value: 2739.45, change: 17.4, percentChange: 10.53, dayChange: 1.92 },
  { symbol: "MSFT", name: "Microsoft Corp.", shares: 10, avgPrice: 310.15, currentPrice: 332.89, value: 3328.90, change: 22.74, percentChange: 7.33, dayChange: 2.13 },
  { symbol: "GOOGL", name: "Alphabet Inc.", shares: 8, avgPrice: 2750.32, currentPrice: 2881.42, value: 23051.36, change: 131.10, percentChange: 4.76, dayChange: 5.32 },
  { symbol: "AMZN", name: "Amazon.com Inc.", shares: 12, avgPrice: 3302.43, currentPrice: 3501.15, value: 42013.80, change: 198.72, percentChange: 6.02, dayChange: 3.75 },
  { symbol: "TSLA", name: "Tesla Inc.", shares: 7, avgPrice: 800.22, currentPrice: 918.36, value: 6428.52, change: 118.14, percentChange: 14.76, dayChange: 4.21 },
  { symbol: "BRK.B", name: "Berkshire Hathaway Inc.", shares: 5, avgPrice: 300.15, currentPrice: 322.67, value: 1613.35, change: 22.52, percentChange: 7.50, dayChange: 1.85 },
  { symbol: "NVDA", name: "NVIDIA Corporation", shares: 20, avgPrice: 200.12, currentPrice: 223.45, value: 4469.00, change: 23.33, percentChange: 11.66, dayChange: 2.08 },
  { symbol: "META", name: "Meta Platforms Inc.", shares: 9, avgPrice: 300.65, currentPrice: 319.76, value: 2877.84, change: 19.11, percentChange: 6.35, dayChange: 1.43 },
  { symbol: "V", name: "Visa Inc.", shares: 18, avgPrice: 220.32, currentPrice: 245.15, value: 4412.70, change: 24.83, percentChange: 11.27, dayChange: 2.01 },
  { symbol: "JNJ", name: "Johnson & Johnson", shares: 11, avgPrice: 170.25, currentPrice: 182.50, value: 2007.50, change: 12.25, percentChange: 7.19, dayChange: 1.56 },
  { symbol: "WMT", name: "Walmart Inc.", shares: 14, avgPrice: 140.60, currentPrice: 155.40, value: 2175.60, change: 14.80, percentChange: 10.52, dayChange: 1.29 },
  { symbol: "PG", name: "Procter & Gamble Co.", shares: 10, avgPrice: 145.20, currentPrice: 156.40, value: 1564.00, change: 11.20, percentChange: 7.71, dayChange: 1.45 },
  { symbol: "XOM", name: "Exxon Mobil Corp.", shares: 20, avgPrice: 60.15, currentPrice: 68.55, value: 1371.00, change: 8.40, percentChange: 13.96, dayChange: 0.92 },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", shares: 13, avgPrice: 120.00, currentPrice: 134.67, value: 1750.71, change: 14.67, percentChange: 12.23, dayChange: 1.25 },
  { symbol: "UNH", name: "UnitedHealth Group Inc.", shares: 8, avgPrice: 485.20, currentPrice: 502.60, value: 4020.80, change: 17.40, percentChange: 3.58, dayChange: 1.34 }
];

export function PortfolioTable() {
    return (
        <div className="rounded-md border">
            <div className="portfolio-table">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Symbol</TableHead>
                            <TableHead>Avg Price</TableHead>
                            <TableHead>Current Price</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Total Return</TableHead>
                            <TableHead>Day Change</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {portfolioData.map((item) => (
                            <TableRow key={item.symbol}>
                                <TableCell className="font-medium">{item.symbol}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-right">${item.avgPrice}</TableCell>
                                <TableCell className="text-right">${item.currentPrice}</TableCell>
                                <TableCell className="text-right">${item.value}</TableCell>
                                <TableCell className={`flex items-center justify-end gap-1 ${item.change >= 0 ? "text-green-600" : "text-red-800"}`}>
                                    {item.change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                    <span>
                                        {item.change >= 0 ? "+" : "-"}
                                        {item.change.toFixed(2)}%
                                    </span>
                                </TableCell>
                                <TableCell className={`flex items-center justify-end gap-1 ${item.dayChange >= 0 ? "text-green-600" : "text-red-800"}`}>
                                    {item.dayChange >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                    <span>
                                        {item.dayChange >= 0 ? "+" : "-"}
                                        ({item.dayChange.toFixed(2)})%
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
