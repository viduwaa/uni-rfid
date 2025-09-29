"use client";
import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    CalendarClock,
    TrendingUp,
    TrendingDown,
    Minus,
    Loader2,
    ArrowLeft,
} from "lucide-react";
import { useStudentAttendance } from "@/hooks/useStudentAttendance";
import Link from "next/link";

const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 85)
        return {
            status: "Excellent",
            color: "bg-green-100 text-green-800",
            icon: TrendingUp,
        };
    if (percentage >= 75)
        return {
            status: "Good",
            color: "bg-blue-100 text-blue-800",
            icon: TrendingUp,
        };
    if (percentage >= 65)
        return {
            status: "Average",
            color: "bg-yellow-100 text-yellow-800",
            icon: Minus,
        };
    return {
        status: "Poor",
        color: "bg-red-100 text-red-800",
        icon: TrendingDown,
    };
};

export default function AttendanceTracking() {
    const [selectedYear, setSelectedYear] = useState<string>("");
    const [selectedSemester, setSelectedSemester] = useState<string>("");
    const { records, summary, loading, error } = useStudentAttendance(
        selectedYear,
        selectedSemester
    );

    const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
    const semesters = ["1st Semester", "2nd Semester"];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-96">
                    <CardHeader>
                        <CardTitle className="text-red-600">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4 mb-8">
                    <Link href="/student/dashboard">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Attendance Tracking
                        </h1>
                        <p className="text-gray-600">
                            Monitor your class attendance across all courses
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <Card className="bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Filter Options
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-48">
                                <label className="block text-sm font-medium mb-2">
                                    Year
                                </label>
                                <Select
                                    value={selectedYear}
                                    onValueChange={setSelectedYear}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Years
                                        </SelectItem>
                                        {years.map((year) => (
                                            <SelectItem key={year} value={year}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-1 min-w-48">
                                <label className="block text-sm font-medium mb-2">
                                    Semester
                                </label>
                                <Select
                                    value={selectedSemester}
                                    onValueChange={setSelectedSemester}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Semester" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Semesters
                                        </SelectItem>
                                        {semesters.map((semester) => (
                                            <SelectItem
                                                key={semester}
                                                value={semester}
                                            >
                                                {semester}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Attendance Summary */}
                {summary.length > 0 && (
                    <Card className="bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <CalendarClock className="h-5 w-5" />
                                <span>Attendance Summary by Course</span>
                            </CardTitle>
                            <CardDescription>
                                Overview of your attendance percentage for each
                                course
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {summary.map((course) => {
                                    const attendanceInfo = getAttendanceStatus(
                                        course.attendance_percentage
                                    );
                                    const Icon = attendanceInfo.icon;

                                    return (
                                        <div
                                            key={course.course_code}
                                            className="p-4 border rounded-lg bg-white shadow-sm"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-sm">
                                                        {course.course_code}
                                                    </h3>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {course.course_name}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    Year {course.year}
                                                </Badge>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>
                                                        Classes Attended:
                                                    </span>
                                                    <span className="font-medium">
                                                        {
                                                            course.attended_classes
                                                        }
                                                        /{course.total_classes}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <Icon className="h-4 w-4" />
                                                        <span className="text-2xl font-bold">
                                                            {
                                                                course.attendance_percentage
                                                            }
                                                            %
                                                        </span>
                                                    </div>
                                                    <Badge
                                                        className={
                                                            attendanceInfo.color
                                                        }
                                                    >
                                                        {attendanceInfo.status}
                                                    </Badge>
                                                </div>

                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${
                                                            course.attendance_percentage >=
                                                            85
                                                                ? "bg-green-500"
                                                                : course.attendance_percentage >=
                                                                    75
                                                                  ? "bg-blue-500"
                                                                  : course.attendance_percentage >=
                                                                      65
                                                                    ? "bg-yellow-500"
                                                                    : "bg-red-500"
                                                        }`}
                                                        style={{
                                                            width: `${Math.min(course.attendance_percentage, 100)}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Detailed Attendance Records */}
                <Card className="bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Attendance Records</CardTitle>
                        <CardDescription>
                            Detailed list of your attendance records
                            {selectedYear && ` for ${selectedYear}`}
                            {selectedSemester && ` - ${selectedSemester}`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {records.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Time</TableHead>
                                            <TableHead>Course</TableHead>
                                            <TableHead>Course Name</TableHead>
                                            <TableHead>Lecturer</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {records.map((record) => (
                                            <TableRow key={record.id}>
                                                <TableCell className="font-medium">
                                                    {new Date(
                                                        record.date
                                                    ).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    {record.checked_in}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {record.course_code}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="max-w-48 truncate">
                                                    {record.course_name}
                                                </TableCell>
                                                <TableCell>
                                                    {record.lecturer_name}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className="bg-green-100 text-green-800">
                                                        Present
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <CalendarClock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No Attendance Records
                                </h3>
                                <p className="text-gray-600">
                                    {selectedYear || selectedSemester
                                        ? "No attendance records found for the selected filters."
                                        : "No attendance records available yet."}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
