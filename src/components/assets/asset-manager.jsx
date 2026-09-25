"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/currency";
import { Trash2, PlusCircle, Wallet, Star, Pencil, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export function AssetManager({ assets = [], currency = "INR", onSave, onUpdateBalance, onDelete }) {
    const [showForm, setShowForm] = useState(false);
    const [editBalanceAsset, setEditBalanceAsset] = useState(null);
    const [newBalanceValue, setNewBalanceValue] = useState("");

    const [form, setForm] = useState({
        name: "",
        group: "Bank Accounts",
        value: "",
        purchaseValue: "",
        notes: "",
    });

    const ACCOUNT_GROUPS = [
        { id: "Cash", label: "💵 Cash" },
        { id: "Bank Accounts", label: "🏦 Bank Accounts" },
        { id: "Card", label: "💳 Card (Liabilities / Credit)" },
        { id: "Investments", label: "📈 Investments (Stocks / Mutual Funds / Crypto)" },
        { id: "Other", label: "📦 Other Accounts" },
    ];

    const totalAssets = assets
        .filter((a) => a.type !== "card" && a.group !== "Card")
        .reduce((sum, a) => sum + Number(a.value || 0), 0);

    const totalLiabilities = assets
        .filter((a) => a.type === "card" || a.group === "Card")
        .reduce((sum, a) => sum + Number(a.value || 0), 0);

    const totalNetWorth = totalAssets - totalLiabilities;

    async function submit(e) {
        e.preventDefault();
        const trimmedName = form.name.trim();
        if (!trimmedName) {
            toast.error("Account name is required!");
            return;
        }

        const isDuplicate = assets.some(
            (a) => a.name?.toLowerCase().trim() === trimmedName.toLowerCase()
        );
        if (isDuplicate) {
            toast.error(`An account with the name "${trimmedName}" already exists! Please use a unique name.`);
            return;
        }

        const isCard = form.group === "Card";
        await onSave({
            name: trimmedName,
            type: isCard ? "card" : form.group.toLowerCase().includes("cash") ? "cash" : form.group.toLowerCase().includes("bank") ? "bank" : "investment",
            group: form.group,
            value: parseFloat(form.value || 0),
            purchaseValue: form.purchaseValue ? parseFloat(form.purchaseValue) : null,
            notes: form.notes,
        });
        setForm({
            name: "",
            group: "Bank Accounts",
            value: "",
            purchaseValue: "",
            notes: "",
        });
        setShowForm(false);
    }

    const handleSaveBalance = (e) => {
        e.preventDefault();
        if (!editBalanceAsset) return;
        const amt = parseFloat(newBalanceValue);
        if (isNaN(amt)) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (onUpdateBalance) {
            onUpdateBalance(editBalanceAsset.id || editBalanceAsset.name, amt);
        }
        setEditBalanceAsset(null);
        setNewBalanceValue("");
    };

    // Group assets by group category
    const groupedAccounts = {
        "Cash": assets.filter((a) => a.group === "Cash" || a.type === "cash"),
        "Bank Accounts": assets.filter((a) => a.group === "Bank Accounts" || a.type === "bank" || a.type === "e-wallet"),
        "Card": assets.filter((a) => a.group === "Card" || a.type === "card"),
        "Investments & Assets": assets.filter((a) => a.group === "Investments" || (!["cash", "bank", "e-wallet", "card"].includes(a.type) && a.group !== "Cash" && a.group !== "Bank Accounts" && a.group !== "Card")),
    };

    return (
        <div className="space-y-6">
            {/* Top Summary Bar */}
            <div className="rounded-2xl bg-white p-5 sm:p-6 text-gray-900 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border border-gray-200">
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-8 flex-1">
                    <div className="space-y-1">
                        <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-600">Assets</div>
                        <div className="text-xl sm:text-2xl font-black text-emerald-600">
                            {formatCurrency(totalAssets, currency)}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-red-600">Liabilities</div>
                        <div className="text-xl sm:text-2xl font-black text-red-600">
                            {formatCurrency(totalLiabilities, currency)}
                        </div>
                    </div>

                    <div className="space-y-1 col-span-2 sm:col-span-1">
                        <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500">Total Net Worth</div>
                        <div className="text-2xl sm:text-3xl font-black text-gray-900">
                            {formatCurrency(totalNetWorth, currency)}
                        </div>
                    </div>
                </div>

                <Button
                    onClick={() => setShowForm(true)}
                    className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md gap-2 text-xs shrink-0"
                >
                    <PlusCircle className="h-4 w-4" />
                    <span>+ Add Account</span>
                </Button>
            </div>

            {/* Modal Popup for Add Account */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white text-gray-900 border border-gray-100 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 text-lg font-bold border-b border-gray-100 pb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                                <span>Account</span>
                                <span>/</span>
                                <span className="text-purple-600 font-bold">New Account</span>
                            </div>
                            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-wrap items-center justify-center p-1.5 bg-gray-50 rounded-2xl border border-gray-100 gap-1 text-xs font-medium">
                        {ACCOUNT_GROUPS.map((g) => (
                            <button
                                key={g.id}
                                type="button"
                                onClick={() => setForm({ ...form, group: g.id })}
                                className={`flex-1 py-1.5 px-2 rounded-xl transition text-[11px] font-semibold flex items-center justify-center gap-1 ${form.group === g.id
                                        ? "bg-white text-purple-700 shadow-xs border border-purple-200 font-bold"
                                        : "text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                {g.label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={submit} className="space-y-4 pt-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 border-b border-gray-100 pb-3">
                            <Label className="text-xs font-semibold text-gray-700">Group *</Label>
                            <select
                                className="h-10 w-full sm:w-64 rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition shadow-2xs"
                                value={form.group}
                                onChange={(e) => setForm({ ...form, group: e.target.value })}
                                required
                            >
                                {ACCOUNT_GROUPS.map((g) => (
                                    <option key={g.id} value={g.id} className="bg-white text-gray-900">
                                        {g.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 border-b border-gray-100 pb-3">
                            <Label className="text-xs font-semibold text-gray-700">Name *</Label>
                            <Input
                                placeholder="e.g. Cash Wallet, HDFC Bank, GPay"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="h-10 w-full sm:w-64 rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 placeholder:text-gray-400 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition shadow-2xs"
                                required
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 border-b border-gray-100 pb-3">
                            <Label className="text-xs font-semibold text-gray-700">Initial Balance ({currency}) *</Label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={form.value}
                                onChange={(e) => setForm({ ...form, value: e.target.value })}
                                className="h-10 w-full sm:w-44 text-left sm:text-right font-bold rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 placeholder:text-gray-400 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition shadow-2xs"
                                required
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 border-b border-gray-100 pb-3">
                            <Label className="text-xs font-semibold text-gray-500">Note / Details</Label>
                            <Input
                                placeholder="Additional details..."
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                className="h-10 w-full sm:w-64 text-left sm:text-right rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 placeholder:text-gray-400 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition shadow-2xs"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-3 border-t border-gray-100">
                            <Button
                                type="submit"
                                className="flex-1 h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                            >
                                Save Account
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowForm(false)}
                                className="h-11 px-5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-medium text-xs"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Account Balance Modal */}
            <Dialog open={!!editBalanceAsset} onOpenChange={(open) => !open && setEditBalanceAsset(null)}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-purple-950 font-bold">
                            <Pencil className="h-4 w-4 text-purple-600" /> Edit Balance for {editBalanceAsset?.name}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSaveBalance} className="space-y-4 pt-2">
                        <div>
                            <Label htmlFor="editBalInput" className="text-xs font-semibold">Account Balance ({currency}) *</Label>
                            <Input
                                id="editBalInput"
                                type="number"
                                step="0.01"
                                placeholder="e.g. 450000"
                                value={newBalanceValue}
                                onChange={(e) => setNewBalanceValue(e.target.value)}
                                required
                                className="h-10 text-sm font-bold mt-1"
                                autoFocus
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t">
                            <Button type="button" variant="outline" onClick={() => setEditBalanceAsset(null)} className="text-xs h-9">
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-9">
                                Save Balance
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Grouped Accounts List */}
            <div className="space-y-6">
                {Object.entries(groupedAccounts).map(([groupName, groupList]) => (
                    <div key={groupName} className="rounded-xl border bg-white shadow-xs overflow-hidden">
                        <div className="bg-gray-50 px-4 sm:px-5 py-3 border-b flex items-center justify-between font-bold text-gray-900 text-sm">
                            <span>{groupName}</span>
                            <span className={groupName === "Card" ? "text-red-600 font-extrabold" : "text-gray-900 font-extrabold"}>
                                {formatCurrency(
                                    groupList.reduce((sum, a) => sum + Number(a.value || 0), 0),
                                    currency
                                )}
                            </span>
                        </div>

                        <div className="divide-y">
                            {groupList.length === 0 ? (
                                <div className="p-4 text-xs text-gray-400 text-center italic">No accounts in this group yet.</div>
                            ) : (
                                groupList.map((acc) => (
                                    <div key={acc.id || acc.name} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-2 sm:gap-4 hover:bg-gray-50/80 transition">
                                        <div className="space-y-0.5">
                                            <div className="font-semibold text-sm text-gray-900">{acc.name}</div>
                                            {acc.notes && <div className="text-xs text-gray-500">{acc.notes}</div>}
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                                            <div className="text-left sm:text-right">
                                                <div className={`font-bold text-base ${acc.type === "card" || acc.group === "Card" ? "text-red-600" : "text-gray-900"}`}>
                                                    {formatCurrency(acc.value, currency)}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <Button
                                                    size="xs"
                                                    variant="outline"
                                                    className="text-[11px] font-semibold text-purple-700 border-purple-200 hover:bg-purple-50 h-7 px-2.5 gap-1 rounded-lg"
                                                    onClick={() => {
                                                        setEditBalanceAsset(acc);
                                                        setNewBalanceValue(String(acc.value || 0));
                                                    }}
                                                >
                                                    <Pencil className="h-3 w-3" /> Edit Balance
                                                </Button>

                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-gray-400 hover:text-red-600"
                                                    onClick={() => onDelete(acc.id || acc.name)}
                                                    title="Delete Account"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
