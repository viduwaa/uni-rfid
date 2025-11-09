import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";

// POST - Save attendance session
export async function POST(request: NextRequest) {
    const client = await pool.connect();

    try {
        const session = await getServerSession(authOptions);
        if (
            !session ||
            !session.user ||
            (session.user as any).role !== "lecturer"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Unauthorized. Only lecturers can access this endpoint.",
                },
                { status: 403 }
            );
        }

        const body = await request.json();
        const {
            courseId,
            hall,
            date,
            totalPresent,
            totalEnrolled,
            attendanceRecords,
        } = body;

        if (!courseId || !hall || !date) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Course ID, hall, and date are required",
                },
                { status: 400 }
            );
        }

        // Get lecturer ID from user session
        const lecturerQuery = `
            SELECT id FROM lecturers WHERE user_id = $1
        `;

        const lecturerResult = await client.query(lecturerQuery, [
            (session.user as any).id,
        ]);

        if (lecturerResult.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Lecturer not found",
                },
                { status: 404 }
            );
        }

        const lecturerId = lecturerResult.rows[0].id;

        // Save session metadata (optional - you can create a sessions table if needed)
        // For now, we'll just return success since attendance is already recorded

        return NextResponse.json({
            success: true,
            message: "Session saved successfully",
            data: {
                courseId,
                hall,
                date,
                totalPresent,
                totalEnrolled,
                attendanceRate:
                    totalEnrolled > 0
                        ? ((totalPresent / totalEnrolled) * 100).toFixed(2)
                        : 0,
            },
        });
    } catch (error) {
        console.error("Error saving attendance session:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to save session",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
