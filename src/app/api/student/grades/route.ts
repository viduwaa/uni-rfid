import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStudentGrades, calculateStudentGPA } from "@/lib/studentQueries";

// GET /api/student/grades
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
        const year = searchParams.get("year");

        // Get student grades
        const grades = await getStudentGrades(studentId, year || undefined);

        // Calculate GPA
        const gpa = await calculateStudentGPA(studentId, year || undefined);

        return NextResponse.json({
            success: true,
            data: {
                grades,
                gpa: parseFloat(gpa.toFixed(2)),
            },
        });
    } catch (error) {
        console.error("Grades API Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch grades data",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
