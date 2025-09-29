import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { returns } = body;

        if (!returns || !Array.isArray(returns) || returns.length === 0) {
            return NextResponse.json(
                { success: false, error: "Returns array is required" },
                { status: 400 }
            );
        }

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const processedReturns = [];
            let totalFines = 0;

            for (const returnItem of returns) {
                const {
                    loan_id,
                    return_date,
                    fine_amount = 0,
                    notes = "",
                } = returnItem;

                // Validate loan exists and is active
                const loanCheck = await client.query(
                    `SELECT bl.*, bc.barcode, b.title as book_title, s.full_name as student_name
                     FROM book_loans bl
                     JOIN book_copies bc ON bl.book_copy_id = bc.id
                     JOIN books b ON bc.book_id = b.id
                     JOIN students s ON bl.student_id = s.user_id
                     WHERE bl.id = $1 AND bl.status = 'active'`,
                    [loan_id]
                );

                if (loanCheck.rows.length === 0) {
                    throw new Error(
                        `Loan ${loan_id} not found or already returned`
                    );
                }

                const loan = loanCheck.rows[0];

                // Update loan record to returned
                await client.query(
                    `UPDATE book_loans 
                     SET status = 'returned', 
                         returned_at = $1, 
                         notes = COALESCE(notes, '') || $2
                     WHERE id = $3`,
                    [return_date, notes ? ` | Return: ${notes}` : "", loan_id]
                );

                // Update book copy availability
                await client.query(
                    `UPDATE book_copies 
                     SET is_available = true
                     WHERE id = $1`,
                    [loan.book_copy_id]
                );

                // Update book availability count
                await client.query(
                    `UPDATE books 
                     SET available_copies = available_copies + 1 
                     WHERE id = (SELECT book_id FROM book_copies WHERE id = $1)`,
                    [loan.book_copy_id]
                );

                // Create fine record if there's a fine amount
                if (fine_amount > 0) {
                    // Create the fine record
                    const fineResult = await client.query(
                        `INSERT INTO library_fines 
                         (student_id, loan_id, amount, reason, status, created_at)
                         VALUES ($1, $2, $3, $4, 'pending', $5)
                         RETURNING id`,
                        [
                            loan.student_id,
                            loan_id,
                            fine_amount,
                            `Late return fine - ${Math.ceil((new Date(return_date).getTime() - new Date(loan.due_date).getTime()) / (1000 * 60 * 60 * 24))} days overdue`,
                            return_date,
                        ]
                    );

                    // Immediately mark the fine as paid since the return process includes payment
                    const fineId = fineResult.rows[0].id;
                    await client.query(
                        `UPDATE library_fines 
                         SET status = 'paid'
                        WHERE id = $1`,
                        [fineId] // Using default user ID since auth is disabled
                    );

                    totalFines += fine_amount;
                }

                processedReturns.push({
                    loan_id,
                    book_title: loan.book_title,
                    student_name: loan.student_name,
                    barcode: loan.barcode,
                    return_date,
                    fine_amount,
                    was_overdue: fine_amount > 0,
                });
            }

            await client.query("COMMIT");

            return NextResponse.json({
                success: true,
                message: `Successfully processed ${processedReturns.length} returns`,
                data: {
                    processed_returns: processedReturns,
                    total_fines: totalFines,
                    return_count: processedReturns.length,
                },
            });
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Book return error:", error);
        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to process returns",
            },
            { status: 500 }
        );
    }
}
