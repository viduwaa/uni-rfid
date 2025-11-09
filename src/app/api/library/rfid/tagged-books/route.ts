import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");
        const search = searchParams.get("search");
        const status = searchParams.get("status"); // all, available, checked_out

        let query = `
            SELECT 
        bc.id AS copy_id,
        b.id AS book_id,
        b.title,
        b.author,
        b.isbn,
        bc.barcode,
        bc.condition,
        bc.is_available,
        brt.rfid_uid,
        brt.assigned_date,
        brt.status AS tag_status,
        bl.id AS loan_id,
        bl.student_id,
        s.full_name AS student_name,
        s.register_number,
        bl.borrowed_at,
        bl.due_date,
        bl.status AS loan_status
      FROM book_copies bc
      INNER JOIN books b ON bc.book_id = b.id
      INNER JOIN book_rfid_tags brt ON bc.id = brt.book_copy_id
      LEFT JOIN book_loans bl ON bc.id = bl.book_copy_id AND bl.status = 'active'
      LEFT JOIN students s ON bl.student_id = s.id
      WHERE 1=1
        `;

        const queryParams: any[] = [];
        let paramCount = 0;

        // Add search filter
        if (search && search.trim()) {
            paramCount++;
            query += ` AND (
                b.title ILIKE $${paramCount} OR 
                b.isbn ILIKE $${paramCount} OR 
                bc.barcode ILIKE $${paramCount} OR
                brt.rfid_uid ILIKE $${paramCount}
            )`;
            queryParams.push(`%${search.trim()}%`);
        }

        // Add status filter
        if (status === "available") {
            query += ` AND bc.is_available = true`;
        } else if (status === "checked_out") {
            query += ` AND bc.is_available = false`;
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM (${query}) as counted`;
        const countResult = await pool.query(countQuery, queryParams);
        const total = parseInt(countResult.rows[0].total);

        // Add pagination
        paramCount++;
        query += ` ORDER BY brt.created_at DESC LIMIT $${paramCount}`;
        queryParams.push(limit);

        paramCount++;
        query += ` OFFSET $${paramCount}`;
        queryParams.push(offset);

        const result = await pool.query(query, queryParams);

        // Transform results
        const books = result.rows.map((row) => ({
            id: row.copy_id,
            book_id: row.book_id,
            barcode: row.barcode,
            book_title: row.title,
            book_author: row.author,
            book_isbn: row.isbn,
            condition: row.condition,
            rfid_uid: row.rfid_uid,
            tag_status: row.tag_status,
            issued_at: row.assigned_date,
            is_available: row.is_available,
            current_loan: row.loan_id
                ? {
                      id: row.loan_id,
                      student_name: row.student_name,
                      student_register: row.register_number,
                      borrowed_at: row.borrowed_at,
                      due_date: row.due_date,
                      status: row.loan_status,
                  }
                : null,
        }));

        return NextResponse.json({
            success: true,
            data: books,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total,
            },
        });
    } catch (error) {
        console.error("Error fetching tagged books:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch tagged books",
            },
            { status: 500 }
        );
    }
}
