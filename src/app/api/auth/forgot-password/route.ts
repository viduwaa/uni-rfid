// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
    getUserByEmailForReset,
    createPasswordResetToken,
} from "@/lib/passwordReset";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { message: "Email is required" },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { message: "Invalid email format" },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await getUserByEmailForReset(email);

        // Always return success to prevent email enumeration attacks
        // But only send email if user exists
        if (user) {
            try {
                // Create password reset token
                const resetToken = await createPasswordResetToken(user.id);

                // Send password reset email
                await sendPasswordResetEmail(user.email, user.name, resetToken);

                console.log(`Password reset email sent to: ${email}`);
            } catch (error) {
                console.error("Error in password reset process:", error);
                // Don't return error to client to prevent information disclosure
            }
        } else {
            console.log(
                `Password reset requested for non-existent email: ${email}`
            );
        }

        // Always return success message
        return NextResponse.json({
            message:
                "If an account with that email exists, a password reset link has been sent to your email address.",
        });
    } catch (error) {
        console.error("Password reset request error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
