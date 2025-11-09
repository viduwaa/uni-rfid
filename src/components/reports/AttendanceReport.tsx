"use client";

import { useState } from "react";
import { FilterPanel, ReportSummaryCard, DataTable } from "./ReportComponents";
import {
    ReportFilters,
    AttendanceSummary,
    AttendanceReportRow,
} from "@/types/reports";
import { Users, CheckCircle, XCircle, Percent } from "lucide-react";
import {
    convertToCSV,
    downloadCSV,
    generateReportFilename,
    reportFormatters,
} from "@/lib/csvUtils";

export default function AttendanceReport() {
    const [filters, setFilters] = useState<ReportFilters>({});
    const [summary, setSummary] = useState<AttendanceSummary | null>(null);
    const [details, setDetails] = useState<AttendanceReportRow[]>([]);
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
            if (filters.year)
                queryParams.append("year", filters.year.toString());
            if (filters.courseId)
                queryParams.append("courseId", filters.courseId);
            if (filters.lecturerId)
                queryParams.append("lecturerId", filters.lecturerId);
            queryParams.append("includeDetails", "true");

            const response = await fetch(
                `/api/admin/reports/attendance?${queryParams}`
            );
            const result = await response.json();

            if (result.success) {
                setSummary(result.data.summary);
                setDetails(result.data.details || []);
            }
        } catch (error) {
            console.error("Error generating attendance report:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportCSV = () => {
        const formattedData = reportFormatters.attendance(details);
        const csv = convertToCSV(formattedData);
        const filename = generateReportFilename("attendance", {
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
        { key: "course_code", label: "Course" },
        { key: "date", label: "Date" },
        { key: "checked_in", label: "Check-in Time" },
        { key: "attendance_status", label: "Status" },
    ];

    return (
        <div className="space-y-6">
            <FilterPanel
                onFilterChange={setFilters}
                onGenerate={generateReport}
                isLoading={isLoading}
                showDateRange={true}
                showFaculty={true}
                showYear={true}
                showCourse={true}
                showLecturer={true}
            />

            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ReportSummaryCard
                        title="Total Classes"
                        value={summary.total_classes}
                        icon={
                            <Users className="h-4 w-4 text-muted-foreground" />
                        }
                    />
                    <ReportSummaryCard
                        title="Total Students"
                        value={summary.total_students}
                        icon={
                            <Users className="h-4 w-4 text-muted-foreground" />
                        }
                    />
                    <ReportSummaryCard
                        title="Present"
                        value={summary.total_present}
                        description={`${summary.attendance_rate}% attendance rate`}
                        icon={
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        }
                    />
                    <ReportSummaryCard
                        title="Absent"
                        value={summary.total_absent}
                        icon={<XCircle className="h-4 w-4 text-red-600" />}
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
