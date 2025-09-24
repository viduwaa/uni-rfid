import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

// GET - Fetch student-course enrollments for a student
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ studentId: string }> }
) {
    const client = await pool.connect();

    try {
        const { studentId } = await params;

        const query = `
      SELECT 
        sc.id,
        sc.student_id,
        sc.course_id,
        sc.enrollment_date,
        c.course_code,
        c.course_name,
        c.faculty,
        c.year,
        c.credits
      FROM student_courses sc
      JOIN courses c ON sc.course_id = c.id
      WHERE sc.student_id = $1
      ORDER BY c.faculty, c.year, c.course_code
    `;

        const result = await client.query(query, [studentId]);

        return NextResponse.json({
            success: true,
            enrollments: result.rows,
        });
    } catch (error) {
        console.error("Error fetching student enrollments:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch student enrollments",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

// POST - Enroll student in course
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ studentId: string }> }
) {
    const client = await pool.connect();

    try {
        const { studentId } = await params;
        const { courseId } = await request.json();

        if (!courseId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Course ID is required",
                },
                { status: 400 }
            );
        }

        // Check if student exists
        const studentCheck = await client.query(
            "SELECT id FROM students WHERE id = $1",
            [studentId]
        );

        if (studentCheck.rowCount === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Student not found",
                },
                { status: 404 }
            );
        }

        // Check if course exists
        const courseCheck = await client.query(
            "SELECT id FROM courses WHERE id = $1",
            [courseId]
        );

        if (courseCheck.rowCount === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Course not found",
                },
                { status: 404 }
            );
        }

        // Check if already enrolled
        const enrollmentCheck = await client.query(
            "SELECT id FROM student_courses WHERE student_id = $1 AND course_id = $2",
            [studentId, courseId]
        );

        if (enrollmentCheck.rowCount && enrollmentCheck.rowCount > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Student is already enrolled in this course",
                },
                { status: 400 }
            );
        }

        // Enroll student
        const insertQuery = `
      INSERT INTO student_courses (student_id, course_id, enrollment_date)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING *
    `;

        const result = await client.query(insertQuery, [studentId, courseId]);

        return NextResponse.json({
            success: true,
            message: "Student enrolled successfully",
            enrollment: result.rows[0],
        });
    } catch (error) {
        console.error("Error enrolling student:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to enroll student",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

// DELETE - Remove student from course
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ studentId: string }> }
) {
    const client = await pool.connect();

    try {
        const { studentId } = await params;
        const url = new URL(request.url);
        const courseId = url.searchParams.get("courseId");

        if (!courseId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Course ID is required",
                },
                { status: 400 }
            );
        }

        const deleteQuery = `
      DELETE FROM student_courses 
      WHERE student_id = $1 AND course_id = $2
      RETURNING *
    `;

        const result = await client.query(deleteQuery, [studentId, courseId]);

        if (result.rowCount === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Enrollment not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Student unenrolled successfully",
            enrollment: result.rows[0],
        });
    } catch (error) {
        console.error("Error unenrolling student:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to unenroll student",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
