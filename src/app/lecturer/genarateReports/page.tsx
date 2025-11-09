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
        <div className="min-h-screen bg-background p-6">
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
                        <Card className="shadow-sm bg-card">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
                                    <Filter className="h-5 w-5" />
                                    Report Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Report Type Selection */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-foreground">
                                        Report Type
                                    </label>
                                    <div className="space-y-2">
                                        {reportTypes.map((type) => {
                                            const active = reportType === type.value;
                                            return (
                                                <button
                                                    key={type.value}
                                                    onClick={() => setReportType(type.value)}
                                                    className={`w-full p-3 rounded-lg border text-left transition-colors
                                                        ${active
                                                            ? "border-primary bg-primary text-primary-foreground"
                                                            : "border-border bg-card text-foreground hover:bg-muted"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <type.icon className="h-5 w-5" />
                                                        <div>
                                                            <p className="font-medium">
                                                                {type.label}
                                                            </p>
                                                            <p className={`text-xs ${active ? "opacity-90" : "text-muted-foreground"}`}>
                                                                {type.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Course Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">
                                        Course (Optional)
                                    </label>
                                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Courses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">All Courses</SelectItem>
                                            {courses.map((course) => (
                                                <SelectItem key={course.id} value={course.id}>
                                                    {course.course_code} – {course.course_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {selectedCourseData && (
                                        <p className="text-xs text-muted-foreground">
                                            {selectedCourseData.enrolled_students} enrolled students
                                        </p>
                                    )}
                                </div>

                                {/* Date Range */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">
                                            Start Date
                                        </label>
                                        <Input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">
                                            End Date
                                        </label>
                                        <Input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Generate Button */}
                                <Button
                                    onClick={generateReport}
                                    disabled={isGenerating || !startDate || !endDate}
                                    className="w-full"
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
                                        <label className="text-sm font-medium text-foreground">
                                            Export Options
                                        </label>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => exportReport("json")}
                                                className="flex-1"
                                            >
                                                <Download className="h-4 w-4 mr-1" />
                                                JSON
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => exportReport("csv")}
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
                        <Card className="shadow-sm min-h-[600px] bg-card">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold text-foreground">
                                    Report Results
                                    {reportData && (
                                        <Badge variant="outline" className="ml-2">
                                            Generated {new Date(reportData.generatedAt).toLocaleString()}
                                        </Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!reportData ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-medium mb-2 text-foreground">
                                            No Report Generated
                                        </h3>
                                        <p className="text-muted-foreground max-w-md">
                                            Configure your report settings and click "Generate Report" to view attendance analytics.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {reportData.courses && (
                                            <div>
                                                <h3 className="text-lg font-semibold mb-4 text-foreground">
                                                    Course Summary
                                                </h3>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full border-collapse">
                                                        <thead>
                                                            <tr className="border-b border-border">
                                                                <th className="text-left p-3 font-medium text-foreground">Course</th>
                                                                <th className="text-left p-3 font-medium text-foreground">Enrolled</th>
                                                                <th className="text-left p-3 font-medium text-foreground">Attended</th>
                                                                <th className="text-left p-3 font-medium text-foreground">Sessions</th>
                                                                <th className="text-left p-3 font-medium text-foreground">Rate</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {reportData.courses.map((course: any, index: number) => (
                                                                <tr
                                                                    key={index}
                                                                    className="border-b border-border hover:bg-muted/50"
                                                                >
                                                                    <td className="p-3">
                                                                        <div>
                                                                            <p className="font-medium text-foreground">
                                                                                {course.course_code}
                                                                            </p>
                                                                            <p className="text-sm text-muted-foreground">
                                                                                {course.course_name}
                                                                            </p>
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-3">{course.total_enrolled}</td>
                                                                    <td className="p-3">{course.total_attended}</td>
                                                                    <td className="p-3">{course.total_sessions}</td>
                                                                    <td className="p-3">
                                                                        <Badge
                                                                            variant={
                                                                                course.overall_attendance_rate > 75
                                                                                    ? "default"
                                                                                    : "secondary"
                                                                            }
                                                                        >
                                                                            {course.overall_attendance_rate}%
                                                                        </Badge>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {reportData.students && (
                                            <div>
                                                <h3 className="text-lg font-semibold mb-4 text-foreground">
                                                    Student Report
                                                </h3>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full border-collapse">
                                                        <thead>
                                                            <tr className="border-b border-border">
                                                                <th className="text-left p-3 font-medium text-foreground">Student</th>
                                                                <th className="text-left p-3 font-medium text-foreground">Course</th>
                                                                <th className="text-left p-3 font-medium text-foreground">Attended</th>
                                                                <th className="text-left p-3 font-medium text-foreground">Total</th>
                                                                <th className="text-left p-3 font-medium text-foreground">Rate</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {reportData.students.map((student: any, index: number) => (
                                                                <tr
                                                                    key={index}
                                                                    className="border-b border-border hover:bg-muted/50"
                                                                >
                                                                    <td className="p-3">
                                                                        <div>
                                                                            <p className="font-medium text-foreground">
                                                                                {student.full_name}
                                                                            </p>
                                                                            <p className="text-sm text-muted-foreground">
                                                                                {student.register_number}
                                                                            </p>
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-3">{student.course_code}</td>
                                                                    <td className="p-3">{student.sessions_attended}</td>
                                                                    <td className="p-3">{student.total_sessions}</td>
                                                                    <td className="p-3">
                                                                        <Badge
                                                                            variant={
                                                                                student.attendance_percentage > 75
                                                                                    ? "default"
                                                                                    : "secondary"
                                                                            }
                                                                        >
                                                                            {student.attendance_percentage}%
                                                                        </Badge>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {reportData.sessions && (
                                            <div>
                                                <h3 className="text-lg font-semibold mb-4 text-foreground">
                                                    Session Details
                                                </h3>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full border-collapse">
                                                        <thead>
                                                            <tr className="border-b border-border">
                                                                <th className="text-left p-3 font-medium text-foreground">Date</th>
                                                                <th className="text-left p-3 font-medium text-foreground">Course</th>
                                                                <th className="text-left p-3 font-medium text-foreground">Present</th>
                                                                <th className="text-left p-3 font-medium text-foreground">Enrolled</th>
                                                                <th className="text-left p-3 font-medium text-foreground">Rate</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {reportData.sessions.map((session: any, index: number) => (
                                                                <tr
                                                                    key={index}
                                                                    className="border-b border-border hover:bg-muted/50"
                                                                >
                                                                    <td className="p-3">
                                                                        {new Date(session.date).toLocaleDateString()}
                                                                    </td>
                                                                    <td className="p-3">
                                                                        <div>
                                                                            <p className="font-medium text-foreground">
                                                                                {session.course_code}
                                                                            </p>
                                                                            <p className="text-sm text-muted-foreground">
                                                                                {session.course_name}
                                                                            </p>
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-3">{session.students_present}</td>
                                                                    <td className="p-3">{session.total_enrolled}</td>
                                                                    <td className="p-3">
                                                                        <Badge
                                                                            variant={
                                                                                session.attendance_percentage > 75
                                                                                    ? "default"
                                                                                    : "secondary"
                                                                            }
                                                                        >
                                                                            {session.attendance_percentage}%
                                                                        </Badge>
                                                                    </td>
                                                                </tr>
                                                            ))}
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
