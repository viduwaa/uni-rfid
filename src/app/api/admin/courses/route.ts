import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

// GET - Fetch all courses with enrollment and lecturer info
export async function GET(request: NextRequest) {
    const client = await pool.connect();

    try {
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
      GROUP BY c.id, c.course_code, c.course_name, c.faculty, 
               c.year, c.credits, c.created_at, c.updated_at
      ORDER BY c.faculty, c.year, c.course_code
    `;

        const result = await client.query(query);

        return NextResponse.json({
            success: true,
            courses: result.rows,
        });
    } catch (error) {
        console.error("Error fetching courses:", error);
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

// POST - Add new course
export async function POST(request: NextRequest) {
    const client = await pool.connect();

    try {
        const courseData = await request.json();

        // Validate required fields
        if (
            !courseData.course_code ||
            !courseData.course_name ||
            !courseData.faculty
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Missing required fields: course_code, course_name, or faculty",
                },
                { status: 400 }
            );
        }

        // Check if course code already exists
        const checkQuery = `
      SELECT id FROM courses WHERE course_code = $1
    `;
        const checkResult = await client.query(checkQuery, [
            courseData.course_code,
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

        const insertQuery = `
      INSERT INTO courses (course_code, course_name, faculty, year, credits)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

        const values = [
            courseData.course_code,
            courseData.course_name,
            courseData.faculty,
            courseData.year || 1,
            courseData.credits || 3,
        ];

        const result = await client.query(insertQuery, values);

        return NextResponse.json({
            success: true,
            message: "Course added successfully",
            course: result.rows[0],
        });
    } catch (error) {
        console.error("Error adding course:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to add course",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
