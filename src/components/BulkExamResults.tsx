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
import { toast } from "sonner";
import {
    SaveIcon,
    UsersIcon,
    CalendarIcon,
    CheckCircleIcon,
    XCircleIcon,
    BookOpenIcon,
} from "lucide-react";

interface Student {
    user_id: string;
    register_number: string;
    full_name: string;
    email: string;
    faculty: string;
    year_of_study: number;
}

interface Course {
    id: string;
    course_code: string;
    course_name: string;
    credits: number;
}

interface StudentResult {
    student_id: string;
    grade: string;
    remarks: string;
    hasExistingResult?: boolean;
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

interface BulkExamResultsProps {
    onResultsAdded?: () => void;
}

export default function BulkExamResults({
    onResultsAdded,
}: BulkExamResultsProps) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [examDate, setExamDate] = useState<string>("");
    const [studentResults, setStudentResults] = useState<
        Record<string, StudentResult>
    >({});
    const [existingResults, setExistingResults] = useState<Record<string, any>>(
        {}
    );
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchStudentsForCourse(selectedCourse);
        } else {
            setStudents([]);
            setStudentResults({});
            setExistingResults({});
        }
    }, [selectedCourse]);

    useEffect(() => {
        if (selectedCourse && examDate) {
            checkExistingResults();
        }
    }, [selectedCourse, examDate]);

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

    const fetchStudentsForCourse = async (courseId: string) => {
        try {
            setLoading(true);
            const response = await fetch(
                `/api/lecturer/students?courseId=${courseId}`
            );
            if (response.ok) {
                const data = await response.json();
                setStudents(data.students);

                // Initialize student results
                const initialResults: Record<string, StudentResult> = {};
                data.students.forEach((student: Student) => {
                    initialResults[student.user_id] = {
                        student_id: student.user_id,
                        grade: "",
                        remarks: "",
                    };
                });
                setStudentResults(initialResults);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
            toast.error("Failed to fetch students");
        } finally {
            setLoading(false);
        }
    };

    const checkExistingResults = async () => {
        try {
            const response = await fetch(
                `/api/lecturer/results?courseId=${selectedCourse}&examDate=${examDate}`
            );
            if (response.ok) {
                const data = await response.json();
                const existing: Record<string, any> = {};

                data.results.forEach((result: any) => {
                    existing[result.student_id] = result;
                });

                setExistingResults(existing);

                // Update student results with existing data
                setStudentResults((prev) => {
                    const updated = { ...prev };
                    Object.keys(existing).forEach((studentId) => {
                        if (updated[studentId]) {
                            updated[studentId] = {
                                ...updated[studentId],
                                grade: existing[studentId].grade,
                                remarks: existing[studentId].remarks || "",
                                hasExistingResult: true,
                            };
                        }
                    });
                    return updated;
                });
            }
        } catch (error) {
            console.error("Error checking existing results:", error);
        }
    };

    const handleGradeChange = (studentId: string, grade: string) => {
        setStudentResults((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                grade,
            },
        }));
    };

    const handleRemarksChange = (studentId: string, remarks: string) => {
        setStudentResults((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                remarks,
            },
        }));
    };

    const handleSubmitAll = async () => {
        if (!selectedCourse || !examDate) {
            toast.error("Please select a course and exam date");
            return;
        }

        // Filter students with grades
        const studentsWithGrades = Object.values(studentResults).filter(
            (result) => result.grade.trim() !== ""
        );

        if (studentsWithGrades.length === 0) {
            toast.error("Please add at least one grade");
            return;
        }

        setIsSubmitting(true);
        let successCount = 0;
        let errorCount = 0;

        try {
            // Submit results one by one
            for (const result of studentsWithGrades) {
                try {
                    const response = await fetch("/api/lecturer/results", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            studentId: result.student_id,
                            courseId: selectedCourse,
                            examDate: examDate,
                            grade: result.grade,
                            remarks: result.remarks,
                        }),
                    });

                    if (response.ok) {
                        successCount++;
                    } else {
                        errorCount++;
                    }
                } catch (error) {
                    errorCount++;
                }
            }

            if (successCount > 0) {
                toast.success(`Successfully saved ${successCount} results`);
                if (onResultsAdded) {
                    onResultsAdded();
                }
            }

            if (errorCount > 0) {
                toast.error(`Failed to save ${errorCount} results`);
            }

            // Refresh existing results
            if (selectedCourse && examDate) {
                checkExistingResults();
            }
        } catch (error) {
            console.error("Error submitting results:", error);
            toast.error("Failed to submit results");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getGradeColor = (grade: string) => {
        if (["A+", "A", "A-"].includes(grade))
            return "bg-green-100 text-green-800 border-green-200";
        if (["B+", "B", "B-"].includes(grade))
            return "bg-blue-100 text-blue-800 border-blue-200";
        if (["C+", "C", "C-"].includes(grade))
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
        if (["D+", "D"].includes(grade))
            return "bg-orange-100 text-orange-800 border-orange-200";
        if (grade === "F") return "bg-red-100 text-red-800 border-red-200";
        return "bg-gray-100 text-gray-800 border-gray-200";
    };

    const getResultsCount = () => {
        return Object.values(studentResults).filter(
            (result) => result.grade.trim() !== ""
        ).length;
    };

    const selectedCourseData = courses.find(
        (course) => course.id === selectedCourse
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpenIcon className="h-5 w-5" />
                        Bulk Exam Results Entry
                    </CardTitle>
                    <CardDescription>
                        Select a course and exam date, then add results for all
                        students at once
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="course">Course</Label>
                            <Select
                                value={selectedCourse}
                                onValueChange={setSelectedCourse}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a course" />
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
                            <Label htmlFor="examDate">Exam Date</Label>
                            <Input
                                type="date"
                                id="examDate"
                                value={examDate}
                                onChange={(e) => setExamDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {selectedCourse && examDate && (
                        <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <UsersIcon className="h-4 w-4" />
                                    {students.length} students
                                </div>
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4" />
                                    {new Date(examDate).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircleIcon className="h-4 w-4" />
                                    {getResultsCount()} results entered
                                </div>
                            </div>
                            <Button
                                onClick={handleSubmitAll}
                                disabled={
                                    isSubmitting || getResultsCount() === 0
                                }
                                className="flex items-center gap-2"
                            >
                                <SaveIcon className="h-4 w-4" />
                                {isSubmitting
                                    ? "Saving..."
                                    : `Save Results (${getResultsCount()})`}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {selectedCourse && examDate && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Students - {selectedCourseData?.course_code}
                        </CardTitle>
                        <CardDescription>
                            Add exam results for all students. Fields marked
                            with existing data indicate previously entered
                            results.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="text-muted-foreground">
                                    Loading students...
                                </div>
                            </div>
                        ) : students.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <UsersIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                <p>No students found for this course</p>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-32">
                                                Reg No
                                            </TableHead>
                                            <TableHead>Student Name</TableHead>
                                            <TableHead className="w-32">
                                                Grade
                                            </TableHead>
                                            <TableHead className="w-64">
                                                Remarks
                                            </TableHead>
                                            <TableHead className="w-24">
                                                Status
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.map((student) => {
                                            const result =
                                                studentResults[student.user_id];
                                            const hasExisting =
                                                existingResults[
                                                    student.user_id
                                                ];

                                            return (
                                                <TableRow
                                                    key={student.user_id}
                                                    className={
                                                        hasExisting
                                                            ? "bg-blue-50"
                                                            : ""
                                                    }
                                                >
                                                    <TableCell className="font-mono text-sm">
                                                        {
                                                            student.register_number
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">
                                                                {
                                                                    student.full_name
                                                                }
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {student.email}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select
                                                            value={
                                                                result?.grade ||
                                                                ""
                                                            }
                                                            onValueChange={(
                                                                value
                                                            ) =>
                                                                handleGradeChange(
                                                                    student.user_id,
                                                                    value
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger
                                                                className={
                                                                    hasExisting
                                                                        ? "border-blue-300 bg-blue-50"
                                                                        : ""
                                                                }
                                                            >
                                                                <SelectValue placeholder="Grade" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {validGrades.map(
                                                                    (grade) => (
                                                                        <SelectItem
                                                                            key={
                                                                                grade
                                                                            }
                                                                            value={
                                                                                grade
                                                                            }
                                                                        >
                                                                            {
                                                                                grade
                                                                            }
                                                                        </SelectItem>
                                                                    )
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Textarea
                                                            placeholder="Optional remarks..."
                                                            value={
                                                                result?.remarks ||
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                handleRemarksChange(
                                                                    student.user_id,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            rows={2}
                                                            className={
                                                                hasExisting
                                                                    ? "border-blue-300 bg-blue-50"
                                                                    : ""
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {hasExisting ? (
                                                            <Badge
                                                                variant="outline"
                                                                className="bg-blue-100 text-blue-800 border-blue-300"
                                                            >
                                                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                                                Exists
                                                            </Badge>
                                                        ) : result?.grade ? (
                                                            <Badge
                                                                variant="outline"
                                                                className={getGradeColor(
                                                                    result.grade
                                                                )}
                                                            >
                                                                {result.grade}
                                                            </Badge>
                                                        ) : (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-gray-500"
                                                            >
                                                                <XCircleIcon className="h-3 w-3 mr-1" />
                                                                Pending
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
