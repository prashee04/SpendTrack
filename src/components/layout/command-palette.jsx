"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Search,
    LayoutDashboard,
    Receipt,
    Target,
    Wallet,
    Settings,
    PlusCircle,
    Download,
    ArrowRight,
    Tag,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export function CommandPalette({ open, onOpenChange, onAddTxClick }) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [transactions, setTransactions] = useState([]);
    const [currency, setCurrency] = useState("INR");

    useEffect(() => {
        if (open) {
            const storedTx = localStorage.getItem("finsight_transactions");
            if (storedTx) {
                try {
                    const parsed = JSON.parse(storedTx);
                    if (Array.isArray(parsed)) setTransactions(parsed);
                } catch { }
            }
            const storedCurr = localStorage.getItem("finsight_currency");
            if (storedCurr) setCurrency(storedCurr);
        }
    }, [open]);

    const navigateTo = (path) => {
        onOpenChange(false);
        setQuery("");
        router.push(path);
    };

    const pages = [
        { name: "Dashboard Overview", path: "/dashboard", icon: LayoutDashboard },
        { name: "Transactions Ledger", path: "/transactions", icon: Receipt },
        { name: "Assets & Net Worth", path: "/assets", icon: Wallet },
        { name: "Settings & Categories", path: "/settings", icon: Settings },
    ];

    const actions = [
        {
            name: "Log New Expense / Income",
            icon: PlusCircle,
            action: () => {
                onOpenChange(false);
                if (onAddTxClick) onAddTxClick();
            },
        },
        {
            name: "Export Financial Statement (CSV)",
            icon: Download,
            action: () => {
                onOpenChange(false);
                let csvContent = "data:text/csv;charset=utf-8,Date,Description,Type,Amount,Reference\n";
                transactions.forEach((t) => {
                    csvContent += `${t.date?.split("T")[0] || ""},"${t.description}",${t.type},${t.amount},"${t.reference || ""}"\n`;
                });
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `SpendTrack_Statement_${new Date().toISOString().slice(0, 10)}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            },
        },
    ];

    const q = query.toLowerCase().trim();

    const filteredPages = pages.filter((p) => p.name.toLowerCase().includes(q));
    const filteredActions = actions.filter((a) => a.name.toLowerCase().includes(q));
    const filteredTx = q
        ? transactions.filter(
            (t) =>
                t.description?.toLowerCase().includes(q) ||
                t.category?.name?.toLowerCase().includes(q) ||
                t.reference?.toLowerCase().includes(q) ||
                String(t.amount).includes(q)
        ).slice(0, 5)
        : [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl bg-white p-0 gap-0 border overflow-hidden rounded-2xl shadow-2xl">
                <DialogHeader className="sr-only">
                    <DialogTitle>Command Palette Search</DialogTitle>
                </DialogHeader>

                <div className="flex items-center px-4 border-b bg-gray-50/50">
                    <Search className="h-4 w-4 text-purple-600 shrink-0 mr-2" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search pages, transactions, actions... (Press Esc to close)"
                        className="h-12 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-medium"
                        autoFocus
                    />
                    <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-gray-400 bg-gray-200/70 rounded">
                        ESC
                    </kbd>
                </div>

                <div className="max-h-[380px] overflow-y-auto p-3 space-y-4">
                    {/* Quick Pages */}
                    {filteredPages.length > 0 && (
                        <div>
                            <div className="px-2 pb-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                Navigation Pages
                            </div>
                            <div className="space-y-1">
                                {filteredPages.map((page) => {
                                    const Icon = page.icon;
                                    return (
                                        <button
                                            key={page.path}
                                            onClick={() => navigateTo(page.path)}
                                            className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition group text-left"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-purple-100 text-gray-600 group-hover:text-purple-700 transition">
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <span>{page.name}</span>
                                            </div>
                                            <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-purple-600 transition" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    {filteredActions.length > 0 && (
                        <div>
                            <div className="px-2 pb-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                Quick Actions
                            </div>
                            <div className="space-y-1">
                                {filteredActions.map((act, idx) => {
                                    const Icon = act.icon;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={act.action}
                                            className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition group text-left"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700 transition">
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <span>{act.name}</span>
                                            </div>
                                            <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-purple-600 transition" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Matching Transactions */}
                    {query && (
                        <div>
                            <div className="px-2 pb-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                Matching Transactions ({filteredTx.length})
                            </div>
                            {filteredTx.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-gray-400">
                                    No transactions match &quot;{query}&quot;
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {filteredTx.map((t) => (
                                        <div
                                            key={t.id}
                                            onClick={() => navigateTo("/transactions")}
                                            className="flex items-center justify-between p-2.5 rounded-xl border bg-gray-50/50 hover:bg-purple-50 hover:border-purple-200 transition cursor-pointer text-xs"
                                        >
                                            <div>
                                                <div className="font-semibold text-gray-900">{t.description}</div>
                                                <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
                                                    <Tag className="h-3 w-3 text-gray-400" />
                                                    <span>{t.category?.name || "General"}</span>
                                                    <span>•</span>
                                                    <span>{t.date?.split("T")[0]}</span>
                                                </div>
                                            </div>
                                            <div
                                                className={`font-bold ${t.type === "INCOME"
                                                        ? "text-emerald-600"
                                                        : t.type === "TRANSFER"
                                                            ? "text-blue-600"
                                                            : "text-red-600"
                                                    }`}
                                            >
                                                {t.type === "INCOME" ? "+" : t.type === "TRANSFER" ? "↔ " : "-"}
                                                {formatCurrency(t.amount, currency)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-2.5 bg-gray-50 border-t flex items-center justify-between text-[11px] text-gray-400 font-medium">
                    <span>ProTip: Press <kbd className="px-1 bg-white border rounded">Ctrl</kbd> + <kbd className="px-1 bg-white border rounded">K</kbd> anywhere to trigger</span>
                    <span className="text-purple-600 font-semibold">SpendTrack Intelligence</span>
                </div>
            </DialogContent>
        </Dialog>
    );
}

