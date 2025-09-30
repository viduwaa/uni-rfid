"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    Search,
    Edit,
    Trash2,
    Plus,
    BookOpen,
    Save,
    X,
    GraduationCap,
    Users,
    Award,
    ArrowLeft,
    Home,
} from "lucide-react";
import Link from "next/link";

interface Course {
    id: string;
    course_code: string;
    course_name: string;
    faculty: string;
    year: number;
    credits: number;
    description?: string;
    created_at: string;
    updated_at: string;
    enrolled_students?: number;
    assigned_lecturers?: Array<{
        id: string;
        full_name: string;
        staff_id: string;
        position: string;
    }>;
}

export default function CourseManagement() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFaculty, setSelectedFaculty] = useState("all");
    const [selectedYear, setSelectedYear] = useState("all");
    const [loading, setLoading] = useState(true);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newCourse, setNewCourse] = useState({
        course_code: "",
        course_name: "",
        faculty: "",
        year: 1,
        credits: 3,
        description: "",
    });

    const faculties = [
        "Faculty of Technology",
        "Faculty of Applied Sciences",
        "Faculty of Social Sciences & Humanities",
        "Faculty of Management Studies",
        "Faculty of Medicine",
        "Faculty of Agriculture",
    ];

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        filterCourses();
    }, [courses, searchTerm, selectedFaculty, selectedYear]);

    const fetchCourses = async () => {
        try {
            const response = await fetch("/api/admin/courses");
            if (response.ok) {
                const data = await response.json();
                console.log(data)
                setCourses(data.courses);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
            toast.error("Failed to fetch courses");
        } finally {
            setLoading(false);
        }
    };

    const filterCourses = () => {
        let filtered = courses.filter((course) => {
            const matchesSearch =
                course.course_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                course.course_code
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                (course.description &&
                    course.description
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()));

            const matchesFaculty =
                selectedFaculty === "all" || course.faculty === selectedFaculty;
            const matchesYear =
                selectedYear === "all" ||
                course.year.toString() === selectedYear;

            return matchesSearch && matchesFaculty && matchesYear;
        });

        setFilteredCourses(filtered);
    };

    const handleAddCourse = async () => {
        try {
            // Validate required fields
            if (
                !newCourse.course_code ||
                !newCourse.course_name ||
                !newCourse.faculty
            ) {
                toast.error("Please fill in all required fields");
                return;
            }

            const response = await fetch("/api/admin/courses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newCourse),
            });

            if (response.ok) {
                toast.success("Course added successfully");
                fetchCourses();
                setIsAddDialogOpen(false);
                setNewCourse({
                    course_code: "",
                    course_name: "",
                    faculty: "",
                    year: 1,
                    credits: 3,
                    description: "",
                });
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to add course");
            }
        } catch (error) {
            console.error("Error adding course:", error);
            toast.error(
                error instanceof Error ? error.message : "Failed to add course"
            );
        }
    };

    const handleEditCourse = async (updatedCourse: Course) => {
        try {
            const response = await fetch(
                `/api/admin/courses/${updatedCourse.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updatedCourse),
                }
            );

            if (response.ok) {
                toast.success("Course updated successfully");
                fetchCourses();
                setIsEditDialogOpen(false);
                setEditingCourse(null);
            } else {
                throw new Error("Failed to update course");
            }
        } catch (error) {
            console.error("Error updating course:", error);
            toast.error("Failed to update course");
        }
    };

    const handleDeleteCourse = async (courseId: string) => {
        if (
            confirm(
                "Are you sure you want to delete this course? This will also remove all enrollments and assignments."
            )
        ) {
            try {
                const response = await fetch(`/api/admin/courses/${courseId}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    toast.success("Course deleted successfully");
                    fetchCourses();
                } else {
                    throw new Error("Failed to delete course");
                }
            } catch (error) {
                console.error("Error deleting course:", error);
                toast.error("Failed to delete course");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4">
            {/* Breadcrumb Navigation */}
            <div className="mb-6">
                <nav className="flex items-center space-x-2 text-sm text-gray-500">
                    <Link
                        href="/admin/dashboard"
                        className="flex items-center hover:text-gray-700"
                    >
                        <Home className="h-4 w-4 mr-1" />
                        Dashboard
                    </Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">
                        Course Management
                    </span>
                </nav>
            </div>

            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <Link href="/admin/dashboard">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Dashboard
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold">
                            Course Management
                        </h1>
                    </div>
                    <Button
                        className="flex items-center gap-2"
                        onClick={() => setIsAddDialogOpen(true)}
                    >
                        <Plus className="h-4 w-4" />
                        Add New Course
                    </Button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Total Courses
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {courses.length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-green-500" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Total Enrollments
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {courses.reduce(
                                            (sum, course) =>
                                                sum +
                                                (course.enrolled_students || 0),
                                            0
                                        )}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-purple-500" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Avg Credits
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {courses.length > 0
                                            ? (
                                                  courses.reduce(
                                                      (sum, course) =>
                                                          sum + course.credits,
                                                      0
                                                  ) / courses.length
                                              ).toFixed(1)
                                            : 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-orange-500" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Faculties
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {
                                            new Set(
                                                courses.map((c) => c.faculty)
                                            ).size
                                        }
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Search by course name, code, or description"
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="pl-8"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Faculty</Label>
                                <Select
                                    value={selectedFaculty}
                                    onValueChange={setSelectedFaculty}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select faculty" />
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
                                                {faculty}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Year</Label>
                                <Select
                                    value={selectedYear}
                                    onValueChange={setSelectedYear}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Years
                                        </SelectItem>
                                        <SelectItem value="1">
                                            Year 1
                                        </SelectItem>
                                        <SelectItem value="2">
                                            Year 2
                                        </SelectItem>
                                        <SelectItem value="3">
                                            Year 3
                                        </SelectItem>
                                        <SelectItem value="4">
                                            Year 4
                                        </SelectItem>
                                        <SelectItem value="5">
                                            Year 5
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setSelectedFaculty("all");
                                        setSelectedYear("all");
                                    }}
                                    className="w-full"
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Courses Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Courses ({filteredCourses.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Course Code</TableHead>
                                    <TableHead>Course Name</TableHead>
                                    <TableHead>Faculty</TableHead>
                                    <TableHead>Year</TableHead>
                                    <TableHead>Credits</TableHead>
                                    <TableHead>Enrolled Students</TableHead>
                                    <TableHead>Assigned Lecturers</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCourses.map((course) => (
                                    <TableRow key={course.id}>
                                        <TableCell className="font-medium">
                                            {course.course_code}
                                        </TableCell>
                                        <TableCell>
                                            {course.course_name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {course.faculty}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                Year {course.year}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="default">
                                                {course.credits} credits
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">
                                                {course.enrolled_students || 0}{" "}
                                                students
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {course.assigned_lecturers?.map(
                                                    (lecturer) => (
                                                        <Badge
                                                            key={lecturer.id}
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {lecturer.full_name}
                                                        </Badge>
                                                    )
                                                ) || (
                                                    <span className="text-sm text-muted-foreground">
                                                        None
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingCourse(
                                                            course
                                                        );
                                                        setIsEditDialogOpen(
                                                            true
                                                        );
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDeleteCourse(
                                                            course.id
                                                        )
                                                    }
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Add Course Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add New Course</DialogTitle>
                        <DialogDescription>
                            Create a new course in the system.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="add-courseCode">
                                Course Code *
                            </Label>
                            <Input
                                id="add-courseCode"
                                placeholder="e.g., CS101, MATH201"
                                value={newCourse.course_code}
                                onChange={(e) =>
                                    setNewCourse({
                                        ...newCourse,
                                        course_code:
                                            e.target.value.toUpperCase(),
                                    })
                                }
                            />
                        </div>

                        <div>
                            <Label htmlFor="add-courseName">
                                Course Name *
                            </Label>
                            <Input
                                id="add-courseName"
                                placeholder="e.g., Introduction to Computer Science"
                                value={newCourse.course_name}
                                onChange={(e) =>
                                    setNewCourse({
                                        ...newCourse,
                                        course_name: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div>
                            <Label>Faculty *</Label>
                            <Select
                                value={newCourse.faculty}
                                onValueChange={(value) =>
                                    setNewCourse({
                                        ...newCourse,
                                        faculty: value,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select faculty" />
                                </SelectTrigger>
                                <SelectContent>
                                    {faculties.map((faculty) => (
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

                        <div>
                            <Label>Year</Label>
                            <Select
                                value={newCourse.year.toString()}
                                onValueChange={(value) =>
                                    setNewCourse({
                                        ...newCourse,
                                        year: parseInt(value),
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Year 1</SelectItem>
                                    <SelectItem value="2">Year 2</SelectItem>
                                    <SelectItem value="3">Year 3</SelectItem>
                                    <SelectItem value="4">Year 4</SelectItem>
                                    <SelectItem value="5">Year 5</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="add-credits">Credits</Label>
                            <Input
                                id="add-credits"
                                type="number"
                                min="1"
                                max="10"
                                value={newCourse.credits}
                                onChange={(e) =>
                                    setNewCourse({
                                        ...newCourse,
                                        credits: parseInt(e.target.value) || 3,
                                    })
                                }
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Label htmlFor="add-description">Description</Label>
                            <Textarea
                                id="add-description"
                                placeholder="Course description..."
                                value={newCourse.description}
                                onChange={(e) =>
                                    setNewCourse({
                                        ...newCourse,
                                        description: e.target.value,
                                    })
                                }
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsAddDialogOpen(false)}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button onClick={handleAddCourse}>
                            <Save className="h-4 w-4 mr-2" />
                            Add Course
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Course Dialog */}
            {editingCourse && (
                <Dialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                >
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                Edit Course - {editingCourse.course_name}
                            </DialogTitle>
                            <DialogDescription>
                                Update course information below.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-courseCode">
                                    Course Code
                                </Label>
                                <Input
                                    id="edit-courseCode"
                                    value={editingCourse.course_code}
                                    onChange={(e) =>
                                        setEditingCourse({
                                            ...editingCourse,
                                            course_code:
                                                e.target.value.toUpperCase(),
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-courseName">
                                    Course Name
                                </Label>
                                <Input
                                    id="edit-courseName"
                                    value={editingCourse.course_name}
                                    onChange={(e) =>
                                        setEditingCourse({
                                            ...editingCourse,
                                            course_name: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Faculty</Label>
                                <Select
                                    value={editingCourse.faculty}
                                    onValueChange={(value) =>
                                        setEditingCourse({
                                            ...editingCourse,
                                            faculty: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {faculties.map((faculty) => (
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

                            <div>
                                <Label>Year</Label>
                                <Select
                                    value={editingCourse.year.toString()}
                                    onValueChange={(value) =>
                                        setEditingCourse({
                                            ...editingCourse,
                                            year: parseInt(value),
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">
                                            Year 1
                                        </SelectItem>
                                        <SelectItem value="2">
                                            Year 2
                                        </SelectItem>
                                        <SelectItem value="3">
                                            Year 3
                                        </SelectItem>
                                        <SelectItem value="4">
                                            Year 4
                                        </SelectItem>
                                        <SelectItem value="5">
                                            Year 5
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="edit-credits">Credits</Label>
                                <Input
                                    id="edit-credits"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={editingCourse.credits}
                                    onChange={(e) =>
                                        setEditingCourse({
                                            ...editingCourse,
                                            credits:
                                                parseInt(e.target.value) || 3,
                                        })
                                    }
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="edit-description">
                                    Description
                                </Label>
                                <Textarea
                                    id="edit-description"
                                    value={editingCourse.description || ""}
                                    onChange={(e) =>
                                        setEditingCourse({
                                            ...editingCourse,
                                            description: e.target.value,
                                        })
                                    }
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                variant="outline"
                                onClick={() => setIsEditDialogOpen(false)}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button
                                onClick={() => handleEditCourse(editingCourse)}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
