import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import authConfig from "../auth.config";

const credentialsSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

const DEMO_EMAIL = "demo@spendtrack.app";
const DEMO_PASSWORD = "DemoSpend2026!";
const DEMO_USER_ID = "000000000000000000000001";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                // The public demo identity is deliberately independent of the
                // database so the demo login can work when no demo user exists.
                if (
                    credentials?.email === DEMO_EMAIL &&
                    credentials?.password === DEMO_PASSWORD
                ) {
                    return {
                        id: DEMO_USER_ID,
                        email: DEMO_EMAIL,
                        name: "Demo User",
                    };
                }

                const parsed = credentialsSchema.safeParse(credentials);
                if (!parsed.success) return null;

                const user = await prisma.user.findUnique({
                    where: { email: parsed.data.email },
                });

                if (!user?.passwordHash) return null;

                const valid = await bcrypt.compare(
                    parsed.data.password,
                    user.passwordHash
                );

                if (!valid) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                };
            },
        }),
    ],
});
