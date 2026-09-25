"use client";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function TransactionFilters({ filters, onChange }) {
    const update = (key, value) => onChange({ ...filters, [key]: value });

    return (
        <div className="grid grid-cols-1 gap-3 rounded-xl border bg-white p-4 shadow-sm md:grid-cols-4">
            <Input
                placeholder="Search description or reference…"
                value={filters.q || ""}
                onChange={(e) => update("q", e.target.value)}
            />

            <Select
                value={filters.type || "all"}
                onValueChange={(v) => update("type", v)}
            >
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="INCOME">Income</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                    <SelectItem value="TRANSFER">Transfer</SelectItem>
                </SelectContent>
            </Select>

            <Input
                type="date"
                value={filters.from || ""}
                onChange={(e) => update("from", e.target.value)}
            />

            <Input
                type="date"
                value={filters.to || ""}
                onChange={(e) => update("to", e.target.value)}
            />
        </div>
    );
}
