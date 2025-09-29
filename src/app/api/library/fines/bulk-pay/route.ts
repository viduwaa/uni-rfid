import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
        const {
            student_id,
            action = "pay",
            notes = "Bulk payment processed",
        } = await request.json();

        if (!student_id) {
            return NextResponse.json(
                { error: "Student ID is required" },
                { status: 400 }
            );
        }

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            // Get all pending fines for the student
            const pendingFinesResult = await client.query(
                `SELECT id, amount FROM library_fines 
                 WHERE student_id = $1 AND status = 'pending'`,
                [student_id]
            );

            if (pendingFinesResult.rows.length === 0) {
                return NextResponse.json({
                    success: true,
                    message: "No pending fines found",
                    paid_count: 0,
                    total_amount: 0,
                });
            }

            const totalAmount = pendingFinesResult.rows.reduce(
                (sum, fine) => sum + parseFloat(fine.amount),
                0
            );

            // Update all pending fines to paid
            const updateResult = await client.query(
                `UPDATE library_fines 
                 SET status = $1, 
                     paid_at = CURRENT_TIMESTAMP, 
                     paid_by = $2, 
                     notes = COALESCE(notes, '') || $3
                 WHERE student_id = $4 AND status = 'pending'
                 RETURNING id`,
                [
                    action === "waive" ? "waived" : "paid",
                    "00000000-0000-0000-0000-000000000000", // Default user ID
                    ` | ${notes}`,
                    student_id,
                ]
            );

            await client.query("COMMIT");

            return NextResponse.json({
                success: true,
                message: `Successfully ${action === "waive" ? "waived" : "paid"} ${updateResult.rows.length} fines`,
                paid_count: updateResult.rows.length,
                total_amount: totalAmount,
            });
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Error processing bulk fine payment:", error);
        return NextResponse.json(
            { error: "Failed to process fine payments" },
            { status: 500 }
        );
    }
}
