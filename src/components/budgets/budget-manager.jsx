"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/currency";
import { PlusCircle, Target, Edit3 } from "lucide-react";

export function BudgetManager({ budgets, categories, transactions, currency = "INR", onSave, onDelete }) {
    const [selectedCat, setSelectedCat] = useState(null);
    const [budgetAmount, setBudgetAmount] = useState("");
    const [openModal, setOpenModal] = useState(false);

    const spentByCategory = {};
    transactions
        .filter((t) => t.type === "EXPENSE")
        .forEach((t) => {
            const key = t.categoryId || "uncategorized";
            spentByCategory[key] = (spentByCategory[key] || 0) + Number(t.amount);
        });

    const handleOpenPopup = (cat, currentAmount) => {
        setSelectedCat(cat);
        setBudgetAmount(currentAmount ? String(currentAmount) : "");
        setOpenModal(true);
    };

    const handleSaveBudget = (e) => {
        e.preventDefault();
        if (!selectedCat) return;

        const amt = parseFloat(budgetAmount);
        onSave({
            categoryId: selectedCat.id,
            amount: isNaN(amt) ? 0 : amt,
            month: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        });

        setOpenModal(false);
        setSelectedCat(null);
        setBudgetAmount("");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl border shadow-xs">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <Target className="h-6 w-6 text-purple-600" />
                        Monthly Expense Budgets
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        Set spending limits per category in React Modal Popups and track progress in real time.
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {categories
                    .filter((c) => c.type === "EXPENSE")
                    .map((cat) => {
                        const budget = budgets.find((b) => b.categoryId === cat.id);
                        const spent = spentByCategory[cat.id] || 0;
                        const amount = Number(budget?.amount || 0);
                        const percent = amount > 0 ? Math.min((spent / amount) * 100, 100) : 0;
                        const over = amount > 0 && spent > amount;

                        return (
                            <div key={cat.id} className="rounded-xl border bg-white p-5 shadow-xs hover:shadow-md transition">
                                <div className="mb-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{cat.icon || "•"}</span>
                                        <div>
                                            <span className="font-bold text-gray-900">{cat.name}</span>
                                            <div className="text-xs text-gray-500">
                                                {amount > 0
                                                    ? `Budget: ${formatCurrency(amount, currency)}`
                                                    : "No budget cap set"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="xs"
                                            onClick={() => handleOpenPopup(cat, amount)}
                                            className="bg-purple-600 hover:bg-purple-700 text-white gap-1"
                                        >
                                            <Edit3 className="h-3.5 w-3.5" />
                                            {amount > 0 ? "Edit Budget" : "+ Set Budget"}
                                        </Button>
                                        {budget && (
                                            <Button
                                                size="xs"
                                                variant="outline"
                                                onClick={() => onDelete(budget.id)}
                                                className="text-gray-500 hover:text-red-600"
                                            >
                                                Clear
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {amount > 0 && (
                                    <>
                                        <div className="mb-1 flex justify-between text-xs font-semibold text-gray-600">
                                            <span>
                                                Spent: {formatCurrency(spent, currency)}
                                            </span>
                                            <span className={over ? "text-red-600 font-bold" : "text-emerald-600 font-bold"}>
                                                {over
                                                    ? `⚠️ Exceeded by ${formatCurrency(spent - amount, currency)}`
                                                    : `Remaining: ${formatCurrency(amount - spent, currency)}`}
                                            </span>
                                        </div>
                                        <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${over ? "bg-red-500" : percent > 85 ? "bg-amber-500" : "bg-purple-600"
                                                    }`}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
            </div>

            {/* React Modal Popup for Setting Category Budget */}
            <Dialog open={openModal} onOpenChange={setOpenModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-purple-600" />
                            <span>Set Budget for {selectedCat?.name}</span>
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSaveBudget} className="space-y-4 py-2">
                        <div>
                            <Label htmlFor="budgetInput">Monthly Spending Limit ({currency}) *</Label>
                            <Input
                                id="budgetInput"
                                type="number"
                                step="0.01"
                                placeholder="e.g. 5000"
                                value={budgetAmount}
                                onChange={(e) => setBudgetAmount(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t">
                            <Button type="button" variant="outline" onClick={() => setOpenModal(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                                Save Category Budget
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
