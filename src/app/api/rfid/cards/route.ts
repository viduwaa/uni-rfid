import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

// Get issued cards
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const issued = searchParams.get("issued");

        if (issued === "true") {
            const client = await pool.connect();

            try {
                const result = await client.query(`
          SELECT 
            s.user_id,
            s.full_name,
            s.register_number,
            s.faculty,
            r.card_uid,
            r.balance,
            r.status,
            r.created_at as issued_at,
            r.updated_at as last_used
          FROM students s
          JOIN rfid_cards r ON r.assigned_student = s.user_id
          WHERE r.card_uid IS NOT NULL
          ORDER BY r.created_at DESC
        `);

                return NextResponse.json({
                    success: true,
                    data: result.rows,
                    count: result.rows.length,
                });
            } finally {
                client.release();
            }
        }

        return NextResponse.json({
            success: false,
            message: "Invalid query parameter",
        });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch cards",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
