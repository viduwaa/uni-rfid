import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";

// POST - Record attendance via NFC card swipe
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
                    success: false,
                    message:
                        "Unauthorized. Only lecturers can record attendance.",
                    code: "UNAUTHORIZED",
                },
                { status: 403 }
            );
        }

        const { cardUid, registerNumber, courseId, readerName, timestamp } =
            await request.json();

        // Validate required fields
        if (!cardUid || !registerNumber || !courseId) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Missing required fields: cardUid, registerNumber, courseId",
                    code: "INVALID_DATA",
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
                {
                    success: false,
                    message: "Lecturer not found",
                    code: "LECTURER_NOT_FOUND",
                },
                { status: 404 }
            );
        }

        const lecturerId = lecturerResult.rows[0].id;

        // Find student by register number
        const studentQuery = `
            SELECT user_id, register_number, full_name, initial_name, email, faculty, year_of_study
            FROM students 
            WHERE register_number = $1
        `;
        const studentResult = await client.query(studentQuery, [
            registerNumber,
        ]);

        if (studentResult.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Student not found with register number: ${registerNumber}`,
                    code: "STUDENT_NOT_FOUND",
                    registerNumber,
                },
                { status: 404 }
            );
        }

        const student = studentResult.rows[0];

        // Verify student is enrolled in the course
        const enrollmentQuery = `
            SELECT sc.id, c.course_code, c.course_name
            FROM student_courses sc
            JOIN courses c ON sc.course_id = c.id
            WHERE sc.student_id = $1 AND sc.course_id = $2
        `;
        const enrollmentResult = await client.query(enrollmentQuery, [
            student.user_id,
            courseId,
        ]);

        if (enrollmentResult.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: `${student.full_name} is not enrolled in this course`,
                    code: "NOT_ENROLLED",
                    student: {
                        user_id: student.user_id,
                        register_number: student.register_number,
                        full_name: student.full_name,
                    },
                },
                { status: 400 }
            );
        }

        const course = enrollmentResult.rows[0];
        const currentDate = new Date().toISOString().split("T")[0];
        const currentTime = new Date()
            .toTimeString()
            .split(" ")[0]
            .substring(0, 5);

        // Check if attendance already exists for today
        const existingQuery = `
            SELECT id, checked_in, created_at FROM attendance 
            WHERE student_id = $1 AND course_id = $2 AND date = $3
        `;
        const existingResult = await client.query(existingQuery, [
            student.user_id,
            courseId,
            currentDate,
        ]);

        if (existingResult.rows.length > 0) {
            const existing = existingResult.rows[0];
            return NextResponse.json(
                {
                    success: false,
                    message: `Attendance already recorded for ${student.full_name} today`,
                    code: "ALREADY_RECORDED",
                    student: {
                        user_id: student.user_id,
                        register_number: student.register_number,
                        full_name: student.full_name,
                    },
                    lastRecorded: existing.created_at,
                    checkedInTime: existing.checked_in,
                },
                { status: 409 }
            );
        }

        // Record new attendance
        const insertQuery = `
            INSERT INTO attendance (student_id, course_id, lecturer_id, date, checked_in)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, student_id, course_id, date, checked_in, created_at
        `;

        const attendanceResult = await client.query(insertQuery, [
            student.user_id,
            courseId,
            lecturerId,
            currentDate,
            currentTime,
        ]);

        // Log the NFC card swipe for audit trail (optional)
        try {
            const logQuery = `
                INSERT INTO nfc_attendance_log (
                    attendance_id, card_uid, reader_name, swipe_timestamp, 
                    student_id, course_id, lecturer_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            `;

            await client.query(logQuery, [
                attendanceResult.rows[0].id,
                cardUid,
                readerName || "Unknown Reader",
                new Date(timestamp || Date.now()),
                student.user_id,
                courseId,
                lecturerId,
            ]);
        } catch (logError) {
            // Log error but don't fail the attendance recording
            console.error("Failed to log NFC swipe:", logError);
        }

        return NextResponse.json({
            success: true,
            message: "Attendance recorded successfully via NFC",
            attendance: attendanceResult.rows[0],
            student: {
                user_id: student.user_id,
                register_number: student.register_number,
                full_name: student.full_name,
                initial_name: student.initial_name,
                email: student.email,
                faculty: student.faculty,
                year_of_study: student.year_of_study,
            },
            course: {
                id: courseId,
                course_code: course.course_code,
                course_name: course.course_name,
            },
            nfc: {
                card_uid: cardUid,
                reader_name: readerName,
                timestamp: timestamp,
            },
        });
    } catch (error) {
        console.error("Error recording NFC attendance:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error while recording attendance",
                code: "SERVER_ERROR",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
