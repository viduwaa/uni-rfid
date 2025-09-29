// app/api/auth/validate-reset-token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateResetToken } from "@/lib/passwordReset";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json(
                {
                    valid: false,
                    message: "Token is required",
                },
                { status: 400 }
            );
        }

        // Validate the reset token
        const resetData = await validateResetToken(token);

        if (!resetData) {
            return NextResponse.json(
                {
                    valid: false,
                    message: "Invalid or expired reset token",
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            valid: true,
            email: resetData.email,
            name: resetData.name,
            message: "Token is valid",
        });
    } catch (error) {
        console.error("Token validation error:", error);
        return NextResponse.json(
            {
                valid: false,
                message: "Internal server error",
            },
            { status: 500 }
        );
    }
}
