"use client";

import { useState } from "react";
import { FilterPanel, ReportSummaryCard, DataTable } from "./ReportComponents";
import {
    ReportFilters,
    StudentPerformanceSummary,
    StudentPerformanceRow,
} from "@/types/reports";
import { Users, Award, TrendingUp, GraduationCap } from "lucide-react";
import {
    convertToCSV,
    downloadCSV,
    generateReportFilename,
    reportFormatters,
} from "@/lib/csvUtils";

export default function StudentPerformanceReport() {
    const [filters, setFilters] = useState<ReportFilters>({});
    const [summary, setSummary] = useState<StudentPerformanceSummary | null>(
        null
    );
    const [details, setDetails] = useState<StudentPerformanceRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const generateReport = async () => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (filters.faculty) queryParams.append("faculty", filters.faculty);
            if (filters.year)
                queryParams.append("year", filters.year.toString());
            if (filters.courseId)
                queryParams.append("courseId", filters.courseId);
            queryParams.append("includeDetails", "true");

            const response = await fetch(
                `/api/admin/reports/student-performance?${queryParams}`
            );
            const result = await response.json();

            if (result.success) {
                setSummary(result.data.summary);
                setDetails(result.data.details || []);
            }
        } catch (error) {
            console.error(
                "Error generating student performance report:",
                error
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportCSV = () => {
        const formattedData = reportFormatters.studentPerformance(details);
        const csv = convertToCSV(formattedData);
        const filename = generateReportFilename("student_performance", {
            faculty: filters.faculty,
        });
        downloadCSV(csv, filename);
    };

    const columns = [
        { key: "register_number", label: "Register No" },
        { key: "full_name", label: "Student Name" },
        { key: "faculty", label: "Faculty" },
        { key: "course_code", label: "Course" },
        { key: "marks", label: "Marks" },
        { key: "grade", label: "Grade" },
        { key: "gpa", label: "GPA" },
        { key: "attendance_rate", label: "Attendance %" },
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
                showCourse={true}
            />

            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ReportSummaryCard
                        title="Total Students"
                        value={summary.total_students}
                        icon={<Users className="h-4 w-4 text-blue-600" />}
                    />
                    <ReportSummaryCard
                        title="Average GPA"
                        value={summary.average_gpa.toFixed(2)}
                        icon={<TrendingUp className="h-4 w-4 text-green-600" />}
                    />
                    <ReportSummaryCard
                        title="Top Performers"
                        value={summary.top_performers.length}
                        description="Students with GPA > 3.5"
                        icon={<Award className="h-4 w-4 text-yellow-600" />}
                    />
                    <ReportSummaryCard
                        title="Faculties"
                        value={summary.by_faculty.length}
                        icon={
                            <GraduationCap className="h-4 w-4 text-purple-600" />
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
