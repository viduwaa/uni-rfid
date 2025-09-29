import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStudentLibraryLoans } from "@/lib/studentQueries";

// GET /api/student/library
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

        // Get library loans
        const loans = await getStudentLibraryLoans(studentId);

        return NextResponse.json({
            success: true,
            data: loans,
        });
    } catch (error) {
        console.error("Library API Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch library data",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
