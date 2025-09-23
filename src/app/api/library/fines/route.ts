import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getPendingFines,
  getStudentFines,
  createFine,
} from "@/lib/libraryQueries";
import type { FineRequest } from "@/types/library";

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
    const studentId = searchParams.get("student_id");
    const pending = searchParams.get("pending") === "true";

    if (studentId) {
      const fines = await getStudentFines(studentId);
      return NextResponse.json({ fines, success: true });
    }

    if (pending) {
      const fines = await getPendingFines();
      return NextResponse.json({ fines, success: true });
    }

    return NextResponse.json({ fines: [], success: true });
  } catch (error) {
    console.error("Error fetching fines:", error);
    return NextResponse.json(
      { error: "Failed to fetch fines" },
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

    // Check if user has permission to create fines
    if (!["admin", "librarian"].includes(user.role.toLowerCase())) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body: FineRequest = await request.json();

    // Validate required fields
    if (!body.student_id || !body.amount || !body.reason) {
      return NextResponse.json(
        { error: "Student ID, amount, and reason are required" },
        { status: 400 }
      );
    }

    if (body.amount <= 0) {
      return NextResponse.json(
        { error: "Fine amount must be greater than 0" },
        { status: 400 }
      );
    }

    const fine = await createFine(body);
    return NextResponse.json({ fine, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating fine:", error);
    return NextResponse.json(
      { error: "Failed to create fine" },
      { status: 500 }
    );
  }
}
