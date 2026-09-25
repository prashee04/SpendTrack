"use client";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { formatCurrency } from "@/lib/currency";

const COLORS = [
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
    "#ef4444",
    "#14b8a6",
    "#6366f1",
    "#f97316",
    "#6b7280",
];

export function CategoryChart({ transactions, currency = "INR" }) {
    const byCategory = {};

    transactions
        .filter((t) => t.type === "EXPENSE")
        .forEach((t) => {
            const name = t.category?.name || "Uncategorized";
            byCategory[name] = (byCategory[name] || 0) + Number(t.amount);
        });

    const data = Object.entries(byCategory)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

    if (data.length === 0) {
        return (
            <div className="rounded-xl border bg-white p-6 shadow-xs flex flex-col items-center justify-center min-h-[360px] text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold">
                    📊
                </div>
                <h2 className="text-base font-bold text-gray-900">Expenses by Category</h2>
                <p className="text-xs text-gray-400 max-w-xs">
                    No expense data recorded yet. Log your first expense or click &quot;⚡ Load Demo Data&quot; to preview category analytics!
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold">Expenses by Category</h2>

            <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                    >
                        {data.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v, currency)} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
