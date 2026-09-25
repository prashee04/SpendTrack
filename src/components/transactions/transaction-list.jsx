"use client";

import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { Pencil, Trash2, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TransactionList({ transactions, currency = "INR", onEdit, onDelete }) {
    if (!transactions.length) {
        return (
            <div className="rounded-xl border bg-white p-12 text-center shadow-sm">
                <p className="text-lg font-medium text-gray-700">No transactions yet</p>
                <p className="mt-1 text-sm text-gray-500">Add your first transaction to get started.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto min-w-full rounded-xl border bg-white shadow-sm">
            <table className="w-full text-sm min-w-[600px]">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {transactions.map((t) => {
                        const isIncome = t.type === "INCOME";
                        const isTransfer = t.type === "TRANSFER";
                        const sign = isIncome ? "+" : isTransfer ? "↔ " : "-";
                        const colorClass = isIncome
                            ? "text-emerald-600"
                            : isTransfer
                                ? "text-blue-600"
                                : "text-red-600";

                        return (
                            <tr key={t.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="font-medium text-gray-900">{t.description}</div>
                                    {t.reference && (
                                        <div className="text-xs text-gray-500">Ref: {t.reference}</div>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 inline-flex items-center gap-1 w-max">
                                            {isTransfer && <ArrowLeftRight className="h-3 w-3" />}
                                            {t.category?.name || "Uncategorized"}
                                        </span>
                                        {t.subCategory && (
                                            <span className="text-[11px] text-gray-500 font-medium pl-1">
                                                ↳ {t.subCategory}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {format(new Date(t.date), "MMM d, yyyy")}
                                </td>
                                <td className={`px-4 py-3 text-right font-semibold ${colorClass}`}>
                                    {sign}
                                    {formatCurrency(Math.abs(Number(t.amount) || 0), currency)}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        {onEdit && (
                                            <Button size="icon" variant="ghost" onClick={() => onEdit(t)} aria-label="Edit">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {onDelete && (
                                            <Button size="icon" variant="ghost" onClick={() => onDelete(t.id)} aria-label="Delete">
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
