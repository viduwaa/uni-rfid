"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
    ArrowLeft,
    Download,
    FileText,
    BarChart3,
    Users,
    Calendar,
    TrendingUp,
    Filter,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/breadcrumb";

interface Course {
    id: string;
    course_code: string;
    course_name: string;
    faculty: string;
    year: number;
    enrolled_students: number;
}

interface ReportData {
    reportType: string;
    generatedAt: string;
    [key: string]: any;
}

export default function GenerateReports() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [reportType, setReportType] = useState("summary");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Set default dates (last 30 days)
    useEffect(() => {
        const today = new Date();
        const thirtyDaysAgo = new Date(
            today.getTime() - 30 * 24 * 60 * 60 * 1000
        );

        setEndDate(today.toISOString().split("T")[0]);
        setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);

        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await fetch("/api/lecturer/courses");
            const data = await response.json();

            if (data.success) {
                setCourses(data.courses);
            } else {
                toast.error(data.message || "Failed to fetch courses");
            }
        } catch (error) {
            toast.error("Error fetching courses");
            console.error("Error fetching courses:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateReport = async () => {
        if (!startDate || !endDate) {
            toast.error("Please select both start and end dates");
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            toast.error("Start date must be before end date");
            return;
        }

        setIsGenerating(true);
        try {
            const params = new URLSearchParams({
                type: reportType,
                startDate,
                endDate,
            });

            if (selectedCourse) {
                params.append("courseId", selectedCourse);
            }

            const response = await fetch(
                `/api/lecturer/reports?${params.toString()}`
            );
            const data = await response.json();

            if (data.success) {
                setReportData(data);
                toast.success("Report generated successfully");
            } else {
                toast.error(data.message || "Failed to generate report");
            }
        } catch (error) {
            toast.error("Error generating report");
            console.error("Error generating report:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const exportReport = (format: "json" | "csv") => {
        if (!reportData) {
            toast.error("No report data to export");
            return;
        }

        let content: string;
        let mimeType: string;
        let extension: string;

        if (format === "json") {
            content = JSON.stringify(reportData, null, 2);
            mimeType = "application/json";
            extension = "json";
        } else {
            // Convert to CSV (simplified for key data)
            content = convertToCSV(reportData);
            mimeType = "text/csv";
            extension = "csv";
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `attendance-report-${reportType}-${new Date().toISOString().split("T")[0]}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success(`Report exported as ${format.toUpperCase()}`);
    };

    const convertToCSV = (data: ReportData): string => {
        // This is a simplified CSV conversion - you might want to enhance this
        let csv = "";

        if (data.courses) {
            csv =
                "Course Code,Course Name,Total Enrolled,Total Attended,Attendance Rate,Sessions\n";
            data.courses.forEach((course: any) => {
                csv += `${course.course_code},${course.course_name},${course.total_enrolled},${course.total_attended},${course.overall_attendance_rate}%,${course.total_sessions}\n`;
            });
        } else if (data.students) {
            csv =
                "Name,Register Number,Faculty,Year,Course,Sessions Attended,Total Sessions,Attendance %\n";
            data.students.forEach((student: any) => {
                csv += `${student.full_name},${student.register_number},${student.faculty},${student.year_of_study},${student.course_code},${student.sessions_attended},${student.total_sessions},${student.attendance_percentage}%\n`;
            });
        } else if (data.sessions) {
            csv = "Date,Course,Students Present,Total Enrolled,Attendance %\n";
            data.sessions.forEach((session: any) => {
                csv += `${session.date},${session.course_code},${session.students_present},${session.total_enrolled},${session.attendance_percentage}%\n`;
            });
        }

        return csv;
    };

    const selectedCourseData = courses.find((c) => c.id === selectedCourse);

    const reportTypes = [
        {
            value: "summary",
            label: "Summary Report",
            icon: BarChart3,
            description: "Overview of attendance across courses",
        },
        {
            value: "student",
            label: "Student Report",
            icon: Users,
            description: "Individual student attendance",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <PageHeader
                    title="Generate Reports"
                    breadcrumbs={[
                        { label: "Dashboard", href: "/lecturer/dashboard" },
                        { label: "Generate Reports", current: true },
                    ]}
                    backButton={{
                        href: "/lecturer/dashboard",
                        label: "Back to Dashboard",
                    }}
                />

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Report Configuration */}
                    <div className="lg:col-span-1">
                        <Card className="bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                    <Filter className="h-5 w-5" />
                                    Report Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Report Type Selection */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-700">
                                        Report Type
                                    </label>
                                    <div className="space-y-2">
                                        {reportTypes.map((type) => (
                                            <button
                                                key={type.value}
                                                onClick={() =>
                                                    setReportType(type.value)
                                                }
                                                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                                                    reportType === type.value
                                                        ? "border-black bg-black text-white"
                                                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <type.icon className="h-5 w-5" />
                                                    <div>
                                                        <p className="font-medium">
                                                            {type.label}
                                                        </p>
                                                        <p className="text-xs opacity-80">
                                                            {type.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Course Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Course (Optional)
                                    </label>
                                    <Select
                                        value={selectedCourse}
                                        onValueChange={setSelectedCourse}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Courses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">
                                                All Courses
                                            </SelectItem>
                                            {courses.map((course) => (
                                                <SelectItem
                                                    key={course.id}
                                                    value={course.id}
                                                >
                                                    {course.course_code} -{" "}
                                                    {course.course_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {selectedCourseData && (
                                        <p className="text-xs text-gray-500">
                                            {
                                                selectedCourseData.enrolled_students
                                            }{" "}
                                            enrolled students
                                        </p>
                                    )}
                                </div>

                                {/* Date Range */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            Start Date
                                        </label>
                                        <Input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) =>
                                                setStartDate(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            End Date
                                        </label>
                                        <Input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) =>
                                                setEndDate(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                {/* Generate Button */}
                                <Button
                                    onClick={generateReport}
                                    disabled={
                                        isGenerating || !startDate || !endDate
                                    }
                                    className="w-full bg-black hover:bg-gray-800 text-white"
                                >
                                    {isGenerating ? (
                                        "Generating..."
                                    ) : (
                                        <>
                                            <TrendingUp className="h-4 w-4 mr-2" />
                                            Generate Report
                                        </>
                                    )}
                                </Button>

                                {/* Export Options */}
                                {reportData && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            Export Options
                                        </label>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    exportReport("json")
                                                }
                                                className="flex-1"
                                            >
                                                <Download className="h-4 w-4 mr-1" />
                                                JSON
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    exportReport("csv")
                                                }
                                                className="flex-1"
                                            >
                                                <Download className="h-4 w-4 mr-1" />
                                                CSV
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Report Results */}
                    <div className="lg:col-span-2">
                        <Card className="bg-white shadow-sm min-h-[600px]">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold">
                                    Report Results
                                    {reportData && (
                                        <Badge
                                            variant="outline"
                                            className="ml-2"
                                        >
                                            Generated{" "}
                                            {new Date(
                                                reportData.generatedAt
                                            ).toLocaleString()}
                                        </Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!reportData ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <FileText className="h-16 w-16 text-gray-300 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            No Report Generated
                                        </h3>
                                        <p className="text-gray-500 max-w-md">
                                            Configure your report settings and
                                            click "Generate Report" to view
                                            attendance analytics
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {reportData.courses && (
                                            <div>
                                                <h3 className="text-lg font-semibold mb-4">
                                                    Course Summary
                                                </h3>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full border-collapse">
                                                        <thead>
                                                            <tr className="border-b">
                                                                <th className="text-left p-3">
                                                                    Course
                                                                </th>
                                                                <th className="text-left p-3">
                                                                    Enrolled
                                                                </th>
                                                                <th className="text-left p-3">
                                                                    Attended
                                                                </th>
                                                                <th className="text-left p-3">
                                                                    Sessions
                                                                </th>
                                                                <th className="text-left p-3">
                                                                    Rate
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {reportData.courses.map(
                                                                (
                                                                    course: any,
                                                                    index: number
                                                                ) => (
                                                                    <tr
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="border-b hover:bg-gray-50"
                                                                    >
                                                                        <td className="p-3">
                                                                            <div>
                                                                                <p className="font-medium">
                                                                                    {
                                                                                        course.course_code
                                                                                    }
                                                                                </p>
                                                                                <p className="text-sm text-gray-500">
                                                                                    {
                                                                                        course.course_name
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        </td>
                                                                        <td className="p-3">
                                                                            {
                                                                                course.total_enrolled
                                                                            }
                                                                        </td>
                                                                        <td className="p-3">
                                                                            {
                                                                                course.total_attended
                                                                            }
                                                                        </td>
                                                                        <td className="p-3">
                                                                            {
                                                                                course.total_sessions
                                                                            }
                                                                        </td>
                                                                        <td className="p-3">
                                                                            <Badge
                                                                                variant={
                                                                                    course.overall_attendance_rate >
                                                                                    75
                                                                                        ? "default"
                                                                                        : "secondary"
                                                                                }
                                                                            >
                                                                                {
                                                                                    course.overall_attendance_rate
                                                                                }

                                                                                %
                                                                            </Badge>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {reportData.students && (
                                            <div>
                                                <h3 className="text-lg font-semibold mb-4">
                                                    Student Report
                                                </h3>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full border-collapse">
                                                        <thead>
                                                            <tr className="border-b">
                                                                <th className="text-left p-3">
                                                                    Student
                                                                </th>
                                                                <th className="text-left p-3">
                                                                    Course
                                                                </th>
                                                                <th className="text-left p-3">
                                                                    Attended
                                                                </th>
                                                                <th className="text-left p-3">
                                                                    Total
                                                                </th>
                                                                <th className="text-left p-3">
                                                                    Rate
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {reportData.students.map(
                                                                (
                                                                    student: any,
                                                                    index: number
                                                                ) => (
                                                                    <tr
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="border-b hover:bg-gray-50"
                                                                    >
                                                                        <td className="p-3">
                                                                            <div>
                                                                                <p className="font-medium">
                                                                                    {
                                                                                        student.full_name
                                                                                    }
                                                                                </p>
                                                                                <p className="text-sm text-gray-500">
                                                                                    {
                                                                                        student.register_number
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        </td>
                                                                        <td className="p-3">
                                                                            {
                                                                                student.course_code
                                                                            }
                                                                        </td>
                                                                        <td className="p-3">
                                                                            {
                                                                                student.sessions_attended
                                                                            }
                                                                        </td>
                                                                        <td className="p-3">
                                                                            {
                                                                                student.total_sessions
                                                                            }
                                                                        </td>
                                                                        <td className="p-3">
                                                                            <Badge
                                                                                variant={
                                                                                    student.attendance_percentage >
                                                                                    75
                                                                                        ? "default"
                                                                                        : "secondary"
                                                                                }
                                                                            >
                                                                                {
                                                                                    student.attendance_percentage
                                                                                }

                                                                                %
                                                                            </Badge>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {reportData.sessions && (
                                            <div>
                                                <h3 className="text-lg font-semibold mb-4">
                                                    Session Details
                                                </h3>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full border-collapse">
                                                        <thead>
                                                            <tr className="border-b">
                                                                <th className="text-left p-3">
                                                                    Date
                                                                </th>
                                                                <th className="text-left p-3">
                                                                    Course
                                                                </th>
                                                                <th className="text-left p-3">
                                                                    Present
                                                                </th>
                                                                <th className="text-left p-3">
                                                                    Enrolled
                                                                </th>
                                                                <th className="text-left p-3">
                                                                    Rate
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {reportData.sessions.map(
                                                                (
                                                                    session: any,
                                                                    index: number
                                                                ) => (
                                                                    <tr
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="border-b hover:bg-gray-50"
                                                                    >
                                                                        <td className="p-3">
                                                                            {new Date(
                                                                                session.date
                                                                            ).toLocaleDateString()}
                                                                        </td>
                                                                        <td className="p-3">
                                                                            <div>
                                                                                <p className="font-medium">
                                                                                    {
                                                                                        session.course_code
                                                                                    }
                                                                                </p>
                                                                                <p className="text-sm text-gray-500">
                                                                                    {
                                                                                        session.course_name
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        </td>
                                                                        <td className="p-3">
                                                                            {
                                                                                session.students_present
                                                                            }
                                                                        </td>
                                                                        <td className="p-3">
                                                                            {
                                                                                session.total_enrolled
                                                                            }
                                                                        </td>
                                                                        <td className="p-3">
                                                                            <Badge
                                                                                variant={
                                                                                    session.attendance_percentage >
                                                                                    75
                                                                                        ? "default"
                                                                                        : "secondary"
                                                                                }
                                                                            >
                                                                                {
                                                                                    session.attendance_percentage
                                                                                }

                                                                                %
                                                                            </Badge>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
