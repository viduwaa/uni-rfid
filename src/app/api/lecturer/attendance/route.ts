import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";

// POST - Record attendance
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
                    message:
                        "Unauthorized. Only lecturers can record attendance.",
                },
                { status: 403 }
            );
        }

        const { studentId, courseId, date, time, hall } = await request.json();

        // Validate required fields
        if (!studentId || !courseId || !date || !time) {
            return NextResponse.json(
                {
                    message:
                        "Missing required fields: studentId, courseId, date, time",
                },
                { status: 400 }
            );
        }

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

        // Check if attendance already exists for this student, course, and date
        const existingQuery = `
            SELECT id FROM attendance 
            WHERE register_number = $1 AND course_id = $2 AND date = $3
        `;
        const existingResult = await client.query(existingQuery, [
            studentId,
            courseId,
            date,
        ]);

        if (existingResult.rows.length > 0) {
            return NextResponse.json(
                {
                    message:
                        "Attendance already recorded for this student today",
                },
                { status: 409 }
            );
        }

        // Insert attendance record
        const insertQuery = `
            INSERT INTO attendance (student_id, course_id, lecturer_id, date, checked_in)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, student_id, course_id, date, checked_in
        `;

        const result = await client.query(insertQuery, [
            studentId,
            courseId,
            lecturerId,
            date,
            time,
        ]);

        return NextResponse.json({
            success: true,
            attendance: result.rows[0],
            message: "Attendance recorded successfully",
        });
    } catch (error) {
        console.error("Error recording attendance:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to record attendance",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

// GET - Fetch attendance records with filters
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
                        "Unauthorized. Only lecturers can view attendance.",
                },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get("courseId");
        const date = searchParams.get("date");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const studentId = searchParams.get("studentId");

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

        // Build dynamic query
        let whereConditions = [`a.lecturer_id = $1`];
        let queryParams = [lecturerId];
        let paramCount = 1;

        if (courseId) {
            paramCount++;
            whereConditions.push(`a.course_id = $${paramCount}`);
            queryParams.push(courseId);
        }

        if (date) {
            paramCount++;
            whereConditions.push(`a.date = $${paramCount}`);
            queryParams.push(date);
        } else if (startDate && endDate) {
            paramCount++;
            whereConditions.push(`a.date >= $${paramCount}`);
            queryParams.push(startDate);

            paramCount++;
            whereConditions.push(`a.date <= $${paramCount}`);
            queryParams.push(endDate);
        }

        if (studentId) {
            paramCount++;
            whereConditions.push(`a.student_id = $${paramCount}`);
            queryParams.push(studentId);
        }

        const attendanceQuery = `
            SELECT 
                a.id,
                a.date,
                a.checked_in,
                a.created_at,
                s.user_id as student_id,
                s.register_number,
                s.full_name as student_name,
                s.faculty as student_faculty,
                s.year_of_study,
                c.id as course_id,
                c.course_code,
                c.course_name,
                c.faculty as course_faculty,
                c.year as course_year
            FROM attendance a
            JOIN students s ON a.student_id = s.user_id
            JOIN courses c ON a.course_id = c.id
            WHERE ${whereConditions.join(" AND ")}
            ORDER BY a.date DESC, a.checked_in ASC
        `;

        const result = await client.query(attendanceQuery, queryParams);

        // Get summary statistics if course is selected
        let summary = null;
        if (courseId) {
            const summaryQuery = `
                SELECT 
                    COUNT(DISTINCT a.student_id) as total_present,
                    COUNT(DISTINCT sc.student_id) as total_enrolled,
                    ROUND(
                        (COUNT(DISTINCT a.student_id)::numeric / 
                         NULLIF(COUNT(DISTINCT sc.student_id), 0)) * 100, 
                        2
                    ) as attendance_percentage
                FROM student_courses sc
                LEFT JOIN attendance a ON sc.student_id = a.student_id 
                    AND sc.course_id = a.course_id
                    ${date ? "AND a.date = $2" : ""}
                    ${startDate && endDate ? "AND a.date >= $2 AND a.date <= $3" : ""}
                WHERE sc.course_id = $1
            `;

            let summaryParams = [courseId];
            if (date) {
                summaryParams.push(date);
            } else if (startDate && endDate) {
                summaryParams.push(startDate, endDate);
            }

            const summaryResult = await client.query(
                summaryQuery,
                summaryParams
            );
            summary = summaryResult.rows[0];
        }

        return NextResponse.json({
            success: true,
            attendance: result.rows,
            summary: summary,
        });
    } catch (error) {
        console.error("Error fetching attendance:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch attendance",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
