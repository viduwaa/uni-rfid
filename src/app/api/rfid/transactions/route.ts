import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get("student_id");
        const cardUid = searchParams.get("card_uid");
        const transactionType = searchParams.get("type");
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");

        const client = await pool.connect();

        try {
            let query = `
                SELECT 
                    st.id,
                    st.transaction_id,
                    st.student_id,
                    s.full_name as student_name,
                    s.register_number,
                    st.card_uid,
                    st.transaction_type,
                    st.transaction_status,
                    st.amount,
                    st.balance_before,
                    st.balance_after,
                    st.description,
                    st.reference_id,
                    st.reference_type,
                    st.location,
                    st.operator_type,
                    st.payment_method,
                    st.payment_reference,
                    st.notes,
                    st.transaction_date,
                    st.created_at
                FROM student_transactions st
                JOIN students s ON st.student_id = s.user_id
                WHERE 1=1
            `;

            const params: any[] = [];
            let paramIndex = 1;

            // Filter by student
            if (studentId) {
                query += ` AND st.student_id = $${paramIndex}`;
                params.push(studentId);
                paramIndex++;
            }

            // Filter by card
            if (cardUid) {
                query += ` AND st.card_uid = $${paramIndex}`;
                params.push(cardUid);
                paramIndex++;
            }

            // Filter by transaction type
            if (transactionType) {
                query += ` AND st.transaction_type = $${paramIndex}`;
                params.push(transactionType.toUpperCase());
                paramIndex++;
            }

            // Order by date descending
            query += ` ORDER BY st.transaction_date DESC, st.created_at DESC`;

            // Add limit and offset
            query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            params.push(limit, offset);

            const result = await client.query(query, params);

            // Get total count
            let countQuery = `
                SELECT COUNT(*) as total
                FROM student_transactions st
                WHERE 1=1
            `;
            const countParams: any[] = [];
            let countParamIndex = 1;

            if (studentId) {
                countQuery += ` AND st.student_id = $${countParamIndex}`;
                countParams.push(studentId);
                countParamIndex++;
            }

            if (cardUid) {
                countQuery += ` AND st.card_uid = $${countParamIndex}`;
                countParams.push(cardUid);
                countParamIndex++;
            }

            if (transactionType) {
                countQuery += ` AND st.transaction_type = $${countParamIndex}`;
                countParams.push(transactionType.toUpperCase());
            }

            const countResult = await client.query(countQuery, countParams);
            const total = parseInt(countResult.rows[0].total);

            return NextResponse.json({
                success: true,
                data: result.rows,
                pagination: {
                    total,
                    limit,
                    offset,
                    hasMore: offset + limit < total,
                },
            });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("❌ Transaction fetch error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch transactions",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
