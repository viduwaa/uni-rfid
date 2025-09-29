import { NextRequest, NextResponse } from "next/server";
import { updateBalance, getStudentBalance } from "@/lib/canteenQueries";

export async function PATCH(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User ID is required",
                },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { amount, description, card_uid } = body;

        if (!amount) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Amount is required",
                },
                { status: 400 }
            );
        }

        const result = await updateBalance(
            userId,
            amount,
            description,
            card_uid
        );

        if (!result.success) {
            return NextResponse.json(result, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to update balance",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User ID is required",
                },
                { status: 400 }
            );
        }

        const result = await getStudentBalance(userId);

        if (!result.success) {
            return NextResponse.json(result, { status: 404 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch balance",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
