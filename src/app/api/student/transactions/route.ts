import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStudentTransactionHistory } from "@/lib/studentQueries";

// GET /api/student/transactions
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (
            !session ||
            !session.user ||
            (session.user as any).role !== "student"
        ) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const studentId = (session.user as any).id;
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "50");

        // Get transaction history
        const transactions = await getStudentTransactionHistory(
            studentId,
            limit
        );

        return NextResponse.json({
            success: true,
            data: transactions,
        });
    } catch (error) {
        console.error("Transactions API Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch transaction data",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
