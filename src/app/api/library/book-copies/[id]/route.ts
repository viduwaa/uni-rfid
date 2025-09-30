import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateBookCopyCondition } from "@/lib/libraryQueries";
import type { BookCondition } from "@/types/library";

interface SessionUser {
    id: string;
    email: string;
    name: string;
    role: string;
}

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = session.user as SessionUser;

        // Check if user has permission to update book copies
        if (!["admin", "librarian"].includes(user.role.toLowerCase())) {
            return NextResponse.json(
                { error: "Insufficient permissions" },
                { status: 403 }
            );
        }

        const { condition, notes } = await request.json();

        if (!condition) {
            return NextResponse.json(
                { error: "Condition is required" },
                { status: 400 }
            );
        }

        const validConditions: BookCondition[] = [
            "New",
            "Good",
            "Fair",
            "Poor",
            "Damaged",
            "Lost",
        ];
        if (!validConditions.includes(condition)) {
            return NextResponse.json(
                {
                    error: `Invalid condition. Must be one of: ${validConditions.join(", ")}`,
                },
                { status: 400 }
            );
        }

        const bookCopy = await updateBookCopyCondition(
            params.id,
            condition,
            notes
        );
        return NextResponse.json({ bookCopy, success: true });
    } catch (error) {
        console.error("Error updating book copy:", error);
        return NextResponse.json(
            { error: "Failed to update book copy" },
            { status: 500 }
        );
    }
}
