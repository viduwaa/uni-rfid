"use client";

import { useState } from "react";
import { FilterPanel, ReportSummaryCard, DataTable } from "./ReportComponents";
import {
    ReportFilters,
    LibraryFinancialSummary,
    LibraryFinancialRow,
} from "@/types/reports";
import { DollarSign, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import {
    convertToCSV,
    downloadCSV,
    generateReportFilename,
    reportFormatters,
} from "@/lib/csvUtils";

export default function LibraryFinancialReport() {
    const [filters, setFilters] = useState<ReportFilters>({});
    const [summary, setSummary] = useState<LibraryFinancialSummary | null>(
        null
    );
    const [details, setDetails] = useState<LibraryFinancialRow[]>([]);
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
                `/api/admin/reports/library-financial?${queryParams}`
            );
            const result = await response.json();

            if (result.success) {
                setSummary(result.data.summary);
                setDetails(result.data.details || []);
            }
        } catch (error) {
            console.error("Error generating library financial report:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportCSV = () => {
        const formattedData = reportFormatters.libraryFinancial(details);
        const csv = convertToCSV(formattedData);
        const filename = generateReportFilename("library_fines", {
            startDate: filters.dateRange?.startDate,
            endDate: filters.dateRange?.endDate,
            faculty: filters.faculty,
        });
        downloadCSV(csv, filename);
    };

    const columns = [
        { key: "register_number", label: "Register No" },
        { key: "full_name", label: "Student Name" },
        { key: "faculty", label: "Faculty" },
        { key: "amount", label: "Amount" },
        { key: "reason", label: "Reason" },
        { key: "status", label: "Status" },
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
                        title="Total Fines Generated"
                        value={`$${summary.total_fines_generated.toFixed(2)}`}
                        icon={<DollarSign className="h-4 w-4 text-red-600" />}
                    />
                    <ReportSummaryCard
                        title="Fines Collected"
                        value={`$${summary.total_fines_collected.toFixed(2)}`}
                        icon={
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        }
                    />
                    <ReportSummaryCard
                        title="Pending Fines"
                        value={`$${summary.pending_fines.toFixed(2)}`}
                        icon={
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                        }
                    />
                    <ReportSummaryCard
                        title="Waived Fines"
                        value={`$${summary.waived_fines.toFixed(2)}`}
                        icon={<XCircle className="h-4 w-4 text-gray-600" />}
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
