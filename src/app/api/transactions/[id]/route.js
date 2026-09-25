import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { transactionSchema } from "@/lib/validators/transaction";

const isValidObjectId = (id) => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);

export async function PATCH(req, { params }) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
        return NextResponse.json({ success: true, localOnly: true });
    }

    const body = await req.json();
    const parsed = transactionSchema.partial().safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.flatten() },
            { status: 400 }
        );
    }

    let validCategoryId = parsed.data.categoryId;
    if (validCategoryId !== undefined) {
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
    }

    const existing = await prisma.transaction.findFirst({
        where: { id, userId: session.user.id },
    });

    if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updateData = { ...parsed.data };
    if (validCategoryId !== undefined) {
        updateData.categoryId = validCategoryId;
    }

    const updated = await prisma.transaction.update({
        where: { id },
        data: updateData,
        include: { category: true },
    });

    return NextResponse.json({ ...updated, amount: Number(updated.amount) });
}

export async function DELETE(_, { params }) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
        return NextResponse.json({ success: true, localOnly: true });
    }

    const existing = await prisma.transaction.findFirst({
        where: { id, userId: session.user.id },
    });

    if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.transaction.delete({ where: { id } });

    return NextResponse.json({ success: true });
}