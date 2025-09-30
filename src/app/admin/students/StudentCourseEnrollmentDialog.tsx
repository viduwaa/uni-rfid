"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
    Search,
    BookOpen,
    Plus,
    Minus,
    Clock,
    GraduationCap,
    Users,
    Filter,
    RefreshCw,
    UserCheck,
    Calendar,
} from "lucide-react";

interface Course {
    id: string;
    course_code: string;
    course_name: string;
    faculty: string;
    year: number;
    credits: number;
    enrolled_students?: number;
    assigned_lecturers?: Array<{
        id: string;
        full_name: string;
        staff_id: string;
        position: string;
    }>;
}

interface Student {
    user_id: string;
    register_number: string;
    full_name: string;
    initial_name: string;
    nic_no: string;
    email: string;
    faculty: string;
    year_of_study: number;
    address?: string;
    phone?: string;
    photo?: string;
    date_of_birth?: string;
    created_at: string;
    updated_at: string;
    card_status?: "ACTIVE" | "INACTIVE" | "LOST" | "DAMAGED";
    card_uid?: string;
    enrolled_courses?: Array<{
        id: string;
        course_code: string;
        course_name: string;
        faculty: string;
        year: number;
        credits: number;
    }>;
}

interface StudentCourseEnrollmentDialogProps {
    student: Student | null;
    isOpen: boolean;
    onClose: () => void;
    onStudentUpdate: () => void;
}

export default function StudentCourseEnrollmentDialog({
    student,
    isOpen,
    onClose,
    onStudentUpdate,
}: StudentCourseEnrollmentDialogProps) {
    const [localStudent, setLocalStudent] = useState<Student | null>(student);
    const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFaculty, setSelectedFaculty] = useState("all");
    const [selectedYear, setSelectedYear] = useState("all");
    const [loading, setLoading] = useState(false);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

    const faculties = [
        "Faculty of Technology",
        "Faculty of Applied Sciences",
        "Faculty of Social Sciences & Humanities",
        "Faculty of Management Studies",
        "Faculty of Medicine",
        "Faculty of Agriculture",
    ];

    const years = [1, 2, 3, 4];

    useEffect(() => {
        setLocalStudent(student);
    }, [student]);

    useEffect(() => {
        if (isOpen && student) {
            fetchAvailableCourses();
        }
    }, [isOpen, student]);

    useEffect(() => {
        filterCourses();
    }, [availableCourses, searchTerm, selectedFaculty, selectedYear]);

    const fetchAvailableCourses = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/courses");
            if (response.ok) {
                const data = await response.json();
                setAvailableCourses(data.courses);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
            toast.error("Failed to fetch courses");
        } finally {
            setLoading(false);
        }
    };

    const filterCourses = () => {
        let filtered = availableCourses.filter((course) => {
            const matchesSearch =
                course.course_code
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                course.course_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

            const matchesFaculty =
                selectedFaculty === "all" || course.faculty === selectedFaculty;

            const matchesYear =
                selectedYear === "all" ||
                course.year.toString() === selectedYear;

            return matchesSearch && matchesFaculty && matchesYear;
        });

        setFilteredCourses(filtered);
    };

    const handleEnrollCourse = async (courseId: string) => {
        if (!localStudent) return;

        try {
            const response = await fetch(
                `/api/admin/student-courses/${localStudent.user_id}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        courseId: courseId,
                    }),
                }
            );

            if (response.ok) {
                // Find the course that was enrolled
                const enrolledCourse = availableCourses.find(
                    (c) => c.id === courseId
                );
                if (enrolledCourse && localStudent) {
                    // Update local student state immediately
                    const updatedStudent = {
                        ...localStudent,
                        enrolled_courses: [
                            ...(localStudent.enrolled_courses || []),
                            {
                                id: enrolledCourse.id,
                                course_code: enrolledCourse.course_code,
                                course_name: enrolledCourse.course_name,
                                faculty: enrolledCourse.faculty,
                                year: enrolledCourse.year,
                                credits: enrolledCourse.credits,
                                enrollment_date: new Date().toISOString(),
                            },
                        ],
                    };
                    setLocalStudent(updatedStudent);
                }
                toast.success("Course enrolled successfully");
                onStudentUpdate(); // Update parent component
            } else {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to enroll in course"
                );
            }
        } catch (error: any) {
            console.error("Error enrolling in course:", error);
            toast.error(error.message || "Failed to enroll in course");
        }
    };

    const handleUnenrollCourse = async (courseId: string) => {
        if (!localStudent) return;

        try {
            const response = await fetch(
                `/api/admin/student-courses/${localStudent.user_id}?courseId=${courseId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                // Update local student state immediately
                if (localStudent) {
                    const updatedStudent = {
                        ...localStudent,
                        enrolled_courses:
                            localStudent.enrolled_courses?.filter(
                                (course) => course.id !== courseId
                            ) || [],
                    };
                    setLocalStudent(updatedStudent);
                }
                toast.success("Course unenrolled successfully");
                onStudentUpdate(); // Update parent component
            } else {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to unenroll from course"
                );
            }
        } catch (error: any) {
            console.error("Error unenrolling from course:", error);
            toast.error(error.message || "Failed to unenroll from course");
        }
    };

    const isEnrolled = (courseId: string) => {
        return (
            localStudent?.enrolled_courses?.some((ec) => ec.id === courseId) ||
            false
        );
    };

    const getAvailableCoursesToEnroll = () => {
        return filteredCourses.filter((course) => !isEnrolled(course.id));
    };

    const getEnrolledCourses = () => {
        return filteredCourses.filter((course) => isEnrolled(course.id));
    };

    const getTotalCredits = () => {
        return (
            localStudent?.enrolled_courses?.reduce(
                (total, course) => total + course.credits,
                0
            ) || 0
        );
    };

    if (!localStudent) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="max-w-6xl w-[60vw] overflow-hidden"
                style={{
                    width: "60vw",
                    maxWidth: "1200px",
                    minWidth: "800px",
                }}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5" />
                        Course Enrollment - {localStudent.full_name}
                    </DialogTitle>
                    <DialogDescription>
                        Manage course enrollments for{" "}
                        {localStudent.register_number} in {localStudent.faculty}
                    </DialogDescription>
                </DialogHeader>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <Card>
                        <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-blue-500" />
                                <div>
                                    <p className="text-xs font-medium">
                                        Enrolled
                                    </p>
                                    <p className="text-lg font-bold">
                                        {localStudent.enrolled_courses
                                            ?.length || 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                                <Plus className="h-4 w-4 text-green-500" />
                                <div>
                                    <p className="text-xs font-medium">
                                        Available
                                    </p>
                                    <p className="text-lg font-bold">
                                        {getAvailableCoursesToEnroll().length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-purple-500" />
                                <div>
                                    <p className="text-xs font-medium">
                                        Total Credits
                                    </p>
                                    <p className="text-lg font-bold">
                                        {getTotalCredits()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-orange-500" />
                                <div>
                                    <p className="text-xs font-medium">Year</p>
                                    <p className="text-lg font-bold">
                                        {localStudent.year_of_study}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="mb-4">
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <Label htmlFor="search" className="text-xs">
                                    Search Courses
                                </Label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Course code or name..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="pl-8 h-9"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs">Faculty</Label>
                                <Select
                                    value={selectedFaculty}
                                    onValueChange={setSelectedFaculty}
                                >
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="All Faculties" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Faculties
                                        </SelectItem>
                                        {faculties.map((faculty) => (
                                            <SelectItem
                                                key={faculty}
                                                value={faculty}
                                            >
                                                {faculty.replace(
                                                    "Faculty of ",
                                                    ""
                                                )}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-xs">Year</Label>
                                <Select
                                    value={selectedYear}
                                    onValueChange={setSelectedYear}
                                >
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="All Years" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Years
                                        </SelectItem>
                                        {years.map((year) => (
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
                            <div className="flex items-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setSelectedFaculty("all");
                                        setSelectedYear("all");
                                    }}
                                    className="h-9"
                                >
                                    <Filter className="h-4 w-4 mr-1" />
                                    Clear
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={fetchAvailableCourses}
                                    className="h-9"
                                    disabled={loading}
                                >
                                    <RefreshCw
                                        className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                                    />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs for Enrolled and Available Courses */}
                <Tabs
                    defaultValue="enrolled"
                    className="flex-1 overflow-hidden"
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger
                            value="enrolled"
                            className="flex items-center gap-2"
                        >
                            <BookOpen className="h-4 w-4" />
                            Enrolled Courses (
                            {localStudent.enrolled_courses?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger
                            value="available"
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Available Courses (
                            {getAvailableCoursesToEnroll().length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent
                        value="enrolled"
                        className="mt-4 overflow-y-auto max-h-96"
                    >
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[120px]">
                                            Course Code
                                        </TableHead>
                                        <TableHead>Course Name</TableHead>
                                        <TableHead className="w-[100px]">
                                            Faculty
                                        </TableHead>
                                        <TableHead className="w-[80px]">
                                            Year
                                        </TableHead>
                                        <TableHead className="w-[80px]">
                                            Credits
                                        </TableHead>
                                        <TableHead className="w-[100px]">
                                            Action
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {getEnrolledCourses().length > 0 ? (
                                        getEnrolledCourses().map((course) => (
                                            <TableRow key={course.id}>
                                                <TableCell className="font-medium">
                                                    {course.course_code}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">
                                                            {course.course_name}
                                                        </p>
                                                        {course.enrolled_students && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {
                                                                    course.enrolled_students
                                                                }{" "}
                                                                students
                                                                enrolled
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {course.faculty.replace(
                                                            "Faculty of ",
                                                            ""
                                                        )}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        Year {course.year}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {course.credits}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() =>
                                                            handleUnenrollCourse(
                                                                course.id
                                                            )
                                                        }
                                                        className="h-8"
                                                    >
                                                        <Minus className="h-3 w-3 mr-1" />
                                                        Unenroll
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="text-center py-8"
                                            >
                                                <div className="flex flex-col items-center gap-2">
                                                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                                                    <p className="text-muted-foreground">
                                                        No courses enrolled yet
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    <TabsContent
                        value="available"
                        className="mt-4 overflow-y-auto max-h-96"
                    >
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[120px]">
                                            Course Code
                                        </TableHead>
                                        <TableHead>Course Name</TableHead>
                                        <TableHead className="w-[100px]">
                                            Faculty
                                        </TableHead>
                                        <TableHead className="w-[80px]">
                                            Year
                                        </TableHead>
                                        <TableHead className="w-[80px]">
                                            Credits
                                        </TableHead>
                                        <TableHead className="w-[100px]">
                                            Action
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {getAvailableCoursesToEnroll().length >
                                    0 ? (
                                        getAvailableCoursesToEnroll().map(
                                            (course) => (
                                                <TableRow key={course.id}>
                                                    <TableCell className="font-medium">
                                                        {course.course_code}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">
                                                                {
                                                                    course.course_name
                                                                }
                                                            </p>
                                                            {course.enrolled_students && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    {
                                                                        course.enrolled_students
                                                                    }{" "}
                                                                    students
                                                                    enrolled
                                                                </p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {course.faculty.replace(
                                                                "Faculty of ",
                                                                ""
                                                            )}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            Year {course.year}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {course.credits}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                handleEnrollCourse(
                                                                    course.id
                                                                )
                                                            }
                                                            className="h-8"
                                                        >
                                                            <Plus className="h-3 w-3 mr-1" />
                                                            Enroll
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="text-center py-8"
                                            >
                                                <div className="flex flex-col items-center gap-2">
                                                    <Plus className="h-8 w-8 text-muted-foreground" />
                                                    <p className="text-muted-foreground">
                                                        No available courses to
                                                        enroll
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
