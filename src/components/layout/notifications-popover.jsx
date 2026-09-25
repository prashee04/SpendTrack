"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Bell, AlertCircle, CheckCircle, X } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export function NotificationsPopover({ currency = "INR" }) {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    const generateAlerts = () => {
        const alerts = [];

        // 1. Check wallet balance
        const storedBalance = localStorage.getItem("finsight_wallet_balance");
        const balance = storedBalance ? parseFloat(storedBalance) : 0;
        if (balance < 1000) {
            alerts.push({
                id: "notif_balance",
                type: "warning",
                title: "Low Account Balance Warning",
                message: `Your total liquid wallet balance is ${formatCurrency(balance, currency)}. Consider topping up your account reserve.`,
                time: "Just now",
            });
        }

        // 2. Check pending bill reminders
        const storedBills = localStorage.getItem("finsight_bill_reminders");
        if (storedBills) {
            try {
                const bills = JSON.parse(storedBills);
                const pending = bills.filter((b) => !b.paid);
                if (pending.length > 0) {
                    alerts.push({
                        id: "notif_bills",
                        type: "bill",
                        title: `${pending.length} Pending Bill Reminders`,
                        message: `You have ${pending.length} upcoming recurring bill(s) due soon. Click to review in Financial Tools.`,
                        time: "Today",
                    });
                }
            } catch { }
        }

        setNotifications(alerts);
    };

    useEffect(() => {
        const timeoutId = setTimeout(generateAlerts, 0);
        return () => clearTimeout(timeoutId);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const dismissNotif = (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const unreadCount = notifications.length;

    return (
        <div className="relative inline-block text-left" ref={containerRef}>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                    setOpen(!open);
                    if (!open) generateAlerts();
                }}
                className="relative text-gray-600 hover:text-purple-700 hover:bg-purple-50"
            >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
                )}
            </Button>

            {open && (
                <div className="absolute right-0 mt-2 z-50 w-80 p-0 bg-white border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
                    <div className="p-3 bg-gray-50 border-b flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-purple-600" />
                            <span className="text-xs font-bold text-gray-900">Notifications & Financial Alerts</span>
                        </div>
                        {unreadCount > 0 && (
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                                {unreadCount} Active
                            </span>
                        )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-xs text-gray-400">
                                <CheckCircle className="h-6 w-6 text-emerald-500 mx-auto mb-1 opacity-80" />
                                No new notifications. All financial alerts cleared!
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div key={n.id} className="p-3 hover:bg-gray-50/80 transition flex items-start gap-2.5 text-xs">
                                    {n.type === "warning" ? (
                                        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                    ) : (
                                        <Bell className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                                    )}

                                    <div className="flex-1 space-y-0.5">
                                        <div className="font-semibold text-gray-900 flex items-center justify-between">
                                            <span>{n.title}</span>
                                            <button
                                                onClick={() => dismissNotif(n.id)}
                                                className="text-gray-400 hover:text-gray-600 p-0.5"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <p className="text-gray-500 text-[11px] leading-relaxed">{n.message}</p>
                                        <div className="text-[10px] text-gray-400 font-medium">{n.time}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-2 border-t bg-gray-50 text-center">
                        <button
                            onClick={() => setNotifications([])}
                            className="text-[11px] font-semibold text-purple-700 hover:underline"
                        >
                            Mark all as read
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

