import { NextRequest, NextResponse } from "next/server";
import {
    getLibraryFinancialReport,
    getLibraryFinancialSummary,
} from "@/lib/reportQueries";
import { ReportFilters } from "@/types/reports";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Parse filters from query parameters
        const filters: ReportFilters = {};

        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        if (startDate && endDate) {
            filters.dateRange = { startDate, endDate };
        }

        const faculty = searchParams.get("faculty");
        if (faculty) filters.faculty = faculty;

        const studentId = searchParams.get("studentId");
        if (studentId) filters.studentId = studentId;

        const includeDetails = searchParams.get("includeDetails") === "true";

        // Fetch summary data
        const summary = await getLibraryFinancialSummary(filters);

        // Optionally fetch detailed data
        let details = null;
        if (includeDetails) {
            details = await getLibraryFinancialReport(filters);
        }

        return NextResponse.json({
            success: true,
            data: {
                summary,
                details,
            },
            filters,
            generated_at: new Date().toISOString(),
            total_records: details ? details.length : 0,
        });
    } catch (error: any) {
        console.error("Error generating library financial report:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to generate library financial report",
                message: error.message,
            },
            { status: 500 }
        );
    }
}
