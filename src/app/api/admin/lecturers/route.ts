import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

// GET - Fetch all lecturers with their assigned courses
export async function GET(request: NextRequest) {
    const client = await pool.connect();

    try {
        const query = `
                        SELECT 
    l.id,
    l.user_id,
    l.staff_id,
    l.nic_no,
    l.full_name,
    l.initial_name,
    l.email,
    l.faculty,
    l.position,
    l.specialization,
    l.address,
    l.phone,
    l.photo,
    l.date_of_birth,
    l.created_at,
    l.updated_at,
    json_agg(
        json_build_object(
            'id', c.id,
            'course_code', c.course_code,
            'course_name', c.course_name,
            'faculty', c.faculty,
            'year', c.year,
            'credits', c.credits
        )
    ) FILTER (WHERE c.id IS NOT NULL) as assigned_courses
FROM 
    lecturers l
LEFT JOIN 
    lecturer_courses lc ON l.id = lc.lecturer_id
LEFT JOIN 
    courses c ON lc.course_id = c.id
GROUP BY 
    l.id,
    l.user_id,
    l.staff_id,
    l.nic_no,
    l.full_name,
    l.initial_name,
    l.email,
    l.faculty,
    l.position,
    l.specialization,
    l.address,
    l.phone,
    l.photo,
    l.date_of_birth,
    l.created_at,
    l.updated_at
ORDER BY 
    l.created_at DESC;
    `;

        const result = await client.query(query);
        console.log(result);

        return NextResponse.json({
            success: true,
            lecturers: result.rows,
        });
    } catch (error) {
        console.error("Error fetching lecturers:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch lecturers",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
