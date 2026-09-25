"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CategoryManager } from "@/components/categories/category-manager";
import { formatCurrency } from "@/lib/currency";
import {
    Settings,
    DollarSign,
    Bell,
    RotateCcw,
    Save,
    Tag,
    Download,
    Upload,
    Database,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
    const [currency, setCurrency] = useState("INR");
    const [overspendingAlerts, setOverspendingAlerts] = useState(true);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const storedCurr = localStorage.getItem("finsight_currency");
            if (storedCurr) setCurrency(storedCurr);

            const storedAlerts = localStorage.getItem("finsight_alerts");
            if (storedAlerts !== null) setOverspendingAlerts(storedAlerts === "true");
        }, 0);

        return () => clearTimeout(timeoutId);
    }, []);

    const handleSaveSettings = (e) => {
        e.preventDefault();
        localStorage.setItem("finsight_currency", currency);
        localStorage.setItem("finsight_alerts", String(overspendingAlerts));
        window.dispatchEvent(new CustomEvent("finsight:currency-updated", { detail: { currency } }));
        toast.success("Settings saved successfully!");
    };

    const handleBackupData = () => {
        const data = {
            version: "1.0",
            exportDate: new Date().toISOString(),
            walletBalance: localStorage.getItem("finsight_wallet_balance") || "0",
            assets: JSON.parse(localStorage.getItem("finsight_assets") || "[]"),
            transactions: JSON.parse(localStorage.getItem("finsight_transactions") || "[]"),
            customCategories: JSON.parse(localStorage.getItem("finsight_custom_categories") || "[]"),
            billReminders: JSON.parse(localStorage.getItem("finsight_bill_reminders") || "[]"),
            savingsGoals: JSON.parse(localStorage.getItem("finsight_savings_goals") || "[]"),
            currency: localStorage.getItem("finsight_currency") || "INR",
        };

        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(data, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `SpendTrack_Backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Account Data Snapshot Exported (JSON)!");
    };

    const handleRestoreData = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const parsed = JSON.parse(evt.target.result);
                if (parsed.transactions && parsed.assets) {
                    if (parsed.walletBalance) localStorage.setItem("finsight_wallet_balance", String(parsed.walletBalance));
                    if (parsed.assets) localStorage.setItem("finsight_assets", JSON.stringify(parsed.assets));
                    if (parsed.transactions) localStorage.setItem("finsight_transactions", JSON.stringify(parsed.transactions));
                    if (parsed.customCategories) localStorage.setItem("finsight_custom_categories", JSON.stringify(parsed.customCategories));
                    if (parsed.billReminders) localStorage.setItem("finsight_bill_reminders", JSON.stringify(parsed.billReminders));
                    if (parsed.savingsGoals) localStorage.setItem("finsight_savings_goals", JSON.stringify(parsed.savingsGoals));
                    if (parsed.currency) localStorage.setItem("finsight_currency", parsed.currency);

                    toast.success("Account Data Restored Successfully! Reloading app...");
                    setTimeout(() => window.location.reload(), 700);
                } else {
                    toast.error("Invalid backup JSON format!");
                }
            } catch (err) {
                toast.error("Failed to parse JSON backup file!");
            }
        };
        reader.readAsText(file);
    };

    const handleResetData = async () => {
        if (
            !confirm(
                "⚠️ Are you sure you want to reset all account data? This will permanently wipe all transactions, assets, bill reminders, savings goals, and reset your wallet balance to ₹0.00!"
            )
        )
            return;

        try {
            await fetch("/api/account/reset", { method: "POST" });
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

        toast.success("Account data cleared! Refreshing application...");
        setTimeout(() => window.location.reload(), 600);
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl border shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <Settings className="h-6 w-6 text-purple-600" />
                        Settings & Data Backup Center
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Configure currency defaults, custom category icons, over-spending alerts, and JSON data backup/restore.
                    </p>
                </div>
            </div>

            {/* CATEGORIES MANAGEMENT */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-purple-600" />
                    <h2 className="text-lg font-bold text-gray-900">Category & Subcategory Management</h2>
                </div>
                <CategoryManager />
            </div>

            {/* JSON DATA BACKUP & RESTORE SECTION */}
            <div className="rounded-2xl border bg-white p-6 shadow-xs space-y-4">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
                    <Database className="h-5 w-5 text-purple-600" />
                    Data Migration, Backup & Restore (JSON)
                </h2>

                <p className="text-xs text-gray-500 leading-relaxed">
                    Export your complete SpendTrack profile (transactions, accounts, savings goals, custom categories) to a local `.json` file for offline backup or migration to another browser.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                    <Button
                        type="button"
                        onClick={handleBackupData}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold gap-2 shadow-xs"
                    >
                        <Download className="h-4 w-4" /> Download JSON Backup
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-700 border-gray-300 hover:bg-gray-100 text-xs font-semibold gap-2"
                    >
                        <Upload className="h-4 w-4 text-purple-600" /> Restore from JSON File
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleRestoreData}
                        accept=".json"
                        className="hidden"
                    />
                </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* 1. CURRENCY PREFERENCES */}
                <div className="rounded-2xl border bg-white p-6 shadow-xs space-y-4">
                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
                        <DollarSign className="h-5 w-5 text-emerald-600" />
                        Currency & Financial Preferences
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="currencySelect" className="text-xs font-semibold text-gray-700">Default Currency Display</Label>
                            <select
                                id="currencySelect"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-semibold mt-1"
                            >
                                <option value="INR">₹ INR - Indian Rupee (Default)</option>
                                <option value="USD">$ USD - US Dollar</option>
                                <option value="EUR">€ EUR - Euro</option>
                                <option value="GBP">£ GBP - British Pound</option>
                                <option value="JPY">¥ JPY - Japanese Yen</option>
                                <option value="AUD">$ AUD - Australian Dollar</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 2. NOTIFICATIONS & ALERTS */}
                <div className="rounded-2xl border bg-white p-6 shadow-xs space-y-4">
                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
                        <Bell className="h-5 w-5 text-amber-500" />
                        Notifications & Over-spending Alerts
                    </h2>

                    <div className="space-y-3 text-xs">
                        <label className="flex items-center justify-between p-3.5 rounded-xl border bg-gray-50/50 cursor-pointer hover:bg-gray-100/50 transition">
                            <div>
                                <div className="font-bold text-gray-900">Wallet Over-spending Protection Alerts</div>
                                <div className="text-[11px] text-gray-500">
                                    Display browser toasts & warning modals when expense exceeds wallet balance limit.
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={overspendingAlerts}
                                onChange={(e) => setOverspendingAlerts(e.target.checked)}
                                className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500"
                            />
                        </label>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-md text-xs font-bold px-5 h-10 rounded-xl">
                        <Save className="h-4 w-4" /> Save Preferences
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleResetData}
                        className="text-red-600 border-red-200 hover:bg-red-50 gap-2 text-xs font-semibold h-10 rounded-xl"
                    >
                        <RotateCcw className="h-4 w-4" /> Reset Local Data to Default
                    </Button>
                </div>
            </form>
        </div>
    );
}

