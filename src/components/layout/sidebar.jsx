"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Receipt,
    Target,
    Wallet,
    Settings,
    ShieldCheck,
    Zap,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";

const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/transactions", label: "Transactions", icon: Receipt },
    { href: "/assets", label: "Assets & Net Worth", icon: Wallet },
    { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ user }) {
    const pathname = usePathname();
    const [netWorth, setNetWorth] = useState(0);

    useEffect(() => {
        const updateBalance = () => {
            const storedBalance = localStorage.getItem("finsight_wallet_balance");
            if (storedBalance !== null) {
                setNetWorth(parseFloat(storedBalance));
            }
        };

        updateBalance();
        window.addEventListener("finsight:transactions-updated", updateBalance);
        window.addEventListener("finsight:assets-updated", updateBalance);
        return () => {
            window.removeEventListener("finsight:transactions-updated", updateBalance);
            window.removeEventListener("finsight:assets-updated", updateBalance);
        };
    }, []);

    return (
        <aside className="hidden w-64 flex-col border-r bg-white md:flex sticky top-0 h-screen overflow-y-auto z-20 shadow-2xs">
            {/* Logo Header */}
            <div className="flex h-16 items-center gap-3 border-b px-6 flex-shrink-0 bg-white">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-500 text-white flex items-center justify-center font-black text-lg shadow-md">
                    💎
                </div>
                <div>
                    <span className="text-lg font-black text-purple-950 tracking-tight block leading-tight">
                        SpendTrack
                    </span>
                    <span className="text-[10px] font-bold text-purple-600 tracking-wider uppercase block">
                        Enterprise Edition
                    </span>
                </div>
            </div>

            {/* Quick Balance Preview Card */}
            <div className="p-4 mx-3 my-3 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 text-white space-y-1 shadow-md border border-purple-700/50">
                <div className="text-[10px] font-bold text-purple-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Total Liquid Pool</span>
                    <Zap className="h-3 w-3 text-purple-300 animate-pulse" />
                </div>
                <div className="text-xl font-extrabold text-white tracking-tight">
                    {formatCurrency(netWorth, "INR")}
                </div>
                <div className="text-[10px] text-purple-200 flex items-center gap-1 font-medium pt-0.5">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    <span>Real-time Asset Linked</span>
                </div>
            </div>

            {/* Main Navigation Links */}
            <nav className="flex-1 space-y-1 px-3 py-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const active =
                        pathname === link.href ||
                        (link.href !== "/dashboard" && pathname.startsWith(link.href));

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200",
                                active
                                    ? "bg-purple-100/80 text-purple-900 shadow-2xs font-extrabold"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <Icon className={cn("h-4 w-4", active ? "text-purple-700" : "text-gray-500")} />
                                <span>{link.label}</span>
                            </div>

                            {link.badge && (
                                <span className="text-[9px] font-black bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                                    {link.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer User Info */}
            <div className="border-t p-4 text-xs text-gray-500 flex-shrink-0 bg-gray-50/50">
                <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Signed in User</div>
                <div className="truncate font-bold text-gray-800 text-xs mt-0.5">
                    {user?.name || user?.email || "Guest"}
                </div>
            </div>
        </aside>
    );
}
