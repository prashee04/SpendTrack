import React from "react";
import { cn } from "@/lib/utils";

export const Button = React.forwardRef(
    ({ children, className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
        const baseStyles =
            "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

        const variants = {
            default: "bg-purple-600 text-white hover:bg-purple-700 shadow-sm",
            destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
            outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
            secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
            ghost: "text-gray-700 hover:bg-gray-100",
            link: "text-purple-600 underline-offset-4 hover:underline",
        };

        const sizes = {
            default: "h-10 px-4 py-2",
            xs: "h-7 px-2 text-xs",      // ← ADDED
            sm: "h-8 px-3 text-xs",
            lg: "h-12 px-6 text-base",
            icon: "h-9 w-9 p-0",
        };

        const buttonClassName = cn(baseStyles, variants[variant], sizes[size], className);

        if (asChild) {
            return React.cloneElement(React.Children.only(children), {
                ...props,
                ref,
                className: cn(buttonClassName, children.props.className),
            });
        }

        return (
            <button ref={ref} className={buttonClassName} {...props}>
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";
