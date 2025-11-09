"use client";

import { useState } from "react";
import { FilterPanel, ReportSummaryCard, DataTable } from "./ReportComponents";
import { ReportFilters, CardUsageSummary, CardUsageRow } from "@/types/reports";
import { CreditCard, Activity, DollarSign, TrendingUp } from "lucide-react";
import {
    convertToCSV,
    downloadCSV,
    generateReportFilename,
    reportFormatters,
} from "@/lib/csvUtils";

export default function CardUsageReport() {
    const [filters, setFilters] = useState<ReportFilters>({});
    const [summary, setSummary] = useState<CardUsageSummary | null>(null);
    const [details, setDetails] = useState<CardUsageRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const generateReport = async () => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (filters.faculty) queryParams.append("faculty", filters.faculty);
            if (filters.year)
                queryParams.append("year", filters.year.toString());
            queryParams.append("includeDetails", "true");

            const response = await fetch(
                `/api/admin/reports/card-usage?${queryParams}`
            );
            const result = await response.json();

            if (result.success) {
                setSummary(result.data.summary);
                setDetails(result.data.details || []);
            }
        } catch (error) {
            console.error("Error generating card usage report:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportCSV = () => {
        const formattedData = reportFormatters.cardUsage(details);
        const csv = convertToCSV(formattedData);
        const filename = generateReportFilename("card_usage", {
            faculty: filters.faculty,
        });
        downloadCSV(csv, filename);
    };

    const columns = [
        { key: "card_id", label: "Card ID" },
        { key: "register_number", label: "Register No" },
        { key: "full_name", label: "Student Name" },
        { key: "faculty", label: "Faculty" },
        { key: "total_swipes", label: "Total Swipes" },
        { key: "current_balance", label: "Balance" },
        { key: "total_spent", label: "Total Spent" },
    ];

    return (
        <div className="space-y-6">
            <FilterPanel
                onFilterChange={setFilters}
                onGenerate={generateReport}
                isLoading={isLoading}
                showDateRange={false}
                showFaculty={true}
                showYear={true}
            />

            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ReportSummaryCard
                        title="Active Cards"
                        value={summary.total_active_cards}
                        icon={<CreditCard className="h-4 w-4 text-blue-600" />}
                    />
                    <ReportSummaryCard
                        title="Total Swipes"
                        value={summary.total_swipes}
                        icon={<Activity className="h-4 w-4 text-green-600" />}
                    />
                    <ReportSummaryCard
                        title="Total Balance"
                        value={`$${summary.total_balance.toFixed(2)}`}
                        icon={
                            <DollarSign className="h-4 w-4 text-purple-600" />
                        }
                    />
                    <ReportSummaryCard
                        title="Avg Balance"
                        value={`$${summary.average_balance.toFixed(2)}`}
                        icon={
                            <TrendingUp className="h-4 w-4 text-orange-600" />
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
