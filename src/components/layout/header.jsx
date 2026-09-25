"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommandPalette } from "@/components/layout/command-palette";
import { NotificationsPopover } from "@/components/layout/notifications-popover";
import { LogOut, User, RotateCcw, Search, PlusCircle, Menu, X, LayoutDashboard, Receipt, Target, Wallet, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";

export function Header({ user, onAddTxClick }) {
    const [commandOpen, setCommandOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const navLinks = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/transactions", label: "Transactions", icon: Receipt },
        { href: "/assets", label: "Assets", icon: Wallet },
        { href: "/settings", label: "Settings", icon: Settings },
    ];

    async function handleFullAccountReset() {
        if (
            !confirm(
                "⚠️ Are you sure you want to reset your account? This will permanently clear ALL transactions, assets, bill reminders, savings goals, and reset your wallet balance to ₹0.00!"
            )
        ) {
            return;
        }

        try {
            const response = await fetch("/api/account/reset", { method: "POST" });
            if (!response.ok) {
                throw new Error(`Account reset failed with status ${response.status}`);
            }
        } catch (e) {
            console.error("API reset error:", e);
        }

        const zeroAssets = [];
        localStorage.setItem("finsight_wallet_balance", "0");
        localStorage.setItem("finsight_assets", JSON.stringify(zeroAssets));
        localStorage.setItem("finsight_transactions", "[]");
        localStorage.removeItem("finsight_custom_categories");
        localStorage.removeItem("finsight_default_asset");
        localStorage.removeItem("finsight_bill_reminders");
        localStorage.removeItem("finsight_savings_goals");
        localStorage.removeItem("finsight_budgets");

        toast.success("Account reset successful! All data cleared.");
        setTimeout(() => {
            window.location.reload();
        }, 600);
    }

    return (
        <>
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/95 backdrop-blur-md px-4 sm:px-6 shadow-2xs">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden text-gray-600 hover:text-gray-900 p-1 rounded-lg hover:bg-gray-100"
                        aria-label="Toggle Navigation Menu"
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>

                    <div className="hidden sm:block text-sm text-gray-500 truncate">
                        Welcome back,{" "}
                        <span className="font-bold text-gray-800">
                            {user?.name || user?.email?.split("@")[0] || "User"}
                        </span>
                    </div>

                    <div className="sm:hidden font-bold text-purple-900 flex items-center gap-1.5 text-base">
                        <span>💎</span> SpendTrack
                    </div>
                </div>

                {/* Center Quick Search Trigger */}
                <button
                    onClick={() => setCommandOpen(true)}
                    className="flex items-center gap-2 bg-gray-100/80 hover:bg-gray-200/80 text-gray-500 hover:text-gray-800 px-3.5 py-1.5 rounded-full text-xs transition border border-gray-200/60 max-w-xs w-full sm:w-64 justify-between"
                >
                    <span className="flex items-center gap-2 truncate">
                        <Search className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                        <span>Search or press Ctrl+K...</span>
                    </span>
                    <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-extrabold text-gray-500 bg-white rounded border border-gray-300">
                        ⌘K
                    </kbd>
                </button>

                {/* Right Action Icons */}
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <NotificationsPopover />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-2 text-xs font-semibold hover:bg-purple-50 text-gray-700">
                                <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                    {(user?.name || user?.email || "U")[0].toUpperCase()}
                                </div>
                                <span className="hidden lg:inline">{user?.name || "My Profile"}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 rounded-xl">
                            <div className="p-2 border-b">
                                <div className="font-bold text-xs text-gray-900 truncate">{user?.name || "SpendTrack Account"}</div>
                                <div className="text-[11px] text-gray-500 truncate">{user?.email || "—"}</div>
                            </div>
                            <DropdownMenuItem
                                onClick={handleFullAccountReset}
                                className="cursor-pointer text-amber-700 focus:text-amber-800 focus:bg-amber-50 font-medium text-xs py-2"
                            >
                                <RotateCcw className="mr-2 h-4 w-4 text-amber-600" />
                                Reset Account Data
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className="cursor-pointer text-red-600 focus:text-red-600 font-medium text-xs py-2"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-b px-4 py-3 space-y-1 shadow-md animate-in slide-in-from-top duration-200 sticky top-16 z-20">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const active = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${active
                                        ? "bg-purple-100 text-purple-700"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            )}

            <CommandPalette
                open={commandOpen}
                onOpenChange={setCommandOpen}
                onAddTxClick={onAddTxClick}
            />
        </>
    );
}
