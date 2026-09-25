import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
    name: z.string().min(1).max(80).trim(),
    email: z.string().email().toLowerCase(),
    password: z.string().min(8).max(100),
});

const DEFAULT_CATEGORIES = [
    { name: "Salary", icon: "💼", color: "#10b981", type: "INCOME" },
    { name: "Freelance", icon: "🧑‍💻", color: "#3b82f6", type: "INCOME" },
    { name: "Investments", icon: "📈", color: "#8b5cf6", type: "INCOME" },
    { name: "Food", icon: "🍔", color: "#ef4444", type: "EXPENSE" },
    { name: "Groceries", icon: "🛒", color: "#f59e0b", type: "EXPENSE" },
    { name: "Transport", icon: "🚗", color: "#6366f1", type: "EXPENSE" },
    { name: "Bills", icon: "🧾", color: "#0ea5e9", type: "EXPENSE" },
    { name: "Shopping", icon: "🛍️", color: "#ec4899", type: "EXPENSE" },
    { name: "Health", icon: "🏥", color: "#14b8a6", type: "EXPENSE" },
    { name: "Entertainment", icon: "🎬", color: "#a855f7", type: "EXPENSE" },
    { name: "Rent", icon: "🏠", color: "#f97316", type: "EXPENSE" },
    { name: "Other", icon: "📦", color: "#6b7280", type: "EXPENSE" },
];

export async function POST(req) {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid input", details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return NextResponse.json(
            { error: "Email already in use" },
            { status: 409 }
        );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
            categories: {
                create: DEFAULT_CATEGORIES,
            },
        },
    });

    return NextResponse.json(
        { id: user.id, email: user.email, name: user.name },
        { status: 201 }
    );
}
