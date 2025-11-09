import { NextRequest, NextResponse } from "next/server";
import { createBookRFIDTag } from "@/lib/libraryQueries";

interface WriteCompleteRequest {
    bookCopy: {
        id: string;
        barcode: string;
        book_id: string;
        book_title?: string;
        book_author?: string;
    };
    rfid: {
        uid: string;
        write_timestamp: number;
    };
    notes?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: WriteCompleteRequest = await request.json();
        console.log("📝 Processing book RFID write-complete request:", body);

        // Validate required fields
        if (!body.bookCopy?.id || !body.bookCopy?.barcode || !body.rfid?.uid) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Missing required fields: bookCopy.id, bookCopy.barcode, or rfid.uid",
                },
                { status: 400 }
            );
        }

        console.log("💾 Inserting book RFID tag into database");

        // Insert RFID tag details into database
        const result = await createBookRFIDTag(
            body.rfid.uid,
            body.bookCopy.id,
            body.notes || `Book copy tagged: ${body.bookCopy.barcode}`
        );

        console.log("✅ Book RFID tag inserted successfully:", result);

        return NextResponse.json({
            success: true,
            message: "Book RFID tag saved to database successfully",
            data: {
                rfid_tag_id: result.id,
                rfid_uid: body.rfid.uid,
                book_copy_id: body.bookCopy.id,
                barcode: body.bookCopy.barcode,
                book_title: body.bookCopy.book_title,
                book_author: body.bookCopy.book_author,
                assigned_at: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error("❌ Database insertion error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to save book RFID tag to database",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
