import { NextRequest, NextResponse } from "next/server";
import { getDailySummary } from "@/lib/canteenQueries";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date') || undefined;

        const summary = await getDailySummary(date);

        if (!summary.success) {
            return NextResponse.json(summary, { status: 404 });
        }

        return NextResponse.json(summary);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to fetch daily summary",
            error: (error as Error).message,
        }, { status: 500 });
    }
}