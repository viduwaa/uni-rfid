import { NextRequest, NextResponse } from "next/server";
import {
    getCourseAnalyticsReport,
    getCourseAnalyticsSummary,
} from "@/lib/reportQueries";
import { ReportFilters } from "@/types/reports";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Parse filters from query parameters
        const filters: ReportFilters = {};

        const faculty = searchParams.get("faculty");
        if (faculty) filters.faculty = faculty;

        const year = searchParams.get("year");
        if (year) filters.year = parseInt(year);

        const courseId = searchParams.get("courseId");
        if (courseId) filters.courseId = courseId;

        const includeDetails = searchParams.get("includeDetails") === "true";

        // Fetch summary data
        const summary = await getCourseAnalyticsSummary(filters);

        // Optionally fetch detailed data
        let details = null;
        if (includeDetails) {
            details = await getCourseAnalyticsReport(filters);
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
        console.error("Error generating course analytics report:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to generate course analytics report",
                message: error.message,
            },
            { status: 500 }
        );
    }
}
