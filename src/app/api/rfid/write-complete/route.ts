import { NextRequest, NextResponse } from "next/server";
import { insertCardDetails } from "@/lib/adminQueries";
import { BaseStudent } from "@/types/student";

interface WriteCompleteRequest {
    student: {
        user_id: string;
        register_number: string;
        full_name: string;
        faculty: string;
        nic_no?: string;
    };
    card: {
        uid: string;
        write_timestamp: number;
    };
    initial_balance?: number;
}

export async function POST(request: NextRequest) {
    try {
        const body: WriteCompleteRequest = await request.json();
        console.log("📝 Processing write-complete request:", body);

        // Validate required fields
        if (!body.student?.user_id || !body.student?.register_number || !body.card?.uid) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Missing required fields: student.user_id, student.register_number, or card.uid",
                },
                { status: 400 }
            );
        }

        // Prepare card data for database insertion
        const cardData:BaseStudent = {
            user_id: body.student.user_id,
            card_id: body.card.uid,
            credits: body.initial_balance || 0,
        };

        console.log("💾 Inserting card data into database:", cardData);

        // Insert card details into database
        const result = await insertCardDetails(cardData);
        
        console.log("✅ Card details inserted successfully:", result);

        return NextResponse.json({
            success: true,
            message: "Card data saved to database successfully",
            data: {
                card_uid: body.card.uid,
                student_name: body.student.full_name,
                register_number: body.student.register_number,
                inserted_at: new Date().toISOString(),
                database_id: result?.id || null
            }
        });

    } catch (error) {
        console.error("❌ Database insertion error:", error);
        
        return NextResponse.json(
            {
                success: false,
                message: "Failed to save card data to database",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}