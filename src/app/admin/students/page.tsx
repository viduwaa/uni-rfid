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
import { getFacultyName } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    Search,
    Edit,
    Trash2,
    Users,
    UserCheck,
    UserX,
    Plus,
    GraduationCap,
    BookOpen,
    Save,
    X,
    ArrowLeft,
    Home,
} from "lucide-react";
import Link from "next/link";
import StudentCourseEnrollmentDialog from "./StudentCourseEnrollmentDialog";

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

export default function StudentManagement() {
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFaculty, setSelectedFaculty] = useState("all");
    const [selectedYear, setSelectedYear] = useState("all");
    const [loading, setLoading] = useState(true);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
    const [selectedStudentForEnroll, setSelectedStudentForEnroll] =
        useState<Student | null>(null);

    const faculties = [
        "Faculty of Technology",
        "Faculty of Applied Sciences",
        "Faculty of Social Sciences & Humanities",
        "Faculty of Management Studies",
        "Faculty of Medicine",
        "Faculty of Agriculture",
    ];

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        filterStudents();
    }, [students, searchTerm, selectedFaculty, selectedYear]);

    const fetchStudents = async () => {
        try {
            const response = await fetch("/api/admin/students");
            if (response.ok) {
                const data = await response.json();
                setStudents(data.students);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
            toast.error("Failed to fetch students");
        } finally {
            setLoading(false);
        }
    };

    const filterStudents = () => {
        let filtered = students.filter((student) => {
            const matchesSearch =
                student.full_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                student.register_number
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesFaculty =
                selectedFaculty === "all" ||
                student.faculty === selectedFaculty;
            const matchesYear =
                selectedYear === "all" ||
                student.year_of_study.toString() === selectedYear;

            return matchesSearch && matchesFaculty && matchesYear;
        });

        setFilteredStudents(filtered);
    };

    const handleEditStudent = async (updatedStudent: Student) => {
        try {
            const response = await fetch(
                `/api/admin/students/${updatedStudent.user_id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updatedStudent),
                }
            );

            if (response.ok) {
                toast.success("Student updated successfully");
                fetchStudents();
                setIsEditDialogOpen(false);
                setEditingStudent(null);
            } else {
                throw new Error("Failed to update student");
            }
        } catch (error) {
            console.error("Error updating student:", error);
            toast.error("Failed to update student");
        }
    };

    const handleDeleteStudent = async (studentId: string) => {
        if (confirm("Are you sure you want to delete this student?")) {
            try {
                const response = await fetch(
                    `/api/admin/students/${studentId}`,
                    {
                        method: "DELETE",
                    }
                );

                if (response.ok) {
                    toast.success("Student deleted successfully");
                    fetchStudents();
                } else {
                    throw new Error("Failed to delete student");
                }
            } catch (error) {
                console.error("Error deleting student:", error);
                toast.error("Failed to delete student");
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
                        Student Management
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
                            Student Management
                        </h1>
                    </div>
                    <Link href="/admin/students/add">
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add New Student
                        </Button>
                    </Link>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Total Students
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {students.length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <UserCheck className="h-5 w-5 text-green-500" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Active Cards
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {
                                            students.filter(
                                                (s) =>
                                                    s.card_status === "ACTIVE"
                                            ).length
                                        }
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <UserX className="h-5 w-5 text-red-500" />
                                <div>
                                    <p className="text-sm font-medium">
                                        No Cards
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {
                                            students.filter((s) => !s.card_uid)
                                                .length
                                        }
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-purple-500" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Faculties
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {
                                            new Set(
                                                students.map((s) => s.faculty)
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
                                        placeholder="Search by name, register number, or email"
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
                                <Label>Year of Study</Label>
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

            {/* Students Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Students ({filteredStudents.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Register Number</TableHead>
                                    <TableHead>Full Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Faculty</TableHead>
                                    <TableHead>Year</TableHead>
                                    <TableHead>Card Status</TableHead>
                                    <TableHead>Enrolled Courses</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.map((student) => (
                                    <TableRow key={student.user_id}>
                                        <TableCell className="font-medium">
                                            {student.register_number}
                                        </TableCell>
                                        <TableCell>
                                            {student.full_name}
                                        </TableCell>
                                        <TableCell>{student.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {getFacultyName(student.faculty)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                Year {student.year_of_study}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {student.card_uid ? (
                                                <Badge
                                                    variant={
                                                        student.card_status ===
                                                        "ACTIVE"
                                                            ? "default"
                                                            : "destructive"
                                                    }
                                                >
                                                    {student.card_status ||
                                                        "ACTIVE"}
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive">
                                                    No Card
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">
                                                    {student.enrolled_courses
                                                        ?.length || 0}{" "}
                                                    courses
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedStudentForEnroll(
                                                            student
                                                        );
                                                        setIsEnrollDialogOpen(
                                                            true
                                                        );
                                                    }}
                                                >
                                                    <BookOpen className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingStudent(
                                                            student
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
                                                        handleDeleteStudent(
                                                            student.user_id
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

            {/* Edit Student Dialog */}
            {editingStudent && (
                <Dialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                >
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                Edit Student - {editingStudent.full_name}
                            </DialogTitle>
                            <DialogDescription>
                                Update student information below.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-fullName">Full Name</Label>
                                <Input
                                    id="edit-fullName"
                                    value={editingStudent.full_name}
                                    onChange={(e) =>
                                        setEditingStudent({
                                            ...editingStudent,
                                            full_name: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-initialName">
                                    Initial Name
                                </Label>
                                <Input
                                    id="edit-initialName"
                                    value={editingStudent.initial_name}
                                    onChange={(e) =>
                                        setEditingStudent({
                                            ...editingStudent,
                                            initial_name: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-registerNumber">
                                    Register Number
                                </Label>
                                <Input
                                    id="edit-registerNumber"
                                    value={editingStudent.register_number}
                                    onChange={(e) =>
                                        setEditingStudent({
                                            ...editingStudent,
                                            register_number: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editingStudent.email}
                                    onChange={(e) =>
                                        setEditingStudent({
                                            ...editingStudent,
                                            email: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-nic">NIC Number</Label>
                                <Input
                                    id="edit-nic"
                                    value={editingStudent.nic_no}
                                    onChange={(e) =>
                                        setEditingStudent({
                                            ...editingStudent,
                                            nic_no: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-phone">Phone</Label>
                                <Input
                                    id="edit-phone"
                                    value={editingStudent.phone || ""}
                                    onChange={(e) =>
                                        setEditingStudent({
                                            ...editingStudent,
                                            phone: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Faculty</Label>
                                <Select
                                    value={editingStudent.faculty}
                                    onValueChange={(value) =>
                                        setEditingStudent({
                                            ...editingStudent,
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
                                <Label>Year of Study</Label>
                                <Select
                                    value={editingStudent.year_of_study.toString()}
                                    onValueChange={(value) =>
                                        setEditingStudent({
                                            ...editingStudent,
                                            year_of_study: parseInt(value),
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

                            <div className="md:col-span-2">
                                <Label htmlFor="edit-address">Address</Label>
                                <Textarea
                                    id="edit-address"
                                    value={editingStudent.address || ""}
                                    onChange={(e) =>
                                        setEditingStudent({
                                            ...editingStudent,
                                            address: e.target.value,
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
                                onClick={() =>
                                    handleEditStudent(editingStudent)
                                }
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Course Enrollment Dialog */}
            <StudentCourseEnrollmentDialog
                student={selectedStudentForEnroll}
                isOpen={isEnrollDialogOpen}
                onClose={() => {
                    setIsEnrollDialogOpen(false);
                    setSelectedStudentForEnroll(null);
                }}
                onStudentUpdate={fetchStudents}
            />
        </div>
    );
}
