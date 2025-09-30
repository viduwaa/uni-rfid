"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/LoginForm";

export default function AdminLoginPage() {
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session?.user?.role === "admin") {
            router.replace("/admin/dashboard");
        }
    }, [session]);

    return <LoginForm role="admin" />;
}
