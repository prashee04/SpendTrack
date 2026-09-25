"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { TrendingUp, TrendingDown, Wallet, Receipt, PlusCircle, ArrowUpRight, ArrowDownRight, ShieldCheck, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

export function StatsCards({ transactions, walletBalance, onAddBalance, currency = "INR", assets = [] }) {
    const [openAddBalance, setOpenAddBalance] = useState(false);
    const [openAssetsBreakdown, setOpenAssetsBreakdown] = useState(false);
    const [addAmount, setAddAmount] = useState("");
    const [selectedAssetId, setSelectedAssetId] = useState("");

    const income = transactions
        .filter((t) => t.type === "INCOME")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const expenses = transactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const netSavings = income - expenses;
    const savingsRate = income > 0 ? Math.round((netSavings / income) * 100) : 0;

    const handleTopUp = (e) => {
        e.preventDefault();
        const amt = parseFloat(addAmount);
        if (isNaN(amt) || amt <= 0) {
            toast.error("Please enter a valid amount to add to wallet.");
            return;
        }

        if (onAddBalance) {
            onAddBalance(amt, selectedAssetId);
        }
        toast.success(`Successfully added ${formatCurrency(amt, currency)} to Wallet & Linked Assets!`);
        setAddAmount("");
        setSelectedAssetId("");
        setOpenAddBalance(false);
    };

    const handleExportCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,Date,Description,Type,Amount,Reference\n";
        transactions.forEach((t) => {
            csvContent += `${t.date?.split("T")[0] || ""},"${t.description}",${t.type},${t.amount},"${t.reference || ""}"\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `SpendTrack_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Exported transactions to CSV!");
    };

    const cards = [
        {
            label: "All Accounts Balance",
            value: formatCurrency(walletBalance, currency),
            icon: Wallet,
            color: walletBalance <= 0 ? "text-red-600" : "text-purple-600",
            bg: walletBalance <= 0 ? "bg-red-50" : "bg-purple-50",
            badge: assets.length > 0 ? `${assets.length} Active Accounts` : null,
            badgeColor: "bg-purple-100 text-purple-700",
            action: (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                        size="xs"
                        variant="outline"
                        className="h-7 text-xs bg-white text-purple-700 border-purple-200 hover:bg-purple-50 shadow-2xs font-semibold"
                        onClick={() => setOpenAddBalance(true)}
                    >
                        <PlusCircle className="mr-1 h-3.5 w-3.5" /> + Top-Up
                    </Button>
                    <Button
                        size="xs"
                        variant="ghost"
                        className="h-7 text-xs text-gray-600 hover:bg-gray-100 font-medium"
                        onClick={() => setOpenAssetsBreakdown(true)}
                    >
                        View Assets
                    </Button>
                </div>
            ),
        },
        {
            label: "Total Income",
            value: formatCurrency(income, currency),
            icon: TrendingUp,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            badge: income > 0 ? "Inflow Active" : "No Inflow",
            badgeColor: "bg-emerald-100 text-emerald-800",
            subtitle: savingsRate > 0 ? `⚡ ${savingsRate}% Savings Rate` : null,
        },
        {
            label: "Total Expenses",
            value: formatCurrency(expenses, currency),
            icon: TrendingDown,
            color: "text-red-600",
            bg: "bg-red-50",
            badge: netSavings >= 0 ? "Controlled Spend" : "High Spend",
            badgeColor: netSavings >= 0 ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800",
            subtitle: expenses > 0 ? `Net: ${formatCurrency(netSavings, currency)}` : null,
        },
        {
            label: "Ledger Entries",
            value: `${transactions.length} Tx`,
            icon: Receipt,
            color: "text-blue-600",
            bg: "bg-blue-50",
            badge: "Live Sync",
            badgeColor: "bg-blue-100 text-blue-800",
            action: (
                <div className="mt-3">
                    <Button
                        size="xs"
                        variant="outline"
                        className="h-7 text-xs bg-white text-blue-700 border-blue-200 hover:bg-blue-50 shadow-2xs font-semibold gap-1"
                        onClick={handleExportCSV}
                    >
                        <Download className="h-3 w-3" /> Export CSV
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.label}
                            className="rounded-2xl border bg-white p-5 shadow-xs transition duration-200 hover:shadow-md flex flex-col justify-between"
                        >
                            <div>
                                <div className="mb-2.5 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-500">{card.label}</span>
                                    <div className="flex items-center gap-1.5">
                                        {card.badge && (
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${card.badgeColor}`}>
                                                {card.badge}
                                            </span>
                                        )}
                                        <div className={`rounded-xl p-2 ${card.bg}`}>
                                            <Icon className={`h-4 w-4 ${card.color}`} />
                                        </div>
                                    </div>
                                </div>
                                <div className="text-2xl font-black text-gray-900 tracking-tight">{card.value}</div>
                                {card.subtitle && (
                                    <p className="mt-1 text-xs font-semibold text-gray-500 flex items-center gap-1">
                                        {card.subtitle}
                                    </p>
                                )}
                            </div>
                            {card.action && <div>{card.action}</div>}
                        </div>
                    );
                })}
            </div>

            {/* Top-up Wallet Modal */}
            <Dialog open={openAddBalance} onOpenChange={setOpenAddBalance}>
                <DialogContent className="max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-purple-950 font-bold">
                            <Wallet className="h-5 w-5 text-purple-600" /> Top-Up Account Balance
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleTopUp} className="space-y-4 pt-2">
                        <div>
                            <Label htmlFor="addAmount" className="text-xs font-semibold">Amount ({currency}) *</Label>
                            <Input
                                id="addAmount"
                                type="number"
                                step="0.01"
                                placeholder="e.g. 5000"
                                value={addAmount}
                                onChange={(e) => setAddAmount(e.target.value)}
                                required
                                className="h-10 text-sm mt-1"
                            />
                        </div>

                        {assets.length > 0 && (
                            <div>
                                <Label htmlFor="targetAsset" className="text-xs font-semibold">Deposit into Linked Asset Account</Label>
                                <select
                                    id="targetAsset"
                                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs mt-1"
                                    value={selectedAssetId}
                                    onChange={(e) => setSelectedAssetId(e.target.value)}
                                >
                                    <option value="">-- Primary Account Pool --</option>
                                    {assets.map((ast) => (
                                        <option key={ast.id} value={ast.id}>
                                            {ast.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2 border-t">
                            <Button type="button" variant="outline" onClick={() => setOpenAddBalance(false)} className="text-xs h-9">
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-9">
                                Confirm Top-Up
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Linked Assets Breakdown Modal */}
            <Dialog open={openAssetsBreakdown} onOpenChange={setOpenAssetsBreakdown}>
                <DialogContent className="max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-purple-950 font-bold">
                            <Wallet className="h-5 w-5 text-purple-600" />
                            <span>Linked Assets Breakdown</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        <p className="text-xs text-gray-500">
                            Your spending wallet balance is directly linked with the following active liquid accounts:
                        </p>

                        <div className="divide-y rounded-2xl border bg-gray-50/50 p-2">
                            {assets.length === 0 ? (
                                <div className="p-3 text-xs text-center text-gray-500">No assets linked yet.</div>
                            ) : (
                                assets.map((ast) => (
                                    <div key={ast.id} className="flex items-center justify-between p-3">
                                        <div>
                                            <div className="font-bold text-sm text-gray-900">{ast.name}</div>
                                            <div className="text-[11px] text-gray-500 capitalize">{ast.type || "Liquid Asset"}</div>
                                        </div>
                                        <div className="font-extrabold text-sm text-purple-700">
                                            {formatCurrency(ast.value, currency)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t font-bold text-xs">
                            <span>Total Liquid Wallet Pool:</span>
                            <span className="text-purple-700 text-base font-extrabold">{formatCurrency(walletBalance, currency)}</span>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button variant="outline" onClick={() => setOpenAssetsBreakdown(false)} className="text-xs h-9">
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
