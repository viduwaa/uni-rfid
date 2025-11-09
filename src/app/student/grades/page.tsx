"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Award,
  Download,
  ArrowLeft,
  Loader2,
  TrendingUp,
  FileText,
  Home,
  User,
} from "lucide-react";
import { useStudentGrades } from "@/hooks/useStudentGrades";
import Link from "next/link";

const getGradeColor = (grade: string) => {
  const gradeValue = grade.replace("+", "").replace("-", "");
  switch (gradeValue) {
    case "A":
      return "bg-green-100 text-green-800 border-green-200";
    case "B":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "C":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "D":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "E":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getGPAStatus = (gpa: number) => {
  if (gpa >= 3.7) return { status: "Excellent", color: "text-green-600" };
  if (gpa >= 3.3) return { status: "Very Good", color: "text-blue-600" };
  if (gpa >= 3.0) return { status: "Good", color: "text-indigo-600" };
  if (gpa >= 2.7) return { status: "Satisfactory", color: "text-yellow-600" };
  if (gpa >= 2.0) return { status: "Pass", color: "text-orange-600" };
  return { status: "Needs Improvement", color: "text-red-600" };
};

export default function StudentGrades() {
  const [selectedYear, setSelectedYear] = useState<string>("");
  const { grades, gpa, loading, error } = useStudentGrades(selectedYear);

  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const gpaStatus = getGPAStatus(gpa);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group grades by year for better organization
  const gradesByYear = grades.reduce(
    (acc, grade) => {
      // Extract year from course data or use a default
      const year = `Year ${Math.ceil(Math.random() * 4)}`; // This should come from your course data
      if (!acc[year]) acc[year] = [];
      acc[year].push(grade);
      return acc;
    },
    {} as Record<string, typeof grades>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb (highest) */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-250">
          <Link
            href="/student/dashboard"
            className="flex items-center hover:text-gray-700"
          >
            <Home className="h-4 w-4 mr-1" />
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-300 font-medium">Academic Results</span>
        </nav>

        {/* Back row with centered title (same horizontal line on md+) */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 mb-6">
          <div className="flex items-center">
            <Link href="/student/dashboard">
              <Button variant="outline" size="sm" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Academic Results
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              View your grades and academic performance
            </p>
          </div>

          <div className="hidden md:block" />
        </div>

        {/* GPA Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className=" backdrop-blur-sm border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">
                {gpa.toFixed(2)}
              </div>
              <p className={`text-sm font-medium ${gpaStatus.color}`}>
                {gpaStatus.status}
              </p>
            </CardContent>
          </Card>

          <Card className=" backdrop-blur-sm border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Courses Completed
              </CardTitle>
              <Award className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700">
                {grades.length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total courses</p>
            </CardContent>
          </Card>

          <Card className=" backdrop-blur-sm border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Credits
              </CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">
                {grades.reduce((sum, grade) => sum + (grade.credits || 0), 0)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Credits earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Year Filter */}
        <Card className=" backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Filter by Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedYear === "" ? "default" : "outline"}
                onClick={() => setSelectedYear("")}
                size="sm"
              >
                All Years
              </Button>
              {years.map((year) => (
                <Button
                  key={year}
                  variant={selectedYear === year ? "default" : "outline"}
                  onClick={() => setSelectedYear(year)}
                  size="sm"
                >
                  {year}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Grades Table */}
        <Card className=" backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {selectedYear
                  ? `${selectedYear} Results`
                  : "All Academic Results"}
              </span>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </CardTitle>
            <CardDescription>
              {selectedYear
                ? `Academic record for ${selectedYear}`
                : "Complete academic record across all years"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {grades.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Exam Date</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell className="font-mono font-medium">
                          {grade.course_code}
                        </TableCell>
                        <TableCell className="max-w-64">
                          <div className="truncate" title={grade.course_name}>
                            {grade.course_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{grade.credits}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getGradeColor(grade.grade)}>
                            {grade.grade}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(grade.exam_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="max-w-48">
                          <div
                            className="truncate text-sm text-gray-600"
                            title={grade.remarks}
                          >
                            {grade.remarks || "-"}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Grades Available
                </h3>
                <p className="text-gray-600">
                  {selectedYear
                    ? `No grades found for ${selectedYear}. Try selecting a different year.`
                    : "No grade data available yet. Grades will appear here once they are entered into the system."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grade Distribution (if grades available) */}
        {grades.length > 0 && (
          <Card className=" backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Grade Distribution</CardTitle>
              <CardDescription>
                Overview of your grade performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {["A", "B", "C", "D", "E"].map((gradeLevel) => {
                  const count = grades.filter((g) =>
                    g.grade.startsWith(gradeLevel)
                  ).length;
                  const percentage =
                    grades.length > 0
                      ? ((count / grades.length) * 100).toFixed(1)
                      : "0";

                  return (
                    <div
                      key={gradeLevel}
                      className="text-center p-4 border rounded-lg"
                    >
                      <div
                        className={`text-2xl font-bold ${getGradeColor(gradeLevel).replace("bg-", "text-").replace("-100", "-600")}`}
                      >
                        {count}
                      </div>
                      <div className="text-sm text-gray-600">
                        Grade {gradeLevel}
                      </div>
                      <div className="text-xs text-gray-500">{percentage}%</div>
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
