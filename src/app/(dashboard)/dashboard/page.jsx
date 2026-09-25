import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardView } from "@/components/dashboard/dashboard-view";

const DEFAULT_CATEGORIES = [
    { id: "cat_food", name: "Food & Dining", icon: "🍔", type: "EXPENSE" },
    { id: "cat_transport", name: "Transport & Fuel", icon: "🚗", type: "EXPENSE" },
    { id: "cat_bills", name: "Bills & Utilities", icon: "🧾", type: "EXPENSE" },
    { id: "cat_shopping", name: "Shopping", icon: "🛍️", type: "EXPENSE" },
    { id: "cat_health", name: "Healthcare", icon: "🏥", type: "EXPENSE" },
    { id: "cat_entertainment", name: "Entertainment", icon: "🎬", type: "EXPENSE" },
    { id: "cat_salary", name: "Salary / Income", icon: "💼", type: "INCOME" },
    { id: "cat_freelance", name: "Freelance Revenue", icon: "🧑‍💻", type: "INCOME" },
];

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    let transactions = [];
    let categories = [];

    try {
        transactions = await prisma.transaction.findMany({
            where: { userId: session.user.id },
            include: { category: true },
            orderBy: { date: "desc" },
            take: 500,
        });

        categories = await prisma.category.findMany({
            where: { userId: session.user.id },
            orderBy: [{ type: "asc" }, { name: "asc" }],
        });
    } catch {
        // Fallback
    }

    const serializedTx = (transactions || []).map((t) => ({
        ...t,
        amount: Number(t.amount),
        date: t.date.toISOString(),
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
    }));

    const finalCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

    return (
        <DashboardView
            initialTransactions={serializedTx}
            initialCategories={finalCategories}
        />
    );
}
