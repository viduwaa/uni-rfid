import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getLibraryStats,
  getCirculationReport,
  getFinancialReport,
  getInventoryReport,
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

    const user = session.user as SessionUser;

    // Check if user has permission to view reports
    if (!["admin", "librarian"].includes(user.role.toLowerCase())) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    switch (reportType) {
      case "stats":
        const stats = await getLibraryStats();
        return NextResponse.json({ stats, success: true });

      case "circulation":
        if (!startDate || !endDate) {
          return NextResponse.json(
            {
              error:
                "Start date and end date are required for circulation report",
            },
            { status: 400 }
          );
        }
        const circulationReport = await getCirculationReport(
          startDate,
          endDate
        );
        return NextResponse.json({ report: circulationReport, success: true });

      case "financial":
        if (!startDate || !endDate) {
          return NextResponse.json(
            {
              error:
                "Start date and end date are required for financial report",
            },
            { status: 400 }
          );
        }
        const financialReport = await getFinancialReport(startDate, endDate);
        return NextResponse.json({ report: financialReport, success: true });

      case "inventory":
        const inventoryReport = await getInventoryReport();
        return NextResponse.json({ report: inventoryReport, success: true });

      default:
        return NextResponse.json(
          {
            error:
              "Invalid report type. Use: stats, circulation, financial, or inventory",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
