"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Wallet,
    Sparkles,
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data.error || "Registration failed");
            toast.error(data.error || "Registration failed");
            setLoading(false);
            return;
        }

        const initialZeroAssets = [];
        localStorage.setItem("finsight_wallet_balance", "0");
        localStorage.setItem("finsight_assets", JSON.stringify(initialZeroAssets));
        localStorage.setItem("finsight_transactions", "[]");

        toast.success("Account created! Initial wallet balance set to ₹0.00.");
        await signIn("credentials", {
            email: form.email,
            password: form.password,
            redirect: false,
        });

        router.push("/dashboard");
        router.refresh();
    }

    return (
        <main className="min-h-screen w-full flex bg-slate-950 text-white font-sans overflow-hidden">
            {/* LEFT HERO PANEL */}
            <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 p-12 flex-col justify-between overflow-hidden border-r border-slate-800/60">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 p-0.5 shadow-lg shadow-purple-500/30 flex items-center justify-center">
                        <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                            <Wallet className="h-5 w-5 text-purple-400" />
                        </div>
                    </div>
                    <div>
                        <div className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
                            SpendTrack <Sparkles className="h-4 w-4 text-purple-400" />
                        </div>
                        <div className="text-xs text-slate-400 font-medium">Personal Financial Platform</div>
                    </div>
                </div>

                <div className="relative z-10 space-y-6 max-w-lg">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
                        Start Managing Your <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent">Financial Future</span>
                    </h1>

                    <div className="space-y-3 text-xs text-slate-300">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Start with ₹0.00 clean wallet balance & zero initial debt
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Pre-seeded with Income categories (Allowance, Salary, Petty Cash, Bonus)
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Canara Bank & Bank SMS Auto-Parser
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-4">
                    <div>
                        <span>© 2026 SpendTrack</span> • <span className="text-slate-300 font-semibold">Prasheetha T K G</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            href="https://github.com/prashee04"
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-purple-400 transition"
                        >
                            GitHub
                        </a>
                        <span>•</span>
                        <a
                            href="https://www.linkedin.com/in/prasheetha-tkg-0889081a9/"
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-purple-400 transition"
                        >
                            LinkedIn
                        </a>
                    </div>
                </div>
            </div>

            {/* RIGHT FORM PANEL */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative bg-slate-950">
                <div className="w-full max-w-md space-y-6">
                    <div className="space-y-1.5">
                        <h2 className="text-2xl font-bold tracking-tight text-white">Create Your Account</h2>
                        <p className="text-xs text-slate-400">
                            Join SpendTrack to automate your personal expenses and wealth tracking.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs text-slate-300 font-medium">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Your full name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="pl-9 bg-slate-900 border-slate-800 text-white text-xs h-10 focus:border-purple-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs text-slate-300 font-medium">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="pl-9 bg-slate-900 border-slate-800 text-white text-xs h-10 focus:border-purple-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs text-slate-300 font-medium">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="At least 8 characters"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="pl-9 pr-9 bg-slate-900 border-slate-800 text-white text-xs h-10 focus:border-purple-500"
                                    minLength={8}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-950/50 border border-red-800 text-xs text-red-300 font-medium">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold h-11 shadow-lg shadow-purple-900/30 transition text-xs gap-2"
                        >
                            {loading ? (
                                <>
                                    <Sparkles className="h-4 w-4 animate-spin" /> Creating Account...
                                </>
                            ) : (
                                <>
                                    Create Free Account <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-900">
                        Already have an account?{" "}
                        <Link href="/login" className="font-bold text-purple-400 hover:text-purple-300 underline">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
