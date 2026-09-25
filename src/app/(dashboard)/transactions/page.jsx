"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { resolveCategory } from "@/lib/categories";
import { applyTxDeltaToAssets } from "@/lib/asset-utils";
import { formatCurrency } from "@/lib/currency";
import toast from "react-hot-toast";

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({ q: "", type: "all", from: "", to: "" });
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(true);

    const updateAssetsForTx = (oldTx, newTx) => {
        let storedAssets = [];
        try {
            const raw = localStorage.getItem("finsight_assets");
            if (raw) storedAssets = JSON.parse(raw);
        } catch { }

        const updatedAssets = applyTxDeltaToAssets(storedAssets, oldTx, newTx);
        const newWalletBalance = updatedAssets.reduce((sum, a) => sum + (a.type === "card" || a.group === "Card" ? 0 : Number(a.value || 0)), 0);

        localStorage.setItem("finsight_assets", JSON.stringify(updatedAssets));
        localStorage.setItem("finsight_wallet_balance", String(newWalletBalance));
        window.dispatchEvent(
            new CustomEvent("finsight:assets-updated", { detail: { assets: updatedAssets, total: newWalletBalance } })
        );
    };

    const syncLocalTx = (newList) => {
        setTransactions(newList);
        localStorage.setItem("finsight_transactions", JSON.stringify(newList));
        window.dispatchEvent(
            new CustomEvent("finsight:transactions-updated", { detail: { transactions: newList } })
        );
    };

    async function loadData() {
        setLoading(true);
        let apiTx = [];
        let cats = [];
        try {
            const [txRes, catRes] = await Promise.all([
                fetch("/api/transactions"),
                fetch("/api/categories"),
            ]);
            if (txRes.ok) {
                const data = await txRes.json();
                if (Array.isArray(data)) apiTx = data;
            }
            if (catRes.ok) {
                const data = await catRes.json();
                if (Array.isArray(data)) cats = data;
            }
        } catch { }

        let localTx = [];
        const stored = localStorage.getItem("finsight_transactions");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) localTx = parsed;
            } catch { }
        }

        const txMap = new Map();
        apiTx.forEach((t) => {
            if (t && t.id) {
                const resolvedCat = t.category?.name
                    ? t.category
                    : resolveCategory(t.categoryId || t.category?.id, cats, t.type);
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
                : resolveCategory(t.categoryId || t.category?.id, cats, t.type);
            txMap.set(t.id, { ...t, category: resolvedCat });
        });

        const merged = Array.from(txMap.values());
        setTransactions(merged);
        if (cats.length > 0) setCategories(cats);
        setLoading(false);
    }

    useEffect(() => {
        const timeoutId = setTimeout(() => loadData(), 0);

        const handleTxUpdated = (e) => {
            if (e.detail?.transactions) {
                setTransactions(e.detail.transactions);
            } else {
                loadData();
            }
        };

        window.addEventListener("finsight:transactions-updated", handleTxUpdated);
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener("finsight:transactions-updated", handleTxUpdated);
        };
    }, []);

    const filtered = useMemo(() => {
        return transactions.filter((t) => {
            if (filters.q) {
                const q = filters.q.toLowerCase();
                const matchDesc = t.description?.toLowerCase().includes(q);
                const matchRef = t.reference?.toLowerCase().includes(q);
                if (!matchDesc && !matchRef) return false;
            }
            if (filters.type && filters.type !== "all" && t.type !== filters.type) {
                return false;
            }
            if (filters.from && new Date(t.date) < new Date(filters.from)) return false;
            if (filters.to && new Date(t.date) > new Date(filters.to)) return false;
            return true;
        });
    }, [transactions, filters]);

    async function handleSubmit(data) {
        const amountNum = Number(data.amount);
        const catObj = resolveCategory(data.categoryId, categories, data.type);

        const newTxData = {
            ...data,
            description: data.description || (data.type === "TRANSFER" ? `Transfer: ${data.reference || "Asset"} → ${data.notes || "Asset"}` : ""),
            amount: amountNum,
            category: catObj,
            date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
        };

        updateAssetsForTx(editing, newTxData);

        if (editing) {
            const updated = transactions.map((t) =>
                t.id === editing.id
                    ? { ...t, ...newTxData, updatedAt: new Date().toISOString() }
                    : t
            );
            syncLocalTx(updated);
            toast.success("Transaction updated & account balances refreshed!");

            fetch(`/api/transactions/${editing.id}`, {
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

            const updated = [newTx, ...transactions];
            syncLocalTx(updated);
            toast.success(
                data.type === "TRANSFER"
                    ? `Transferred ${formatCurrency(amountNum, "INR")} from ${data.reference} → ${data.notes}!`
                    : data.type === "EXPENSE"
                        ? "Expense logged & deducted!"
                        : "Transaction logged!"
            );

            fetch("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }).then(async (res) => {
                if (res.ok) {
                    const saved = await res.json();
                    if (saved && saved.id) {
                        const replaced = updated.map((t) => (t.id === newTx.id ? { ...t, id: saved.id } : t));
                        syncLocalTx(replaced);
                    }
                }
            }).catch(() => { });
        }

        setOpen(false);
        setEditing(null);
    }

    async function handleDelete(id) {
        const target = transactions.find((t) => t.id === id);
        if (!target) return;

        if (!confirm(`Delete transaction "${target.description}"?`)) return;

        updateAssetsForTx(target, null);
        const updated = transactions.filter((t) => t.id !== id);
        syncLocalTx(updated);
        toast.success("Transaction deleted & account balances refunded!");

        fetch(`/api/transactions/${id}`, { method: "DELETE" }).catch(() => { });
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Recent Transactions Ledger</h1>
                <Button
                    onClick={() => {
                        setEditing(null);
                        setOpen(true);
                    }}
                >
                    + Add Transaction
                </Button>
            </div>

            <TransactionFilters filters={filters} onChange={setFilters} />

            {loading ? (
                <div className="rounded-xl border bg-white p-12 text-center text-sm text-gray-500">
                    Loading…
                </div>
            ) : (
                <TransactionList
                    transactions={filtered}
                    onEdit={(t) => {
                        setEditing(t);
                        setOpen(true);
                    }}
                    onDelete={handleDelete}
                />
            )}

            <Dialog
                open={open}
                onOpenChange={(v) => {
                    setOpen(v);
                    if (!v) setEditing(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? "Edit Transaction" : "Add Transaction"}
                        </DialogTitle>
                    </DialogHeader>

                    <TransactionForm
                        defaultValues={editing}
                        categories={categories}
                        onSubmit={handleSubmit}
                        onCancel={() => {
                            setOpen(false);
                            setEditing(null);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
