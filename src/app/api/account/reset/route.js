import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    try {
        // Delete all transactions, budgets, and assets for this user
        await prisma.$transaction([
            prisma.transaction.deleteMany({ where: { userId } }),
            prisma.budget.deleteMany({ where: { userId } }),
            prisma.asset.deleteMany({ where: { userId } }),
        ]);

        return NextResponse.json({ success: true, message: "Account data reset successfully" });
    } catch (error) {
        console.error("Account reset error:", error);
        return NextResponse.json({ error: "Failed to reset account data" }, { status: 500 });
    }
}

