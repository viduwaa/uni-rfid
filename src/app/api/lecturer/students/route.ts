import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";

// GET - Fetch students enrolled in lecturer's courses
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

        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get("courseId");
        const faculty = searchParams.get("faculty");
        const year = searchParams.get("year");

        // Get lecturer ID
        const lecturerQuery = `SELECT id FROM lecturers WHERE user_id = $1`;
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

        // Build dynamic query for students
        let whereConditions = [];
        let queryParams = [lecturerId];
        let paramCount = 1;

        if (courseId) {
            paramCount++;
            whereConditions.push(`sc.course_id = $${paramCount}`);
            queryParams.push(courseId);
        }

        if (faculty) {
            paramCount++;
            whereConditions.push(`s.faculty = $${paramCount}`);
            queryParams.push(faculty);
        }

        if (year) {
            paramCount++;
            whereConditions.push(`s.year_of_study = $${paramCount}`);
            queryParams.push(year);
        }

        const whereClause =
            whereConditions.length > 0
                ? `AND ${whereConditions.join(" AND ")}`
                : "";

        const studentsQuery = `
            SELECT
                s.user_id,
                s.register_number,
                s.full_name,
                s.initial_name,
                s.email,
                s.faculty,
                s.year_of_study,
                s.phone,
                s.photo,
                jsonb_agg(
                    DISTINCT jsonb_build_object(
                        'course_id', c.id,
                        'course_code', c.course_code,
                        'course_name', c.course_name,
                        'enrolled_at', sc.enrolled_at
                    )
                ) FILTER (WHERE c.id IS NOT NULL) as enrolled_courses,
                COUNT(DISTINCT a.id) as total_attendance,
                COUNT(DISTINCT CASE WHEN a.date >= CURRENT_DATE - INTERVAL '30 days' THEN a.id END) as recent_attendance
            FROM students s
            INNER JOIN student_courses sc ON s.user_id = sc.student_id
            INNER JOIN courses c ON sc.course_id = c.id
            INNER JOIN lecturer_courses lc ON c.id = lc.course_id
            LEFT JOIN attendance a ON s.user_id = a.student_id AND c.id = a.course_id
            WHERE lc.lecturer_id = $1
            ${whereClause}
            GROUP BY 
                s.user_id, s.register_number, s.full_name, s.initial_name, 
                s.email, s.faculty, s.year_of_study, s.phone, s.photo
            ORDER BY s.full_name
        `;

        const result = await client.query(studentsQuery, queryParams);

        // Get summary statistics
        const summaryQuery = `
            SELECT 
                COUNT(DISTINCT s.user_id) as total_students,
                COUNT(DISTINCT s.faculty) as unique_faculties,
                COUNT(DISTINCT c.id) as total_courses,
                AVG(s.year_of_study) as avg_year
            FROM students s
            INNER JOIN student_courses sc ON s.user_id = sc.student_id
            INNER JOIN courses c ON sc.course_id = c.id
            INNER JOIN lecturer_courses lc ON c.id = lc.course_id
            WHERE lc.lecturer_id = $1
            ${whereClause}
        `;

        const summaryResult = await client.query(summaryQuery, queryParams);

        return NextResponse.json({
            success: true,
            students: result.rows,
            summary: summaryResult.rows[0],
        });
    } catch (error) {
        console.error("Error fetching students:", error);
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
