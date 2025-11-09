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
import { toast } from "sonner";
import { getFacultyName } from "@/lib/utils";
import {
    ArrowLeft,
    Search,
    Users,
    UserCheck,
    BookOpen,
    Filter,
    Eye,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/breadcrumb";

interface Student {
    user_id: string;
    register_number: string;
    full_name: string;
    initial_name: string;
    email: string;
    faculty: string;
    year_of_study: number;
    phone: string;
    photo: string;
    enrolled_courses: any[];
    total_attendance: number;
    recent_attendance: number;
}

interface Course {
    id: string;
    course_code: string;
    course_name: string;
    faculty: string;
    year: number;
}

interface Summary {
    total_students: number;
    unique_faculties: number;
    total_courses: number;
    avg_year: number;
}

export default function MyStudents() {
    const [students, setStudents] = useState<Student[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedFaculty, setSelectedFaculty] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
        fetchStudents();
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [selectedCourse, selectedFaculty, selectedYear]);

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
        }
    };

    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedCourse) params.append("courseId", selectedCourse);
            if (selectedFaculty) params.append("faculty", selectedFaculty);
            if (selectedYear) params.append("year", selectedYear);

            const response = await fetch(
                `/api/lecturer/students?${params.toString()}`
            );
            const data = await response.json();

            if (data.success) {
                setStudents(data.students);
                setSummary(data.summary);
            } else {
                toast.error(data.message || "Failed to fetch students");
            }
        } catch (error) {
            toast.error("Error fetching students");
            console.error("Error fetching students:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const clearFilters = () => {
        setSelectedCourse("");
        setSelectedFaculty("");
        setSelectedYear("");
        setSearchTerm("");
    };

    const filteredStudents = students.filter(
        (student) =>
            student.full_name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            student.register_number
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const uniqueFaculties = [...new Set(courses.map((c) => c.faculty))];
    const uniqueYears = [...new Set(courses.map((c) => c.year))].sort();

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <PageHeader
                    title="My Students"
                    breadcrumbs={[
                        { label: "Dashboard", href: "/lecturer/dashboard" },
                        { label: "My Students", current: true },
                    ]}
                    backButton={{
                        href: "/lecturer/dashboard",
                        label: "Back to Dashboard",
                    }}
                >
                    {summary && (
                        <Badge variant="outline">
                            {summary.total_students} Students
                        </Badge>
                    )}
                </PageHeader>

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <Users className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {summary.total_students}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Total Students
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="h-8 w-8 text-green-600" />
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {summary.total_courses}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Total Courses
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <UserCheck className="h-8 w-8 text-purple-600" />
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {summary.unique_faculties}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Faculties
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                    </div>
                )}

                {/* Filters */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Search
                                </label>
                                <div className="relative">
                                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                                    <Input
                                        placeholder="Search students..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Course
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
                                                {course.course_code}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Faculty
                                </label>
                                <Select
                                    value={selectedFaculty}
                                    onValueChange={setSelectedFaculty}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Faculties" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">
                                            All Faculties
                                        </SelectItem>
                                        {uniqueFaculties.map((faculty) => (
                                            <SelectItem
                                                key={faculty}
                                                value={faculty}
                                            >
                                                {faculty}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Year
                                </label>
                                <Select
                                    value={selectedYear}
                                    onValueChange={setSelectedYear}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Years" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">
                                            All Years
                                        </SelectItem>
                                        {uniqueYears.map((year) => (
                                            <SelectItem
                                                key={year}
                                                value={year.toString()}
                                            >
                                                Year {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
                                    className="w-full"
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Students Table */}
                <Card className="bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">
                            Student Details
                            <span className="text-sm font-normal text-gray-500 ml-2">
                                ({filteredStudents.length} students)
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-8 text-gray-500">
                                Loading students...
                            </div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No students found matching your criteria
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                                                Name
                                            </th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                                                Register Number
                                            </th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                                                Faculty
                                            </th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                                                Year
                                            </th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                                                Phone
                                            </th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                                                Email
                                            </th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                                                Courses
                                            </th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">
                                                Attendance
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.map((student) => (
                                            <tr
                                                key={student.user_id}
                                                className="border-b border-gray-100 hover:bg-gray-50"
                                            >
                                                <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                                                    {student.full_name}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-900">
                                                    {student.register_number}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-900">
                                                    {getFacultyName(student.faculty)}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-900">
                                                    Year {student.year_of_study}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-900">
                                                    {student.phone || "N/A"}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-900">
                                                    {student.email}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-900">
                                                    <Badge variant="outline">
                                                        {student
                                                            .enrolled_courses
                                                            ?.length || 0}{" "}
                                                        courses
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-900">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-xs text-green-600">
                                                            Total:{" "}
                                                            {
                                                                student.total_attendance
                                                            }
                                                        </span>
                                                        <span className="text-xs text-blue-600">
                                                            Recent:{" "}
                                                            {
                                                                student.recent_attendance
                                                            }
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
