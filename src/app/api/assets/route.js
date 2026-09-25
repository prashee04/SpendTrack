import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { assetSchema } from "@/lib/validators/asset";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assets = await prisma.asset.findMany({
        where: { userId: session.user.id },
        include: { history: true },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
        assets.map((a) => ({
            ...a,
            value: Number(a.value),
            purchaseValue: a.purchaseValue ? Number(a.purchaseValue) : null,
            history: a.history.map((h) => ({ ...h, value: Number(h.value) })),
        }))
    );
}

export async function POST(req) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = assetSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.flatten() },
            { status: 400 }
        );
    }

    const existingAsset = await prisma.asset.findFirst({
        where: {
            userId: session.user.id,
            name: { equals: parsed.data.name, mode: "insensitive" },
        },
    });

    if (existingAsset) {
        return NextResponse.json(
            { error: `An asset named "${parsed.data.name}" already exists.` },
            { status: 400 }
        );
    }

    const asset = await prisma.asset.create({
        data: {
            ...parsed.data,
            userId: session.user.id,
            history: {
                create: [{ value: parsed.data.value }],
            },
        },
    });

    return NextResponse.json(
        {
            ...asset,
            value: Number(asset.value),
            purchaseValue: asset.purchaseValue ? Number(asset.purchaseValue) : null,
        },
        { status: 201 }
    );
}