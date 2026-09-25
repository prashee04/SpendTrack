import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { budgetSchema } from "@/lib/validators/budget";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const budgets = await prisma.budget.findMany({
        where: { userId: session.user.id },
        include: { category: true },
    });

    return NextResponse.json(
        budgets.map((b) => ({ ...b, amount: Number(b.amount) }))
    );
}

export async function POST(req) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = budgetSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.flatten() },
            { status: 400 }
        );
    }

    const { categoryId, amount, month } = parsed.data;

    const category = await prisma.category.findFirst({
        where: { id: categoryId, userId: session.user.id },
    });
    if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);

    const budget = await prisma.budget.upsert({
        where: {
            userId_categoryId_month: {
                userId: session.user.id,
                categoryId,
                month: monthStart,
            },
        },
        update: { amount },
        create: {
            userId: session.user.id,
            categoryId,
            amount,
            month: monthStart,
        },
        include: { category: true },
    });

    return NextResponse.json({ ...budget, amount: Number(budget.amount) });
}
