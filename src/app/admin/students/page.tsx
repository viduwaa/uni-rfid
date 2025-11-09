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
import PageHeader from "@/components/PageHeader";
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
    { code: "tec", name: "Faculty of Technology" },
    { code: "app", name: "Faculty of Applied Sciences" },
    { code: "ssh", name: "Faculty of Social Sciences & Humanities" },
    { code: "mgt", name: "Faculty of Management Studies" },
    { code: "med", name: "Faculty of Medicine and Allied Sciences" },
    { code: "agr", name: "Faculty of Agriculture" },
  ];

  // Helper function to get short faculty name
  const getShortFacultyName = (facultyCode: string) => {
    const facultyMap: { [key: string]: string } = {
      tec: "FOT",
      app: "APP",
      ssh: "SSH",
      mgt: "MGT",
      med: "MED",
      agr: "AGR",
    };
    return (
      facultyMap[facultyCode.toLowerCase()] ||
      facultyCode.substring(0, 3).toUpperCase()
    );
  };

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
    let filtered = students;

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((student) => {
        const fullName = student.full_name?.toLowerCase() || "";
        const registerNumber = student.register_number?.toLowerCase() || "";
        const email = student.email?.toLowerCase() || "";
        const faculty = student.faculty?.toLowerCase() || "";

        return (
          fullName.includes(search) ||
          registerNumber.includes(search) ||
          email.includes(search) ||
          faculty.includes(search)
        );
      });
    }

    // Apply faculty filter
    if (selectedFaculty !== "all") {
      filtered = filtered.filter(
        (student) => student.faculty === selectedFaculty
      );
    }

    // Apply year filter
    if (selectedYear !== "all") {
      filtered = filtered.filter(
        (student) => student.year_of_study.toString() === selectedYear
      );
    }

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
        const response = await fetch(`/api/admin/students/${studentId}`, {
          method: "DELETE",
        });

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
      <PageHeader
        title="Student Management"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Student Management" },
        ]}
        backHref="/admin/dashboard"
        right={
          <div className="hidden md:block text-right">
            <Link href="/admin/students/add">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Student
              </Button>
            </Link>
          </div>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Active Cards</p>
                <p className="text-2xl font-bold">
                  {students.filter((s) => s.card_status === "ACTIVE").length}
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
                <p className="text-sm font-medium">No Cards</p>
                <p className="text-2xl font-bold">
                  {students.filter((s) => !s.card_uid).length}
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
                <p className="text-sm font-medium">Faculties</p>
                <p className="text-2xl font-bold">
                  {new Set(students.map((s) => s.faculty)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Search & Filter</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search" className="text-sm font-medium">
                Search Students
              </Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, register number, email, or faculty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
              {searchTerm && (
                <p className="text-xs text-muted-foreground mt-1">
                  Found {filteredStudents.length} results
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium">Filter by Faculty</Label>
              <Select
                value={selectedFaculty}
                onValueChange={setSelectedFaculty}
              >
                <SelectTrigger className="mt-1 h-10">
                  <SelectValue placeholder="Select faculty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Faculties</SelectItem>
                  {faculties.map((faculty) => (
                    <SelectItem key={faculty.code} value={faculty.code}>
                      {faculty.name.replace("Faculty of ", "")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Filter by Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="mt-1 h-10">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="1">Year 1</SelectItem>
                  <SelectItem value="2">Year 2</SelectItem>
                  <SelectItem value="3">Year 3</SelectItem>
                  <SelectItem value="4">Year 4</SelectItem>
                  <SelectItem value="5">Year 5</SelectItem>
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
                className="w-full h-10"
                disabled={
                  !searchTerm &&
                  selectedFaculty === "all" &&
                  selectedYear === "all"
                }
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Students List</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Showing {filteredStudents.length} of {students.length} students
              </p>
            </div>
            {filteredStudents.length > 0 && (
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {filteredStudents.length} Results
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No students found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ||
                selectedFaculty !== "all" ||
                selectedYear !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by adding a new student"}
              </p>
              {!searchTerm &&
                selectedFaculty === "all" &&
                selectedYear === "all" && (
                  <Link href="/admin/students/add">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Student
                    </Button>
                  </Link>
                )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Register No.</TableHead>
                    <TableHead>Student Details</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-[80px]">Faculty</TableHead>
                    <TableHead className="w-[80px]">Year</TableHead>
                    <TableHead>Card Status</TableHead>
                    <TableHead>Courses</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow
                      key={student.user_id}
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="font-mono font-semibold">
                        {student.register_number}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{student.full_name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{student.email}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="whitespace-nowrap font-semibold"
                        >
                          {getShortFacultyName(student.faculty)}
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
                              student.card_status === "ACTIVE"
                                ? "default"
                                : "destructive"
                            }
                            className="whitespace-nowrap"
                          >
                            {student.card_status || "ACTIVE"}
                          </Badge>
                        ) : (
                          <Badge
                            variant="destructive"
                            className="whitespace-nowrap"
                          >
                            No Card
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="gap-1 px-2 py-1"
                          >
                            <BookOpen className="h-3 w-3" />
                            <span className="font-semibold">
                              {student.enrolled_courses?.length || 0}
                            </span>
                            <span className="text-muted-foreground">
                              courses
                            </span>
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedStudentForEnroll(student);
                              setIsEnrollDialogOpen(true);
                            }}
                            className="gap-1.5"
                          >
                            <BookOpen className="h-4 w-4" />
                            Manage Courses
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingStudent(student);
                              setIsEditDialogOpen(true);
                            }}
                            title="Edit Student"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStudent(student.user_id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            title="Delete Student"
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
          )}
        </CardContent>
      </Card>

      {/* Edit Student Dialog */}
      {editingStudent && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                <Label htmlFor="edit-initialName">Initial Name</Label>
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
                <Label htmlFor="edit-registerNumber">Register Number</Label>
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
                      <SelectItem key={faculty.code} value={faculty.code}>
                        {faculty.name}
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
                    <SelectItem value="1">Year 1</SelectItem>
                    <SelectItem value="2">Year 2</SelectItem>
                    <SelectItem value="3">Year 3</SelectItem>
                    <SelectItem value="4">Year 4</SelectItem>
                    <SelectItem value="5">Year 5</SelectItem>
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
              <Button onClick={() => handleEditStudent(editingStudent)}>
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
