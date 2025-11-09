import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

interface RechargeRequest {
    card_uid: string;
    amount: number;
}

export async function POST(request: NextRequest) {
    try {
        const body: RechargeRequest = await request.json();
        console.log("📝 Processing recharge request:", body);

        // Validate required fields
        if (!body.card_uid || !body.amount) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Missing required fields: card_uid or amount",
                },
                { status: 400 }
            );
        }

        // Validate amount
        if (body.amount <= 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Amount must be greater than 0",
                },
                { status: 400 }
            );
        }

        if (body.amount > 10000) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Amount cannot exceed Rs. 10,000",
                },
                { status: 400 }
            );
        }

        const client = await pool.connect();

        try {
            // Start transaction
            await client.query("BEGIN");

            // Get current card details
            const cardResult = await client.query(
                `SELECT id, card_uid, assigned_student, balance, status 
                 FROM rfid_cards 
                 WHERE card_uid = $1`,
                [body.card_uid]
            );

            if (cardResult.rows.length === 0) {
                await client.query("ROLLBACK");
                return NextResponse.json(
                    {
                        success: false,
                        message: "Card not found",
                    },
                    { status: 404 }
                );
            }

            const card = cardResult.rows[0];

            // Check if card is active
            if (card.status !== "ACTIVE") {
                await client.query("ROLLBACK");
                return NextResponse.json(
                    {
                        success: false,
                        message: `Cannot recharge ${card.status} card. Only ACTIVE cards can be recharged.`,
                    },
                    { status: 400 }
                );
            }

            const oldBalance = parseFloat(card.balance);
            const newBalance = oldBalance + body.amount;

            // Update card balance
            const updateResult = await client.query(
                `UPDATE rfid_cards 
                 SET balance = $1, updated_at = CURRENT_TIMESTAMP 
                 WHERE card_uid = $2 
                 RETURNING balance`,
                [newBalance, body.card_uid]
            );

            // Generate unique transaction ID
            const transactionIdResult = await client.query(
                `SELECT generate_transaction_id() as transaction_id`
            );
            const transactionId = transactionIdResult.rows[0].transaction_id;

            // Log the recharge transaction in student_transactions table
            await client.query(
                `INSERT INTO student_transactions 
                 (transaction_id, student_id, card_uid, transaction_type, transaction_status, 
                  amount, balance_before, balance_after, description, reference_type, 
                  location, operator_type, payment_method, transaction_date)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)`,
                [
                    transactionId,
                    card.assigned_student,
                    body.card_uid,
                    "RECHARGE",
                    "COMPLETED",
                    body.amount,
                    oldBalance,
                    newBalance,
                    `Admin recharge: Rs. ${body.amount.toFixed(2)} added`,
                    "manual_recharge",
                    "Admin Portal",
                    "admin",
                    "ADMIN",
                ]
            );

            // Commit transaction
            await client.query("COMMIT");

            console.log(
                `✅ Card ${body.card_uid} recharged: ${oldBalance} -> ${newBalance}`
            );

            return NextResponse.json({
                success: true,
                message: "Card recharged successfully",
                data: {
                    transaction_id: transactionId,
                    card_uid: body.card_uid,
                    amount_added: body.amount,
                    old_balance: oldBalance,
                    new_balance: newBalance,
                    timestamp: new Date().toISOString(),
                },
            });
        } catch (error) {
            // Rollback on error
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("❌ Recharge error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to recharge card",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
