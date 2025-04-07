"use client"

import {
  ArrowDown,
  ArrowUp,
  Bell,
  Clock,
  DollarSign,
  Eye,
  LineChart,
  Menu,
  PieChart,
  Search,
  Settings,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { AreaChart, LineChartComponent, PieChartComponent } from "./stock-charts"
import { StockData } from "./stock-data"

export function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0">
            <div className="px-6 py-4 border-b">
              <Link href="#" className="flex items-center gap-2 font-semibold">
                <LineChart className="h-6 w-6" />
                <span className="text-lg">StockTracker</span>
              </Link>
            </div>
            <nav className="grid gap-2 p-4">
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
              >
                <LineChart className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <PieChart className="h-4 w-4" />
                Portfolio
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <TrendingUp className="h-4 w-4" />
                Market
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Eye className="h-4 w-4" />
                Watchlist
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Clock className="h-4 w-4" />
                History
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="#" className="flex items-center gap-2 font-semibold md:hidden">
          <LineChart className="h-6 w-6" />
          <span className="">StockTracker</span>
        </Link>
        <div className="hidden md:flex md:items-center md:gap-2">
          <Link href="#" className="flex items-center gap-2 font-semibold">
            <LineChart className="h-6 w-6" />
            <span className="">StockTracker</span>
          </Link>
          <Button variant="outline" size="sm" className="ml-6">
            Markets
          </Button>
          <Button variant="outline" size="sm">
            Watchlist
          </Button>
          <Button variant="outline" size="sm">
            Portfolio
          </Button>
        </div>
        <div className="relative ml-auto flex-1 md:grow-0 md:basis-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search stocks..."
            className="w-full rounded-lg bg-background pl-8 md:w-72"
          />
        </div>
        <Button variant="outline" size="icon" className="ml-auto md:ml-0">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Avatar className="h-6 w-6">
                <AvatarImage src="/placeholder-user.jpg" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 shrink-0 border-r bg-background md:block">
          <div className="flex h-full flex-col gap-2">
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid gap-1 px-2">
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
                >
                  <LineChart className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <PieChart className="h-4 w-4" />
                  Portfolio
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <TrendingUp className="h-4 w-4" />
                  Market
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Eye className="h-4 w-4" />
                  Watchlist
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Clock className="h-4 w-4" />
                  History
                </Link>
              </nav>
            </div>
            <div className="mt-auto p-4">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">Upgrade to Pro</CardTitle>
                  <CardDescription>Get advanced analytics and features</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Button size="sm" className="w-full">
                    Upgrade
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </aside>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Change</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-500">+$892.40</div>
                <p className="text-xs text-muted-foreground">+1.9% today</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stocks</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">Across 8 sectors</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,234.59</div>
                <p className="text-xs text-muted-foreground">Available for trading</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                  <CardTitle>Portfolio Performance</CardTitle>
                  <CardDescription>Your portfolio value over time</CardDescription>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Tabs defaultValue="1m">
                    <TabsList className="grid grid-cols-4 w-[200px]">
                      <TabsTrigger value="1w">1w</TabsTrigger>
                      <TabsTrigger value="1m">1m</TabsTrigger>
                      <TabsTrigger value="3m">3m</TabsTrigger>
                      <TabsTrigger value="1y">1y</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="pl-2">
                <AreaChart />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Top Performing Stocks</CardTitle>
                <CardDescription>Your best performing assets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {StockData.topPerformers.map((stock) => (
                    <div key={stock.symbol} className="flex items-center">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={stock.logo} alt={stock.name} />
                        <AvatarFallback>{stock.symbol.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{stock.name}</p>
                        <p className="text-sm text-muted-foreground">{stock.symbol}</p>
                      </div>
                      <div className="ml-auto font-medium">
                        <div className="flex items-center gap-1">
                          <ArrowUp className="h-4 w-4 text-emerald-500" />
                          <span className="text-emerald-500">{stock.change}%</span>
                        </div>
                        <div className="text-sm text-muted-foreground text-right">${stock.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest stock trades</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Stock</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Shares</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {StockData.recentTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.symbol}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.type === "Buy" ? "default" : "destructive"}>
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>${transaction.price}</TableCell>
                        <TableCell>{transaction.shares}</TableCell>
                        <TableCell className="text-right">${transaction.total}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="ghost" size="sm">
                  View All Transactions
                </Button>
              </CardFooter>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Portfolio Allocation</CardTitle>
                <CardDescription>Breakdown by sector</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <PieChartComponent />
              </CardContent>
              <CardFooter className="flex flex-wrap justify-center gap-2">
                {StockData.sectors.map((sector) => (
                  <Badge key={sector.name} variant="outline" className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: sector.color }} />
                    {sector.name}
                  </Badge>
                ))}
              </CardFooter>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Watchlist</CardTitle>
                <CardDescription>Stocks you're monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {StockData.watchlist.map((stock) => (
                      <TableRow key={stock.symbol}>
                        <TableCell className="font-medium">{stock.symbol}</TableCell>
                        <TableCell>${stock.price}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {stock.change > 0 ? (
                              <>
                                <ArrowUp className="h-4 w-4 text-emerald-500" />
                                <span className="text-emerald-500">{stock.change}%</span>
                              </>
                            ) : (
                              <>
                                <ArrowDown className="h-4 w-4 text-red-500" />
                                <span className="text-red-500">{Math.abs(stock.change)}%</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  Add Stock
                </Button>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </CardFooter>
            </Card>
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Market Trends</CardTitle>
                <CardDescription>Major indices performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {StockData.marketIndices.map((index) => (
                    <div key={index.name} className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{index.name}</p>
                        <p className="text-sm text-muted-foreground">{index.value}</p>
                      </div>
                      <div className="ml-auto">
                        <div className="flex items-center gap-1">
                          {index.change > 0 ? (
                            <>
                              <ArrowUp className="h-4 w-4 text-emerald-500" />
                              <span className="text-emerald-500">{index.change}%</span>
                            </>
                          ) : (
                            <>
                              <ArrowDown className="h-4 w-4 text-red-500" />
                              <span className="text-red-500">{Math.abs(index.change)}%</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 w-24">
                        <LineChartComponent data={index.data} color={index.change > 0 ? "#10b981" : "#ef4444"} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  View Market Details
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

