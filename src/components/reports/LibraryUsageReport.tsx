"use client";

import { useState } from "react";
import { FilterPanel, ReportSummaryCard, DataTable } from "./ReportComponents";
import {
    ReportFilters,
    LibraryUsageSummary,
    LibraryUsageRow,
} from "@/types/reports";
import { BookOpen, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import {
    convertToCSV,
    downloadCSV,
    generateReportFilename,
    reportFormatters,
} from "@/lib/csvUtils";

export default function LibraryUsageReport() {
    const [filters, setFilters] = useState<ReportFilters>({});
    const [summary, setSummary] = useState<LibraryUsageSummary | null>(null);
    const [details, setDetails] = useState<LibraryUsageRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const generateReport = async () => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (filters.dateRange?.startDate)
                queryParams.append("startDate", filters.dateRange.startDate);
            if (filters.dateRange?.endDate)
                queryParams.append("endDate", filters.dateRange.endDate);
            if (filters.faculty) queryParams.append("faculty", filters.faculty);
            queryParams.append("includeDetails", "true");

            const response = await fetch(
                `/api/admin/reports/library-usage?${queryParams}`
            );
            const result = await response.json();

            if (result.success) {
                setSummary(result.data.summary);
                setDetails(result.data.details || []);
            }
        } catch (error) {
            console.error("Error generating library usage report:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportCSV = () => {
        const formattedData = reportFormatters.libraryUsage(details);
        const csv = convertToCSV(formattedData);
        const filename = generateReportFilename("library_usage", {
            startDate: filters.dateRange?.startDate,
            endDate: filters.dateRange?.endDate,
            faculty: filters.faculty,
        });
        downloadCSV(csv, filename);
    };

    const columns = [
        { key: "register_number", label: "Register No" },
        { key: "full_name", label: "Student Name" },
        { key: "book_title", label: "Book Title" },
        { key: "author", label: "Author" },
        { key: "borrowed_at", label: "Borrowed" },
        { key: "due_date", label: "Due Date" },
        { key: "status", label: "Status" },
        { key: "days_overdue", label: "Days Overdue" },
    ];

    return (
        <div className="space-y-6">
            <FilterPanel
                onFilterChange={setFilters}
                onGenerate={generateReport}
                isLoading={isLoading}
                showDateRange={true}
                showFaculty={true}
            />

            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ReportSummaryCard
                        title="Total Loans"
                        value={summary.total_loans}
                        icon={<BookOpen className="h-4 w-4 text-blue-600" />}
                    />
                    <ReportSummaryCard
                        title="Active Loans"
                        value={summary.active_loans}
                        icon={<Clock className="h-4 w-4 text-green-600" />}
                    />
                    <ReportSummaryCard
                        title="Overdue Loans"
                        value={summary.overdue_loans}
                        icon={
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                        }
                    />
                    <ReportSummaryCard
                        title="Returns"
                        value={summary.total_returns}
                        icon={
                            <CheckCircle className="h-4 w-4 text-purple-600" />
                        }
                    />
                </div>
            )}

            <DataTable
                columns={columns}
                data={details}
                onExportCSV={handleExportCSV}
                isLoading={isLoading}
            />
        </div>
    );
}
