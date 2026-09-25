"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/currency";
import {
    FileText,
    Bell,
    Target,
    CheckCircle,
    Download,
    Plus,
    Trash2,
    PiggyBank,
    Sparkles,
    Calculator,
    TrendingUp,
    ShieldCheck,
    DollarSign,
    Clock,
    AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";

const DEFAULT_REMINDERS = [];
const DEFAULT_GOALS = [];

const EMOJI_OPTIONS = ["🛡️", "✈️", "🛵", "🏠", "💻", "🎓", "💍", "💰", "🚗", "📱", "🏖️", "🏥"];

export function FinancialToolsSuite({
    transactions = [],
    walletBalance = 0,
    currency = "INR",
    onAddExpense,
}) {
    // 1. BILL REMINDERS STATE
    const [reminders, setReminders] = useState(DEFAULT_REMINDERS);
    const [addBillOpen, setAddBillOpen] = useState(false);
    const [billTitle, setBillTitle] = useState("");
    const [billAmount, setBillAmount] = useState("");
    const [billDueDate, setBillDueDate] = useState("");
    const [billCategory, setBillCategory] = useState("Bills");

    // 2. SAVINGS GOALS STATE
    const [goals, setGoals] = useState(DEFAULT_GOALS);
    const [addGoalOpen, setAddGoalOpen] = useState(false);
    const [goalTitle, setGoalTitle] = useState("");
    const [goalTarget, setGoalTarget] = useState("");
    const [goalInitial, setGoalInitial] = useState("0");
    const [goalIcon, setGoalIcon] = useState("🎯");

    // 3. DEPOSIT MODAL STATE
    const [depositOpen, setDepositOpen] = useState(false);
    const [activeGoal, setActiveGoal] = useState(null);
    const [depositAmount, setDepositAmount] = useState("5000");

    // 4. FINANCIAL CALCULATOR STATES
    const [calcTab, setCalcTab] = useState("sip");

    // SIP Calculator State
    const [sipMonthly, setSipMonthly] = useState("5000");
    const [sipReturn, setSipReturn] = useState("12");
    const [sipYears, setSipYears] = useState("10");

    // EMI Calculator State
    const [emiPrincipal, setEmiPrincipal] = useState("500000");
    const [emiRate, setEmiRate] = useState("9.5");
    const [emiTenureMonths, setEmiTenureMonths] = useState("36");

    // LOAD SAVED DATA FROM LOCALSTORAGE
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const savedRem = localStorage.getItem("finsight_bill_reminders");
            if (savedRem) {
                try {
                    const parsed = JSON.parse(savedRem);
                    if (Array.isArray(parsed)) {
                        const defaultTitles = ["Electricity Bill (BESCOM)", "Airtel Fiber Broadband", "House Rent"];
                        const cleaned = parsed.filter((b) => !defaultTitles.includes(b.title));
                        setReminders(cleaned);
                        localStorage.setItem("finsight_bill_reminders", JSON.stringify(cleaned));
                    }
                } catch { }
            } else {
                setReminders([]);
            }

            const savedGoals = localStorage.getItem("finsight_savings_goals");
            if (savedGoals) {
                try {
                    const parsed = JSON.parse(savedGoals);
                    if (Array.isArray(parsed)) {
                        const defaultGoalTitles = ["Emergency Safety Reserve", "Goa Vacation Trip", "New EV Scooter"];
                        const cleaned = parsed.filter((g) => !defaultGoalTitles.includes(g.title));
                        setGoals(cleaned);
                        localStorage.setItem("finsight_savings_goals", JSON.stringify(cleaned));
                    }
                } catch { }
            } else {
                setGoals([]);
            }
        }, 0);
        return () => clearTimeout(timeoutId);
    }, []);

    const saveReminders = (newReminders) => {
        setReminders(newReminders);
        localStorage.setItem("finsight_bill_reminders", JSON.stringify(newReminders));
    };

    const saveGoals = (newGoals) => {
        setGoals(newGoals);
        localStorage.setItem("finsight_savings_goals", JSON.stringify(newGoals));
    };

    const handleAddBill = (e) => {
        e.preventDefault();
        const amt = parseFloat(billAmount);
        if (!billTitle.trim() || isNaN(amt) || amt <= 0) {
            toast.error("Please enter a valid bill title and amount");
            return;
        }

        const newBill = {
            id: "rem_" + Date.now(),
            title: billTitle.trim(),
            amount: amt,
            dueDate: billDueDate || new Date().toISOString().split("T")[0],
            category: billCategory || "Bills",
            paid: false,
        };

        saveReminders([...reminders, newBill]);
        toast.success(`Added Bill Reminder: ${newBill.title}`);
        setBillTitle("");
        setBillAmount("");
        setBillDueDate("");
        setBillCategory("Bills");
        setAddBillOpen(false);
    };

    const handleDeleteBill = (id) => {
        const updated = reminders.filter((r) => r.id !== id);
        saveReminders(updated);
        toast.success("Bill reminder removed");
    };

    const handlePayBill = (rem) => {
        const updated = reminders.map((r) => (r.id === rem.id ? { ...r, paid: true } : r));
        saveReminders(updated);

        if (onAddExpense) {
            onAddExpense({
                description: `Bill Paid: ${rem.title}`,
                amount: rem.amount,
                type: "EXPENSE",
                reference: "UPI / Auto-Debit",
                date: new Date().toISOString().split("T")[0],
            });
        }
        toast.success(`Paid ${rem.title} (${formatCurrency(rem.amount, currency)})! Transaction logged.`);
    };

    const handleAddGoal = (e) => {
        e.preventDefault();
        const target = parseFloat(goalTarget);
        const initial = parseFloat(goalInitial) || 0;
        if (!goalTitle.trim() || isNaN(target) || target <= 0) {
            toast.error("Please enter a valid goal title and target amount");
            return;
        }

        const newGoal = {
            id: "goal_" + Date.now(),
            title: goalTitle.trim(),
            targetAmount: target,
            currentAmount: Math.min(target, initial),
            icon: goalIcon || "🎯",
        };

        saveGoals([...goals, newGoal]);
        toast.success(`Added Savings Goal: ${newGoal.title}`);
        setGoalTitle("");
        setGoalTarget("");
        setGoalInitial("0");
        setGoalIcon("🎯");
        setAddGoalOpen(false);
    };

    const handleDeleteGoal = (id) => {
        const updated = goals.filter((g) => g.id !== id);
        saveGoals(updated);
        toast.success("Savings goal deleted");
    };

    const handleOpenDeposit = (goal) => {
        setActiveGoal(goal);
        setDepositAmount("5000");
        setDepositOpen(true);
    };

    const handleConfirmDeposit = (e) => {
        e.preventDefault();
        if (!activeGoal) return;
        const amt = parseFloat(depositAmount);
        if (isNaN(amt) || amt <= 0) {
            toast.error("Please enter a valid deposit amount");
            return;
        }

        const updated = goals.map((g) =>
            g.id === activeGoal.id
                ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amt) }
                : g
        );
        saveGoals(updated);
        toast.success(`Deposited ${formatCurrency(amt, currency)} to ${activeGoal.title}!`);
        setDepositOpen(false);
        setActiveGoal(null);
    };

    const handleExportMonthlyReport = () => {
        let csvContent = "data:text/csv;charset=utf-8,Date,Description,Type,Amount,Reference\n";
        transactions.forEach((t) => {
            csvContent += `${t.date?.split("T")[0] || ""},"${t.description}",${t.type},${t.amount},"${t.reference || ""}"\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `SpendTrack_Monthly_Report_${new Date().toISOString().slice(0, 7)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Downloaded Monthly Financial Statement (CSV)!");
    };

    // Calculate due status for bill reminders
    const getDueStatus = (dueDateStr) => {
        if (!dueDateStr) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDateStr);
        due.setHours(0, 0, 0, 0);

        const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return { label: "Overdue", color: "bg-red-100 text-red-700 border-red-200" };
        if (diffDays === 0) return { label: "Due Today", color: "bg-amber-100 text-amber-800 border-amber-300 font-bold" };
        if (diffDays <= 7) return { label: `Due in ${diffDays}d`, color: "bg-amber-50 text-amber-700 border-amber-200" };
        return { label: `Due ${dueDateStr}`, color: "bg-gray-100 text-gray-600 border-gray-200" };
    };

    // Calculate SIP Return Math
    const calculateSip = () => {
        const P = parseFloat(sipMonthly) || 0;
        const i = (parseFloat(sipReturn) || 0) / 12 / 100;
        const n = (parseFloat(sipYears) || 0) * 12;

        if (P <= 0 || n <= 0) return { invested: 0, returns: 0, total: 0 };

        const totalInvested = P * n;
        const futureValue = i > 0 ? P * (((Math.pow(1 + i, n) - 1) / i) * (1 + i)) : totalInvested;
        const estimatedReturns = Math.max(0, futureValue - totalInvested);

        return {
            invested: Math.round(totalInvested),
            returns: Math.round(estimatedReturns),
            total: Math.round(futureValue),
        };
    };

    // Calculate Loan EMI Math
    const calculateEmi = () => {
        const P = parseFloat(emiPrincipal) || 0;
        const r = (parseFloat(emiRate) || 0) / 12 / 100;
        const n = parseFloat(emiTenureMonths) || 0;

        if (P <= 0 || n <= 0) return { emi: 0, totalInterest: 0, totalPayable: 0 };

        const emi = r > 0 ? (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : P / n;
        const totalPayable = emi * n;
        const totalInterest = Math.max(0, totalPayable - P);

        return {
            emi: Math.round(emi),
            totalInterest: Math.round(totalInterest),
            totalPayable: Math.round(totalPayable),
        };
    };

    const monthlyExpenseAvg = () => {
        const expenseTotal = transactions
            .filter((t) => t.type === "EXPENSE")
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);
        return expenseTotal > 0 ? Math.round(expenseTotal) : 25000;
    };

    const sipResults = calculateSip();
    const emiResults = calculateEmi();
    const avgExpense = monthlyExpenseAvg();

    return (
        <div className="space-y-6">
            {/* Top Banner */}
            <div className="flex flex-wrap items-center justify-between bg-white p-5 rounded-2xl border shadow-xs gap-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-purple-600" />
                        Complete Financial Management Tools
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Manage recurring utility bills, create savings goals, and use interactive financial calculators.
                    </p>
                </div>

                <Button
                    onClick={handleExportMonthlyReport}
                    variant="outline"
                    className="gap-2 text-xs bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 font-semibold shadow-2xs"
                >
                    <Download className="h-4 w-4" />
                    Export Monthly Statement (CSV)
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* 1. BILL REMINDERS & RECURRING UTILITIES */}
                <div className="rounded-2xl border bg-white p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-amber-500" />
                            <h3 className="font-bold text-gray-900 text-sm">
                                Bill Reminders & Utilities
                            </h3>
                            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                                {reminders.filter((r) => !r.paid).length} Pending
                            </span>
                        </div>

                        <Button
                            size="sm"
                            onClick={() => setAddBillOpen(true)}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1 shadow-xs rounded-xl"
                        >
                            <Plus className="h-3.5 w-3.5" /> Add Bill
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {reminders.length === 0 ? (
                            <div className="text-center py-6 text-xs text-gray-400">
                                No bill reminders added yet. Click &quot;+ Add Bill&quot; above.
                            </div>
                        ) : (
                            reminders.map((rem) => {
                                const dueStatus = getDueStatus(rem.dueDate);
                                return (
                                    <div
                                        key={rem.id}
                                        className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs transition ${rem.paid ? "bg-gray-50/70 opacity-75 border-gray-200" : "bg-white border-amber-200/80 shadow-2xs hover:shadow-md"
                                            }`}
                                    >
                                        <div className="space-y-1">
                                            <div className="font-bold text-gray-900 flex items-center gap-2">
                                                <span className="text-sm">{rem.title}</span>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                                                    {rem.category}
                                                </span>
                                            </div>
                                            <div className="text-gray-500 flex items-center gap-2 text-[11px]">
                                                {dueStatus && !rem.paid && (
                                                    <span className={`px-2 py-0.5 rounded-md border text-[10px] ${dueStatus.color}`}>
                                                        {dueStatus.label}
                                                    </span>
                                                )}
                                                <span>•</span>
                                                <span className="font-extrabold text-amber-700 text-xs">
                                                    {formatCurrency(rem.amount, currency)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {rem.paid ? (
                                                <span className="text-emerald-600 font-extrabold flex items-center gap-1 text-xs bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                                                    <CheckCircle className="h-3.5 w-3.5" /> Paid
                                                </span>
                                            ) : (
                                                <Button
                                                    size="xs"
                                                    onClick={() => handlePayBill(rem)}
                                                    className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold shadow-xs text-[11px] px-3 py-1.5 rounded-xl transition"
                                                >
                                                    Pay & Record
                                                </Button>
                                            )}

                                            <button
                                                onClick={() => handleDeleteBill(rem.id)}
                                                className="text-gray-400 hover:text-red-600 p-1.5 transition rounded-lg hover:bg-gray-100"
                                                title="Delete Reminder"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* 2. SAVINGS GOALS TRACKER */}
                <div className="rounded-2xl border bg-white p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-purple-600" />
                            <h3 className="font-bold text-gray-900 text-sm">
                                Savings Goals Tracker
                            </h3>
                            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                                {goals.length} Active Goals
                            </span>
                        </div>

                        <Button
                            size="sm"
                            onClick={() => setAddGoalOpen(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-1 shadow-xs rounded-xl"
                        >
                            <Plus className="h-3.5 w-3.5" /> Add Goal
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {goals.length === 0 ? (
                            <div className="text-center py-6 text-xs text-gray-400">
                                No savings goals added yet. Click &quot;+ Add Goal&quot; above.
                            </div>
                        ) : (
                            goals.map((goal) => {
                                const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                                return (
                                    <div key={goal.id} className="rounded-2xl border p-4 bg-white space-y-2.5 hover:shadow-md transition">
                                        <div className="flex items-center justify-between text-xs font-bold text-gray-900">
                                            <span className="flex items-center gap-2 text-sm">
                                                <span className="text-base">{goal.icon}</span>
                                                <span>{goal.title}</span>
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-purple-700 font-extrabold text-xs">
                                                    {formatCurrency(goal.currentAmount, currency)} / {formatCurrency(goal.targetAmount, currency)} ({pct}%)
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteGoal(goal.id)}
                                                    className="text-gray-400 hover:text-red-600 p-1 transition rounded-lg hover:bg-gray-100"
                                                    title="Delete Goal"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden p-0.5 border">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 rounded-full transition-all duration-500 shadow-xs"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>

                                        <div className="flex justify-end pt-0.5">
                                            <button
                                                onClick={() => handleOpenDeposit(goal)}
                                                className="text-xs font-extrabold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 border border-purple-200/80 shadow-2xs"
                                            >
                                                <PiggyBank className="h-3.5 w-3.5 text-purple-600" /> + Deposit Funds
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* 3. INTERACTIVE FINANCIAL CALCULATORS SUITE SECTION */}
            <div className="rounded-2xl border bg-white shadow-xs overflow-hidden">
                <div className="p-4 bg-gray-50 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-purple-600" />
                        <div>
                            <h3 className="font-bold text-gray-900 text-sm">Interactive Wealth & Debt Calculators</h3>
                            <p className="text-[11px] text-gray-500">SIP Mutual Fund Wealth Estimator, EMI Loan Calculator, and Emergency Reserve Target</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border text-xs font-semibold">
                        <button
                            onClick={() => setCalcTab("sip")}
                            className={`px-3 py-1.5 rounded-lg transition ${calcTab === "sip" ? "bg-purple-600 text-white shadow-xs" : "text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            📈 SIP Return Calculator
                        </button>
                        <button
                            onClick={() => setCalcTab("emi")}
                            className={`px-3 py-1.5 rounded-lg transition ${calcTab === "emi" ? "bg-purple-600 text-white shadow-xs" : "text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            💳 Loan EMI Calculator
                        </button>
                        <button
                            onClick={() => setCalcTab("emergency")}
                            className={`px-3 py-1.5 rounded-lg transition ${calcTab === "emergency" ? "bg-purple-600 text-white shadow-xs" : "text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            🛡️ Emergency Reserve Target
                        </button>
                    </div>
                </div>

                <div className="p-5">
                    {calcTab === "sip" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="space-y-4 text-xs">
                                <div>
                                    <Label className="font-semibold text-gray-700">Monthly SIP Investment ({currency})</Label>
                                    <Input
                                        type="number"
                                        value={sipMonthly}
                                        onChange={(e) => setSipMonthly(e.target.value)}
                                        className="mt-1 font-bold text-sm h-10"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="font-semibold text-gray-700">Expected Annual Return (%)</Label>
                                        <Input
                                            type="number"
                                            value={sipReturn}
                                            onChange={(e) => setSipReturn(e.target.value)}
                                            className="mt-1 font-bold h-10"
                                        />
                                    </div>
                                    <div>
                                        <Label className="font-semibold text-gray-700">Time Horizon (Years)</Label>
                                        <Input
                                            type="number"
                                            value={sipYears}
                                            onChange={(e) => setSipYears(e.target.value)}
                                            className="mt-1 font-bold h-10"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 bg-purple-50/70 rounded-2xl border border-purple-100 space-y-3">
                                <div className="text-xs font-bold text-purple-900 flex items-center justify-between">
                                    <span>Estimated Wealth Accumulation</span>
                                    <TrendingUp className="h-4 w-4 text-purple-600" />
                                </div>

                                <div className="space-y-2 divide-y text-xs">
                                    <div className="flex justify-between py-1">
                                        <span className="text-gray-600">Total Invested Amount:</span>
                                        <span className="font-bold text-gray-900">{formatCurrency(sipResults.invested, currency)}</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="text-gray-600">Estimated Returns:</span>
                                        <span className="font-bold text-emerald-600">+{formatCurrency(sipResults.returns, currency)}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 text-sm font-extrabold text-purple-900">
                                        <span>Total Future Value:</span>
                                        <span className="text-base text-purple-700">{formatCurrency(sipResults.total, currency)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {calcTab === "emi" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="space-y-4 text-xs">
                                <div>
                                    <Label className="font-semibold text-gray-700">Total Loan Amount ({currency})</Label>
                                    <Input
                                        type="number"
                                        value={emiPrincipal}
                                        onChange={(e) => setEmiPrincipal(e.target.value)}
                                        className="mt-1 font-bold text-sm h-10"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="font-semibold text-gray-700">Interest Rate (% p.a.)</Label>
                                        <Input
                                            type="number"
                                            value={emiRate}
                                            onChange={(e) => setEmiRate(e.target.value)}
                                            className="mt-1 font-bold h-10"
                                        />
                                    </div>
                                    <div>
                                        <Label className="font-semibold text-gray-700">Loan Tenure (Months)</Label>
                                        <Input
                                            type="number"
                                            value={emiTenureMonths}
                                            onChange={(e) => setEmiTenureMonths(e.target.value)}
                                            className="mt-1 font-bold h-10"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 bg-gray-50 rounded-2xl border space-y-3">
                                <div className="text-xs font-bold text-gray-900 flex items-center justify-between">
                                    <span>Loan EMI & Interest Breakdown</span>
                                    <DollarSign className="h-4 w-4 text-red-500" />
                                </div>

                                <div className="space-y-2 divide-y text-xs">
                                    <div className="flex justify-between py-1">
                                        <span className="text-gray-600">Monthly EMI Payment:</span>
                                        <span className="font-extrabold text-purple-700 text-sm">{formatCurrency(emiResults.emi, currency)}</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="text-gray-600">Total Interest Payable:</span>
                                        <span className="font-bold text-red-600">{formatCurrency(emiResults.totalInterest, currency)}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 text-xs font-bold text-gray-900">
                                        <span>Total Amount Payable:</span>
                                        <span>{formatCurrency(emiResults.totalPayable, currency)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {calcTab === "emergency" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-2xl border bg-blue-50/50 space-y-1">
                                <div className="text-xs font-bold text-blue-900">3-Month Safety Net</div>
                                <div className="text-lg font-extrabold text-blue-700">
                                    {formatCurrency(avgExpense * 3, currency)}
                                </div>
                                <p className="text-[11px] text-gray-500">Covers 3 months of basic living needs</p>
                            </div>

                            <div className="p-4 rounded-2xl border bg-emerald-50/50 space-y-1">
                                <div className="text-xs font-bold text-emerald-900">6-Month Recommended Reserve</div>
                                <div className="text-lg font-extrabold text-emerald-700">
                                    {formatCurrency(avgExpense * 6, currency)}
                                </div>
                                <p className="text-[11px] text-gray-500">Standard emergency runway for stability</p>
                            </div>

                            <div className="p-4 rounded-2xl border bg-purple-50/50 space-y-1">
                                <div className="text-xs font-bold text-purple-900">1-Year Complete Security</div>
                                <div className="text-lg font-extrabold text-purple-700">
                                    {formatCurrency(avgExpense * 12, currency)}
                                </div>
                                <p className="text-[11px] text-gray-500">Complete financial peace of mind reserve</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL 1: ADD BILL REMINDER */}
            <Dialog open={addBillOpen} onOpenChange={setAddBillOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-amber-900">
                            <Bell className="h-5 w-5 text-amber-600" /> Add Bill Reminder / Utility
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleAddBill} className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="billTitle" className="text-xs font-medium">Bill Title *</Label>
                            <Input
                                id="billTitle"
                                placeholder="e.g. BESCOM Electricity, Fiber Internet, House Rent"
                                value={billTitle}
                                onChange={(e) => setBillTitle(e.target.value)}
                                required
                                className="text-xs h-9"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="billAmount" className="text-xs font-medium">Bill Amount ({currency}) *</Label>
                                <Input
                                    id="billAmount"
                                    type="number"
                                    step="0.01"
                                    placeholder="1450"
                                    value={billAmount}
                                    onChange={(e) => setBillAmount(e.target.value)}
                                    required
                                    className="text-xs h-9"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="billDueDate" className="text-xs font-medium">Due Date</Label>
                                <Input
                                    id="billDueDate"
                                    type="date"
                                    value={billDueDate}
                                    onChange={(e) => setBillDueDate(e.target.value)}
                                    className="text-xs h-9"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="billCategory" className="text-xs font-medium">Category</Label>
                            <select
                                id="billCategory"
                                value={billCategory}
                                onChange={(e) => setBillCategory(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs"
                            >
                                <option value="Bills">⚡ Bills & Utilities</option>
                                <option value="Housing">🏠 Housing & Rent</option>
                                <option value="Subscription">🍿 Subscriptions & OTT</option>
                                <option value="Insurance">🛡️ Insurance & Health</option>
                                <option value="Loan/EMI">💳 Loan / Credit Card EMI</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setAddBillOpen(false)}
                                className="text-xs h-9"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9"
                            >
                                Save Bill Reminder
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* MODAL 2: ADD SAVINGS GOAL */}
            <Dialog open={addGoalOpen} onOpenChange={setAddGoalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-purple-900">
                            <Target className="h-5 w-5 text-purple-600" /> Create Financial Savings Goal
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleAddGoal} className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="goalTitle" className="text-xs font-medium">Goal Name *</Label>
                            <Input
                                id="goalTitle"
                                placeholder="e.g. Goa Trip, EV Scooter, Emergency Fund, Laptop"
                                value={goalTitle}
                                onChange={(e) => setGoalTitle(e.target.value)}
                                required
                                className="text-xs h-9"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="goalTarget" className="text-xs font-medium">Target Savings Amount ({currency}) *</Label>
                                <Input
                                    id="goalTarget"
                                    type="number"
                                    step="0.01"
                                    placeholder="50000"
                                    value={goalTarget}
                                    onChange={(e) => setGoalTarget(e.target.value)}
                                    required
                                    className="text-xs h-9"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="goalInitial" className="text-xs font-medium">Initial Saved Amount ({currency})</Label>
                                <Input
                                    id="goalInitial"
                                    type="number"
                                    step="0.01"
                                    placeholder="0"
                                    value={goalInitial}
                                    onChange={(e) => setGoalInitial(e.target.value)}
                                    className="text-xs h-9"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Goal Icon / Badge</Label>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {EMOJI_OPTIONS.map((emoji) => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => setGoalIcon(emoji)}
                                        className={`h-9 w-9 text-lg rounded-lg border flex items-center justify-center transition ${goalIcon === emoji
                                                ? "bg-purple-100 border-purple-600 scale-110 shadow-xs"
                                                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                            }`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setAddGoalOpen(false)}
                                className="text-xs h-9"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-9"
                            >
                                Create Savings Goal
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* MODAL 3: DEPOSIT FUNDS TO SAVINGS GOAL */}
            <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-purple-900">
                            <PiggyBank className="h-5 w-5 text-purple-600" />
                            Deposit to {activeGoal?.title}
                        </DialogTitle>
                    </DialogHeader>

                    {activeGoal && (
                        <form onSubmit={handleConfirmDeposit} className="space-y-4 pt-2">
                            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 space-y-1 text-xs">
                                <div className="text-purple-900 font-semibold flex items-center gap-1.5">
                                    <span>{activeGoal.icon}</span> {activeGoal.title}
                                </div>
                                <div className="text-purple-700 font-medium">
                                    Current Progress: {formatCurrency(activeGoal.currentAmount, currency)} / {formatCurrency(activeGoal.targetAmount, currency)}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="depositAmt" className="text-xs font-medium">Deposit Amount ({currency}) *</Label>
                                <Input
                                    id="depositAmt"
                                    type="number"
                                    step="0.01"
                                    placeholder="5000"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    required
                                    className="text-xs h-9"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <span className="text-[11px] text-gray-500 font-medium">Quick add:</span>
                                {[1000, 5000, 10000, 25000].map((quick) => (
                                    <button
                                        key={quick}
                                        type="button"
                                        onClick={() => setDepositAmount(String(quick))}
                                        className="text-xs px-2 py-0.5 bg-gray-100 hover:bg-purple-100 hover:text-purple-700 rounded font-medium transition"
                                    >
                                        +{quick >= 1000 ? `${quick / 1000}k` : quick}
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDepositOpen(false)}
                                    className="text-xs h-9"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-9 gap-1"
                                >
                                    <Sparkles className="h-3.5 w-3.5" /> Confirm Deposit
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

