import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

// Handle card-specific operations
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ cardUid: string }> }
) {
    const params = await context.params;
    try {
        const { action } = await request.json();
        const cardUid = params.cardUid;

        const client = await pool.connect();

        try {
            let query = "";
            let newStatus = "";

            switch (action) {
                case "activate":
                    newStatus = "ACTIVE";
                    query = `
            UPDATE rfid_cards 
            SET status = $1, updated_at = CURRENT_TIMESTAMP 
            WHERE card_uid = $2 
            RETURNING *
          `;
                    break;
                case "deactivate":
                    newStatus = "INACTIVE";
                    query = `
            UPDATE rfid_cards 
            SET status = $1, updated_at = CURRENT_TIMESTAMP 
            WHERE card_uid = $2 
            RETURNING *
          `;
                    break;
                case "block":
                    newStatus = "BLOCKED";
                    query = `
            UPDATE rfid_cards 
            SET status = $1, updated_at = CURRENT_TIMESTAMP 
            WHERE card_uid = $2 
            RETURNING *
          `;
                    break;
                default:
                    return NextResponse.json(
                        { success: false, message: "Invalid action" },
                        { status: 400 }
                    );
            }

            const result = await client.query(query, [newStatus, cardUid]);

            if (result.rows.length === 0) {
                return NextResponse.json(
                    { success: false, message: "Card not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                data: result.rows[0],
                message: `Card ${action}d successfully`,
            });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to update card",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
