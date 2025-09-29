import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
    getActiveLoans,
    checkoutBook,
    getStudentLoans,
    getLoansByBarcode,
} from "@/lib/libraryQueries";
import type { CheckoutRequest } from "@/types/library";

interface SessionUser {
    id: string;
    email: string;
    name: string;
    role: string;
}

export async function GET(request: NextRequest) {
    try {
        // TODO: Re-enable authentication in production
        // const session = await getServerSession(authOptions);
        // if (!session || !session.user) {
        //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        // }

        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get("student_id");
        const status = searchParams.get("status");
        const barcode = searchParams.get("barcode");

        if (studentId) {
            const loans = await getStudentLoans(studentId, status);
            return NextResponse.json({ loans, success: true });
        }

        if (barcode) {
            const loans = await getLoansByBarcode(barcode, status);
            return NextResponse.json({ loans, success: true });
        }

        // Get all active loans
        const loans = await getActiveLoans();
        return NextResponse.json({ loans, success: true });
    } catch (error) {
        console.error("Error fetching loans:", error);
        return NextResponse.json(
            { error: "Failed to fetch loans" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // TODO: Re-enable authentication in production
        // const session = await getServerSession(authOptions);
        // if (!session || !session.user) {
        //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        // }

        // const user = session.user as SessionUser;

        // // Check if user has permission to issue books
        // if (!["admin", "librarian"].includes(user.role.toLowerCase())) {
        //   return NextResponse.json(
        //     { error: "Insufficient permissions" },
        //     { status: 403 }
        //   );
        // }

        const body: CheckoutRequest = await request.json();

        // Validate required fields
        if (!body.student_id || !body.book_copy_id || !body.due_date) {
            return NextResponse.json(
                {
                    error: "Student ID, book copy ID, and due date are required",
                },
                { status: 400 }
            );
        }

        // Use default user ID since authentication is disabled
        const defaultUserId = "00000000-0000-0000-0000-000000000000";
        const loan = await checkoutBook(body, defaultUserId);
        return NextResponse.json({ loan, success: true }, { status: 201 });
    } catch (error) {
        console.error("Error creating loan:", error);
        if (error instanceof Error && error.message.includes("not available")) {
            return NextResponse.json(
                { error: "Book copy is not available for checkout" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Failed to checkout book" },
            { status: 500 }
        );
    }
}
