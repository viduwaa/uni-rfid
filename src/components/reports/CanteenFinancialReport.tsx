"use client";

import { useState } from "react";
import { FilterPanel, ReportSummaryCard, DataTable } from "./ReportComponents";
import {
    ReportFilters,
    CanteenFinancialSummary,
    CanteenFinancialRow,
} from "@/types/reports";
import { DollarSign, ShoppingCart, TrendingUp, Package } from "lucide-react";
import {
    convertToCSV,
    downloadCSV,
    generateReportFilename,
    reportFormatters,
} from "@/lib/csvUtils";

export default function CanteenFinancialReport() {
    const [filters, setFilters] = useState<ReportFilters>({});
    const [summary, setSummary] = useState<CanteenFinancialSummary | null>(
        null
    );
    const [details, setDetails] = useState<CanteenFinancialRow[]>([]);
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
                `/api/admin/reports/canteen-financial?${queryParams}`
            );
            const result = await response.json();

            if (result.success) {
                setSummary(result.data.summary);
                setDetails(result.data.details || []);
            }
        } catch (error) {
            console.error("Error generating canteen financial report:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportCSV = () => {
        const formattedData = reportFormatters.canteenFinancial(details);
        const csv = convertToCSV(formattedData);
        const filename = generateReportFilename("canteen_financial", {
            startDate: filters.dateRange?.startDate,
            endDate: filters.dateRange?.endDate,
            faculty: filters.faculty,
        });
        downloadCSV(csv, filename);
    };

    const columns = [
        { key: "transaction_id", label: "Transaction ID" },
        { key: "register_number", label: "Register No" },
        { key: "full_name", label: "Student Name" },
        { key: "faculty", label: "Faculty" },
        { key: "amount", label: "Amount" },
        { key: "payment_method", label: "Payment Method" },
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
                        title="Total Revenue"
                        value={`$${summary.total_revenue.toFixed(2)}`}
                        icon={<DollarSign className="h-4 w-4 text-green-600" />}
                    />
                    <ReportSummaryCard
                        title="Total Transactions"
                        value={summary.total_transactions}
                        icon={
                            <ShoppingCart className="h-4 w-4 text-blue-600" />
                        }
                    />
                    <ReportSummaryCard
                        title="Avg Transaction Value"
                        value={`$${summary.average_transaction_value.toFixed(2)}`}
                        icon={
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                        }
                    />
                    <ReportSummaryCard
                        title="Items Sold"
                        value={summary.total_items_sold}
                        icon={<Package className="h-4 w-4 text-orange-600" />}
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
