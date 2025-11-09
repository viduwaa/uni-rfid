"use client";

import { useState } from "react";
import { FilterPanel, ReportSummaryCard, DataTable } from "./ReportComponents";
import {
    ReportFilters,
    CourseAnalyticsSummary,
    CourseAnalyticsRow,
} from "@/types/reports";
import { BookOpen, Users, TrendingUp, Award } from "lucide-react";
import {
    convertToCSV,
    downloadCSV,
    generateReportFilename,
    reportFormatters,
} from "@/lib/csvUtils";

export default function CourseAnalyticsReport() {
    const [filters, setFilters] = useState<ReportFilters>({});
    const [summary, setSummary] = useState<CourseAnalyticsSummary | null>(null);
    const [details, setDetails] = useState<CourseAnalyticsRow[]>([]);
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
                `/api/admin/reports/course-analytics?${queryParams}`
            );
            const result = await response.json();

            if (result.success) {
                setSummary(result.data.summary);
                setDetails(result.data.details || []);
            }
        } catch (error) {
            console.error("Error generating course analytics report:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportCSV = () => {
        const formattedData = reportFormatters.courseAnalytics(details);
        const csv = convertToCSV(formattedData);
        const filename = generateReportFilename("course_analytics", {
            faculty: filters.faculty,
        });
        downloadCSV(csv, filename);
    };

    const columns = [
        { key: "course_code", label: "Course Code" },
        { key: "course_name", label: "Course Name" },
        { key: "faculty", label: "Faculty" },
        { key: "enrolled_students", label: "Enrolled" },
        { key: "average_attendance_rate", label: "Attendance %" },
        { key: "average_grade", label: "Avg Grade" },
        { key: "pass_rate", label: "Pass Rate %" },
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
                        title="Total Courses"
                        value={summary.total_courses}
                        icon={<BookOpen className="h-4 w-4 text-blue-600" />}
                    />
                    <ReportSummaryCard
                        title="Total Enrollments"
                        value={summary.total_enrollments}
                        icon={<Users className="h-4 w-4 text-green-600" />}
                    />
                    <ReportSummaryCard
                        title="Avg Enrollment"
                        value={Math.round(summary.average_enrollment)}
                        description="Per course"
                        icon={
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                        }
                    />
                    <ReportSummaryCard
                        title="Faculties"
                        value={summary.by_faculty.length}
                        icon={<Award className="h-4 w-4 text-orange-600" />}
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
