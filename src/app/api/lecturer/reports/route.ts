import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";

// GET - Generate attendance reports
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
                        "Unauthorized. Only lecturers can generate reports.",
                },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get("courseId");
        const reportType = searchParams.get("type") || "summary";
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const format = searchParams.get("format") || "json";

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

        let report = {};

        switch (reportType) {
            case "summary":
                report = await generateSummaryReport(
                    client,
                    lecturerId,
                    courseId || undefined,
                    startDate || undefined,
                    endDate || undefined
                );
                break;
            case "detailed":
                report = await generateDetailedReport(
                    client,
                    lecturerId,
                    courseId || undefined,
                    startDate || undefined,
                    endDate || undefined
                );
                break;
            case "student":
                report = await generateStudentReport(
                    client,
                    lecturerId,
                    courseId || undefined,
                    startDate || undefined,
                    endDate || undefined
                );
                break;
            case "course":
                report = await generateCourseReport(
                    client,
                    lecturerId,
                    startDate || undefined,
                    endDate || undefined
                );
                break;
            default:
                return NextResponse.json(
                    {
                        message:
                            "Invalid report type. Valid types: summary, detailed, student, course",
                    },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            success: true,
            reportType,
            generatedAt: new Date().toISOString(),
            ...report,
        });
    } catch (error) {
        console.error("Error generating report:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to generate report",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

// Helper function to generate summary report
async function generateSummaryReport(
    client: any,
    lecturerId: string,
    courseId?: string,
    startDate?: string,
    endDate?: string
) {
    let whereConditions = [`lc.lecturer_id = $1`];
    let queryParams = [lecturerId];
    let paramCount = 1;

    if (courseId) {
        paramCount++;
        whereConditions.push(`c.id = $${paramCount}`);
        queryParams.push(courseId);
    }

    let dateFilter = "";
    if (startDate && endDate) {
        paramCount++;
        dateFilter = `AND a.date >= $${paramCount}`;
        queryParams.push(startDate);

        paramCount++;
        dateFilter += ` AND a.date <= $${paramCount}`;
        queryParams.push(endDate);
    }

    const summaryQuery = `
        SELECT 
            c.id as course_id,
            c.course_code,
            c.course_name,
            COUNT(DISTINCT sc.student_id) as total_enrolled,
            COUNT(DISTINCT a.student_id) as total_attended,
            COUNT(DISTINCT a.date) as total_sessions,
            ROUND(
                (COUNT(DISTINCT a.student_id)::numeric / 
                 NULLIF(COUNT(DISTINCT sc.student_id), 0)) * 100, 
                2
            ) as overall_attendance_rate,
            MIN(a.date) as first_session,
            MAX(a.date) as last_session
        FROM courses c
        INNER JOIN lecturer_courses lc ON c.id = lc.course_id
        LEFT JOIN student_courses sc ON c.id = sc.course_id
        LEFT JOIN attendance a ON c.id = a.course_id ${dateFilter}
        WHERE ${whereConditions.join(" AND ")}
        GROUP BY c.id, c.course_code, c.course_name
        ORDER BY c.course_name
    `;

    const result = await client.query(summaryQuery, queryParams);

    return {
        courses: result.rows,
        totalCourses: result.rows.length,
        dateRange: startDate && endDate ? { startDate, endDate } : null,
    };
}

// Helper function to generate detailed report
async function generateDetailedReport(
    client: any,
    lecturerId: string,
    courseId?: string,
    startDate?: string,
    endDate?: string
) {
    let whereConditions = [`a.lecturer_id = $1`];
    let queryParams = [lecturerId];
    let paramCount = 1;

    if (courseId) {
        paramCount++;
        whereConditions.push(`a.course_id = $${paramCount}`);
        queryParams.push(courseId);
    }

    if (startDate && endDate) {
        paramCount++;
        whereConditions.push(`a.date >= $${paramCount}`);
        queryParams.push(startDate);

        paramCount++;
        whereConditions.push(`a.date <= $${paramCount}`);
        queryParams.push(endDate);
    }

    const detailedQuery = `
        SELECT 
            a.date,
            c.course_code,
            c.course_name,
            COUNT(a.id) as students_present,
            (SELECT COUNT(*) FROM student_courses sc WHERE sc.course_id = a.course_id) as total_enrolled,
            ROUND(
                (COUNT(a.id)::numeric / 
                 (SELECT COUNT(*) FROM student_courses sc WHERE sc.course_id = a.course_id)) * 100, 
                2
            ) as attendance_percentage,
            json_agg(
                json_build_object(
                    'student_id', s.user_id,
                    'register_number', s.register_number,
                    'name', s.full_name,
                    'checked_in', a.checked_in
                )
                ORDER BY a.checked_in
            ) as attendees
        FROM attendance a
        JOIN students s ON a.student_id = s.user_id
        JOIN courses c ON a.course_id = c.id
        WHERE ${whereConditions.join(" AND ")}
        GROUP BY a.date, c.id, c.course_code, c.course_name
        ORDER BY a.date DESC, c.course_name
    `;

    const result = await client.query(detailedQuery, queryParams);

    return {
        sessions: result.rows,
        totalSessions: result.rows.length,
        dateRange: startDate && endDate ? { startDate, endDate } : null,
    };
}

// Helper function to generate student report
async function generateStudentReport(
    client: any,
    lecturerId: string,
    courseId?: string,
    startDate?: string,
    endDate?: string
) {
    let whereConditions = [`lc.lecturer_id = $1`];
    let queryParams = [lecturerId];
    let paramCount = 1;

    if (courseId) {
        paramCount++;
        whereConditions.push(`c.id = $${paramCount}`);
        queryParams.push(courseId);
    }

    let attendanceFilter = "";
    if (startDate && endDate) {
        paramCount++;
        attendanceFilter = `AND a.date >= $${paramCount}`;
        queryParams.push(startDate);

        paramCount++;
        attendanceFilter += ` AND a.date <= $${paramCount}`;
        queryParams.push(endDate);
    }

    // First, get the total sessions per course
    let sessionWhereConditions = [`a.lecturer_id = $1`];
    let sessionParams = [lecturerId];
    let sessionParamCount = 1;

    if (courseId) {
        sessionParamCount++;
        sessionWhereConditions.push(`a.course_id = $${sessionParamCount}`);
        sessionParams.push(courseId);
    }

    if (startDate && endDate) {
        sessionParamCount++;
        sessionWhereConditions.push(`a.date >= $${sessionParamCount}`);
        sessionParams.push(startDate);

        sessionParamCount++;
        sessionWhereConditions.push(`a.date <= $${sessionParamCount}`);
        sessionParams.push(endDate);
    }

    const sessionQuery = `
        SELECT 
            c.id as course_id,
            c.course_code,
            c.course_name,
            COUNT(DISTINCT a.date) as total_sessions
        FROM courses c
        INNER JOIN lecturer_courses lc ON c.id = lc.course_id
        LEFT JOIN attendance a ON c.id = a.course_id
        WHERE ${sessionWhereConditions.join(" AND ")}
        GROUP BY c.id, c.course_code, c.course_name
    `;

    const sessionResult = await client.query(sessionQuery, sessionParams);
    const sessionMap = new Map(
        sessionResult.rows.map((row: any) => [
            row.course_id,
            row.total_sessions,
        ])
    );

    // Now get student attendance data
    const studentQuery = `
        SELECT 
            s.user_id,
            s.register_number,
            s.full_name,
            s.faculty,
            s.year_of_study,
            c.id as course_id,
            c.course_code,
            c.course_name,
            COUNT(a.id) as sessions_attended
        FROM students s
        INNER JOIN student_courses sc ON s.user_id = sc.student_id
        INNER JOIN courses c ON sc.course_id = c.id
        INNER JOIN lecturer_courses lc ON c.id = lc.course_id
        LEFT JOIN attendance a ON s.user_id = a.student_id 
            AND c.id = a.course_id 
            AND a.lecturer_id = lc.lecturer_id
            ${attendanceFilter}
        WHERE ${whereConditions.join(" AND ")}
        GROUP BY s.user_id, s.register_number, s.full_name, s.faculty, s.year_of_study, 
                 c.id, c.course_code, c.course_name
        ORDER BY s.full_name, c.course_name
    `;

    const result = await client.query(studentQuery, queryParams);

    // Calculate attendance percentage for each student
    const studentsWithPercentage = result.rows.map((student: any) => {
        const totalSessions = Number(sessionMap.get(student.course_id)) || 0;
        const sessionsAttended = Number(student.sessions_attended) || 0;
        const attendancePercentage =
            totalSessions > 0
                ? Math.round((sessionsAttended / totalSessions) * 100 * 100) /
                  100
                : 0;

        return {
            ...student,
            total_sessions: totalSessions,
            attendance_percentage: attendancePercentage,
        };
    });

    return {
        students: studentsWithPercentage,
        totalStudents: studentsWithPercentage.length,
        dateRange: startDate && endDate ? { startDate, endDate } : null,
    };
}

// Helper function to generate course report
async function generateCourseReport(
    client: any,
    lecturerId: string,
    startDate?: string,
    endDate?: string
) {
    let queryParams = [lecturerId];
    let dateFilter = "";

    if (startDate && endDate) {
        dateFilter = `AND a.date >= $2 AND a.date <= $3`;
        queryParams.push(startDate, endDate);
    }

    const courseQuery = `
        SELECT 
            c.id,
            c.course_code,
            c.course_name,
            c.faculty,
            c.year,
            c.credits,
            COUNT(DISTINCT sc.student_id) as enrolled_students,
            COUNT(DISTINCT a.date) as sessions_conducted,
            COUNT(a.id) as total_attendance_records,
            CASE 
                WHEN COUNT(DISTINCT a.date) > 0 THEN
                    ROUND(
                        (COUNT(a.id)::numeric / 
                         (COUNT(DISTINCT a.date) * COUNT(DISTINCT sc.student_id))) * 100, 
                        2
                    )
                ELSE 0 
            END as average_attendance_rate
        FROM courses c
        INNER JOIN lecturer_courses lc ON c.id = lc.course_id
        LEFT JOIN student_courses sc ON c.id = sc.course_id
        LEFT JOIN attendance a ON c.id = a.course_id 
            AND a.lecturer_id = lc.lecturer_id 
            ${dateFilter}
        WHERE lc.lecturer_id = $1
        GROUP BY c.id, c.course_code, c.course_name, c.faculty, c.year, c.credits
        ORDER BY c.course_name
    `;

    const result = await client.query(courseQuery, queryParams);

    return {
        courses: result.rows,
        totalCourses: result.rows.length,
        dateRange: startDate && endDate ? { startDate, endDate } : null,
    };
}
