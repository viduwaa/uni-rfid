import { NextRequest, NextResponse } from "next/server";
import { getCirculationReport } from "@/lib/libraryQueries";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user ||
      !["admin", "librarian"].includes((session.user as any).role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = parseInt(searchParams.get("period") || "30");

    if (period <= 0 || period > 365) {
      return NextResponse.json(
        { error: "Period must be between 1 and 365 days" },
        { status: 400 }
      );
    }

    // Calculate start and end dates based on period
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const report = await getCirculationReport(startDate, endDate);

    return NextResponse.json(report);
  } catch (error) {
    console.error("Circulation report error:", error);
    return NextResponse.json(
      { error: "Failed to generate circulation report" },
      { status: 500 }
    );
  }
}
