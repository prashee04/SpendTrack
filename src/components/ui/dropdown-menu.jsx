import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const DropdownContext = createContext(null);

export function DropdownMenu({ children }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const onClick = (e) => {
            if (rootRef.current && !rootRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        const onKey = (e) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onClick);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    return (
        <DropdownContext.Provider value={{ open, setOpen }}>
            <div ref={rootRef} className="relative inline-block text-left">
                {children}
            </div>
        </DropdownContext.Provider>
    );
}

export function DropdownMenuTrigger({ asChild = false, children, ...props }) {
    const { open, setOpen } = useContext(DropdownContext);

    const handleClick = (event) => {
        children.props.onClick?.(event);
        if (!event.defaultPrevented) setOpen(!open);
    };

    if (asChild) {
        return React.cloneElement(React.Children.only(children), {
            ...props,
            "aria-expanded": open,
            onClick: handleClick,
        });
    }

    return (
        <div onClick={handleClick} aria-expanded={open} {...props}>
            {children}
        </div>
    );
}

export function DropdownMenuContent({ align = "end", className, children }) {
    const { open } = useContext(DropdownContext);
    if (!open) return null;

    const alignment = align === "end" ? "right-0" : "left-0";

    return (
        <div
            className={cn(
                "absolute top-full mt-2 w-48 rounded-xl border bg-white p-1 shadow-lg ring-1 ring-black/5 z-50",
                alignment,
                className
            )}
        >
            {children}
        </div>
    );
}

export function DropdownMenuItem({ onClick, className, children }) {
    const { setOpen } = useContext(DropdownContext);

    return (
        <div
            onClick={(e) => {
                if (onClick) onClick(e);
                setOpen(false);
            }}
            className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors",
                className
            )}
        >
            {children}
        </div>
    );
}

export function DropdownMenuSeparator({ className }) {
    return <div className={cn("-mx-1 my-1 h-px bg-gray-100", className)} />;
}
