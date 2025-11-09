import { NextRequest, NextResponse } from "next/server";
import { getSystemUsageReport } from "@/lib/reportQueries";
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

        // Fetch system usage data
        const data = await getSystemUsageReport(filters);

        return NextResponse.json({
            success: true,
            data,
            filters,
            generated_at: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error("Error generating system usage report:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to generate system usage report",
                message: error.message,
            },
            { status: 500 }
        );
    }
}
