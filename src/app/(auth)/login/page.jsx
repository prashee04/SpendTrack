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
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    TrendingUp,
    ShieldCheck,
    Bot,
    Zap,
} from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        if (e) e.preventDefault();
        setError("");
        setLoading(true);

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        setLoading(false);

        if (result?.error) {
            setError("Invalid email or password");
            toast.error("Invalid credentials!");
            return;
        }

        toast.success("Welcome back!");
        router.push("/dashboard");
        router.refresh();
    }

    function useDemoAccount() {
        setEmail("demo@spendtrack.app");
        setPassword("DemoSpend2026!");
        setError("");
    }

    return (
        <main className="min-h-screen w-full flex bg-slate-950 text-white font-sans overflow-hidden">
            {/* LEFT HERO PANEL - CREATIVE SHOWCASE */}
            <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 p-12 flex-col justify-between overflow-hidden border-r border-slate-800/60">
                {/* Background ambient glow circles */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

                {/* Header Branding */}
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

                {/* Center Feature Highlights */}
                <div className="relative z-10 space-y-6 max-w-lg">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
                        <Zap className="h-3.5 w-3.5 text-purple-400" /> Professional Expense Tracker
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
                        Take Control of Your <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">Wealth & Assets</span>
                    </h1>

                    <p className="text-sm text-slate-300 leading-relaxed">
                        Automated receipt scanning, bank SMS auto-categorization, over-spending balance protection, and budget forecasting.
                    </p>

                    {/* Floating Feature Cards */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg">
                            <div className="h-9 w-9 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                                <Bot className="h-5 w-5 text-purple-400" />
                            </div>
                            <div className="text-xs">
                                <div className="font-bold text-slate-100">Receipt OCR & Bank SMS Reader</div>
                                <div className="text-slate-400 text-[11px]">Auto-parses Canara Bank, Swiggy & Uber SMS in &lt;0.5s</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg">
                            <div className="h-9 w-9 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div className="text-xs">
                                <div className="font-bold text-slate-100">Wallet Balance Over-spending Guard</div>
                                <div className="text-slate-400 text-[11px]">Real-time balance deduction & limit warning alerts</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Tagline */}
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
                    {/* Mobile Branding (Visible on small screens) */}
                    <div className="lg:hidden flex items-center gap-2.5 mb-2">
                        <div className="h-9 w-9 rounded-lg bg-purple-600 flex items-center justify-center">
                            <Wallet className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-base text-white">SpendTrack</span>
                    </div>

                    <div className="space-y-1.5">
                        <h2 className="text-2xl font-bold tracking-tight text-white">Sign In to SpendTrack</h2>
                        <p className="text-xs text-slate-400">
                            Enter your credentials to access your financial dashboard.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Input */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs text-slate-300 font-medium">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-9 bg-slate-900 border-slate-800 text-white text-xs h-10 focus:border-purple-500"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-xs text-slate-300 font-medium">Password</Label>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-9 pr-9 bg-slate-900 border-slate-800 text-white text-xs h-10 focus:border-purple-500"
                                    required
                                    minLength={8}
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
                                    <Sparkles className="h-4 w-4 animate-spin" /> Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In to Account <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3 text-center">
                        <p className="mb-2 text-xs text-slate-300">Want to explore first?</p>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={useDemoAccount}
                            className="h-9 w-full border-purple-500/30 bg-transparent text-xs text-purple-200 hover:bg-purple-500/10 hover:text-white"
                        >
                            Fill demo account
                        </Button>
                    </div>

                    <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-900">
                        Don&apos;t have an account yet?{" "}
                        <Link href="/register" className="font-bold text-purple-400 hover:text-purple-300 underline">
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
