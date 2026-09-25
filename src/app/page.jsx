import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function LandingPage() {
    const session = await auth();
    if (session) redirect("/dashboard");

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 px-6 text-white">
            <div className="max-w-3xl text-center">
                <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl">
                    MoneyMaster
                </h1>
                <p className="mb-8 text-lg text-white/80 md:text-xl">
                    Professional expense tracking with budgets, assets, AI-powered
                    categorization, and beautiful analytics.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Button asChild size="lg" className="bg-white text-purple-700 hover:bg-white/90">
                        <Link href="/register">Get Started Free</Link>
                    </Button>
                    <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="border-white/40 bg-transparent text-white hover:bg-white/10"
                    >
                        <Link href="/login">Sign In</Link>
                    </Button>
                </div>
            </div>
            <footer className="absolute bottom-6 text-sm text-white/60">
                Built by Your Name · GitHub · LinkedIn
            </footer>
        </main>
    );
}
