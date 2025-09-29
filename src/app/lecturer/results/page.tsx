"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
    PlusIcon,
    EditIcon,
    Trash2Icon,
    GraduationCapIcon,
    TrophyIcon,
    FileTextIcon,
    UsersIcon,
} from "lucide-react";
import BulkExamResults from "@/components/BulkExamResults";
import { PageHeader } from "@/components/ui/breadcrumb";

interface Student {
    user_id: string;
    register_number: string;
    full_name: string;
    email: string;
    faculty: string;
    year_of_study: number;
    enrolled_courses: Array<{
        course_id: string;
        course_code: string;
        course_name: string;
    }>;
}

interface Course {
    id: string;
    course_code: string;
    course_name: string;
    credits: number;
}

interface ExamResult {
    id: string;
    student_id: string;
    course_id: string;
    exam_date: string;
    grade: string;
    remarks: string;
    published_at: string;
    register_number: string;
    student_name: string;
    student_email: string;
    course_code: string;
    course_name: string;
    credits: number;
}

const validGrades = [
    "A+",
    "A",
    "A-",
    "B+",
    "B",
    "B-",
    "C+",
    "C",
    "C-",
    "D+",
    "D",
    "F",
];

export default function StudentResultsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [results, setResults] = useState<ExamResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingResult, setEditingResult] = useState<ExamResult | null>(null);

    const [formData, setFormData] = useState({
        studentId: "",
        courseId: "",
        examDate: "",
        grade: "",
        remarks: "",
    });

    // Fetch initial data
    useEffect(() => {
        fetchCourses();
        fetchStudents();
        fetchResults();
    }, []);

    // Fetch results when course changes
    useEffect(() => {
        fetchResults();
    }, [selectedCourse]);

    // Fetch students when course changes
    useEffect(() => {
        fetchStudents();
    }, [selectedCourse]);

    const fetchCourses = async () => {
        try {
            const response = await fetch("/api/lecturer/courses");
            if (response.ok) {
                const data = await response.json();
                setCourses(data.courses);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
            toast.error("Failed to fetch courses");
        }
    };

    const fetchStudents = async () => {
        try {
            const url = selectedCourse
                ? `/api/lecturer/students?courseId=${selectedCourse}`
                : "/api/lecturer/students";

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setStudents(data.students);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
            toast.error("Failed to fetch students");
        }
    };

    const fetchResults = async () => {
        try {
            setLoading(true);
            const url = selectedCourse
                ? `/api/lecturer/results?courseId=${selectedCourse}`
                : "/api/lecturer/results";

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setResults(data.results);
            }
        } catch (error) {
            console.error("Error fetching results:", error);
            toast.error("Failed to fetch results");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/lecturer/results", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(data.message);
                setFormData({
                    studentId: "",
                    courseId: "",
                    examDate: "",
                    grade: "",
                    remarks: "",
                });
                setIsEditDialogOpen(false);
                fetchResults();
                fetchStudents();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error adding result:", error);
            toast.error("Failed to add result");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (result: ExamResult) => {
        setEditingResult(result);
        setFormData({
            studentId: result.student_id,
            courseId: result.course_id,
            examDate: result.exam_date,
            grade: result.grade,
            remarks: result.remarks || "",
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/lecturer/results", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(data.message);
                setIsEditDialogOpen(false);
                setEditingResult(null);
                fetchResults();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error updating result:", error);
            toast.error("Failed to update result");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (resultId: string) => {
        if (!confirm("Are you sure you want to delete this result?")) {
            return;
        }

        try {
            const response = await fetch(
                `/api/lecturer/results?resultId=${resultId}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (data.success) {
                toast.success(data.message);
                fetchResults();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error deleting result:", error);
            toast.error("Failed to delete result");
        }
    };

    const getGradeColor = (grade: string) => {
        if (["A+", "A", "A-"].includes(grade))
            return "bg-green-100 text-green-800";
        if (["B+", "B", "B-"].includes(grade))
            return "bg-blue-100 text-blue-800";
        if (["C+", "C", "C-"].includes(grade))
            return "bg-yellow-100 text-yellow-800";
        if (["D+", "D"].includes(grade)) return "bg-orange-100 text-orange-800";
        if (grade === "F") return "bg-red-100 text-red-800";
        return "bg-gray-100 text-gray-800";
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <PageHeader
                    title="Student Results Management"
                    breadcrumbs={[
                        { label: "Dashboard", href: "/lecturer/dashboard" },
                        { label: "Results", current: true },
                    ]}
                    backButton={{
                        href: "/lecturer/dashboard",
                        label: "Back to Dashboard",
                    }}
                >
                    <p className="text-muted-foreground">
                        Add, view, and manage exam results for your students
                    </p>
                </PageHeader>

                <Tabs defaultValue="bulk" className="space-y-4">
                    <TabsList>
                        <TabsTrigger
                            value="bulk"
                            className="flex items-center gap-2"
                        >
                            <UsersIcon className="h-4 w-4" />
                            Bulk Entry
                        </TabsTrigger>
                        <TabsTrigger
                            value="individual"
                            className="flex items-center gap-2"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Individual Entry
                        </TabsTrigger>
                        <TabsTrigger
                            value="results"
                            className="flex items-center gap-2"
                        >
                            <FileTextIcon className="h-4 w-4" />
                            View Results
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="bulk" className="space-y-4">
                        <BulkExamResults onResultsAdded={fetchResults} />
                    </TabsContent>

                    <TabsContent value="individual" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PlusIcon className="h-5 w-5" />
                                    Add Individual Result
                                </CardTitle>
                                <CardDescription>
                                    Add a single exam result for a specific
                                    student
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-4 max-w-md"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="courseId">Course</Label>
                                        <Select
                                            value={formData.courseId}
                                            onValueChange={(value) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    courseId: value,
                                                }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select course" />
                                            </SelectTrigger>
                                            <SelectContent>
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
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="studentId">
                                            Student
                                        </Label>
                                        <Select
                                            value={formData.studentId}
                                            onValueChange={(value) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    studentId: value,
                                                }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select student" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {students.map((student) => (
                                                    <SelectItem
                                                        key={student.user_id}
                                                        value={student.user_id}
                                                    >
                                                        {
                                                            student.register_number
                                                        }{" "}
                                                        - {student.full_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="examDate">
                                            Exam Date
                                        </Label>
                                        <Input
                                            type="date"
                                            id="examDate"
                                            value={formData.examDate}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    examDate: e.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="grade">Grade</Label>
                                        <Select
                                            value={formData.grade}
                                            onValueChange={(value) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    grade: value,
                                                }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select grade" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {validGrades.map((grade) => (
                                                    <SelectItem
                                                        key={grade}
                                                        value={grade}
                                                    >
                                                        {grade}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="remarks">
                                            Remarks (Optional)
                                        </Label>
                                        <Textarea
                                            id="remarks"
                                            placeholder="Enter any additional remarks..."
                                            value={formData.remarks}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    remarks: e.target.value,
                                                }))
                                            }
                                            rows={3}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={
                                            isSubmitting ||
                                            !formData.studentId ||
                                            !formData.courseId ||
                                            !formData.examDate ||
                                            !formData.grade
                                        }
                                        className="w-full"
                                    >
                                        {isSubmitting
                                            ? "Adding..."
                                            : "Add Result"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="results" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrophyIcon className="h-5 w-5" />
                                    Filter Results
                                </CardTitle>
                                <CardDescription>
                                    Filter results by course to view specific
                                    data
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <Select
                                        value={selectedCourse}
                                        onValueChange={setSelectedCourse}
                                    >
                                        <SelectTrigger className="w-64">
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
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedCourse("");
                                            fetchResults();
                                        }}
                                    >
                                        Clear Filter
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Exam Results</CardTitle>
                                <CardDescription>
                                    {results.length} result(s) found
                                    {selectedCourse && (
                                        <span className="ml-2">
                                            for{" "}
                                            {
                                                courses.find(
                                                    (c) =>
                                                        c.id === selectedCourse
                                                )?.course_name
                                            }
                                        </span>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex items-center justify-center h-32">
                                        <div className="text-muted-foreground">
                                            Loading results...
                                        </div>
                                    </div>
                                ) : results.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <GraduationCapIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                        <p>No exam results found</p>
                                        <p className="text-sm">
                                            Add some results to see them here
                                        </p>
                                    </div>
                                ) : (
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>
                                                        Student
                                                    </TableHead>
                                                    <TableHead>
                                                        Course
                                                    </TableHead>
                                                    <TableHead>
                                                        Exam Date
                                                    </TableHead>
                                                    <TableHead>Grade</TableHead>
                                                    <TableHead>
                                                        Remarks
                                                    </TableHead>
                                                    <TableHead>
                                                        Published
                                                    </TableHead>
                                                    <TableHead>
                                                        Actions
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {results.map((result) => (
                                                    <TableRow key={result.id}>
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium">
                                                                    {
                                                                        result.student_name
                                                                    }
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {
                                                                        result.register_number
                                                                    }
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <div className="font-medium">
                                                                    {
                                                                        result.course_code
                                                                    }
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {
                                                                        result.course_name
                                                                    }
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(
                                                                result.exam_date
                                                            ).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                className={getGradeColor(
                                                                    result.grade
                                                                )}
                                                            >
                                                                {result.grade}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="max-w-48">
                                                            <div
                                                                className="truncate"
                                                                title={
                                                                    result.remarks
                                                                }
                                                            >
                                                                {result.remarks ||
                                                                    "-"}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(
                                                                result.published_at
                                                            ).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            result
                                                                        )
                                                                    }
                                                                >
                                                                    <EditIcon className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            result.id
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2Icon className="h-4 w-4" />
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
                    </TabsContent>
                </Tabs>

                {/* Edit Dialog */}
                <Dialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Exam Result</DialogTitle>
                            <DialogDescription>
                                Update the exam result for{" "}
                                {editingResult?.student_name}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Student</Label>
                                <div className="p-2 bg-muted rounded">
                                    {editingResult?.register_number} -{" "}
                                    {editingResult?.student_name}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Course</Label>
                                <div className="p-2 bg-muted rounded">
                                    {editingResult?.course_code} -{" "}
                                    {editingResult?.course_name}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="examDate">Exam Date</Label>
                                <Input
                                    type="date"
                                    id="examDate"
                                    value={formData.examDate}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            examDate: e.target.value,
                                        }))
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="grade">Grade</Label>
                                <Select
                                    value={formData.grade}
                                    onValueChange={(value) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            grade: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select grade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {validGrades.map((grade) => (
                                            <SelectItem
                                                key={grade}
                                                value={grade}
                                            >
                                                {grade}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="remarks">
                                    Remarks (Optional)
                                </Label>
                                <Textarea
                                    id="remarks"
                                    placeholder="Enter any additional remarks..."
                                    value={formData.remarks}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            remarks: e.target.value,
                                        }))
                                    }
                                    rows={3}
                                />
                            </div>

                            <DialogFooter>
                                <Button
                                    type="submit"
                                    disabled={
                                        isSubmitting ||
                                        !formData.examDate ||
                                        !formData.grade
                                    }
                                >
                                    {isSubmitting
                                        ? "Updating..."
                                        : "Update Result"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
