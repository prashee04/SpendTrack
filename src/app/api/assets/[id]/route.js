import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { assetSchema } from "@/lib/validators/asset";

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
    const parsed = assetSchema.partial().safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.flatten() },
            { status: 400 }
        );
    }

    const existing = await prisma.asset.findFirst({
        where: { id, userId: session.user.id },
    });

    if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const valueChanged =
        parsed.data.value !== undefined &&
        Number(parsed.data.value) !== Number(existing.value);

    const updated = await prisma.asset.update({
        where: { id },
        data: {
            ...parsed.data,
            ...(valueChanged
                ? {
                    history: {
                        create: [{ value: parsed.data.value }],
                    },
                }
                : {}),
        },
    });

    return NextResponse.json({
        ...updated,
        value: Number(updated.value),
        purchaseValue: updated.purchaseValue ? Number(updated.purchaseValue) : null,
    });
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

    const existing = await prisma.asset.findFirst({
        where: { id, userId: session.user.id },
    });

    if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.asset.delete({ where: { id } });

    return NextResponse.json({ success: true });
}