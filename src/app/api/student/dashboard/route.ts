import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
    getStudentByUserId,
    getStudentDashboardStats,
    getStudentAttendance,
    getStudentGrades,
    getAttendanceSummary,
    calculateStudentGPA,
    getStudentCourses,
    getStudentLibraryLoans,
} from "@/lib/studentQueries";

// GET /api/student/dashboard
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

        // Get student basic info
        const student = await getStudentByUserId(studentId);
        if (!student) {
            return NextResponse.json(
                { success: false, message: "Student not found" },
                { status: 404 }
            );
        }

        // Get dashboard statistics
        const stats = await getStudentDashboardStats(studentId);

        // Get enrolled courses
        const courses = await getStudentCourses(studentId);

        // Get active borrowed books
        const allBorrowedBooks = await getStudentLibraryLoans(studentId);
        const borrowedBooks = allBorrowedBooks.filter(book => book.status === 'active');

        return NextResponse.json({
            success: true,
            data: {
                student,
                stats,
                courses,
                borrowedBooks,
            },
        });
    } catch (error) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch dashboard data",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
