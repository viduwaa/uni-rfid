import { NextRequest, NextResponse } from "next/server";
import { getAllBooks, searchBooks, addBook } from "@/lib/libraryQueries";
import type { AddBookRequest, SearchBooksQuery } from "@/types/library";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");
        const category = searchParams.get("category");
        const author = searchParams.get("author");
        const availableOnly = searchParams.get("available_only") === "true";
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");

        // If any search parameters are provided, use search function
        if (search || category || author || availableOnly) {
            const searchQuery: SearchBooksQuery = {
                search: search || undefined,
                category: category || undefined,
                author: author || undefined,
                available_only: availableOnly,
                limit,
                offset,
            };
            const books = await searchBooks(searchQuery);
            return NextResponse.json({ books, success: true });
        }

        // Otherwise, get all books
        const books = await getAllBooks();
        return NextResponse.json({ books, success: true });
    } catch (error) {
        console.error("Error fetching books:", error);
        return NextResponse.json(
            { error: "Failed to fetch books" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: AddBookRequest = await request.json();

        // Validate required fields
        if (!body.title || !body.author || !body.copies || body.copies < 1) {
            return NextResponse.json(
                { error: "Title, author, and copies (min 1) are required" },
                { status: 400 }
            );
        }

        // Use a default user ID for now (can be updated with proper auth later)
        const book = await addBook(body, "system-user");
        return NextResponse.json({ book, success: true }, { status: 201 });
    } catch (error) {
        console.error("Error adding book:", error);
        return NextResponse.json(
            { error: "Failed to add book" },
            { status: 500 }
        );
    }
}
