import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

// GET - Fetch all students with their card status and enrolled courses
export async function GET(request: NextRequest) {
    const client = await pool.connect();

    try {
        const query = `
      SELECT 
        s.user_id,
        s.register_number,
        s.full_name,
        s.initial_name,
        s.nic_no,
        s.email,
        s.faculty,
        s.year_of_study,
        s.address,
        s.phone,
        s.photo,
        s.date_of_birth,
        s.created_at,
        s.updated_at,
        r.card_uid,
        r.status as card_status,
        COALESCE(
          JSON_AGG(
            CASE WHEN c.id IS NOT NULL THEN
              JSON_BUILD_OBJECT(
                'id', c.id,
                'course_code', c.course_code,
                'course_name', c.course_name,
                'faculty', c.faculty,
                'year', c.year,
                'credits', c.credits
              )
            END
          ) FILTER (WHERE c.id IS NOT NULL), 
          '[]'::json
        ) as enrolled_courses
      FROM students s
      LEFT JOIN rfid_cards r ON s.user_id = r.assigned_student
      LEFT JOIN student_courses sc ON s.user_id = sc.student_id
      LEFT JOIN courses c ON sc.course_id = c.id
      GROUP BY s.user_id, s.register_number, s.full_name, s.initial_name, 
               s.nic_no, s.email, s.faculty, s.year_of_study, s.address, 
               s.phone, s.photo, s.date_of_birth, s.created_at, s.updated_at,
               r.card_uid, r.status
      ORDER BY s.created_at DESC
    `;

        const result = await client.query(query);

        return NextResponse.json({
            success: true,
            students: result.rows,
        });
    } catch (error) {
        console.error("Error fetching students:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch students",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
