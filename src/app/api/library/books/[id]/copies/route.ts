import { NextRequest, NextResponse } from "next/server";
import { getBookCopiesByBookId } from "@/lib/libraryQueries";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        // TODO: Re-enable authentication in production
        // const session = await getServerSession(authOptions);
        // if (!session || !session.user) {
        //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        // }

        const { searchParams } = new URL(request.url);
        const availableOnly = searchParams.get("available_only") === "true";

        let copies = await getBookCopiesByBookId(params.id);

        // Filter for available copies if requested
        if (availableOnly) {
            copies = copies.filter((copy) => copy.is_available);
        }

        return NextResponse.json({ copies, success: true });
    } catch (error) {
        console.error("Error fetching book copies:", error);
        return NextResponse.json(
            { error: "Failed to fetch book copies" },
            { status: 500 }
        );
    }
}
