import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        // Get comprehensive library statistics
        const statsQuery = `
            WITH library_stats AS (
                -- Total books and availability
                SELECT 
                    COUNT(DISTINCT b.id) as total_books,
                    COUNT(DISTINCT bc.id) as total_copies,
                    COUNT(DISTINCT CASE WHEN bc.status = 'available' THEN bc.id END) as available_copies,
                    COUNT(DISTINCT CASE WHEN bc.status = 'checked_out' THEN bc.id END) as checked_out_copies
                FROM books b
                LEFT JOIN book_copies bc ON b.id = bc.book_id
            ),
            member_stats AS (
                -- Library member statistics
                SELECT 
                    COUNT(*) as total_members,
                    COUNT(CASE WHEN membership_status = 'active' THEN 1 END) as active_members
                FROM library_members
            ),
            loan_stats AS (
                -- Current loan statistics
                SELECT 
                    COUNT(*) as total_active_loans,
                    COUNT(CASE WHEN due_date < CURRENT_DATE THEN 1 END) as overdue_loans
                FROM book_loans
                WHERE status = 'active'
            ),
            fine_stats AS (
                -- Fine statistics
                SELECT 
                    COALESCE(SUM(amount), 0) as pending_fines
                FROM library_fines
                WHERE status = 'pending'
            ),
            today_stats AS (
                -- Today's activity
                SELECT 
                    COUNT(CASE WHEN DATE(loan_date) = CURRENT_DATE THEN 1 END) as todays_checkouts,
                    COUNT(CASE WHEN DATE(return_date) = CURRENT_DATE THEN 1 END) as todays_returns
                FROM book_loans
            )
            SELECT 
                ls.total_books,
                ls.available_copies as available_books,
                ls.checked_out_copies as checked_out_books,
                ms.total_members,
                ms.active_members,
                lns.total_active_loans as total_loans,
                lns.overdue_loans,
                fs.pending_fines,
                ts.todays_checkouts,
                ts.todays_returns
            FROM library_stats ls
            CROSS JOIN member_stats ms
            CROSS JOIN loan_stats lns
            CROSS JOIN fine_stats fs
            CROSS JOIN today_stats ts
        `;

        const result = await pool.query(statsQuery);

        if (result.rows.length === 0) {
            return NextResponse.json({
                success: true,
                stats: {
                    total_books: 0,
                    available_books: 0,
                    checked_out_books: 0,
                    total_members: 0,
                    active_members: 0,
                    total_loans: 0,
                    overdue_loans: 0,
                    pending_fines: 0,
                    todays_checkouts: 0,
                    todays_returns: 0,
                },
            });
        }

        const stats = result.rows[0];

        // Convert string numbers to proper types
        const formattedStats = {
            total_books: parseInt(stats.total_books) || 0,
            available_books: parseInt(stats.available_books) || 0,
            checked_out_books: parseInt(stats.checked_out_books) || 0,
            total_members: parseInt(stats.total_members) || 0,
            active_members: parseInt(stats.active_members) || 0,
            total_loans: parseInt(stats.total_loans) || 0,
            overdue_loans: parseInt(stats.overdue_loans) || 0,
            pending_fines: parseFloat(stats.pending_fines) || 0,
            todays_checkouts: parseInt(stats.todays_checkouts) || 0,
            todays_returns: parseInt(stats.todays_returns) || 0,
        };

        return NextResponse.json({
            success: true,
            stats: formattedStats,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Library stats error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch library statistics",
            },
            { status: 500 }
        );
    }
}
