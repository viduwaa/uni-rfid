import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateMemberStatus } from "@/lib/libraryQueries";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as SessionUser;

    // Check if user has permission to update member status
    if (!["admin", "librarian"].includes(user.role.toLowerCase())) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { status, max_books_allowed, notes } = await request.json();

    if (!status || max_books_allowed === undefined) {
      return NextResponse.json(
        { error: "Status and max_books_allowed are required" },
        { status: 400 }
      );
    }

    if (max_books_allowed < 0) {
      return NextResponse.json(
        { error: "Max books allowed must be non-negative" },
        { status: 400 }
      );
    }

    const member = await updateMemberStatus(
      params.id,
      status,
      max_books_allowed,
      notes
    );
    return NextResponse.json({ member, success: true });
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    );
  }
}
