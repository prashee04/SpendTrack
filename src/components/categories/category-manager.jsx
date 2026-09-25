"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Plus,
    Pencil,
    MinusCircle,
    GripVertical,
    Tag,
    X,
    Sparkles,
    FolderKanban,
} from "lucide-react";
import toast from "react-hot-toast";

const DEFAULT_INCOME_CATEGORIES = [
    {
        id: "cat_allowance",
        name: "Allowance",
        icon: "💵",
        type: "INCOME",
        subcategories: ["Daily Allowance", "Travel Allowance", "Stipend"],
    },
    {
        id: "cat_salary",
        name: "Salary",
        icon: "💼",
        type: "INCOME",
        subcategories: ["Monthly Pay", "Overtime", "Commission"],
    },
    {
        id: "cat_petty_cash",
        name: "Petty Cash",
        icon: "💵",
        type: "INCOME",
        subcategories: ["Office Cash", "Reimbursement", "Float"],
    },
    {
        id: "cat_bonus",
        name: "Bonus",
        icon: "🎁",
        type: "INCOME",
        subcategories: ["Annual Bonus", "Performance Bonus", "Incentives"],
    },
    {
        id: "cat_others_inc",
        name: "Others",
        icon: "📦",
        type: "INCOME",
        subcategories: ["Gifts", "Interest", "Miscellaneous"],
    },
];

const DEFAULT_EXPENSE_CATEGORIES = [
    {
        id: "cat_food",
        name: "Food",
        icon: "🍜",
        type: "EXPENSE",
        subcategories: ["Lunch", "Dinner", "Eating out", "Beverages"],
    },
    {
        id: "cat_social",
        name: "Social Life",
        icon: "🧑‍🤝‍🧑",
        type: "EXPENSE",
        subcategories: ["Friend", "Fellowship", "Alumni", "Dues"],
    },
    {
        id: "cat_pets",
        name: "Pets",
        icon: "🐶",
        type: "EXPENSE",
        subcategories: ["Food", "Vet", "Grooming", "Toys"],
    },
    {
        id: "cat_transport",
        name: "Transport",
        icon: "🚕",
        type: "EXPENSE",
        subcategories: ["Bus", "Subway", "Taxi", "Car"],
    },
    {
        id: "cat_culture",
        name: "Culture",
        icon: "🖼️",
        type: "EXPENSE",
        subcategories: ["Books", "Movie", "Music", "Apps"],
    },
    {
        id: "cat_household",
        name: "Household",
        icon: "🪑",
        type: "EXPENSE",
        subcategories: ["Appliances", "Furniture", "Kitchen", "Toiletries"],
    },
    {
        id: "cat_apparel",
        name: "Apparel",
        icon: "🥋",
        type: "EXPENSE",
        subcategories: ["Clothing", "Fashion", "Shoes", "Laundry"],
    },
    {
        id: "cat_beauty",
        name: "Beauty",
        icon: "💄",
        type: "EXPENSE",
        subcategories: ["Cosmetics", "Makeup", "Accessories", "Beauty"],
    },
    {
        id: "cat_health",
        name: "Health",
        icon: "🧘",
        type: "EXPENSE",
        subcategories: ["Health", "Yoga", "Hospital", "Medicine"],
    },
    {
        id: "cat_education",
        name: "Education",
        icon: "📙",
        type: "EXPENSE",
        subcategories: ["Schooling", "Textbooks", "School supplies"],
    },
    {
        id: "cat_gift",
        name: "Gift",
        icon: "🎁",
        type: "EXPENSE",
        subcategories: ["Birthday", "Wedding", "Holiday"],
    },
    {
        id: "cat_other",
        name: "Other",
        icon: "📦",
        type: "EXPENSE",
        subcategories: ["Miscellaneous", "General"],
    },
];

const INITIAL_ALL_CATEGORIES = [...DEFAULT_INCOME_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES];

export function CategoryManager({ onCategoriesChange }) {
    const [categories, setCategories] = useState([]);
    const [showSubcategories, setShowSubcategories] = useState(true);
    const [activeType, setActiveType] = useState("EXPENSE");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const [formName, setFormName] = useState("");
    const [formIcon, setFormIcon] = useState("🏷️");
    const [subInput, setSubInput] = useState("");
    const [formSubcategories, setFormSubcategories] = useState([]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const stored = localStorage.getItem("finsight_custom_categories");
            let loaded = [];
            if (stored) {
                try {
                    loaded = JSON.parse(stored);
                } catch {
                    loaded = [];
                }
            }

            const existingNames = new Set((loaded || []).map((c) => (c.name || "").toLowerCase()));
            const missingIncome = DEFAULT_INCOME_CATEGORIES.filter((c) => !existingNames.has(c.name.toLowerCase()));
            const missingExpense = DEFAULT_EXPENSE_CATEGORIES.filter((c) => !existingNames.has(c.name.toLowerCase()));

            const merged = [...(loaded || []), ...missingIncome, ...missingExpense];
            setCategories(merged);
            localStorage.setItem("finsight_custom_categories", JSON.stringify(merged));
        }, 0);
        return () => clearTimeout(timeoutId);
    }, []);

    const saveCategories = (updated) => {
        setCategories(updated);
        localStorage.setItem("finsight_custom_categories", JSON.stringify(updated));
        if (onCategoriesChange) onCategoriesChange(updated);
    };

    const handleOpenAdd = () => {
        setEditingCategory(null);
        setFormName("");
        setFormIcon(activeType === "INCOME" ? "💵" : "🏷️");
        setFormSubcategories([]);
        setSubInput("");
        setIsAddOpen(true);
    };

    const handleOpenEdit = (cat) => {
        setEditingCategory(cat);
        setFormName(cat.name);
        setFormIcon(cat.icon || "🏷️");
        setFormSubcategories(cat.subcategories || []);
        setSubInput("");
        setIsAddOpen(true);
    };

    const handleDelete = (id, name) => {
        if (!confirm(`Delete category "${name}"?`)) return;
        const updated = categories.filter((c) => c.id !== id);
        saveCategories(updated);
        toast.success(`Deleted ${name}`);
    };

    const handleAddSubcategoryTag = () => {
        if (!subInput.trim()) return;
        if (!formSubcategories.includes(subInput.trim())) {
            setFormSubcategories([...formSubcategories, subInput.trim()]);
        }
        setSubInput("");
    };

    const handleRemoveSubcategoryTag = (tag) => {
        setFormSubcategories(formSubcategories.filter((s) => s !== tag));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!formName.trim()) {
            toast.error("Category name required");
            return;
        }

        if (editingCategory) {
            const updated = categories.map((c) =>
                c.id === editingCategory.id
                    ? {
                        ...c,
                        name: formName.trim(),
                        icon: formIcon.trim() || "🏷️",
                        subcategories: formSubcategories,
                    }
                    : c
            );
            saveCategories(updated);
            toast.success(`Updated "${formName}"`);
        } else {
            const newCat = {
                id: `cat_${Date.now()}`,
                name: formName.trim(),
                icon: formIcon.trim() || "🏷️",
                type: activeType,
                subcategories: formSubcategories,
            };
            const updated = [...categories, newCat];
            saveCategories(updated);
            toast.success(`Added category "${formName}"`);
        }

        setIsAddOpen(false);
    };

    const filtered = categories.filter((c) => (c.type || "EXPENSE") === activeType);

    return (
        <div className="rounded-2xl bg-white text-gray-900 p-6 shadow-sm border border-gray-200 max-w-3xl mx-auto space-y-5">
            {/* Header with Segmented Category Switcher & Add Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
                {/* Segmented Type Switcher */}
                <div className="grid grid-cols-2 gap-1.5 bg-gray-100 p-1.5 rounded-xl border border-gray-200 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={() => setActiveType("EXPENSE")}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeType === "EXPENSE"
                                ? "bg-white text-[#ff5c54] shadow-xs border border-[#ff5c54]"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                    >
                        <span>🛍️ Expense Categories</span>
                        <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold">
                            {categories.filter((c) => (c.type || "EXPENSE") === "EXPENSE").length}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveType("INCOME")}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeType === "INCOME"
                                ? "bg-white text-emerald-600 shadow-xs border border-emerald-500/40"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                    >
                        <span>💵 Income Categories</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">
                            {categories.filter((c) => c.type === "INCOME").length}
                        </span>
                    </button>
                </div>

                {/* Add Category Button */}
                <Button
                    type="button"
                    onClick={handleOpenAdd}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs gap-1.5 shadow-xs h-9"
                >
                    <Plus className="h-4 w-4" /> Add {activeType === "INCOME" ? "Income" : "Expense"} Category
                </Button>
            </div>

            {/* Subcategory Toggle Row */}
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2">
                    <FolderKanban className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-bold text-gray-800">Show Subcategory Details</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showSubcategories}
                        onChange={(e) => setShowSubcategories(e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff5c54]"></div>
                </label>
            </div>

            {/* Categories Grid List */}
            <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
                {filtered.length > 0 ? (
                    filtered.map((cat) => (
                        <div
                            key={cat.id}
                            className="flex items-center justify-between p-3.5 bg-white hover:bg-purple-50/40 rounded-xl border border-gray-200 hover:border-purple-200 transition group shadow-2xs"
                        >
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleDelete(cat.id, cat.name)}
                                    className="text-red-500 hover:text-red-600 transition p-1 hover:bg-red-50 rounded-lg"
                                    title="Delete category"
                                >
                                    <MinusCircle className="h-5 w-5 text-red-500" />
                                </button>

                                <div>
                                    <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <span className="text-base">{cat.icon || "🏷️"}</span>
                                        <span>{cat.name}</span>
                                        {cat.subcategories && cat.subcategories.length > 0 && (
                                            <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-semibold">
                                                {cat.subcategories.length} subcategories
                                            </span>
                                        )}
                                    </div>
                                    {showSubcategories && cat.subcategories && cat.subcategories.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                            {cat.subcategories.map((sub, idx) => (
                                                <span
                                                    key={idx}
                                                    className="text-[10px] bg-purple-50 text-purple-800 border border-purple-100 px-2 py-0.5 rounded font-medium"
                                                >
                                                    {sub}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-gray-400">
                                <button
                                    type="button"
                                    onClick={() => handleOpenEdit(cat)}
                                    className="p-2 text-gray-600 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition"
                                    title="Edit Category"
                                >
                                    <Pencil className="h-4 w-4" />
                                </button>
                                <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <Tag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-gray-700">No {activeType.toLowerCase()} categories found</p>
                        <Button
                            type="button"
                            onClick={handleOpenAdd}
                            className="mt-3 bg-purple-600 text-white text-xs font-bold"
                        >
                            + Add {activeType === "INCOME" ? "Income" : "Expense"} Category
                        </Button>
                    </div>
                )}
            </div>

            {/* Add / Edit Category Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-white border border-gray-200 text-gray-900 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <Tag className="h-5 w-5 text-purple-600" />
                            {editingCategory ? "Edit Category & Subcategories" : `Add New ${activeType === "INCOME" ? "Income" : "Expense"} Category`}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
                        <div className="grid grid-cols-4 gap-3">
                            <div>
                                <Label className="text-gray-700 text-xs">Icon</Label>
                                <Input
                                    value={formIcon}
                                    onChange={(e) => setFormIcon(e.target.value)}
                                    className="bg-gray-50 border-gray-300 text-gray-900 text-center text-lg mt-1"
                                    maxLength={4}
                                />
                            </div>
                            <div className="col-span-3">
                                <Label className="text-gray-700 text-xs">Category Name *</Label>
                                <Input
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder={activeType === "INCOME" ? "e.g. Allowance, Royalty, Stipend" : "e.g. Subscriptions, Gaming"}
                                    className="bg-gray-50 border-gray-300 text-gray-900 mt-1"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="text-gray-700 text-xs">Add Subcategories (Optional)</Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    value={subInput}
                                    onChange={(e) => setSubInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleAddSubcategoryTag();
                                        }
                                    }}
                                    placeholder="e.g. Daily Allowance, Stipend"
                                    className="bg-gray-50 border-gray-300 text-gray-900 text-xs"
                                />
                                <Button
                                    type="button"
                                    onClick={handleAddSubcategoryTag}
                                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold"
                                >
                                    Add Tag
                                </Button>
                            </div>

                            {formSubcategories.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                    {formSubcategories.map((sub) => (
                                        <span
                                            key={sub}
                                            className="text-xs bg-purple-50 text-purple-900 border border-purple-200 px-2.5 py-1 rounded-md flex items-center gap-1 font-medium"
                                        >
                                            {sub}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSubcategoryTag(sub)}
                                                className="hover:text-red-600"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddOpen(false)}
                                className="border-gray-300 text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                                {editingCategory ? "Update Category" : "Save Category"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

