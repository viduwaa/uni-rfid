import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";

// GET - Fetch all schedules for the lecturer (calendar events)
export async function GET(request: NextRequest) {
    const client = await pool.connect();

    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== "lecturer") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get lecturer ID
        const lecturerResult = await client.query(
            "SELECT id FROM lecturers WHERE user_id = $1",
            [(session.user as any).id]
        );

        if (lecturerResult.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: "Lecturer not found" },
                { status: 404 }
            );
        }

        const lecturerId = lecturerResult.rows[0].id;

        // Get query parameters for filtering
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        // Fetch all schedules for the lecturer
        const scheduleQuery = `
            SELECT 
                cs.id,
                cs.course_id,
                cs.day_of_week,
                cs.start_time,
                cs.end_time,
                cs.room,
                cs.event_type,
                cs.specific_date,
                cs.color,
                cs.notes,
                cs.lecturer_id,
                c.course_code,
                c.course_name,
                c.faculty as course_faculty,
                c.year as course_year,
                COUNT(DISTINCT sc.student_id) as enrolled_students
            FROM course_schedules cs
            JOIN courses c ON cs.course_id = c.id
            JOIN lecturer_courses lc ON c.id = lc.course_id
            LEFT JOIN student_courses sc ON c.id = sc.course_id
            WHERE lc.lecturer_id = $1 OR cs.lecturer_id = $1
            GROUP BY cs.id, c.id, c.course_code, c.course_name, c.faculty, c.year
            ORDER BY cs.day_of_week, cs.start_time
        `;

        const scheduleResult = await client.query(scheduleQuery, [lecturerId]);

        return NextResponse.json({
            success: true,
            events: scheduleResult.rows,
        });
    } catch (error) {
        console.error("Error fetching calendar events:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

// POST - Create new schedule event
export async function POST(request: NextRequest) {
    const client = await pool.connect();

    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== "lecturer") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get lecturer ID
        const lecturerResult = await client.query(
            "SELECT id FROM lecturers WHERE user_id = $1",
            [(session.user as any).id]
        );

        if (lecturerResult.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: "Lecturer not found" },
                { status: 404 }
            );
        }

        const lecturerId = lecturerResult.rows[0].id;
        const body = await request.json();
        const {
            courseId,
            eventType = "recurring",
            dayOfWeek,
            specificDate,
            startTime,
            endTime,
            room,
            color = "#3b82f6",
            notes = "",
        } = body;

        // Validation
        if (!courseId || !startTime || !endTime || !room) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Missing required fields: courseId, startTime, endTime, room",
                },
                { status: 400 }
            );
        }

        if (
            eventType === "recurring" &&
            (dayOfWeek === undefined || dayOfWeek === null)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "dayOfWeek is required for recurring events",
                },
                { status: 400 }
            );
        }

        if (eventType === "one-time" && !specificDate) {
            return NextResponse.json(
                {
                    success: false,
                    message: "specificDate is required for one-time events",
                },
                { status: 400 }
            );
        }

        // Check if lecturer teaches this course
        const courseCheck = await client.query(
            `SELECT 1 FROM lecturer_courses WHERE course_id = $1 AND lecturer_id = $2`,
            [courseId, lecturerId]
        );

        if (courseCheck.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Course not assigned to this lecturer",
                },
                { status: 403 }
            );
        }

        // Check for conflicts
        let conflictQuery;
        let conflictParams;

        if (eventType === "recurring") {
            conflictQuery = `
                SELECT id FROM course_schedules cs
                WHERE cs.lecturer_id = $1 
                AND cs.event_type = 'recurring'
                AND cs.day_of_week = $2 
                AND (
                    (cs.start_time <= $3::time AND cs.end_time > $3::time) OR
                    (cs.start_time < $4::time AND cs.end_time >= $4::time) OR
                    (cs.start_time >= $3::time AND cs.end_time <= $4::time)
                )
            `;
            conflictParams = [lecturerId, dayOfWeek, startTime, endTime];
        } else {
            conflictQuery = `
                SELECT id FROM course_schedules cs
                WHERE cs.lecturer_id = $1 
                AND cs.event_type = 'one-time'
                AND cs.specific_date = $2 
                AND (
                    (cs.start_time <= $3::time AND cs.end_time > $3::time) OR
                    (cs.start_time < $4::time AND cs.end_time >= $4::time) OR
                    (cs.start_time >= $3::time AND cs.end_time <= $4::time)
                )
            `;
            conflictParams = [lecturerId, specificDate, startTime, endTime];
        }

        const conflictCheck = await client.query(conflictQuery, conflictParams);

        if (conflictCheck.rows.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Schedule conflict: You have another class at this time",
                },
                { status: 409 }
            );
        }

        // Insert new schedule
        const insertResult = await client.query(
            `INSERT INTO course_schedules (
                course_id, lecturer_id, event_type, day_of_week, specific_date,
                start_time, end_time, room, color, notes, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
            RETURNING id`,
            [
                courseId,
                lecturerId,
                eventType,
                dayOfWeek,
                specificDate,
                startTime,
                endTime,
                room,
                color,
                notes,
            ]
        );

        const scheduleId = insertResult.rows[0].id;

        // Fetch the created schedule with course details
        const createdSchedule = await client.query(
            `SELECT 
                cs.*,
                c.course_code,
                c.course_name,
                c.faculty as course_faculty,
                c.year as course_year
             FROM course_schedules cs
             JOIN courses c ON cs.course_id = c.id
             WHERE cs.id = $1`,
            [scheduleId]
        );

        return NextResponse.json({
            success: true,
            message: "Schedule created successfully",
            event: createdSchedule.rows[0],
        });
    } catch (error) {
        console.error("Error creating schedule:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

// PUT - Update existing schedule event
export async function PUT(request: NextRequest) {
    const client = await pool.connect();

    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== "lecturer") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get lecturer ID
        const lecturerResult = await client.query(
            "SELECT id FROM lecturers WHERE user_id = $1",
            [(session.user as any).id]
        );

        if (lecturerResult.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: "Lecturer not found" },
                { status: 404 }
            );
        }

        const lecturerId = lecturerResult.rows[0].id;
        const body = await request.json();
        const {
            id,
            courseId,
            eventType,
            dayOfWeek,
            specificDate,
            startTime,
            endTime,
            room,
            color,
            notes,
        } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Schedule ID is required" },
                { status: 400 }
            );
        }

        // Check ownership
        const ownershipCheck = await client.query(
            `SELECT id FROM course_schedules WHERE id = $1 AND lecturer_id = $2`,
            [id, lecturerId]
        );

        if (ownershipCheck.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Schedule not found or access denied",
                },
                { status: 404 }
            );
        }

        // Build update query dynamically
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (courseId !== undefined) {
            updates.push(`course_id = $${paramCount++}`);
            values.push(courseId);
        }
        if (eventType !== undefined) {
            updates.push(`event_type = $${paramCount++}`);
            values.push(eventType);
        }
        if (dayOfWeek !== undefined) {
            updates.push(`day_of_week = $${paramCount++}`);
            values.push(dayOfWeek);
        }
        if (specificDate !== undefined) {
            updates.push(`specific_date = $${paramCount++}`);
            values.push(specificDate);
        }
        if (startTime !== undefined) {
            updates.push(`start_time = $${paramCount++}`);
            values.push(startTime);
        }
        if (endTime !== undefined) {
            updates.push(`end_time = $${paramCount++}`);
            values.push(endTime);
        }
        if (room !== undefined) {
            updates.push(`room = $${paramCount++}`);
            values.push(room);
        }
        if (color !== undefined) {
            updates.push(`color = $${paramCount++}`);
            values.push(color);
        }
        if (notes !== undefined) {
            updates.push(`notes = $${paramCount++}`);
            values.push(notes);
        }

        updates.push(`updated_at = NOW()`);
        values.push(id);

        const updateQuery = `
            UPDATE course_schedules 
            SET ${updates.join(", ")}
            WHERE id = $${paramCount}
            RETURNING id
        `;

        await client.query(updateQuery, values);

        // Fetch updated schedule
        const updatedSchedule = await client.query(
            `SELECT 
                cs.*,
                c.course_code,
                c.course_name,
                c.faculty as course_faculty,
                c.year as course_year
             FROM course_schedules cs
             JOIN courses c ON cs.course_id = c.id
             WHERE cs.id = $1`,
            [id]
        );

        return NextResponse.json({
            success: true,
            message: "Schedule updated successfully",
            event: updatedSchedule.rows[0],
        });
    } catch (error) {
        console.error("Error updating schedule:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

// DELETE - Remove schedule event
export async function DELETE(request: NextRequest) {
    const client = await pool.connect();

    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== "lecturer") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get lecturer ID
        const lecturerResult = await client.query(
            "SELECT id FROM lecturers WHERE user_id = $1",
            [(session.user as any).id]
        );

        if (lecturerResult.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: "Lecturer not found" },
                { status: 404 }
            );
        }

        const lecturerId = lecturerResult.rows[0].id;
        const { searchParams } = new URL(request.url);
        const scheduleId = searchParams.get("id");

        if (!scheduleId) {
            return NextResponse.json(
                { success: false, message: "Schedule ID is required" },
                { status: 400 }
            );
        }

        // Check ownership
        const ownershipCheck = await client.query(
            `SELECT id FROM course_schedules WHERE id = $1 AND lecturer_id = $2`,
            [scheduleId, lecturerId]
        );

        if (ownershipCheck.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Schedule not found or access denied",
                },
                { status: 404 }
            );
        }

        // Delete the schedule
        await client.query("DELETE FROM course_schedules WHERE id = $1", [
            scheduleId,
        ]);

        return NextResponse.json({
            success: true,
            message: "Schedule deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting schedule:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
