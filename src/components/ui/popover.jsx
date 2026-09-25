"use client";

import { useState, useRef, useEffect } from "react";

export function Popover({ open, onOpenChange, children }) {
    return <div className="relative inline-block text-left">{children}</div>;
}

export function PopoverTrigger({ asChild, children, onClick }) {
    return children;
}

export function PopoverContent({ align = "end", className = "", children }) {
    return (
        <div
            className={`absolute right-0 mt-2 z-50 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 focus:outline-none ${className}`}
        >
            {children}
        </div>
    );
}

