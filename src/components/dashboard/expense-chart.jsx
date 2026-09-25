"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { format, startOfMonth, subMonths } from "date-fns";
import { formatCurrency } from "@/lib/currency";

export function ExpenseChart({ transactions, currency = "INR" }) {
    const months = Array.from({ length: 6 }, (_, i) => {
        const date = startOfMonth(subMonths(new Date(), 5 - i));

        const income = transactions
            .filter((t) => {
                const d = new Date(t.date);
                return (
                    t.type === "INCOME" &&
                    d.getMonth() === date.getMonth() &&
                    d.getFullYear() === date.getFullYear()
                );
            })
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const expenses = transactions
            .filter((t) => {
                const d = new Date(t.date);
                return (
                    t.type === "EXPENSE" &&
                    d.getMonth() === date.getMonth() &&
                    d.getFullYear() === date.getFullYear()
                );
            })
            .reduce((sum, t) => sum + Number(t.amount), 0);

        return { month: format(date, "MMM"), income, expenses };
    });

    const hasData = months.some((m) => m.income > 0 || m.expenses > 0);

    if (!hasData) {
        return (
            <div className="rounded-xl border bg-white p-6 shadow-xs flex flex-col items-center justify-center min-h-[360px] text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
                    📈
                </div>
                <h2 className="text-base font-bold text-gray-900">Income vs Expenses (6 months)</h2>
                <p className="text-xs text-gray-400 max-w-xs">
                    No 6-month transaction history recorded yet. Add transactions or click &quot;⚡ Load Demo Data&quot; to preview monthly spending velocity!
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold">Income vs Expenses (6 months)</h2>

            <ResponsiveContainer width="100%" height={320}>
                <BarChart data={months}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="month" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip
                        formatter={(value) => formatCurrency(value, currency)}
                        contentStyle={{ borderRadius: 8, border: "1px solid #eee" }}
                    />
                    <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expenses" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
