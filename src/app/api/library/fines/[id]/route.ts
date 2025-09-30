import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { payFine, waiveFine } from "@/lib/libraryQueries";

interface SessionUser {
    id: string;
    email: string;
    name: string;
    role: string;
}

export async function POST(
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

        // Check if user has permission to manage fines
        if (!["admin", "librarian"].includes(user.role.toLowerCase())) {
            return NextResponse.json(
                { error: "Insufficient permissions" },
                { status: 403 }
            );
        }

        const { action, notes } = await request.json();

        if (action === "pay") {
            const fine = await payFine(params.id, user.id, notes);
            return NextResponse.json({ fine, success: true });
        } else if (action === "waive") {
            const fine = await waiveFine(params.id, user.id, notes);
            return NextResponse.json({ fine, success: true });
        } else {
            return NextResponse.json(
                { error: 'Invalid action. Use "pay" or "waive"' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Error processing fine:", error);
        if (error instanceof Error && error.message.includes("not found")) {
            return NextResponse.json(
                { error: "Pending fine not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { error: "Failed to process fine" },
            { status: 500 }
        );
    }
}
