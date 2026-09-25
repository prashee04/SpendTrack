const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();
const demoEmail = "demo@spendtrack.app";
const demoPassword = "DemoSpend2026!";

const categories = [
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

async function main() {
    const passwordHash = await bcrypt.hash(demoPassword, 12);
    const user = await prisma.user.upsert({
        where: { email: demoEmail },
        update: { name: "Demo User", passwordHash },
        create: { name: "Demo User", email: demoEmail, passwordHash },
    });

    for (const category of categories) {
        await prisma.category.upsert({
            where: {
                userId_name_type: {
                    userId: user.id,
                    name: category.name,
                    type: category.type,
                },
            },
            update: category,
            create: { ...category, userId: user.id },
        });
    }

    console.log(`Demo account ready: ${demoEmail}`);
}

main()
    .catch((error) => {
        console.error("Could not seed the demo account:", error);
        process.exitCode = 1;
    })
    .finally(async () => prisma.$disconnect());
