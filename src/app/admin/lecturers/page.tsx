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
import { getFacultyName } from "@/lib/utils";
import {
    Search,
    Edit,
    Trash2,
    Users,
    BookOpen,
    Plus,
    GraduationCap,
    Save,
    X,
    UserCheck,
    Award,
    ArrowLeft,
    Home,
} from "lucide-react";
import Link from "next/link";
import CourseAssignmentDialog from "./CourseAssignmentDialog";

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

interface Course {
    id: string;
    course_code: string;
    course_name: string;
    faculty: string;
    year: number;
    credits: number;
}

export default function LecturerManagement() {
    const [lecturers, setLecturers] = useState<Lecturer[]>([]);
    const [filteredLecturers, setFilteredLecturers] = useState<Lecturer[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFaculty, setSelectedFaculty] = useState("all");
    const [loading, setLoading] = useState(true);
    const [editingLecturer, setEditingLecturer] = useState<Lecturer | null>(
        null
    );
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [selectedLecturerForAssign, setSelectedLecturerForAssign] =
        useState<Lecturer | null>(null);

    const faculties = [
        "Faculty of Technology",
        "Faculty of Applied Sciences",
        "Faculty of Social Sciences & Humanities",
        "Faculty of Management Studies",
        "Faculty of Medicine",
        "Faculty of Agriculture",
    ];

    const positions = [
        "Professor",
        "Associate Professor",
        "Senior Lecturer",
        "Lecturer",
        "Assistant Lecturer",
        "Temporary Lecturer",
    ];

    useEffect(() => {
        fetchLecturers();
    }, []);

    useEffect(() => {
        filterLecturers();
    }, [lecturers, searchTerm, selectedFaculty]);

    const fetchLecturers = async () => {
        try {
            const response = await fetch("/api/admin/lecturers");
            if (response.ok) {
                const data = await response.json();
                setLecturers(data.lecturers);
                console.log(lecturers);
            }
        } catch (error) {
            console.error("Error fetching lecturers:", error);
            toast.error("Failed to fetch lecturers");
        } finally {
            setLoading(false);
        }
    };

    console.log(lecturers);
    const filterLecturers = () => {
        let filtered = lecturers.filter((lecturer) => {
            const matchesSearch =
                lecturer.full_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                lecturer.staff_id
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                lecturer.email
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                (lecturer.specialization &&
                    lecturer.specialization
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()));

            const matchesFaculty =
                selectedFaculty === "all" ||
                lecturer.faculty === selectedFaculty;

            return matchesSearch && matchesFaculty;
        });

        setFilteredLecturers(filtered);
    };

    const handleEditLecturer = async (updatedLecturer: Lecturer) => {
        try {
            const response = await fetch(
                `/api/admin/lecturers/${updatedLecturer.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updatedLecturer),
                }
            );

            if (response.ok) {
                toast.success("Lecturer updated successfully");
                fetchLecturers();
                setIsEditDialogOpen(false);
                setEditingLecturer(null);
            } else {
                throw new Error("Failed to update lecturer");
            }
        } catch (error) {
            console.error("Error updating lecturer:", error);
            toast.error("Failed to update lecturer");
        }
    };

    const handleDeleteLecturer = async (lecturerId: string) => {
        if (confirm("Are you sure you want to delete this lecturer?")) {
            try {
                const response = await fetch(
                    `/api/admin/lecturers/${lecturerId}`,
                    {
                        method: "DELETE",
                    }
                );

                if (response.ok) {
                    toast.success("Lecturer deleted successfully");
                    fetchLecturers();
                } else {
                    throw new Error("Failed to delete lecturer");
                }
            } catch (error) {
                console.error("Error deleting lecturer:", error);
                toast.error("Failed to delete lecturer");
            }
        }
    };

    const handleLecturerUpdate = () => {
        fetchLecturers(); // Refresh lecturer data to show real-time changes
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
                        Lecturer Management
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
                            Lecturer Management
                        </h1>
                    </div>
                    <Link href="/admin/lecturers/add">
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add New Lecturer
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
                                        Total Lecturers
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {lecturers.length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-green-500" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Professors
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {
                                            lecturers.filter((l) =>
                                                l.position.includes("Professor")
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
                                <UserCheck className="h-5 w-5 text-purple-500" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Senior Lecturers
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {
                                            lecturers.filter((l) =>
                                                l.position.includes("Senior")
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
                                <GraduationCap className="h-5 w-5 text-orange-500" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Faculties
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {
                                            new Set(
                                                lecturers.map((l) => l.faculty)
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Search by name, staff ID, email, or specialization"
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

                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setSelectedFaculty("all");
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

            {/* Lecturers Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Lecturers ({filteredLecturers.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Staff ID</TableHead>
                                    <TableHead>Full Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Faculty</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Specialization</TableHead>
                                    <TableHead>Assigned Courses</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLecturers.map((lecturer) => (
                                    <TableRow key={lecturer.staff_id}>
                                        <TableCell className="font-medium">
                                            {lecturer.staff_id}
                                        </TableCell>
                                        <TableCell>
                                            {lecturer.full_name}
                                        </TableCell>
                                        <TableCell>{lecturer.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {getFacultyName(lecturer.faculty)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {lecturer.position}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {lecturer.specialization ||
                                                    "Not specified"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">
                                                    {lecturer.assigned_courses
                                                        ?.length || 0}{" "}
                                                    courses
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedLecturerForAssign(
                                                            lecturer
                                                        );
                                                        setIsAssignDialogOpen(
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
                                                        setEditingLecturer(
                                                            lecturer
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
                                                        handleDeleteLecturer(
                                                            lecturer.id
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

            {/* Edit Lecturer Dialog */}
            {editingLecturer && (
                <Dialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                >
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                Edit Lecturer - {editingLecturer.full_name}
                            </DialogTitle>
                            <DialogDescription>
                                Update lecturer information below.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-fullName">Full Name</Label>
                                <Input
                                    id="edit-fullName"
                                    value={editingLecturer.full_name}
                                    onChange={(e) =>
                                        setEditingLecturer({
                                            ...editingLecturer,
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
                                    value={editingLecturer.initial_name}
                                    onChange={(e) =>
                                        setEditingLecturer({
                                            ...editingLecturer,
                                            initial_name: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-staffId">Staff ID</Label>
                                <Input
                                    id="edit-staffId"
                                    value={editingLecturer.staff_id}
                                    onChange={(e) =>
                                        setEditingLecturer({
                                            ...editingLecturer,
                                            staff_id: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editingLecturer.email}
                                    onChange={(e) =>
                                        setEditingLecturer({
                                            ...editingLecturer,
                                            email: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-nic">NIC Number</Label>
                                <Input
                                    id="edit-nic"
                                    value={editingLecturer.nic_no}
                                    onChange={(e) =>
                                        setEditingLecturer({
                                            ...editingLecturer,
                                            nic_no: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-phone">Phone</Label>
                                <Input
                                    id="edit-phone"
                                    value={editingLecturer.phone || ""}
                                    onChange={(e) =>
                                        setEditingLecturer({
                                            ...editingLecturer,
                                            phone: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Label>Faculty</Label>
                                <Select
                                    value={editingLecturer.faculty}
                                    onValueChange={(value) =>
                                        setEditingLecturer({
                                            ...editingLecturer,
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
                                <Label>Position</Label>
                                <Select
                                    value={editingLecturer.position}
                                    onValueChange={(value) =>
                                        setEditingLecturer({
                                            ...editingLecturer,
                                            position: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {positions.map((position) => (
                                            <SelectItem
                                                key={position}
                                                value={position}
                                            >
                                                {position}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="edit-specialization">
                                    Specialization
                                </Label>
                                <Input
                                    id="edit-specialization"
                                    value={editingLecturer.specialization || ""}
                                    onChange={(e) =>
                                        setEditingLecturer({
                                            ...editingLecturer,
                                            specialization: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., Machine Learning, Database Systems"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="edit-address">Address</Label>
                                <Textarea
                                    id="edit-address"
                                    value={editingLecturer.address || ""}
                                    onChange={(e) =>
                                        setEditingLecturer({
                                            ...editingLecturer,
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
                                    handleEditLecturer(editingLecturer)
                                }
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Course Assignment Dialog */}
            <CourseAssignmentDialog
                lecturer={selectedLecturerForAssign}
                isOpen={isAssignDialogOpen}
                onClose={() => {
                    setIsAssignDialogOpen(false);
                    setSelectedLecturerForAssign(null);
                }}
                onLecturerUpdate={handleLecturerUpdate}
            />
        </div>
        
    );
}
