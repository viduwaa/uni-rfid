import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getBookCopiesByBookId,
  getBookCopyByBarcode,
} from "@/lib/libraryQueries";

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
    const bookId = searchParams.get("book_id");
    const barcode = searchParams.get("barcode");

    if (barcode) {
      const bookCopy = await getBookCopyByBarcode(barcode);
      if (!bookCopy) {
        return NextResponse.json(
          { error: "Book copy not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ bookCopy, success: true });
    }

    if (bookId) {
      const bookCopies = await getBookCopiesByBookId(bookId);
      return NextResponse.json({ bookCopies, success: true });
    }

    return NextResponse.json(
      { error: "Either book_id or barcode is required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching book copies:", error);
    return NextResponse.json(
      { error: "Failed to fetch book copies" },
      { status: 500 }
    );
  }
}
