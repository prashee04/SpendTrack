"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlusCircle, Receipt, Loader2, Sparkles, Download, ArrowLeftRight, Search, Filter } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { resolveCategory } from "@/lib/categories";
import { applyTxDeltaToAssets } from "@/lib/asset-utils";
import toast from "react-hot-toast";

const ExpenseChart = dynamic(
    () => import("@/components/dashboard/expense-chart").then((m) => m.ExpenseChart),
    {
        loading: () => (
            <div className="h-64 rounded-2xl border bg-white p-6 flex flex-col items-center justify-center text-gray-400 gap-2 shadow-xs">
                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                <span className="text-xs font-semibold">Loading Expense Velocity Chart...</span>
            </div>
        ),
        ssr: false,
    }
);

const CategoryChart = dynamic(
    () => import("@/components/dashboard/category-chart").then((m) => m.CategoryChart),
    {
        loading: () => (
            <div className="h-64 rounded-2xl border bg-white p-6 flex flex-col items-center justify-center text-gray-400 gap-2 shadow-xs">
                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                <span className="text-xs font-semibold">Loading Category Breakdown Chart...</span>
            </div>
        ),
        ssr: false,
    }
);

const FinancialToolsSuite = dynamic(
    () => import("@/components/dashboard/financial-tools-suite").then((m) => m.FinancialToolsSuite),
    {
        loading: () => (
            <div className="h-64 rounded-2xl border bg-white p-6 flex flex-col items-center justify-center text-gray-400 gap-2 shadow-xs">
                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                <span className="text-xs font-semibold">Loading Financial Tools Suite...</span>
            </div>
        ),
        ssr: false,
    }
);

export function DashboardView({ initialTransactions = [], initialCategories = [] }) {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [assets, setAssets] = useState([]);
    const [walletBalance, setWalletBalance] = useState(0);
    const [openModal, setOpenModal] = useState(false);
    const [editingTx, setEditingTx] = useState(null);
    const [currency, setCurrency] = useState("INR");
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const storedCurr = localStorage.getItem("finsight_currency");
            if (storedCurr) setCurrency(storedCurr);

            const storedAssets = localStorage.getItem("finsight_assets");
            let activeAssets = [];
            try {
                activeAssets = storedAssets ? JSON.parse(storedAssets) : [];
            } catch {
                activeAssets = [];
            }

            if (!activeAssets) {
                activeAssets = [];
                localStorage.setItem("finsight_assets", JSON.stringify(activeAssets));
            }
            setAssets(activeAssets);

            const storedBalance = localStorage.getItem("finsight_wallet_balance");
            if (storedBalance !== null) {
                setWalletBalance(parseFloat(storedBalance));
            } else {
                const calculatedTotal = activeAssets.reduce((sum, a) => sum + Number(a.value || 0), 0);
                localStorage.setItem("finsight_wallet_balance", String(calculatedTotal));
                setWalletBalance(calculatedTotal);
            }

            const storedTx = localStorage.getItem("finsight_transactions");
            let localTx = [];
            if (storedTx) {
                try {
                    const parsed = JSON.parse(storedTx);
                    if (Array.isArray(parsed)) localTx = parsed;
                } catch { }
            }

            const txMap = new Map();
            (initialTransactions || []).forEach((t) => {
                if (t && t.id) {
                    const resolvedCat = t.category?.name
                        ? t.category
                        : resolveCategory(t.categoryId || t.category?.id, initialCategories, t.type);
                    txMap.set(t.id, { ...t, category: resolvedCat });
                }
            });

            localTx.forEach((t) => {
                if (!t || !t.id) return;
                if (txMap.has(t.id)) return;

                if (typeof t.id === "string" && t.id.startsWith("tx_")) {
                    const isDup = Array.from(txMap.values()).some(
                        (dbTx) =>
                            dbTx.description === t.description &&
                            Number(dbTx.amount) === Number(t.amount) &&
                            dbTx.type === t.type &&
                            new Date(dbTx.date).toDateString() === new Date(t.date).toDateString()
                    );
                    if (isDup) return;
                }

                const resolvedCat = t.category?.name
                    ? t.category
                    : resolveCategory(t.categoryId || t.category?.id, initialCategories, t.type);
                txMap.set(t.id, { ...t, category: resolvedCat });
            });

            const merged = Array.from(txMap.values());
            setTransactions(merged);

            setCategories(initialCategories);
        }, 0);
        return () => clearTimeout(timeoutId);
    }, [initialTransactions, initialCategories]);

    useEffect(() => {
        const handleAssetsUpdated = (e) => {
            if (e.detail?.assets) {
                setAssets(e.detail.assets);
                const total = e.detail.assets.reduce((sum, a) => sum + Number(a.value || 0), 0);
                setWalletBalance(total);
            }
        };

        const handleTxUpdated = (e) => {
            if (e.detail?.transactions) {
                setTransactions(e.detail.transactions);
            }
        };

        window.addEventListener("finsight:assets-updated", handleAssetsUpdated);
        window.addEventListener("finsight:transactions-updated", handleTxUpdated);
        return () => {
            window.removeEventListener("finsight:assets-updated", handleAssetsUpdated);
            window.removeEventListener("finsight:transactions-updated", handleTxUpdated);
        };
    }, []);

    const updateWalletAndTx = (newBalance, newTxList, updatedAssets = assets) => {
        setWalletBalance(newBalance);
        setTransactions(newTxList);
        setAssets(updatedAssets);
        localStorage.setItem("finsight_wallet_balance", String(newBalance));
        localStorage.setItem("finsight_transactions", JSON.stringify(newTxList));
        localStorage.setItem("finsight_assets", JSON.stringify(updatedAssets));
        window.dispatchEvent(
            new CustomEvent("finsight:transactions-updated", { detail: { transactions: newTxList } })
        );
    };

    const handleAddBalance = (amount, targetAssetId) => {
        const newBalance = walletBalance + amount;
        let updatedAssets = [...assets];

        if (targetAssetId) {
            updatedAssets = assets.map((a) =>
                a.id === targetAssetId ? { ...a, value: Number(a.value || 0) + amount } : a
            );
        } else if (updatedAssets.length > 0) {
            updatedAssets = updatedAssets.map((a, idx) =>
                idx === 0 ? { ...a, value: Number(a.value || 0) + amount } : a
            );
        }

        updateWalletAndTx(newBalance, transactions, updatedAssets);
    };

    const handleFormSubmit = async (data) => {
        const amountNum = Number(data.amount);
        const catObj = resolveCategory(data.categoryId, categories, data.type);

        if (data.type === "TRANSFER" && data.reference === data.notes) {
            toast.error("From Account and To Account cannot be the same!");
            return false;
        }

        const newTxData = {
            ...data,
            description: data.description || (data.type === "TRANSFER" ? `Transfer: ${data.reference || "Asset"} → ${data.notes || "Asset"}` : ""),
            amount: amountNum,
            category: catObj,
            date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
        };

        const updatedAssets = applyTxDeltaToAssets(assets, editingTx, newTxData);
        const newWalletBalance = updatedAssets.reduce((sum, a) => sum + (a.type === "card" || a.group === "Card" ? 0 : Number(a.value || 0)), 0);

        if (editingTx) {
            const updatedList = transactions.map((t) =>
                t.id === editingTx.id
                    ? { ...t, ...newTxData, updatedAt: new Date().toISOString() }
                    : t
            );

            updateWalletAndTx(newWalletBalance, updatedList, updatedAssets);
            toast.success("Transaction updated & account balances refreshed!");

            fetch(`/api/transactions/${editingTx.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }).catch(() => { });
        } else {
            const newTx = {
                id: "tx_" + Date.now(),
                ...newTxData,
                createdAt: new Date().toISOString(),
            };

            const updatedList = [newTx, ...transactions];
            updateWalletAndTx(newWalletBalance, updatedList, updatedAssets);
            toast.success(
                data.type === "TRANSFER"
                    ? `Transferred ${formatCurrency(amountNum, currency)} from ${data.reference} → ${data.notes}!`
                    : data.type === "EXPENSE"
                        ? "Expense logged & deducted!"
                        : "Income logged successfully!"
            );

            fetch("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }).then(async (res) => {
                if (res.ok) {
                    const saved = await res.json();
                    if (saved && saved.id) {
                        const replacedList = updatedList.map((t) => (t.id === newTx.id ? { ...t, id: saved.id } : t));
                        updateWalletAndTx(newWalletBalance, replacedList, updatedAssets);
                    }
                }
            }).catch(() => { });
        }

        setOpenModal(false);
        setEditingTx(null);
        return true;
    };

    const handleDeleteTx = async (id) => {
        const target = transactions.find((t) => t.id === id);
        if (!target) return;

        if (!confirm(`Delete transaction "${target.description}"?`)) return;

        const updatedAssets = applyTxDeltaToAssets(assets, target, null);
        const newWalletBalance = updatedAssets.reduce((sum, a) => sum + (a.type === "card" || a.group === "Card" ? 0 : Number(a.value || 0)), 0);
        const updatedList = transactions.filter((t) => t.id !== id);

        updateWalletAndTx(newWalletBalance, updatedList, updatedAssets);
        toast.success("Transaction deleted & account balances updated!");

        fetch(`/api/transactions/${id}`, { method: "DELETE" }).catch(() => { });
    };

    // Filter transactions on dashboard
    const filteredTxLedger = useMemo(() => {
        return transactions.filter((t) => {
            if (typeFilter !== "all" && t.type !== typeFilter) return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matchDesc = t.description?.toLowerCase().includes(q);
                const matchCat = t.category?.name?.toLowerCase().includes(q);
                const matchRef = t.reference?.toLowerCase().includes(q);
                if (!matchDesc && !matchCat && !matchRef) return false;
            }
            return true;
        });
    }, [transactions, typeFilter, searchQuery]);

    return (
        <div className="space-y-6">
            {/* Header Banner with Action Buttons */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <span>Financial Dashboard</span>
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Track liquid account balances, log transactions, and monitor spending velocity analytics.
                    </p>
                </div>

                <div className="flex items-center space-x-2.5 w-full md:w-auto">
                    <Button
                        onClick={() => {
                            setEditingTx(null);
                            setOpenModal(true);
                        }}
                        className="flex-1 md:flex-none gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md font-bold text-xs px-4 py-2 rounded-xl"
                    >
                        <PlusCircle className="h-4 w-4" />
                        <span>+ Add Transaction</span>
                    </Button>
                </div>
            </div>

            <StatsCards
                transactions={transactions}
                walletBalance={walletBalance}
                assets={assets}
                onAddBalance={handleAddBalance}
                currency={currency}
            />

            {/* TAB SWITCHER */}
            <div className="flex flex-wrap items-center gap-2 border-b pb-3">
                <button
                    onClick={() => setActiveTab("overview")}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${activeTab === "overview"
                            ? "bg-purple-600 text-white shadow-xs"
                            : "bg-white text-gray-600 hover:bg-gray-100 border"
                        }`}
                >
                    📊 Spending Overview & Analytics
                </button>
                <button
                    onClick={() => setActiveTab("tools")}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${activeTab === "tools"
                            ? "bg-purple-600 text-white shadow-xs"
                            : "bg-white text-gray-600 hover:bg-gray-100 border"
                        }`}
                >
                    🔔 Bills, Goals & Financial Calculators
                </button>
            </div>

            {activeTab === "overview" ? (
                <>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <CategoryChart transactions={transactions} currency={currency} />
                        <ExpenseChart transactions={transactions} currency={currency} />
                    </div>

                    {/* Transaction Ledger Header & Quick Search Bar */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border shadow-xs">
                            <h2 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                                <Receipt className="h-5 w-5 text-purple-600" />
                                <span>Recent Transactions Ledger</span>
                            </h2>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="relative flex-1 sm:w-56">
                                    <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-gray-400" />
                                    <Input
                                        placeholder="Search ledger..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8 text-xs h-9 bg-gray-50 border-gray-200"
                                    />
                                </div>

                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="h-9 text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 font-semibold text-gray-700"
                                >
                                    <option value="all">All Types</option>
                                    <option value="EXPENSE">Expense</option>
                                    <option value="INCOME">Income</option>
                                    <option value="TRANSFER">Transfer</option>
                                </select>
                            </div>
                        </div>

                        <TransactionList
                            transactions={filteredTxLedger}
                            currency={currency}
                            onEdit={(t) => {
                                setEditingTx(t);
                                setOpenModal(true);
                            }}
                            onDelete={handleDeleteTx}
                        />
                    </div>
                </>
            ) : (
                <FinancialToolsSuite
                    transactions={transactions}
                    walletBalance={walletBalance}
                    currency={currency}
                    onAddExpense={async (expData) => {
                        const amountNum = Number(expData.amount);
                        const catObj = categories.find((c) => c.name?.toLowerCase().includes("bills")) || { name: "Bills", icon: "💡" };
                        const newTx = {
                            id: "tx_" + Date.now(),
                            ...expData,
                            amount: amountNum,
                            category: catObj,
                            createdAt: new Date().toISOString(),
                        };
                        const newWalletBalance = walletBalance - amountNum;
                        const updatedList = [newTx, ...transactions];
                        updateWalletAndTx(newWalletBalance, updatedList);

                        fetch("/api/transactions", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(expData),
                        }).then(async (res) => {
                            if (res.ok) {
                                const saved = await res.json();
                                if (saved && saved.id) {
                                    const replacedList = updatedList.map((t) => (t.id === newTx.id ? { ...t, id: saved.id } : t));
                                    updateWalletAndTx(newWalletBalance, replacedList);
                                }
                            }
                        }).catch(() => { });
                    }}
                />
            )}

            <Dialog
                open={openModal}
                onOpenChange={(v) => {
                    setOpenModal(v);
                    if (!v) setEditingTx(null);
                }}
            >
                <DialogContent className="rounded-2xl max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="font-bold text-gray-900">
                            {editingTx ? "Edit Transaction Entry" : "Log New Transaction"}
                        </DialogTitle>
                    </DialogHeader>

                    <TransactionForm
                        defaultValues={editingTx}
                        categories={categories}
                        walletBalance={walletBalance}
                        assets={assets}
                        currency={currency}
                        onSubmit={handleFormSubmit}
                        onAddAsset={(newAsset, updatedList) => {
                            const newTotal = updatedList.reduce((sum, a) => sum + Number(a.value || 0), 0);
                            updateWalletAndTx(newTotal, transactions, updatedList);
                        }}
                        onCancel={() => {
                            setOpenModal(false);
                            setEditingTx(null);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
