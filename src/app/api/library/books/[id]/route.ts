import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBookById, updateBook, deleteBook } from "@/lib/libraryQueries";

interface SessionUser {
    id: string;
    email: string;
    name: string;
    role: string;
}

export async function GET(
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

        const book = await getBookById(params.id);
        if (!book) {
            return NextResponse.json(
                { error: "Book not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ book, success: true });
    } catch (error) {
        console.error("Error fetching book:", error);
        return NextResponse.json(
            { error: "Failed to fetch book" },
            { status: 500 }
        );
    }
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

        // Check if user has permission to update books
        if (!["admin", "librarian"].includes(user.role.toLowerCase())) {
            return NextResponse.json(
                { error: "Insufficient permissions" },
                { status: 403 }
            );
        }

        const updates = await request.json();
        const book = await updateBook(params.id, updates);

        return NextResponse.json({ book, success: true });
    } catch (error) {
        console.error("Error updating book:", error);
        return NextResponse.json(
            { error: "Failed to update book" },
            { status: 500 }
        );
    }
}

export async function DELETE(
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

        // Check if user has permission to delete books
        if (!["admin", "librarian"].includes(user.role.toLowerCase())) {
            return NextResponse.json(
                { error: "Insufficient permissions" },
                { status: 403 }
            );
        }

        const success = await deleteBook(params.id);
        if (!success) {
            return NextResponse.json(
                { error: "Book not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting book:", error);
        if (error instanceof Error && error.message.includes("active loans")) {
            return NextResponse.json(
                { error: "Cannot delete book with active loans" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Failed to delete book" },
            { status: 500 }
        );
    }
}
