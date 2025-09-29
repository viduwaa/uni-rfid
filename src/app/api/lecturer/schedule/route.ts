import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";

interface ScheduleItem {
    id: string;
    course_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    room: string;
    created_at: string;
    course_code: string;
    course_name: string;
    course_faculty: string;
    course_year: number;
    enrolled_students: string;
}

export async function GET(request: NextRequest) {
    const client = await pool.connect();

    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get lecturer ID from session
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

        // Get the week parameter from query string
        const { searchParams } = new URL(request.url);
        const weekOffset = parseInt(searchParams.get("weekOffset") || "0");

        // Calculate start and end dates for the requested week
        const today = new Date();
        const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Adjust for Monday start

        const baseMonday = new Date(today);
        baseMonday.setDate(today.getDate() + mondayOffset + weekOffset * 7);

        const startOfWeek = new Date(baseMonday);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(baseMonday);
        endOfWeek.setDate(baseMonday.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        // Fetch schedule for the week
        const scheduleQuery = `
            SELECT 
                cs.id,
                cs.course_id,
                cs.day_of_week,
                cs.start_time,
                cs.end_time,
                cs.room,
                cs.created_at,
                c.course_code,
                c.course_name,
                c.faculty as course_faculty,
                c.year as course_year,
                COUNT(DISTINCT se.student_id) as enrolled_students
            FROM course_schedules cs
            JOIN courses c ON cs.course_id = c.id
            JOIN lecturer_courses lc ON c.id = lc.course_id
            LEFT JOIN student_enrollments se ON c.id = se.course_id
            WHERE lc.lecturer_id = $1
            GROUP BY cs.id, cs.course_id, cs.day_of_week, cs.start_time, cs.end_time, 
                     cs.room, cs.created_at, c.course_code, c.course_name, c.faculty, c.year
            ORDER BY cs.day_of_week, cs.start_time
        `;

        const scheduleResult = await client.query(scheduleQuery, [lecturerId]);
        const schedule: ScheduleItem[] = scheduleResult.rows;

        // Get week dates for reference
        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(baseMonday);
            date.setDate(baseMonday.getDate() + i);
            weekDates.push({
                date: date.toISOString().split("T")[0],
                dayName: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                ][i],
                dayShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
                isToday: date.toDateString() === today.toDateString(),
            });
        }

        // Get summary statistics
        const totalClasses = schedule.length;
        const uniqueCourses = [
            ...new Set(schedule.map((item: ScheduleItem) => item.course_id)),
        ].length;
        const totalStudents = schedule.reduce(
            (sum: number, item: ScheduleItem) =>
                sum + parseInt(item.enrolled_students),
            0
        );

        // Calculate average classes per day
        const classesPerDay = schedule.reduce(
            (acc: Record<number, number>, item: ScheduleItem) => {
                const day = item.day_of_week;
                acc[day] = (acc[day] || 0) + 1;
                return acc;
            },
            {} as Record<number, number>
        );

        const averageClassesPerDay = totalClasses / 5; // Assuming 5 working days

        return NextResponse.json({
            success: true,
            schedule: schedule,
            weekDates: weekDates,
            summary: {
                totalClasses,
                uniqueCourses,
                totalStudents,
                averageClassesPerDay: Number(averageClassesPerDay.toFixed(1)),
            },
            weekInfo: {
                startDate: startOfWeek.toISOString().split("T")[0],
                endDate: endOfWeek.toISOString().split("T")[0],
                weekOffset,
            },
        });
    } catch (error) {
        console.error("Error fetching schedule:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

export async function POST(request: NextRequest) {
    const client = await pool.connect();

    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get lecturer ID from session
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
        const { courseId, dayOfWeek, startTime, endTime, room } =
            await request.json();

        // Validate input
        if (
            !courseId ||
            dayOfWeek === undefined ||
            !startTime ||
            !endTime ||
            !room
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Missing required fields: courseId, dayOfWeek, startTime, endTime, room",
                },
                { status: 400 }
            );
        }

        // Validate day of week (0-6)
        if (dayOfWeek < 0 || dayOfWeek > 6) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Day of week must be between 0 (Monday) and 6 (Sunday)",
                },
                { status: 400 }
            );
        }

        // Check if lecturer teaches this course
        const courseCheck = await client.query(
            `SELECT c.id, c.course_code, c.course_name 
             FROM courses c 
             JOIN lecturer_courses lc ON c.id = lc.course_id 
             WHERE c.id = $1 AND lc.lecturer_id = $2`,
            [courseId, lecturerId]
        );

        if (courseCheck.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Course not found or not assigned to this lecturer",
                },
                { status: 403 }
            );
        }

        // Check for schedule conflicts
        const conflictCheck = await client.query(
            `SELECT id FROM course_schedules cs
             JOIN lecturer_courses lc ON cs.course_id = lc.course_id
             WHERE lc.lecturer_id = $1 
             AND cs.day_of_week = $2 
             AND cs.room = $3
             AND (
                 (cs.start_time <= $4 AND cs.end_time > $4) OR
                 (cs.start_time < $5 AND cs.end_time >= $5) OR
                 (cs.start_time >= $4 AND cs.end_time <= $5)
             )`,
            [lecturerId, dayOfWeek, room, startTime, endTime]
        );

        if (conflictCheck.rows.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Schedule conflict: Room is already booked for this time slot",
                },
                { status: 409 }
            );
        }

        // Insert new schedule
        const insertResult = await client.query(
            `INSERT INTO course_schedules (course_id, day_of_week, start_time, end_time, room, created_at)
             VALUES ($1, $2, $3, $4, $5, NOW())
             RETURNING id`,
            [courseId, dayOfWeek, startTime, endTime, room]
        );

        const scheduleId = insertResult.rows[0].id;

        // Fetch the created schedule with course details
        const createdSchedule = await client.query(
            `SELECT 
                cs.id,
                cs.course_id,
                cs.day_of_week,
                cs.start_time,
                cs.end_time,
                cs.room,
                cs.created_at,
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
            schedule: createdSchedule.rows[0],
        });
    } catch (error) {
        console.error("Error creating schedule:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

export async function DELETE(request: NextRequest) {
    const client = await pool.connect();

    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get lecturer ID from session
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
        const scheduleId = searchParams.get("scheduleId");

        if (!scheduleId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Schedule ID is required",
                },
                { status: 400 }
            );
        }

        // Check if the schedule belongs to the lecturer's courses
        const scheduleCheck = await client.query(
            `SELECT cs.id FROM course_schedules cs
             JOIN lecturer_courses lc ON cs.course_id = lc.course_id
             WHERE cs.id = $1 AND lc.lecturer_id = $2`,
            [scheduleId, lecturerId]
        );

        if (scheduleCheck.rows.length === 0) {
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
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
