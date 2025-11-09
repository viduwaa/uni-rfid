import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";

// GET - Fetch students enrolled in a specific course
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
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

        const { courseId } = await params;

        if (!courseId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Course ID is required",
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

        // Verify lecturer is assigned to this course
        const assignmentCheck = `
            SELECT 1 FROM lecturer_courses 
            WHERE lecturer_id = $1 AND course_id = $2
        `;

        const assignmentResult = await client.query(assignmentCheck, [
            lecturerId,
            courseId,
        ]);

        if (assignmentResult.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "You are not assigned to this course or course does not exist",
                },
                { status: 403 }
            );
        }

        // Fetch students enrolled in the course
        const studentsQuery = `
            SELECT 
                s.user_id as student_id,
                s.register_number,
                s.full_name,
                s.faculty,
                s.year_of_study as year,
                rc.card_uid
            FROM students s
            INNER JOIN student_courses sc ON s.user_id = sc.student_id
            LEFT JOIN rfid_cards rc ON s.user_id = rc.assigned_student AND rc.status = 'ACTIVE'
            WHERE sc.course_id = $1
            ORDER BY s.full_name
        `;

        const result = await client.query(studentsQuery, [courseId]);

        return NextResponse.json({
            success: true,
            students: result.rows,
            count: result.rows.length,
        });
    } catch (error) {
        console.error("Error fetching course students:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch students",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
