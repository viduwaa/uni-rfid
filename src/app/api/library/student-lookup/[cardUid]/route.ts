import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ cardUid: string }> }
) {
    try {
        const params = await context.params;
        const { cardUid } = await params;

        if (!cardUid) {
            return NextResponse.json(
                { success: false, message: "Card UID is required" },
                { status: 400 }
            );
        }

        // Query to get student and library membership information
        const query = `
            SELECT 
                s.user_id,
                s.register_number,
                s.full_name,
                s.email,
                s.faculty,
                s.year_of_study,
                r.card_uid,
                r.balance,
                r.status as card_status,
                lm.id as membership_id,
                lm.membership_status,
                lm.max_books_allowed,
                lm.membership_date,
                lm.notes,
                -- Current loans count
                COALESCE(
                    (SELECT COUNT(*) 
                     FROM book_loans bl 
                     WHERE bl.student_id = s.user_id 
                     AND bl.status = 'active'), 0
                ) as current_loans,
                -- Overdue loans count
                COALESCE(
                    (SELECT COUNT(*) 
                     FROM book_loans bl 
                     WHERE bl.student_id = s.user_id 
                     AND bl.status = 'active'
                     AND bl.due_date < CURRENT_DATE), 0
                ) as overdue_loans,
                -- Pending fines total
                COALESCE(
                    (SELECT SUM(amount) 
                     FROM library_fines lf 
                     WHERE lf.student_id = s.user_id 
                     AND lf.status = 'pending'), 0
                ) as pending_fines
            FROM rfid_cards r
            JOIN students s ON r.assigned_student = s.user_id
            LEFT JOIN library_members lm ON s.user_id = lm.student_id
            WHERE r.card_uid = $1 
            AND r.status = 'ACTIVE'
        `;

        const result = await pool.query(query, [cardUid]);

        if (result.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Student not found or card not active",
                },
                { status: 404 }
            );
        }

        const studentData = result.rows[0];

        // Check if student has library membership
        if (!studentData.membership_id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Student is not a library member",
                },
                { status: 403 }
            );
        }

        // Format the response data
        const responseData = {
            user_id: studentData.user_id,
            register_number: studentData.register_number,
            full_name: studentData.full_name,
            email: studentData.email,
            faculty: studentData.faculty,
            year_of_study: studentData.year_of_study,
            card_uid: studentData.card_uid,
            balance: parseFloat(studentData.balance),
            card_status: studentData.card_status,
            membership_id: studentData.membership_id,
            membership_status: studentData.membership_status,
            max_books_allowed: studentData.max_books_allowed,
            membership_date: studentData.membership_date,
            current_loans: parseInt(studentData.current_loans),
            overdue_loans: parseInt(studentData.overdue_loans),
            pending_fines: parseFloat(studentData.pending_fines),
            notes: studentData.notes,
            // Additional computed fields
            can_checkout:
                studentData.membership_status === "active" &&
                parseInt(studentData.overdue_loans) === 0 &&
                parseInt(studentData.current_loans) <
                    studentData.max_books_allowed,
            checkout_restrictions: [] as string[],
        };

        // Add checkout restrictions if any
        if (studentData.membership_status !== "active") {
            responseData.checkout_restrictions.push(
                `Membership is ${studentData.membership_status}`
            );
        }

        if (parseInt(studentData.overdue_loans) > 0) {
            responseData.checkout_restrictions.push(
                `${studentData.overdue_loans} overdue book(s)`
            );
        }

        if (
            parseInt(studentData.current_loans) >= studentData.max_books_allowed
        ) {
            responseData.checkout_restrictions.push(
                `Maximum books limit reached (${studentData.max_books_allowed})`
            );
        }

        if (parseFloat(studentData.pending_fines) > 0) {
            responseData.checkout_restrictions.push(
                `Pending fines: Rs. ${parseFloat(studentData.pending_fines).toFixed(2)}`
            );
        }

        return NextResponse.json({
            success: true,
            data: responseData,
            message: "Student information retrieved successfully",
        });
    } catch (error) {
        console.error("Student lookup error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error during student lookup",
            },
            { status: 500 }
        );
    }
}
