import { NextRequest, NextResponse } from "next/server";
import { getInventoryReport } from "@/lib/libraryQueries";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        // TODO: Re-enable authentication in production
        // const session = await getServerSession(authOptions);
        // if (
        //   !session ||
        //   !session.user ||
        //   !['admin', 'librarian'].includes((session.user as any).role?.toLowerCase())
        // ) {
        //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        const report = await getInventoryReport();

        return NextResponse.json(report);
    } catch (error) {
        console.error("Inventory report error:", error);
        return NextResponse.json(
            { error: "Failed to generate inventory report" },
            { status: 500 }
        );
    }
}
