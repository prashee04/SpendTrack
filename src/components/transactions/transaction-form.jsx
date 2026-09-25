"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema } from "@/lib/validators/transaction";
import { AIScannerModal } from "@/components/transactions/ai-scanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/currency";
import { Sparkles, Camera, Repeat, AlertCircle, Star, Plus, Wallet, Tag } from "lucide-react";
import toast from "react-hot-toast";

const FALLBACK_INCOME_CATEGORIES = [
    { id: "cat_allowance", name: "Allowance", icon: "💵", type: "INCOME" },
    { id: "cat_salary", name: "Salary", icon: "💼", type: "INCOME" },
    { id: "cat_petty_cash", name: "Petty Cash", icon: "💵", type: "INCOME" },
    { id: "cat_bonus", name: "Bonus", icon: "🎁", type: "INCOME" },
    { id: "cat_others", name: "Others", icon: "📦", type: "INCOME" },
];

const FALLBACK_EXPENSE_CATEGORIES = [
    { id: "cat_food", name: "Food & Dining", icon: "🍔", type: "EXPENSE" },
    { id: "cat_transport", name: "Transport & Fuel", icon: "🚗", type: "EXPENSE" },
    { id: "cat_bills", name: "Bills & Utilities", icon: "💡", type: "EXPENSE" },
    { id: "cat_shopping", name: "Shopping", icon: "🛍️", type: "EXPENSE" },
    { id: "cat_health", name: "Healthcare", icon: "🏥", type: "EXPENSE" },
    { id: "cat_entertainment", name: "Entertainment", icon: "🎬", type: "EXPENSE" },
    { id: "cat_other_exp", name: "Other Expense", icon: "📦", type: "EXPENSE" },
];

const EMPTY_ASSETS = [];
const EMPTY_CATEGORIES = [];

export function TransactionForm({
    defaultValues,
    categories = EMPTY_CATEGORIES,
    walletBalance = 0,
    assets: initialAssets = EMPTY_ASSETS,
    onSubmit,
    onCancel,
    onAddAsset,
    currency = "INR",
}) {
    const [openScanner, setOpenScanner] = useState(false);
    const [localAssets, setLocalAssets] = useState(initialAssets);
    const [addAccountOpen, setAddAccountOpen] = useState(false);
    const [addCategoryOpen, setAddCategoryOpen] = useState(false);
    const [customCategories, setCustomCategories] = useState([]);

    // Form state for inline account creation
    const [newAccName, setNewAccName] = useState("");
    const [newAccGroup, setNewAccGroup] = useState("Bank Accounts");
    const [newAccValue, setNewAccValue] = useState("");

    // Form state for inline category creation
    const [newCatName, setNewCatName] = useState("");
    const [newCatIcon, setNewCatIcon] = useState("🏷️");

    useEffect(() => {
        if (initialAssets && initialAssets.length > 0) {
            setLocalAssets(initialAssets);
        } else {
            const storedAssets = localStorage.getItem("finsight_assets");
            if (storedAssets) {
                try {
                    const parsed = JSON.parse(storedAssets);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setLocalAssets(parsed);
                    }
                } catch { }
            }
        }

        const storedCustom = localStorage.getItem("finsight_custom_categories");
        if (storedCustom) {
            try {
                setCustomCategories(JSON.parse(storedCustom));
            } catch { }
        }
    }, [initialAssets]);

    // Build comprehensive merged categories list (props + fallbacks + custom categories)
    const combinedCategories = useMemo(() => {
        const map = new Map();

        // 1. Add fallback income & expense categories
        [...FALLBACK_INCOME_CATEGORIES, ...FALLBACK_EXPENSE_CATEGORIES].forEach((c) => {
            map.set(c.id, c);
        });

        // 2. Add custom categories from localStorage or props
        [...customCategories, ...(categories || [])].forEach((c) => {
            const key = c.id || c._id;
            if (key) {
                map.set(key, { ...c, id: key });
            }
        });

        // 3. Preserve category if attached to defaultValues
        if (defaultValues?.category) {
            const catObj = defaultValues.category;
            const key = catObj.id || catObj._id || defaultValues.categoryId;
            if (key) {
                map.set(key, {
                    id: key,
                    name: catObj.name || "Categorized",
                    icon: catObj.icon || "🏷️",
                    type: catObj.type || defaultValues.type || "EXPENSE",
                });
            }
        }

        return Array.from(map.values());
    }, [categories, customCategories, defaultValues]);

    const initialCatId = useMemo(() => {
        if (defaultValues?.categoryId) return defaultValues.categoryId;
        if (defaultValues?.category) return defaultValues.category.id || defaultValues.category._id;
        return null;
    }, [defaultValues]);

    const form = useForm({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: defaultValues?.type || "EXPENSE",
            amount: defaultValues?.amount ? Number(defaultValues.amount) : "",
            description: defaultValues?.description || "",
            categoryId: initialCatId,
            subCategory: defaultValues?.subCategory || "",
            reference: defaultValues?.reference || "",
            notes: defaultValues?.notes || "",
            date: defaultValues?.date
                ? new Date(defaultValues.date).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
        },
    });

    const type = useWatch({ control: form.control, name: "type" });
    const selectedCatId = useWatch({ control: form.control, name: "categoryId" });
    const subCategory = useWatch({ control: form.control, name: "subCategory" });
    const reference = useWatch({ control: form.control, name: "reference" });
    const notes = useWatch({ control: form.control, name: "notes" });

    const selectedCatObj = useMemo(() => {
        if (!selectedCatId) return null;
        return combinedCategories.find((c) => (c.id || c._id) === selectedCatId);
    }, [selectedCatId, combinedCategories]);

    const selectedCatSubcategories = useMemo(() => {
        return selectedCatObj?.subcategories || [];
    }, [selectedCatObj]);

    const filteredCategories = useMemo(() => {
        return combinedCategories.filter((c) => {
            const catId = c.id || c._id;
            if (selectedCatId && catId === selectedCatId) return true;
            return c.type === type || !c.type;
        });
    }, [combinedCategories, type, selectedCatId]);

    useEffect(() => {
        if (defaultValues) {
            form.reset({
                type: defaultValues.type || "EXPENSE",
                amount: defaultValues.amount ? Number(defaultValues.amount) : "",
                description: defaultValues.description || "",
                categoryId: initialCatId,
                subCategory: defaultValues.subCategory || "",
                reference: defaultValues.reference || "",
                notes: defaultValues.notes || "",
                date: defaultValues.date
                    ? new Date(defaultValues.date).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0],
            });
        }
    }, [defaultValues, initialCatId, form]);

    useEffect(() => {
        form.clearErrors();
    }, [type, form]);

    const handleFormSubmit = async (data, shouldContinue = false) => {
        if (type === "TRANSFER") {
            if (!data.reference || !data.notes) {
                toast.error("Please select both From and To accounts for the transfer!");
                return;
            }
            if (data.reference === data.notes) {
                toast.error("From Account and To Account cannot be the same! Please select two different accounts.");
                return;
            }
            data.categoryId = null;
            data.subCategory = null;
        } else {
            if (!data.reference) {
                toast.error("Account is required! Please select a linked asset account.");
                return;
            }
        }

        const amountNum = Number(data.amount);

        if (type === "EXPENSE") {
            const oldAmount =
                defaultValues?.type === "EXPENSE" ? Number(defaultValues.amount || 0) : 0;
            const availableBalance = walletBalance + oldAmount;

            if (amountNum > availableBalance) {
                toast.error(
                    `Insufficient Wallet Balance! Cannot spend ${formatCurrency(amountNum, currency)} — available: ${formatCurrency(availableBalance, currency)}.`
                );
                return;
            }
        }

        const success = await onSubmit(data);
        if (success !== false && (!defaultValues || shouldContinue)) {
            form.reset({
                type: type,
                amount: "",
                description: "",
                categoryId: null,
                reference: "",
                notes: "",
                date: new Date().toISOString().split("T")[0],
            });
            if (shouldContinue) {
                toast.success("Saved! Ready for next expense entry.");
            }
        }
    };

    const handleCreateAccount = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const trimmedName = newAccName.trim();
        if (!trimmedName) {
            toast.error("Account name is required!");
            return;
        }

        const isDuplicate = localAssets.some(
            (ast) => ast.name?.toLowerCase().trim() === trimmedName.toLowerCase()
        );
        if (isDuplicate) {
            toast.error(`An account with the name "${trimmedName}" already exists! Please use a unique name.`);
            return;
        }

        const newAsset = {
            id: "ast_" + Date.now(),
            name: trimmedName,
            group: newAccGroup,
            type: newAccGroup.toLowerCase().includes("card")
                ? "card"
                : newAccGroup.toLowerCase().includes("cash")
                    ? "cash"
                    : newAccGroup.toLowerCase().includes("bank")
                        ? "bank"
                        : "investment",
            value: parseFloat(newAccValue || 0),
            purchaseValue: parseFloat(newAccValue || 0),
            createdAt: new Date().toISOString(),
        };

        const updated = [...localAssets, newAsset];
        setLocalAssets(updated);

        localStorage.setItem("finsight_assets", JSON.stringify(updated));
        const total = updated.reduce((sum, a) => sum + Number(a.value || 0), 0);
        localStorage.setItem("finsight_wallet_balance", String(total));

        if (onAddAsset) {
            onAddAsset(newAsset, updated);
        }

        window.dispatchEvent(
            new CustomEvent("finsight:assets-updated", { detail: { assets: updated, total } })
        );

        // Sync to backend DB
        fetch("/api/assets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: newAsset.name,
                group: newAsset.group,
                type: newAsset.type,
                value: newAsset.value,
                purchaseValue: newAsset.purchaseValue,
            }),
        }).catch(() => { });

        form.setValue("reference", newAsset.name, { shouldValidate: true, shouldDirty: true });

        toast.success(`Created account "${newAsset.name}" & linked to Assets!`);
        setNewAccName("");
        setNewAccValue("");
        setAddAccountOpen(false);
    };

    const handleCreateCategory = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!newCatName.trim()) {
            toast.error("Category name is required!");
            return;
        }

        const newCategory = {
            id: "cat_custom_" + Date.now(),
            name: newCatName.trim(),
            icon: newCatIcon.trim() || "🏷️",
            type: type,
            subcategories: [],
        };

        const updated = [...customCategories, newCategory];
        setCustomCategories(updated);

        localStorage.setItem("finsight_custom_categories", JSON.stringify(updated));
        form.setValue("categoryId", newCategory.id, { shouldValidate: true, shouldDirty: true });

        toast.success(`Created category "${newCategory.name}" & auto-selected!`);
        setNewCatName("");
        setNewCatIcon("🏷️");
        setAddCategoryOpen(false);
    };

    const quickFill = (desc, amt, tType, catName, refName) => {
        const foundCat = combinedCategories.find(
            (c) => c.name?.toLowerCase().includes(catName.toLowerCase()) && (c.type === tType || !c.type)
        );
        form.setValue("type", tType);
        form.setValue("description", desc);
        form.setValue("amount", amt);
        if (foundCat) form.setValue("categoryId", foundCat.id || foundCat._id);
        if (refName) form.setValue("reference", refName);
        toast.success(`Quick-filled ${desc}!`);
    };

    const handleExtractedData = (data) => {
        if (!data) return;
        const targetType = data.type || "EXPENSE";
        form.setValue("type", targetType);
        form.setValue("description", data.description || "");
        form.setValue("amount", data.amount || "");
        if (data.reference) form.setValue("reference", data.reference);
        if (data.notes) form.setValue("notes", data.notes);

        if (data.categoryName) {
            const matched = combinedCategories.find(
                (c) =>
                    c.name?.toLowerCase().includes(data.categoryName.toLowerCase()) &&
                    (c.type === targetType || !c.type)
            );
            if (matched) form.setValue("categoryId", matched.id || matched._id);
        }
    };

    return (
        <>
            <form
                onSubmit={form.handleSubmit((d) => handleFormSubmit(d, false))}
                className="space-y-4 bg-white p-4 rounded-xl border shadow-xs"
            >
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400">Trans.</span>
                        <span className="text-gray-300">/</span>
                        <span className="text-sm font-bold text-[#ff5c54] capitalize">{type.toLowerCase()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-400 cursor-pointer" title="Favorites" />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
                    <button
                        type="button"
                        onClick={() => {
                            form.setValue("type", "INCOME");
                            form.setValue("categoryId", null);
                        }}
                        className={`py-2 text-xs font-bold rounded-lg transition-all ${type === "INCOME"
                                ? "bg-white text-emerald-600 shadow-xs border border-emerald-500/40"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                    >
                        Income
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            form.setValue("type", "EXPENSE");
                            form.setValue("categoryId", null);
                        }}
                        className={`py-2 text-xs font-bold rounded-lg transition-all ${type === "EXPENSE"
                                ? "bg-white text-[#ff5c54] shadow-xs border border-[#ff5c54]"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                    >
                        Expense
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            form.setValue("type", "TRANSFER");
                            form.setValue("categoryId", null);
                        }}
                        className={`py-2 text-xs font-bold rounded-lg transition-all ${type === "TRANSFER"
                                ? "bg-white text-blue-600 shadow-xs border border-blue-500/40"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                    >
                        Transfer
                    </button>
                </div>

                {!defaultValues && (
                    <div className="rounded-lg bg-purple-50/70 p-2.5 border border-purple-100 space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-purple-900 flex items-center gap-1">
                                ⚡ Quick AI Auto-Fill:
                            </span>
                            <Button
                                type="button"
                                size="xs"
                                onClick={() => setOpenScanner(true)}
                                className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] gap-1 py-0.5 px-2 font-semibold"
                            >
                                <Sparkles className="h-3 w-3" /> AI Receipt OCR / SMS Reader
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-1.5 text-[11px]">
                            <button type="button" onClick={() => quickFill("Swiggy Delivery", 450, "EXPENSE", "Food", "GPay / UPI E-Wallet")} className="bg-white text-gray-700 hover:bg-purple-100 rounded px-2 py-0.5 border shadow-2xs font-medium">
                                🍔 Swiggy ₹450
                            </button>
                            <button type="button" onClick={() => quickFill("Uber Ride Fare", 320, "EXPENSE", "Transport", "GPay / UPI E-Wallet")} className="bg-white text-gray-700 hover:bg-purple-100 rounded px-2 py-0.5 border shadow-2xs font-medium">
                                🚕 Uber ₹320
                            </button>
                            <button type="button" onClick={() => quickFill("Electricity Utility Bill", 1250, "EXPENSE", "Bills", "HDFC Savings Bank")} className="bg-white text-gray-700 hover:bg-purple-100 rounded px-2 py-0.5 border shadow-2xs font-medium">
                                💡 Utility Bill ₹1,250
                            </button>
                            <button type="button" onClick={() => quickFill("Monthly Salary Inflow", 85000, "INCOME", "Salary", "HDFC Savings Bank")} className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded px-2 py-0.5 border border-emerald-200 shadow-2xs font-medium">
                                💼 Salary +₹85,000
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-3 text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 border-b border-gray-200 pb-2">
                        <Label htmlFor="date" className="text-gray-600 font-medium">Date</Label>
                        <div className="flex items-center gap-2 justify-between sm:justify-end w-full sm:w-auto">
                            <Input id="date" type="date" {...form.register("date")} className="h-8 w-full sm:w-auto text-xs bg-transparent border-0 text-left sm:text-right font-semibold cursor-pointer" />
                            <Repeat className="h-4 w-4 text-gray-400 hover:text-purple-500 cursor-pointer shrink-0" title="Repeat / Installment" />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 border-b border-gray-200 pb-2">
                        <Label htmlFor="amount" className="text-gray-600 font-medium">Amount ({currency}) *</Label>
                        <Input id="amount" type="number" step="0.01" placeholder="0.00" {...form.register("amount")} className="h-9 w-full sm:w-40 text-left sm:text-right font-bold text-base bg-transparent border-gray-300" />
                    </div>
                    {form.formState.errors.amount && (
                        <p className="text-xs text-red-500 font-medium text-right">{form.formState.errors.amount.message}</p>
                    )}

                    {type !== "TRANSFER" && (
                        <>
                            {/* CATEGORY FIELD WITH + ADD CATEGORY BUTTON */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 border-b border-gray-200 pb-2">
                                <div className="flex items-center gap-1.5">
                                    <Label className="text-gray-600 font-medium">Category *</Label>
                                    <button
                                        type="button"
                                        onClick={() => setAddCategoryOpen(true)}
                                        className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded font-semibold flex items-center gap-0.5"
                                        title="Add New Category"
                                    >
                                        <Plus className="h-3 w-3" /> Add
                                    </button>
                                </div>
                                <div className="w-full sm:w-52">
                                    <Select value={selectedCatId || ""} onValueChange={(v) => form.setValue("categoryId", v || null)}>
                                        <SelectTrigger className="h-9 text-xs bg-transparent border-gray-300 w-full">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white text-gray-900 max-h-60 overflow-y-auto">
                                            {filteredCategories.map((cat) => {
                                                const valKey = cat.id || cat._id;
                                                return (
                                                    <SelectItem key={valKey} value={valKey}>
                                                        {cat.icon || "•"} {cat.name}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* SUBCATEGORY FIELD */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 border-b border-gray-200 pb-2">
                                <Label className="text-gray-600 font-medium">Subcategory</Label>
                                <div className="w-full sm:w-52">
                                    {selectedCatSubcategories.length > 0 ? (
                                        <select
                                            className="h-9 w-full text-xs bg-transparent border rounded-md px-2 border-gray-300 font-medium text-gray-800"
                                            value={subCategory || ""}
                                            onChange={(e) => form.setValue("subCategory", e.target.value)}
                                        >
                                            <option value="">-- Select Subcategory --</option>
                                            {selectedCatSubcategories.map((sub, idx) => (
                                                <option key={idx} value={sub}>
                                                    {sub}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <Input
                                            placeholder="e.g. Dining Out, Fuel..."
                                            {...form.register("subCategory")}
                                            className="h-9 text-xs bg-transparent border-gray-300 w-full"
                                        />
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {type === "TRANSFER" ? (
                        <div className="space-y-3 border-b border-gray-200 pb-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
                                <Label className="text-gray-600 font-medium">From Account *</Label>
                                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                                    <select
                                        className="h-8 flex-1 sm:w-44 text-xs bg-transparent border rounded-md px-2 border-gray-300 font-medium"
                                        value={reference || ""}
                                        onChange={(e) => {
                                            const newRef = e.target.value;
                                            form.setValue("reference", newRef, { shouldValidate: true, shouldDirty: true });
                                            if (notes === newRef) {
                                                form.setValue("notes", "", { shouldValidate: true, shouldDirty: true });
                                            }
                                        }}
                                        required
                                    >
                                        <option value="">-- Source Asset --</option>
                                        {localAssets.map((ast) => (
                                            <option key={ast.id || ast.name} value={ast.name}>
                                                {ast.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button type="button" onClick={() => setAddAccountOpen(true)} className="h-8 px-2 text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-md font-semibold shrink-0 flex items-center gap-1">
                                        <Plus className="h-3 w-3" /> Add
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
                                <Label className="text-gray-600 font-medium">To Account *</Label>
                                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                                    <select
                                        className="h-8 flex-1 sm:w-44 text-xs bg-transparent border rounded-md px-2 border-gray-300 font-medium"
                                        value={notes || ""}
                                        onChange={(e) => form.setValue("notes", e.target.value, { shouldValidate: true, shouldDirty: true })}
                                        required
                                    >
                                        <option value="">-- Destination Asset --</option>
                                        {localAssets.map((ast) => (
                                            <option
                                                key={ast.id || ast.name}
                                                value={ast.name}
                                                disabled={ast.name === reference}
                                            >
                                                {ast.name} {ast.name === reference ? "(Same as From)" : ""}
                                            </option>
                                        ))}
                                    </select>
                                    <button type="button" onClick={() => setAddAccountOpen(true)} className="h-8 px-2 text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-md font-semibold shrink-0 flex items-center gap-1">
                                        <Plus className="h-3 w-3" /> Add
                                    </button>
                                </div>
                            </div>
                            {reference && notes && reference === notes && (
                                <p className="text-xs text-red-500 font-bold text-right pt-0.5">
                                    ⚠️ From Account & To Account cannot be the same!
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 border-b border-gray-200 pb-2">
                            <Label htmlFor="reference" className="text-gray-600 font-medium">Account *</Label>
                            <div className="flex items-center gap-1.5 w-full sm:w-auto">
                                <select id="reference" className="h-9 flex-1 sm:w-44 text-xs bg-transparent border rounded-md px-2 border-gray-300" value={reference || ""} onChange={(e) => form.setValue("reference", e.target.value)} required>
                                    <option value="">-- Select Account --</option>
                                    {localAssets.map((ast) => (
                                        <option key={ast.id || ast.name} value={ast.name}>
                                            {ast.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setAddAccountOpen(true)}
                                    className="h-9 px-2 text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-md font-semibold shrink-0 flex items-center gap-1"
                                    title="Add New Bank Account or Asset"
                                >
                                    <Plus className="h-3.5 w-3.5" /> Add
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 border-b border-gray-200 pb-2">
                        <Label htmlFor="notes" className="text-gray-600 font-medium flex items-center gap-1">
                            Note <AlertCircle className="h-3.5 w-3.5 text-gray-400" />
                        </Label>
                        <Input id="notes" placeholder="Additional details..." {...form.register("notes")} className="h-8 w-full sm:w-56 text-xs bg-transparent border-0 text-left sm:text-right placeholder:text-gray-400" />
                    </div>

                    <div className="pt-2">
                        <Label htmlFor="description" className="text-xs text-gray-500">Description *</Label>
                        <div className="relative mt-1">
                            <Input id="description" placeholder="e.g. Grocery Shopping, Dinner with Friends" {...form.register("description")} className="h-9 pr-9 text-xs bg-transparent border-gray-300 w-full" />
                            <button type="button" onClick={() => setOpenScanner(true)} className="absolute right-2 top-2 text-gray-400 hover:text-purple-600 transition" title="AI Photo / Receipt Camera Scanner">
                                <Camera className="h-5 w-5" />
                            </button>
                        </div>
                        {form.formState.errors.description && (
                            <p className="text-xs text-red-500 font-medium mt-1">{form.formState.errors.description.message}</p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-4 border-t border-gray-200">
                    <Button type="submit" disabled={form.formState.isSubmitting} className="w-full sm:flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold h-10 shadow-md transition text-xs">
                        {form.formState.isSubmitting ? "Saving..." : defaultValues ? "Update Expense" : "Save Expense"}
                    </Button>

                    {!defaultValues && (
                        <Button type="button" variant="outline" onClick={() => form.handleSubmit((d) => handleFormSubmit(d, true))()} className="w-full sm:w-auto h-10 px-5 border-gray-300 text-gray-700 hover:bg-gray-100 font-medium text-xs">
                            Continue
                        </Button>
                    )}

                    {onCancel && (
                        <Button type="button" variant="ghost" onClick={onCancel} className="w-full sm:w-auto h-10 text-xs text-gray-500">Cancel</Button>
                    )}
                </div>
            </form>

            <AIScannerModal
                open={openScanner}
                onOpenChange={setOpenScanner}
                onExtractedData={handleExtractedData}
                currency={currency}
            />

            {/* INLINE QUICK-ADD ACCOUNT DIALOG */}
            <Dialog open={addAccountOpen} onOpenChange={setAddAccountOpen}>
                <DialogContent className="max-w-md bg-white text-gray-900 border border-gray-100 rounded-3xl p-6 shadow-2xl space-y-4">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 text-base font-bold border-b border-gray-100 pb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                                <span>Account</span>
                                <span>/</span>
                                <span className="text-purple-600 font-bold">New Account</span>
                            </div>
                            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3.5 text-xs pt-1">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                            <Label className="text-xs font-semibold text-gray-700">Account Group *</Label>
                            <select
                                value={newAccGroup}
                                onChange={(e) => setNewAccGroup(e.target.value)}
                                className="h-9 w-56 rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition shadow-2xs"
                            >
                                <option value="Bank Accounts">🏦 Bank Accounts</option>
                                <option value="Cash">💵 Cash</option>
                                <option value="Card">💳 Card (Credit / Liability)</option>
                                <option value="Investments">📈 Investments</option>
                                <option value="Other">📦 Other Accounts</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                            <Label className="text-xs font-semibold text-gray-700">Account Name *</Label>
                            <Input
                                value={newAccName}
                                onChange={(e) => setNewAccName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleCreateAccount(e);
                                    }
                                }}
                                placeholder="e.g. Canara Bank, SBI Savings"
                                className="h-9 w-56 rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 placeholder:text-gray-400 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition shadow-2xs"
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                            <Label className="text-xs font-semibold text-gray-700">Initial Balance ({currency})</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={newAccValue}
                                onChange={(e) => setNewAccValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleCreateAccount(e);
                                    }
                                }}
                                placeholder="0.00"
                                className="h-9 w-36 text-right font-bold rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-800 placeholder:text-gray-400 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition shadow-2xs"
                            />
                        </div>

                        <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                            <Button
                                type="button"
                                onClick={handleCreateAccount}
                                className="flex-1 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                            >
                                Save Account
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setAddAccountOpen(false);
                                }}
                                className="h-10 px-4 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-medium text-xs"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* INLINE QUICK-ADD CATEGORY DIALOG */}
            <Dialog open={addCategoryOpen} onOpenChange={setAddCategoryOpen}>
                <DialogContent className="max-w-sm bg-white text-gray-900 border">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-sm font-bold text-gray-900">
                            <Tag className="h-4 w-4 text-purple-600" />
                            Add New {type === "INCOME" ? "Income" : "Expense"} Category
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 text-xs pt-1">
                        <div className="grid grid-cols-4 gap-2">
                            <div>
                                <Label className="text-gray-700">Icon</Label>
                                <Input
                                    value={newCatIcon}
                                    onChange={(e) => setNewCatIcon(e.target.value)}
                                    className="bg-gray-50 border-gray-300 text-center text-base mt-1"
                                    maxLength={4}
                                />
                            </div>
                            <div className="col-span-3">
                                <Label className="text-gray-700">Category Name *</Label>
                                <Input
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleCreateCategory(e);
                                        }
                                    }}
                                    placeholder={type === "INCOME" ? "e.g. Allowance, Royalty" : "e.g. Subscriptions, Gaming"}
                                    className="bg-gray-50 border-gray-300 mt-1 text-xs"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setAddCategoryOpen(false);
                                }}
                                className="h-8 text-xs border-gray-300 text-gray-700"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleCreateCategory}
                                className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                            >
                                Save Category
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
