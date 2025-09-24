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

interface Lecturer {
    id: string;
    user_id: string;
    staff_id: string;
    nic_no: string;
    full_name: string;
    initial_name: string;
    email: string;
    faculty: string;
    position: string;
    specialization?: string;
    address?: string;
    phone?: string;
    photo?: string;
    date_of_birth?: string;
    created_at: string;
    updated_at: string;
    assigned_courses?: Array<{
        id: string;
        course_code: string;
        course_name: string;
        faculty: string;
        year: number;
        credits: number;
    }>;
}

interface CourseAssignmentDialogProps {
    lecturer: Lecturer | null;
    isOpen: boolean;
    onClose: () => void;
    onLecturerUpdate: () => void;
}

export default function CourseAssignmentDialog({
    lecturer,
    isOpen,
    onClose,
    onLecturerUpdate,
}: CourseAssignmentDialogProps) {
    const [localLecturer, setLocalLecturer] = useState<Lecturer | null>(
        lecturer
    );
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
        setLocalLecturer(lecturer);
    }, [lecturer]);

    useEffect(() => {
        if (isOpen && lecturer) {
            fetchAvailableCourses();
        }
    }, [isOpen, lecturer]);

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

    const handleAssignCourse = async (courseId: string) => {
        if (!localLecturer) return;

        try {
            const response = await fetch(
                `/api/admin/lecturer-courses/${localLecturer.id}`,
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
                // Find the course that was assigned
                const assignedCourse = availableCourses.find(
                    (c) => c.id === courseId
                );
                if (assignedCourse && localLecturer) {
                    // Update local lecturer state immediately
                    const updatedLecturer = {
                        ...localLecturer,
                        assigned_courses: [
                            ...(localLecturer.assigned_courses || []),
                            {
                                id: assignedCourse.id,
                                course_code: assignedCourse.course_code,
                                course_name: assignedCourse.course_name,
                                faculty: assignedCourse.faculty,
                                year: assignedCourse.year,
                                credits: assignedCourse.credits,
                            },
                        ],
                    };
                    setLocalLecturer(updatedLecturer);
                }
                toast.success("Course assigned successfully");
                onLecturerUpdate(); // Update parent component
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to assign course");
            }
        } catch (error: any) {
            console.error("Error assigning course:", error);
            toast.error(error.message || "Failed to assign course");
        }
    };

    const handleUnassignCourse = async (courseId: string) => {
        if (!localLecturer) return;

        try {
            const response = await fetch(
                `/api/admin/lecturer-courses/${localLecturer.id}?courseId=${courseId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                // Update local lecturer state immediately
                if (localLecturer) {
                    const updatedLecturer = {
                        ...localLecturer,
                        assigned_courses:
                            localLecturer.assigned_courses?.filter(
                                (course) => course.id !== courseId
                            ) || [],
                    };
                    setLocalLecturer(updatedLecturer);
                }
                toast.success("Course unassigned successfully");
                onLecturerUpdate(); // Update parent component
            } else {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to unassign course"
                );
            }
        } catch (error: any) {
            console.error("Error unassigning course:", error);
            toast.error(error.message || "Failed to unassign course");
        }
    };

    const isAssigned = (courseId: string) => {
        return (
            localLecturer?.assigned_courses?.some((ac) => ac.id === courseId) ||
            false
        );
    };

    const getAvailableCoursesToAssign = () => {
        return filteredCourses.filter((course) => !isAssigned(course.id));
    };

    const getAssignedCourses = () => {
        return filteredCourses.filter((course) => isAssigned(course.id));
    };

    if (!localLecturer) return null;

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
                        <BookOpen className="h-5 w-5" />
                        Course Management - {localLecturer.full_name}
                    </DialogTitle>
                    <DialogDescription>
                        Manage course assignments for {localLecturer.staff_id}{" "}
                        in {localLecturer.faculty}
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
                                        Assigned
                                    </p>
                                    <p className="text-lg font-bold">
                                        {localLecturer.assigned_courses
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
                                        {getAvailableCoursesToAssign().length}
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
                                        Faculty
                                    </p>
                                    <p className="text-lg font-bold">
                                        {localLecturer.faculty.replace(
                                            "Faculty of ",
                                            ""
                                        )}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-orange-500" />
                                <div>
                                    <p className="text-xs font-medium">
                                        Position
                                    </p>
                                    <p className="text-sm font-bold">
                                        {localLecturer.position}
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

                {/* Tabs for Assigned and Available Courses */}
                <Tabs
                    defaultValue="assigned"
                    className="flex-1 overflow-hidden"
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger
                            value="assigned"
                            className="flex items-center gap-2"
                        >
                            <BookOpen className="h-4 w-4" />
                            Assigned Courses (
                            {localLecturer.assigned_courses?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger
                            value="available"
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Available Courses (
                            {getAvailableCoursesToAssign().length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent
                        value="assigned"
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
                                    {getAssignedCourses().length > 0 ? (
                                        getAssignedCourses().map((course) => (
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
                                                            handleUnassignCourse(
                                                                course.id
                                                            )
                                                        }
                                                        className="h-8"
                                                    >
                                                        <Minus className="h-3 w-3 mr-1" />
                                                        Unassign
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
                                                        No courses assigned yet
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
                                    {getAvailableCoursesToAssign().length >
                                    0 ? (
                                        getAvailableCoursesToAssign().map(
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
                                                                handleAssignCourse(
                                                                    course.id
                                                                )
                                                            }
                                                            className="h-8"
                                                        >
                                                            <Plus className="h-3 w-3 mr-1" />
                                                            Assign
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
                                                        assign
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
