'use client'

import type React from "react";
import Link from "next/link"
import {Bell, ChevronDown, LogOut, Menu, Search, Settings, TrendingUp, User, DollarSign, LineChart, BarChart3, ArrowUp, TrendingDown }
from "lucide-react"

import {Button} from "@/components/ui/button"
import {Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import   {StockChart} from "@/components/built-UI/stock-chart";
import { RecentTransactions } from "@/components/built-UI/transactions";
import {TopStocks} from "@/components/built-UI/top-stocks"

import {Input} from "@/components/ui/input"
import {Sheet, SheetContent, SheetTrigger} from "@/components/ui/sheet"
import {DashBoardNav } from "@/components/built-UI/dashboard-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function DashBoard()
{
  return (
    <div className = "flex-1 space-y-4 p-4 pt-6 md:p-8 lg:p-16 ">
      <div className = "flex flex-col items-center justify-between w-full">
        <h1 className = "text-3x1 font-bold tracking-tight lg:text-5xl lg:p-16"> Dashboard </h1>
      </div>
      <Tabs defaultValue = "overview" className = "space-y-4 lg:space-x-16">
        <TabsList className = "flex space-x-4">
          <TabsTrigger value = "overview"> <h1 className = " font-bold sm: text-sm md:text-md lg:text-lg">OverView</h1></TabsTrigger>
          <TabsTrigger value = "analytics"><h1 className = " font-bold sm: text-sm md:text-md lg:text-lg">Analytics</h1></TabsTrigger>
          <TabsTrigger value = "reports"> <h1 className = " font-bold sm:text-sm md:text-md lg:text-lg">Reports</h1> </TabsTrigger>
        </TabsList>
        <TabsContent value = "overview" className = "space-y-4 lg:rounded-lg">
          <div className = "grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:rounded-2xl lg:space-x-0 lg:pb-10">
            <Card className = "lg:rounded-2xl space-y-4 lg: h-[200px] w-[400px]">
              <CardHeader className = "flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className = "space-x-8 lg:text-lg" >Portfolio Value</CardTitle>
               <DollarSign className = "h-4 w-4"></DollarSign>
              </CardHeader>
              <CardContent>
                <div className="text-2x1 font-bold lg:text-3xl "> $43,576.78 </div>
                <p className= "text-xs  lg:text-lg font-semibold ">+20.1% from last month</p>
                <div className = "container flex flex-row justify-start space-x-3">
                  <span className= "flex flex-row items-center justify-center text-green-600 space-x-2">
                    <ArrowUp className = 'h-4 w-4'></ArrowUp>
                    <h1>4.3%</h1>
                    <span className = "text-white">Today</span>
                  </span>
                </div>


              </CardContent>
            </Card>
            <Card className = "space-y-0 lg: rounded-3xl md: rounded-2x1 lg: h-[200px] w-[400px]">
              <CardHeader className = "flex flex-row justify-between pb-2">
                <CardTitle className = "lg: text-lg font-bold">Cash Balance</CardTitle>
                <DollarSign></DollarSign>
              </CardHeader>
              <CardContent>
                <div>
                  <h1 className = "text-2xl font-bold font-mono lg:text-3xl lg:space-y-2">$23,456.00</h1>
                  <p className = "font-sans lg:pb-4">Available for trading</p>
                  <span className = "from-neutral-600 font-serif"> Last Deposit: $2000 (3 days ago)</span>
                </div>
              </CardContent>
            </Card>
            <Card className= "space-y-0 lg: rounded-3xl md: rounded-2x1 lg: h-[200px] w-[400px]">
            <CardHeader className = "flex flex-row justify-between pb-2">
                <CardTitle className = "lg: text-lg font-bold">Today's Return</CardTitle>
                <LineChart></LineChart>
              </CardHeader>

              <CardContent>
              <div>
                  <h1 className = "text-2xl font-bold font-mono lg:text-3xl lg:space-y-2 justify-start">+$1,234</h1>
                  <p className = "font-sans lg:pb-6">+2.3% today</p>
                  <div className = "flex flex-row items-center space-x-3 text-green-500 justify-start">
                  <TrendingUp className = "h-5 w-5 bg-transparent "></TrendingUp>
                  <span className = "text-green-600 font-serif"> Outperforming the market by 1.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className= "space-y-0 lg: rounded-3xl md: rounded-2x1 lg: h-[200px] w-[400px]">
            <CardHeader className = "flex flex-row justify-between pb-2">
                <CardTitle className = "lg: text-lg font-bold">Total Return</CardTitle>
                <BarChart3></BarChart3>
              </CardHeader>

              <CardContent>
              <div>
                  <h1 className = "text-2xl font-bold font-mono lg:text-3xl lg:space-y-0">+$5,234</h1>
                  <p className = "font-sans lg:pb-6">+22.3% all time</p>
                  <div className = "flex flex-row justify-start items-center space-x-3 text-red-500 lg:space-x-1">
                  <TrendingDown className = "h-5 w-5 bg-transparent "></TrendingDown>
                  <span className = "font-serif"> -2.5%</span>
                  <span className = "text-white">This week</span>
                  </div>
                  
                </div>
              </CardContent>
            </Card>
            
            


          </div>
          <div className = "grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className = "cols-span-4 lg:h-[500px] w-[1000px] lg:rounded-2xl">
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <StockChart></StockChart>
              </CardContent>
            </Card>

          </div>
          <div className = "grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className = "cols-span-4 lg:h-[500px] w-[1000px] lg:rounded-2xl">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
              <RecentTransactions></RecentTransactions>
              </CardContent>
            </Card>
          </div>
          <div className = "grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className = "cols-span-4 lg:h-[500px] w-[1000px] lg:rounded-2xl">
              <CardHeader>
                <CardTitle>Top Performances</CardTitle>
              </CardHeader>
              <CardContent>
              <TopStocks></TopStocks>
              </CardContent>
            </Card>
          </div>

        </TabsContent>
      </Tabs>
      
      
      
       </div>
  )
}