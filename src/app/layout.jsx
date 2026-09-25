
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
    variable: "--font-jakarta",
});

export const metadata = {
    title: "SpendTrack — Enterprise Personal Finance & Asset Platform",
    description:
        "Professional personal finance management platform with asset tracking, utility bill management, and real-time financial analytics.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={jakarta.className}>
            <body className="bg-slate-50/70 text-slate-900 antialiased selection:bg-purple-500 selection:text-white min-h-screen">
                <SessionProvider>{children}</SessionProvider>
            </body>
        </html>
    );
}
