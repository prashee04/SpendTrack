import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default async function DashboardLayout({ children }) {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    return (
        <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
            <Sidebar user={session.user} />
            <div className="flex flex-1 flex-col min-w-0">
                <Header user={session.user} />
                <main className="flex-1 p-3.5 sm:p-6 overflow-x-hidden">{children}</main>
                <Footer />
            </div>
        </div>
    );
}
