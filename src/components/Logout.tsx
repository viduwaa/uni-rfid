"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
    const { data: session } = useSession();

    const handleLogout = () => {
        // Get user role to redirect to the correct login page
        const role = session?.user?.role;

        let callbackUrl = "/";

        // Redirect to the appropriate login page based on role
        switch (role) {
            case "admin":
                callbackUrl = "/admin";
                break;
            case "lecturer":
                callbackUrl = "/lecturer";
                break;
            case "student":
                callbackUrl = "/student";
                break;
            case "canteen":
                callbackUrl = "/canteen";
                break;
            case "librarian":
                callbackUrl = "/library";
                break;
            default:
                callbackUrl = "/";
        }

        signOut({ callbackUrl });
    };

    return <Button onClick={handleLogout}>Logout</Button>;
}
