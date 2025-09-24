import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { returnBook, renewLoan } from "@/lib/libraryQueries";
import type { ReturnRequest } from "@/types/library";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as SessionUser;

    // Check if user has permission to process returns
    if (!["admin", "librarian"].includes(user.role.toLowerCase())) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { action, ...body } = await request.json();

    if (action === "return") {
      const returnData: ReturnRequest = body;

      // Validate required fields
      if (!returnData.return_condition) {
        return NextResponse.json(
          { error: "Return condition is required" },
          { status: 400 }
        );
      }

      returnData.loan_id = params.id;
      const loan = await returnBook(returnData, user.id);
      return NextResponse.json({ loan, success: true });
    } else if (action === "renew") {
      const { new_due_date } = body;

      if (!new_due_date) {
        return NextResponse.json(
          { error: "New due date is required" },
          { status: 400 }
        );
      }

      const loan = await renewLoan(params.id, new_due_date);
      return NextResponse.json({ loan, success: true });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "return" or "renew"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error processing loan action:", error);
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Active loan not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to process loan action" },
      { status: 500 }
    );
  }
}
