import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";

// GET - Fetch courses assigned to current lecturer
export async function GET(request: NextRequest) {
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
                    message:
                        "Unauthorized. Only lecturers can access this endpoint.",
                },
                { status: 403 }
            );
        }

        // Get lecturer ID from user session
        const lecturerQuery = `
            SELECT id FROM lecturers WHERE user_id = $1
        `;

        console.log(session.user?.id);
        const lecturerResult = await client.query(lecturerQuery, [
            (session.user as any).id,
        ]);

        if (lecturerResult.rows.length === 0) {
            return NextResponse.json(
                { message: "Lecturer not found" },
                { status: 404 }
            );
        }

        const lecturerId = lecturerResult.rows[0].id;

        // Fetch assigned courses with student counts
        const coursesQuery = `
            SELECT 
                c.id,
                c.course_code,
                c.course_name,
                c.faculty,
                c.year,
                c.credits,
                COUNT(DISTINCT sc.student_id) as enrolled_students
            FROM courses c
            INNER JOIN lecturer_courses lc ON c.id = lc.course_id
            LEFT JOIN student_courses sc ON c.id = sc.course_id
            WHERE lc.lecturer_id = $1
            GROUP BY c.id, c.course_code, c.course_name, c.faculty, c.year, c.credits
            ORDER BY c.course_name
        `;

        const result = await client.query(coursesQuery, [lecturerId]);

        return NextResponse.json({
            success: true,
            courses: result.rows,
        });
    } catch (error) {
        console.error("Error fetching lecturer courses:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch courses",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
