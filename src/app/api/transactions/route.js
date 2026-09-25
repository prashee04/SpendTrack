import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { transactionSchema } from "@/lib/validators/transaction";
import { z } from "zod";

const querySchema = z.object({
    q: z.string().optional(),
    type: z.enum(["INCOME", "EXPENSE", "TRANSFER", "all"]).optional(),
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function GET(req) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const parsedQuery = querySchema.safeParse({
        q: searchParams.get("q") || undefined,
        type: searchParams.get("type") || undefined,
        from: searchParams.get("from") || undefined,
        to: searchParams.get("to") || undefined,
    });

    if (!parsedQuery.success) {
        return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
    }

    const { q, type, from, to } = parsedQuery.data;

    const where = {
        userId: session.user.id,
        ...(type && type !== "all" ? { type } : {}),
        ...(from || to
            ? {
                date: {
                    ...(from ? { gte: new Date(from) } : {}),
                    ...(to ? { lte: new Date(to) } : {}),
                },
            }
            : {}),
        ...(q
            ? {
                OR: [
                    { description: { contains: q, mode: "insensitive" } },
                    { reference: { contains: q, mode: "insensitive" } },
                ],
            }
            : {}),
    };

    const transactions = await prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { date: "desc" },
        take: 500,
    });

    return NextResponse.json(
        transactions.map((t) => ({
            ...t,
            amount: Number(t.amount),
        }))
    );
}

export async function POST(req) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = transactionSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.flatten() },
            { status: 400 }
        );
    }

    const isValidObjectId = (id) => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);

    let validCategoryId = parsed.data.categoryId || null;
    if (validCategoryId && isValidObjectId(validCategoryId)) {
        try {
            const category = await prisma.category.findFirst({
                where: { id: validCategoryId, userId: session.user.id },
            });
            if (!category) {
                validCategoryId = null;
            }
        } catch {
            validCategoryId = null;
        }
    } else {
        validCategoryId = null;
    }

    const transaction = await prisma.transaction.create({
        data: {
            ...parsed.data,
            categoryId: validCategoryId,
            userId: session.user.id,
        },
        include: { category: true },
    });

    return NextResponse.json(
        { ...transaction, amount: Number(transaction.amount) },
        { status: 201 }
    );
}
