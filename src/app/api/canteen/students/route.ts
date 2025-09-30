import { NextRequest, NextResponse } from "next/server";
import {
    updateBalance,
    getStudentByCardUID,
    getStudentBalance,
} from "@/lib/canteenQueries";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const cardUID = searchParams.get("cardUID");

        if (!cardUID) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Card UID is required",
                },
                { status: 400 }
            );
        }

        const studentData = await getStudentByCardUID(cardUID);
        if (!studentData) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Student not found or card inactive",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: studentData,
        });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch student data",
            },
            { status: 500 }
        );
    }
}

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

        const { amount, description, card_uid } = await request.json();

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
            },
            { status: 500 }
        );
    }
}
