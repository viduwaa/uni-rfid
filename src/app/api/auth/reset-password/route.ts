// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateResetToken, resetPassword } from "@/lib/passwordReset";

export async function POST(request: NextRequest) {
    try {
        const { token, password, confirmPassword } = await request.json();

        // Validate required fields
        if (!token || !password || !confirmPassword) {
            return NextResponse.json(
                {
                    message:
                        "Token, password, and confirm password are required",
                },
                { status: 400 }
            );
        }

        // Validate password match
        if (password !== confirmPassword) {
            return NextResponse.json(
                {
                    message: "Passwords do not match",
                },
                { status: 400 }
            );
        }

        // Validate password strength
        if (password.length < 6) {
            return NextResponse.json(
                {
                    message: "Password must be at least 6 characters long",
                },
                { status: 400 }
            );
        }

        // Validate and use the reset token
        const resetData = await validateResetToken(token);
        if (!resetData) {
            return NextResponse.json(
                {
                    message: "Invalid or expired reset token",
                },
                { status: 400 }
            );
        }

        // Reset the password
        const success = await resetPassword(token, password);
        if (!success) {
            return NextResponse.json(
                {
                    message: "Failed to reset password. Please try again.",
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message:
                "Password reset successful. You can now login with your new password.",
        });
    } catch (error) {
        console.error("Password reset error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
