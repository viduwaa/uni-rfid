import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";

// GET - Fetch exam results for lecturer's courses
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
        const studentId = searchParams.get("studentId");
        const examDate = searchParams.get("examDate");

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

        // Build dynamic query for exam results
        let whereConditions = ["lc.lecturer_id = $1"];
        let queryParams = [lecturerId];
        let paramCount = 1;

        if (courseId) {
            paramCount++;
            whereConditions.push(`er.course_id = $${paramCount}`);
            queryParams.push(courseId);
        }

        if (studentId) {
            paramCount++;
            whereConditions.push(`er.student_id = $${paramCount}`);
            queryParams.push(studentId);
        }

        if (examDate) {
            paramCount++;
            whereConditions.push(`er.exam_date = $${paramCount}`);
            queryParams.push(examDate);
        }

        const whereClause = whereConditions.join(" AND ");

        const resultsQuery = `
            SELECT 
                er.id,
                er.student_id,
                er.course_id,
                er.exam_date,
                er.grade,
                er.remarks,
                er.published_at,
                s.register_number,
                s.full_name as student_name,
                s.email as student_email,
                c.course_code,
                c.course_name,
                c.credits
            FROM exam_results er
            INNER JOIN students s ON er.student_id = s.user_id
            INNER JOIN courses c ON er.course_id = c.id
            INNER JOIN lecturer_courses lc ON c.id = lc.course_id
            WHERE ${whereClause}
            ORDER BY er.exam_date DESC, s.full_name
        `;

        const result = await client.query(resultsQuery, queryParams);

        // Get summary statistics
        const summaryQuery = `
            SELECT 
                COUNT(*) as total_results,
                COUNT(DISTINCT er.student_id) as unique_students,
                COUNT(DISTINCT er.course_id) as unique_courses,
                AVG(
                    CASE 
                        WHEN er.grade ~ '^[A-F][+-]?$' THEN 
                            CASE er.grade
                                WHEN 'A+' THEN 4.0
                                WHEN 'A' THEN 4.0
                                WHEN 'A-' THEN 3.7
                                WHEN 'B+' THEN 3.3
                                WHEN 'B' THEN 3.0
                                WHEN 'B-' THEN 2.7
                                WHEN 'C+' THEN 2.3
                                WHEN 'C' THEN 2.0
                                WHEN 'C-' THEN 1.7
                                WHEN 'D+' THEN 1.3
                                WHEN 'D' THEN 1.0
                                WHEN 'F' THEN 0.0
                                ELSE NULL
                            END
                        ELSE NULL
                    END
                ) as average_gpa
            FROM exam_results er
            INNER JOIN courses c ON er.course_id = c.id
            INNER JOIN lecturer_courses lc ON c.id = lc.course_id
            WHERE ${whereClause}
        `;

        const summaryResult = await client.query(summaryQuery, queryParams);

        return NextResponse.json({
            success: true,
            results: result.rows,
            summary: summaryResult.rows[0],
        });
    } catch (error) {
        console.error("Error fetching exam results:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch exam results",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

// POST - Add or update exam result
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
                        "Unauthorized. Only lecturers can access this endpoint.",
                },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { studentId, courseId, examDate, grade, remarks } = body;

        // Validate required fields
        if (!studentId || !courseId || !examDate || !grade) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Missing required fields: studentId, courseId, examDate, grade",
                },
                { status: 400 }
            );
        }

        // Validate grade format (A+, A, A-, B+, B, B-, C+, C, C-, D+, D, F)
        const validGrades = [
            "A+",
            "A",
            "A-",
            "B+",
            "B",
            "B-",
            "C+",
            "C",
            "C-",
            "D+",
            "D",
            "F",
        ];
        if (!validGrades.includes(grade.toUpperCase())) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid grade. Valid grades are: A+, A, A-, B+, B, B-, C+, C, C-, D+, D, F",
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

        // Verify lecturer teaches this course
        const courseAccessQuery = `
            SELECT c.id, c.course_code, c.course_name 
            FROM courses c
            INNER JOIN lecturer_courses lc ON c.id = lc.course_id
            WHERE lc.lecturer_id = $1 AND c.id = $2
        `;
        const courseAccessResult = await client.query(courseAccessQuery, [
            lecturerId,
            courseId,
        ]);

        if (courseAccessResult.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "You are not authorized to add results for this course",
                },
                { status: 403 }
            );
        }

        // Verify student is enrolled in this course
        const enrollmentQuery = `
            SELECT sc.id 
            FROM student_courses sc
            WHERE sc.student_id = $1 AND sc.course_id = $2
        `;
        const enrollmentResult = await client.query(enrollmentQuery, [
            studentId,
            courseId,
        ]);

        if (enrollmentResult.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Student is not enrolled in this course",
                },
                { status: 400 }
            );
        }

        // Check if result already exists for this student, course, and exam date
        const existingResultQuery = `
            SELECT id FROM exam_results 
            WHERE student_id = $1 AND course_id = $2 AND exam_date = $3
        `;
        const existingResult = await client.query(existingResultQuery, [
            studentId,
            courseId,
            examDate,
        ]);

        let result;
        if (existingResult.rows.length > 0) {
            // Update existing result
            const updateQuery = `
                UPDATE exam_results 
                SET grade = $1, remarks = $2, published_at = CURRENT_TIMESTAMP
                WHERE student_id = $3 AND course_id = $4 AND exam_date = $5
                RETURNING id, student_id, course_id, exam_date, grade, remarks, published_at
            `;
            result = await client.query(updateQuery, [
                grade.toUpperCase(),
                remarks || null,
                studentId,
                courseId,
                examDate,
            ]);
        } else {
            // Insert new result
            const insertQuery = `
                INSERT INTO exam_results (student_id, course_id, exam_date, grade, remarks)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, student_id, course_id, exam_date, grade, remarks, published_at
            `;
            result = await client.query(insertQuery, [
                studentId,
                courseId,
                examDate,
                grade.toUpperCase(),
                remarks || null,
            ]);
        }

        // Get student and course details for response
        const detailsQuery = `
            SELECT 
                s.register_number,
                s.full_name as student_name,
                s.email as student_email,
                c.course_code,
                c.course_name
            FROM students s, courses c
            WHERE s.user_id = $1 AND c.id = $2
        `;
        const detailsResult = await client.query(detailsQuery, [
            studentId,
            courseId,
        ]);

        return NextResponse.json({
            success: true,
            message:
                existingResult.rows.length > 0
                    ? "Result updated successfully"
                    : "Result added successfully",
            result: {
                ...result.rows[0],
                student_details: detailsResult.rows[0],
            },
        });
    } catch (error) {
        console.error("Error adding/updating exam result:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to add/update exam result",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

// DELETE - Remove exam result
export async function DELETE(request: NextRequest) {
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
        const resultId = searchParams.get("resultId");

        if (!resultId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Result ID is required",
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

        // Verify lecturer has access to this result
        const accessQuery = `
            SELECT er.id, s.full_name as student_name, c.course_name
            FROM exam_results er
            INNER JOIN courses c ON er.course_id = c.id
            INNER JOIN lecturer_courses lc ON c.id = lc.course_id
            INNER JOIN students s ON er.student_id = s.user_id
            WHERE er.id = $1 AND lc.lecturer_id = $2
        `;
        const accessResult = await client.query(accessQuery, [
            resultId,
            lecturerId,
        ]);

        if (accessResult.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Result not found or you don't have permission to delete it",
                },
                { status: 404 }
            );
        }

        // Delete the result
        const deleteQuery = `DELETE FROM exam_results WHERE id = $1`;
        await client.query(deleteQuery, [resultId]);

        return NextResponse.json({
            success: true,
            message: "Exam result deleted successfully",
            deletedResult: accessResult.rows[0],
        });
    } catch (error) {
        console.error("Error deleting exam result:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete exam result",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
