import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllBooks, searchBooks, addBook } from "@/lib/libraryQueries";
import type { AddBookRequest, SearchBooksQuery } from "@/types/library";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as SessionUser;

    // Check if user has permission to add books
    if (!["admin", "librarian"].includes(user.role.toLowerCase())) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body: AddBookRequest = await request.json();

    // Validate required fields
    if (!body.title || !body.author || !body.copies || body.copies < 1) {
      return NextResponse.json(
        { error: "Title, author, and copies (min 1) are required" },
        { status: 400 }
      );
    }

    const book = await addBook(body, user.id);
    return NextResponse.json({ book, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error adding book:", error);
    return NextResponse.json({ error: "Failed to add book" }, { status: 500 });
  }
}
