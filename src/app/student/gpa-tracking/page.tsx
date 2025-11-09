"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Award,
  Trash2,
  Edit,
  Plus,
  ArrowLeft,
  Calculator,
  Loader2,
  Home,
  User,
} from "lucide-react";
import { useStudentGrades } from "@/hooks/useStudentGrades";
import Link from "next/link";

interface SimulatedCourse {
  id: string;
  subject: string;
  grade: string;
  credits: number;
  year: string;
  semester: string;
}

const gradePoints: Record<string, number> = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  E: 0.0,
};

const gradeOptions = Object.keys(gradePoints);
const yearOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const semesterOptions = ["1st Semester", "2nd Semester"];

export default function GPATracking() {
  const {
    grades: realGrades,
    gpa: currentGPA,
    loading,
    error,
  } = useStudentGrades();
  const [simulatedCourses, setSimulatedCourses] = useState<SimulatedCourse[]>(
    []
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form state
  const [newSubject, setNewSubject] = useState("");
  const [newGrade, setNewGrade] = useState("A");
  const [newCredits, setNewCredits] = useState<number>(3);
  const [newYear, setNewYear] = useState("1st Year");
  const [newSemester, setNewSemester] = useState("1st Semester");

  const handleAddCourse = () => {
    if (newSubject && newGrade && newCredits > 0 && newYear && newSemester) {
      const newCourse: SimulatedCourse = {
        id: Date.now().toString(),
        subject: newSubject,
        grade: newGrade,
        credits: newCredits,
        year: newYear,
        semester: newSemester,
      };

      if (editingIndex !== null) {
        // Update existing course
        const updated = [...simulatedCourses];
        updated[editingIndex] = newCourse;
        setSimulatedCourses(updated);
        setEditingIndex(null);
      } else {
        // Add new course
        setSimulatedCourses([...simulatedCourses, newCourse]);
      }

      // Reset form
      setNewSubject("");
      setNewGrade("A");
      setNewCredits(3);
      setNewYear("1st Year");
      setNewSemester("1st Semester");
    }
  };

  const handleDeleteCourse = (index: number) => {
    setSimulatedCourses(simulatedCourses.filter((_, i) => i !== index));
  };

  const handleEditCourse = (index: number) => {
    const course = simulatedCourses[index];
    setNewSubject(course.subject);
    setNewGrade(course.grade);
    setNewCredits(course.credits);
    setNewYear(course.year);
    setNewSemester(course.semester);
    setEditingIndex(index);
  };

  const calculateSimulatedGPA = (
    courses: SimulatedCourse[] = simulatedCourses
  ) => {
    if (courses.length === 0) return "0.00";

    const totalCredits = courses.reduce(
      (sum, course) => sum + course.credits,
      0
    );
    const weightedPoints = courses.reduce((sum, course) => {
      return sum + gradePoints[course.grade] * course.credits;
    }, 0);

    return (weightedPoints / totalCredits).toFixed(2);
  };

  const calculateCombinedGPA = () => {
    // Combine real grades with simulated courses for prediction
    const allCourses = [
      ...realGrades.map((g) => ({
        id: g.id,
        subject: g.course_name,
        grade: g.grade,
        credits: g.credits,
        year: `Year ${Math.ceil(Math.random() * 4)}`, // This should come from course data
        semester: "1st Semester", // This should come from course data
      })),
      ...simulatedCourses,
    ];

    if (allCourses.length === 0) return "0.00";

    const totalCredits = allCourses.reduce(
      (sum, course) => sum + course.credits,
      0
    );
    const weightedPoints = allCourses.reduce((sum, course) => {
      return sum + gradePoints[course.grade] * course.credits;
    }, 0);

    return (weightedPoints / totalCredits).toFixed(2);
  };

  const getGPAByYear = (year: string) => {
    const yearCourses = simulatedCourses.filter((c) => c.year === year);
    return calculateSimulatedGPA(yearCourses);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  return (
    <div className="min-h-screen p-6">
      <nav className="max-w-7xl mx-auto flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-250">
        <Link
          href="/student/dashboard"
          className="flex items-center hover:text-gray-700"
        >
          <Home className="h-4 w-4 mr-1" />
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-300 font-medium">
          GPA Calculator
        </span>
      </nav>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header: left-back, centered title, right placeholder to balance */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 mb-10 mt-8">
          <div className="flex items-center">
            <Link href="/student/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              GPA Calculator
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Calculate and track your GPA progress
            </p>
          </div>

          <div className="hidden md:block" />
        </div>

        {/* GPA Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className=" backdrop-blur-sm border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Current GPA</CardTitle>
              <Award className="h-6 w-6 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">
                {currentGPA.toFixed(2)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Based on actual grades
              </p>
            </CardContent>
          </Card>

          <Card className=" backdrop-blur-sm border-green-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Simulated GPA
              </CardTitle>
              <Calculator className="h-6 w-6 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">
                {calculateSimulatedGPA()}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                From calculator below
              </p>
            </CardContent>
          </Card>

          <Card className=" backdrop-blur-sm border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Projected GPA
              </CardTitle>
              <Award className="h-6 w-6 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700">
                {calculateCombinedGPA()}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Combined estimate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Real Grades Summary */}
        {realGrades.length > 0 && (
          <Card className=" backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Your Actual Grades</CardTitle>
              <CardDescription>
                Grades from your academic record (read-only)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {realGrades.slice(0, 5).map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell className="font-mono">
                          {grade.course_code}
                        </TableCell>
                        <TableCell>{grade.course_name}</TableCell>
                        <TableCell>{grade.credits}</TableCell>
                        <TableCell>
                          <span className="font-bold">{grade.grade}</span>
                        </TableCell>
                        <TableCell>
                          {(gradePoints[grade.grade] * grade.credits).toFixed(
                            1
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {realGrades.length > 5 && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    +{realGrades.length - 5} more courses
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* GPA Calculator */}
        <Card className=" backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>GPA Calculator</span>
            </CardTitle>
            <CardDescription>
              Add courses to calculate and predict your GPA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Course Form */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 ">
              <div>
                <Label className="text-sm font-medium mb-2">Year</Label>
                <Select value={newYear} onValueChange={setNewYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2">Semester</Label>
                <Select value={newSemester} onValueChange={setNewSemester}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {semesterOptions.map((semester) => (
                      <SelectItem key={semester} value={semester}>
                        {semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2">Course Name</Label>
                <Input
                  type="text"
                  placeholder="e.g., Data Structures"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2">Credits</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={newCredits}
                  onChange={(e) => setNewCredits(parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2">Grade</Label>
                <Select value={newGrade} onValueChange={setNewGrade}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeOptions.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade} ({gradePoints[grade]})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={handleAddCourse} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {editingIndex !== null ? "Update" : "Add"}
                </Button>
              </div>
            </div>

            {/* Simulated Courses Table */}
            {simulatedCourses.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">Simulated Courses</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Year</TableHead>
                        <TableHead>Semester</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Credits</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {simulatedCourses.map((course, index) => (
                        <TableRow key={course.id}>
                          <TableCell>{course.year}</TableCell>
                          <TableCell>{course.semester}</TableCell>
                          <TableCell>{course.subject}</TableCell>
                          <TableCell>{course.credits}</TableCell>
                          <TableCell>
                            <span className="font-bold">{course.grade}</span>
                          </TableCell>
                          <TableCell>
                            {(
                              gradePoints[course.grade] * course.credits
                            ).toFixed(1)}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditCourse(index)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteCourse(index)}
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

                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                    Calculated GPA: {calculateSimulatedGPA()}
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    Based on {simulatedCourses.length} simulated course(s)
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Year-wise GPA Breakdown */}
        {simulatedCourses.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Year-wise GPA Breakdown</CardTitle>
              <CardDescription>
                GPA calculation for each academic year (simulated courses only)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {yearOptions.map((year) => {
                  const yearCourses = simulatedCourses.filter(
                    (c) => c.year === year
                  );
                  const yearGPA = getGPAByYear(year);

                  return (
                    <div
                      key={year}
                      className="text-center p-4 border rounded-lg"
                    >
                      <div className="text-sm text-gray-600">{year}</div>
                      <div className="text-2xl font-bold text-blue-700">
                        {yearCourses.length > 0 ? yearGPA : "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {yearCourses.length} course(s)
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
