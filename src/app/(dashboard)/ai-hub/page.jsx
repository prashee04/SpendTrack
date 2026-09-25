"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AIHubPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/dashboard");
    }, [router]);

    return (
        <div className="p-8 text-center text-xs text-gray-500 font-semibold">
            Redirecting to Dashboard...
        </div>
    );
}

