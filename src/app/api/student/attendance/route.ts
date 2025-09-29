import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
    getStudentAttendance,
    getAttendanceSummary,
} from "@/lib/studentQueries";

// GET /api/student/attendance
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
        const semester = searchParams.get("semester");
        const summary = searchParams.get("summary") === "true";

        if (summary) {
            // Get attendance summary by course
            const attendanceSummary = await getAttendanceSummary(studentId);

            return NextResponse.json({
                success: true,
                data: attendanceSummary,
            });
        } else {
            // Get detailed attendance records
            const attendanceRecords = await getStudentAttendance(
                studentId,
                year || undefined,
                semester || undefined
            );

            return NextResponse.json({
                success: true,
                data: attendanceRecords,
            });
        }
    } catch (error) {
        console.error("Attendance API Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch attendance data",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
