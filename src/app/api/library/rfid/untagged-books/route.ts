import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get("search") || "";
        const searchType = searchParams.get("search_type") || "title";
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");

        let query = `
            SELECT 
                bc.id,
                bc.book_id,
                bc.barcode,
                bc.condition,
                bc.is_available,
                bc.has_rfid_tag,
                b.title as book_title,
                b.author as book_author,
                b.isbn as book_isbn,
                b.publisher,
                b.publication_year,
                b.category,
                b.location
            FROM book_copies bc
            JOIN books b ON bc.book_id = b.id
            WHERE bc.has_rfid_tag = false
        `;

        const values: any[] = [];
        let paramIndex = 1;

        if (search) {
            if (searchType === "isbn") {
                query += ` AND b.isbn ILIKE $${paramIndex}`;
                values.push(`%${search}%`);
                paramIndex++;
            } else if (searchType === "title") {
                query += ` AND b.title ILIKE $${paramIndex}`;
                values.push(`%${search}%`);
                paramIndex++;
            } else if (searchType === "barcode") {
                query += ` AND bc.barcode ILIKE $${paramIndex}`;
                values.push(`%${search}%`);
                paramIndex++;
            }
        }

        query += ` ORDER BY b.title, bc.barcode LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        values.push(limit, offset);

        const result = await pool.query(query, values);

        // Get total count
        let countQuery = `
            SELECT COUNT(*) as total
            FROM book_copies bc
            JOIN books b ON bc.book_id = b.id
            WHERE bc.has_rfid_tag = false
        `;

        const countValues: any[] = [];
        let countParamIndex = 1;

        if (search) {
            if (searchType === "isbn") {
                countQuery += ` AND b.isbn ILIKE $${countParamIndex}`;
                countValues.push(`%${search}%`);
            } else if (searchType === "title") {
                countQuery += ` AND b.title ILIKE $${countParamIndex}`;
                countValues.push(`%${search}%`);
            } else if (searchType === "barcode") {
                countQuery += ` AND bc.barcode ILIKE $${countParamIndex}`;
                countValues.push(`%${search}%`);
            }
        }

        const countResult = await pool.query(countQuery, countValues);
        const total = parseInt(countResult.rows[0]?.total || "0");

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
    } catch (error) {
        console.error("❌ Error fetching untagged books:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch untagged books",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
