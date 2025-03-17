"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Briefcase, CreditCard, History, LineChart, PieChart, Search, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
    { title: "DashBoard", href: "/dashboard", icon: PieChart },
    { title: "Portfolio", href: "/dashboard/portfolio", icon: Briefcase },
    { title: "Stocks", href: "/dashboard/stocks", icon: CreditCard },
    { title: "Market", href: "/dashboard/market", icon: TrendingUp },
    { title: "WatchList", href: "/dashboard/watchlist", icon: LineChart },
    { title: "History", href: "/dashboard/history", icon: History },
    { title: "Search", href: "/dashboard/search", icon: Search },
    { title: "Funding", href: "/dashboard/funding", icon: BarChart3 }
];

export function DashBoardNav() {
    const pathname = usePathname();

    function NavLoop(navItems) {
        return navItems.map((item) => (
            <Button
                key={item.href}
                asChild
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn("justify-start gap-2", pathname === item.href && "bg-muted")}
            >
                <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    {item.title}
                </Link>
            </Button>
        ));
    }

    return (
        <nav className="nav grid grid-cols-1 gap-1 px-2">
            {NavLoop(navItems)}
        </nav>
    );
}
