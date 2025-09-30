import { NextRequest, NextResponse } from "next/server";
import {
    getCirculationReport,
    getFinancialReport,
    getInventoryReport,
    getPopularBooksReport,
} from "@/lib/libraryQueries";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        // TODO: Re-enable authentication in production
        // const session = await getServerSession(authOptions);

        // if (
        //   !session?.user ||
        //   !["admin", "librarian"].includes((session.user as any).role)
        // ) {
        //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        // }

        const searchParams = request.nextUrl.searchParams;
        const period = parseInt(searchParams.get("period") || "30");
        const reportType = searchParams.get("type") || "circulation";
        const format = searchParams.get("format") || "csv";

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

        let csvContent = "";
        let filename = `library-${reportType}-report.csv`;

        switch (reportType) {
            case "circulation":
                const circReport = await getCirculationReport(
                    startDate,
                    endDate
                );
                csvContent = generateCirculationCSV(circReport);
                break;

            case "financial":
                const finReport = await getFinancialReport(startDate, endDate);
                csvContent = generateFinancialCSV(finReport);
                break;

            case "inventory":
                const invReport = await getInventoryReport();
                csvContent = generateInventoryCSV(invReport);
                break;

            case "popular":
                const popReport = await getPopularBooksReport(
                    startDate,
                    endDate,
                    50
                );
                csvContent = generatePopularBooksCSV(popReport);
                break;

            default:
                return NextResponse.json(
                    { error: "Invalid report type" },
                    { status: 400 }
                );
        }

        const response = new NextResponse(csvContent, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });

        return response;
    } catch (error) {
        console.error("Export error:", error);
        return NextResponse.json(
            { error: "Failed to export report" },
            { status: 500 }
        );
    }
}

function generateCirculationCSV(report: any): string {
    const header = "Metric,Value\n";
    const rows = [
        `Total Loans,${report.total_loans || 0}`,
        `Active Loans,${report.active_loans || 0}`,
        `Returned Loans,${report.returned_loans || 0}`,
        `Overdue Loans,${report.overdue_loans || 0}`,
        `Period,${report.period || "N/A"}`,
    ];

    return header + rows.join("\n");
}

function generateFinancialCSV(report: any): string {
    const header = "Metric,Value\n";
    const rows = [
        `Total Fines,${report.total_fines || 0}`,
        `Paid Fines,${report.paid_fines || 0}`,
        `Pending Fines,${report.pending_fines || 0}`,
        `Waived Fines,${report.waived_fines || 0}`,
        `Period,${report.period || "N/A"}`,
    ];

    return header + rows.join("\n");
}

function generateInventoryCSV(report: any): string {
    const header = "Metric,Value\n";
    const rows = [
        `Total Books,${report.total_books || 0}`,
        `Total Copies,${report.total_copies || 0}`,
        `Available Copies,${report.available_copies || 0}`,
        `Checked Out Copies,${report.checked_out_copies || 0}`,
    ];

    // Add category breakdown
    if (report.category_breakdown) {
        rows.push("\nCategory,Book Count,Copy Count");
        report.category_breakdown.forEach((cat: any) => {
            rows.push(`${cat.category},${cat.book_count},${cat.copy_count}`);
        });
    }

    return header + rows.join("\n");
}

function generatePopularBooksCSV(report: { books: any[] }): string {
    const header = "Title,Author,Loan Count\n";
    const rows = report.books.map(
        (book) =>
            `"${book.title.replace(/"/g, '""')}","${book.author.replace(/"/g, '""')}",${book.loan_count}`
    );

    return header + rows.join("\n");
}
