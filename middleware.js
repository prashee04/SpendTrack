export { auth as middleware } from "@/auth";

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/transactions/:path*",
        "/budgets/:path*",
        "/assets/:path*",
    ],
};