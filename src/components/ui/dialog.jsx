import React, { useEffect } from "react";
import { cn } from "@/lib/utils";

export function Dialog({ open, onOpenChange, children }) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === "Escape") {
                e.stopPropagation();
                onOpenChange?.(false);
            }
        };
        document.addEventListener("keydown", onKey, true);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey, true);
            document.body.style.overflow = prev;
        };
    }, [open, onOpenChange]);

    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
            onClick={(e) => e.stopPropagation()}
        >
            <div
                className="fixed inset-0"
                onClick={(e) => {
                    e.stopPropagation();
                    if (e.target === e.currentTarget) {
                        onOpenChange?.(false);
                    }
                }}
            />
            <div
                className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}

export function DialogContent({ className, children }) {
    return <div className={cn("space-y-4", className)}>{children}</div>;
}

export function DialogHeader({ className, children }) {
    return (
        <div className={cn("flex flex-col space-y-1.5 text-left border-b pb-3 mb-2", className)}>
            {children}
        </div>
    );
}

export function DialogTitle({ className, children }) {
    return <h3 className={cn("text-lg font-bold text-gray-900", className)}>{children}</h3>;
}
