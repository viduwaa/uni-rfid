import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

// GET - Fetch specific course
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const client = await pool.connect();

    try {
        const { id: courseId } = await params;

        const query = `
      SELECT 
        c.id,
        c.course_code,
        c.course_name,
        c.faculty,
        c.year,
        c.credits,
        c.created_at,
        c.updated_at,
        COUNT(DISTINCT sc.student_id) as enrolled_students,
        COALESCE(
          JSON_AGG(
            CASE WHEN l.id IS NOT NULL THEN
              JSON_BUILD_OBJECT(
                'id', l.id,
                'full_name', l.full_name,
                'staff_id', l.staff_id,
                'position', l.position
              )
            END
          ) FILTER (WHERE l.id IS NOT NULL), 
          '[]'::json
        ) as assigned_lecturers
      FROM courses c
      LEFT JOIN student_courses sc ON c.id = sc.course_id
      LEFT JOIN lecturer_courses lc ON c.id = lc.course_id
      LEFT JOIN lecturers l ON lc.lecturer_id = l.id
      WHERE c.id = $1
      GROUP BY c.id, c.course_code, c.course_name, c.faculty, 
               c.year, c.credits, c.created_at, c.updated_at
    `;

        const result = await client.query(query, [courseId]);

        if (result.rowCount === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Course not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            course: result.rows[0],
        });
    } catch (error) {
        console.error("Error fetching course:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch course",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

// PUT - Update course
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const client = await pool.connect();

    try {
        const { id: courseId } = await params;
        const updates = await request.json();

        // Build dynamic update query
        const updateFields = [];
        const values = [];
        let paramCount = 1;

        if (updates.course_code) {
            // Check if new course code conflicts with existing courses
            const checkQuery = `SELECT id FROM courses WHERE course_code = $1 AND id != $2`;
            const checkResult = await client.query(checkQuery, [
                updates.course_code,
                courseId,
            ]);

            if (checkResult.rowCount && checkResult.rowCount > 0) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Course code already exists",
                    },
                    { status: 400 }
                );
            }

            updateFields.push(`course_code = $${paramCount}`);
            values.push(updates.course_code);
            paramCount++;
        }

        if (updates.course_name) {
            updateFields.push(`course_name = $${paramCount}`);
            values.push(updates.course_name);
            paramCount++;
        }

        if (updates.faculty) {
            updateFields.push(`faculty = $${paramCount}`);
            values.push(updates.faculty);
            paramCount++;
        }

        if (updates.year !== undefined) {
            updateFields.push(`year = $${paramCount}`);
            values.push(updates.year);
            paramCount++;
        }

        if (updates.credits !== undefined) {
            updateFields.push(`credits = $${paramCount}`);
            values.push(updates.credits);
            paramCount++;
        }

        if (updateFields.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No fields provided to update",
                },
                { status: 400 }
            );
        }

        // Add updated_at timestamp
        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(courseId);

        const updateQuery = `
      UPDATE courses 
      SET ${updateFields.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

        const result = await client.query(updateQuery, values);

        if (result.rowCount === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Course not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Course updated successfully",
            course: result.rows[0],
        });
    } catch (error) {
        console.error("Error updating course:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to update course",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

// DELETE - Delete course
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const { id: courseId } = await params;

        // First check if course exists
        const checkQuery = `SELECT id FROM courses WHERE id = $1`;
        const checkResult = await client.query(checkQuery, [courseId]);

        if (checkResult.rowCount === 0) {
            await client.query("ROLLBACK");
            return NextResponse.json(
                {
                    success: false,
                    message: "Course not found",
                },
                { status: 404 }
            );
        }

        // Delete related student enrollments
        await client.query("DELETE FROM student_courses WHERE course_id = $1", [
            courseId,
        ]);

        // Delete related lecturer assignments
        await client.query(
            "DELETE FROM lecturer_courses WHERE course_id = $1",
            [courseId]
        );

        // Delete the course
        const deleteQuery = "DELETE FROM courses WHERE id = $1 RETURNING *";
        const result = await client.query(deleteQuery, [courseId]);

        await client.query("COMMIT");

        return NextResponse.json({
            success: true,
            message: "Course deleted successfully",
            course: result.rows[0],
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error deleting course:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete course",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
