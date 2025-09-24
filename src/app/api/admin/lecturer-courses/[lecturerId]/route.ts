import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

// GET - Fetch lecturer-course assignments for a lecturer
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ lecturerId: string }> }
) {
    const client = await pool.connect();

    try {
        const { lecturerId } = await params;

        const query = `
      SELECT 
        lc.id,
        lc.lecturer_id,
        lc.course_id,
        lc.assignment_date,
        c.course_code,
        c.course_name,
        c.faculty,
        c.year,
        c.credits,
        COUNT(sc.student_id) as enrolled_students
      FROM lecturer_courses lc
      JOIN courses c ON lc.course_id = c.id
      LEFT JOIN student_courses sc ON c.id = sc.course_id
      WHERE lc.lecturer_id = $1
      GROUP BY lc.id, lc.lecturer_id, lc.course_id, lc.assignment_date,
               c.course_code, c.course_name, c.faculty, c.year, c.credits
      ORDER BY c.faculty, c.year, c.course_code
    `;

        const result = await client.query(query, [lecturerId]);

        return NextResponse.json({
            success: true,
            assignments: result.rows,
        });
    } catch (error) {
        console.error("Error fetching lecturer assignments:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch lecturer assignments",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

// POST - Assign lecturer to course
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ lecturerId: string }> }
) {
    const client = await pool.connect();
    

    try {
        const { lecturerId } = await params;
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

        // Check if lecturer exists
        const lecturerCheck = await client.query(
            "SELECT id FROM lecturers WHERE id = $1",
            [lecturerId]
        );

        if (lecturerCheck.rowCount === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Lecturer not found",
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

        // Check if already assigned
        const assignmentCheck = await client.query(
            "SELECT id FROM lecturer_courses WHERE lecturer_id = $1 AND course_id = $2",
            [lecturerId, courseId]
        );

        if (assignmentCheck.rowCount && assignmentCheck.rowCount > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Lecturer is already assigned to this course",
                },
                { status: 400 }
            );
        }

        // Assign lecturer to course
        const insertQuery = `
      INSERT INTO lecturer_courses (lecturer_id, course_id)
      VALUES ($1, $2)
      RETURNING *
    `;

        const result = await client.query(insertQuery, [lecturerId, courseId]);

        return NextResponse.json({
            success: true,
            message: "Lecturer assigned successfully",
            assignment: result.rows[0],
        });
    } catch (error) {
        console.error("Error assigning lecturer:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to assign lecturer",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

// DELETE - Remove lecturer from course
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ lecturerId: string }> }
) {
    const client = await pool.connect();

    try {
        const { lecturerId } = await params;
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
      DELETE FROM lecturer_courses 
      WHERE lecturer_id = $1 AND course_id = $2
      RETURNING *
    `;

        const result = await client.query(deleteQuery, [lecturerId, courseId]);

        if (result.rowCount === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Assignment not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Lecturer unassigned successfully",
            assignment: result.rows[0],
        });
    } catch (error) {
        console.error("Error unassigning lecturer:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to unassign lecturer",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}