import { NextRequest, NextResponse } from "next/server";
import { getBookCopyByRFID } from "@/lib/libraryQueries";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const rfidUID = searchParams.get("rfid_uid") || searchParams.get("uid");

        if (!rfidUID) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Missing rfid_uid or uid parameter",
                },
                { status: 400 }
            );
        }

        console.log("🔍 Looking up book copy by RFID UID:", rfidUID);

        // Fetch book copy data by RFID
        const bookCopy = await getBookCopyByRFID(rfidUID);

        if (!bookCopy) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Book copy not found for this RFID tag",
                    data: null,
                },
                { status: 404 }
            );
        }

        // Format the response data
        const responseData = {
            id: bookCopy.id, // book_copy_id
            book_id: bookCopy.book_id,
            rfid_uid: bookCopy.rfid_uid,
            barcode: bookCopy.barcode,
            book_title: bookCopy.book_title,
            book_author: bookCopy.book_author,
            book_isbn: bookCopy.book_isbn,
            category: bookCopy.category,
            is_available: bookCopy.is_available,
            condition: bookCopy.condition,
            has_rfid_tag: bookCopy.has_rfid_tag,
            rfid_status: bookCopy.rfid_status,
            current_loan: bookCopy.current_loan_id
                ? {
                      loan_id: bookCopy.current_loan_id,
                      student_id: bookCopy.current_borrower_id,
                      student_name: bookCopy.current_borrower_name,
                      due_date: bookCopy.current_due_date,
                      borrowed_at: bookCopy.current_borrowed_at,
                  }
                : null,
        };

        console.log("✅ Book copy found:", responseData);

        return NextResponse.json({
            success: true,
            message: "Book copy found",
            data: responseData,
        });
    } catch (error) {
        console.error("❌ Error fetching book copy:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch book copy data",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
