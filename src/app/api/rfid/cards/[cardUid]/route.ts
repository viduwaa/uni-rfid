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

// Delete a card
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ cardUid: string }> }
) {
    const params = await context.params;
    try {
        const cardUid = params.cardUid;
        const client = await pool.connect();

        try {
            // First check if card exists
            const checkQuery = `
                SELECT card_uid, assigned_student 
                FROM rfid_cards 
                WHERE card_uid = $1
            `;
            const checkResult = await client.query(checkQuery, [cardUid]);

            if (checkResult.rows.length === 0) {
                return NextResponse.json(
                    { success: false, message: "Card not found" },
                    { status: 404 }
                );
            }

            // Delete the card (transactions will remain for audit purposes)
            const deleteQuery = `
                DELETE FROM rfid_cards 
                WHERE card_uid = $1 
                RETURNING card_uid
            `;
            const result = await client.query(deleteQuery, [cardUid]);

            return NextResponse.json({
                success: true,
                message: "Card deleted successfully",
                data: { card_uid: result.rows[0].card_uid },
            });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete card",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
