import React, { createContext, useContext, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const SelectContext = createContext(null);

function extractText(node) {
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(extractText).join(" ");
    if (node && typeof node === "object" && node.props && node.props.children) {
        return extractText(node.props.children);
    }
    return "";
}

export function Select({ value, onValueChange, children }) {
    const [open, setOpen] = useState(false);
    const [labels, setLabels] = useState({});

    const registerLabel = (val, label) => {
        setLabels((prev) => (prev[val] === label ? prev : { ...prev, [val]: label }));
    };

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open]);

    return (
        <SelectContext.Provider value={{ value, onValueChange, open, setOpen, labels, registerLabel }}>
            <div className="relative inline-block w-full">{children}</div>
        </SelectContext.Provider>
    );
}

export function SelectTrigger({ className, children }) {
    const { open, setOpen } = useContext(SelectContext);

    return (
        <button
            type="button"
            onClick={() => setOpen(!open)}
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-purple-500",
                className
            )}
        >
            {children}
            <span className="ml-2 text-xs text-gray-400">▼</span>
        </button>
    );
}

export function SelectValue({ placeholder }) {
    const { value, labels } = useContext(SelectContext);
    const label = labels[value] || value;
    return <span className="truncate">{label || placeholder}</span>;
}

export function SelectContent({ className, children }) {
    const { open } = useContext(SelectContext);
    if (!open) return null;

    return (
        <div
            className={cn(
                "absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg",
                className
            )}
        >
            {children}
        </div>
    );
}

export function SelectItem({ value, children, className }) {
    const { value: selectedValue, onValueChange, setOpen, registerLabel } = useContext(SelectContext);
    const isSelected = selectedValue === value;

    useEffect(() => {
        if (value && children) {
            const textLabel = extractText(children).trim();
            if (textLabel) {
                registerLabel(value, textLabel);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, children]);

    return (
        <div
            onClick={() => {
                onValueChange(value);
                setOpen(false);
            }}
            className={cn(
                "cursor-pointer rounded-md px-3 py-2 text-sm transition-colors hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2",
                isSelected && "bg-purple-100 font-semibold text-purple-700",
                className
            )}
        >
            {children}
        </div>
    );
}
