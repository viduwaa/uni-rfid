import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
    try {
        const client = await pool.connect();

        try {
            // Get active cards count
            const activeCardsResult = await client.query(`
                SELECT COUNT(*) as count
                FROM rfid_cards
                WHERE status = 'ACTIVE'
            `);

            // Get total issued cards count
            const issuedCardsResult = await client.query(`
                SELECT COUNT(*) as count
                FROM rfid_cards
            `);

            // Get total balance across all cards
            const totalBalanceResult = await client.query(`
                SELECT COALESCE(SUM(balance), 0) as total
                FROM rfid_cards
            `);

            // Get unissued cards count (students without cards)
            const unissuedCardsResult = await client.query(`
                SELECT COUNT(*) as count
                FROM students s
                WHERE NOT EXISTS (
                    SELECT 1 
                    FROM rfid_cards r 
                    WHERE r.assigned_student = s.user_id
                )
            `);

            const stats = {
                activeCards: parseInt(activeCardsResult.rows[0].count),
                issuedCards: parseInt(issuedCardsResult.rows[0].count),
                totalBalance: parseFloat(totalBalanceResult.rows[0].total),
                unissuedCards: parseInt(unissuedCardsResult.rows[0].count),
            };

            return NextResponse.json({
                success: true,
                data: stats,
            });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Stats API Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch RFID statistics",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
