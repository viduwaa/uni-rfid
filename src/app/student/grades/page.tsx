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
  BookOpen,
  TrendingUp,
  Download,
} from "lucide-react";

interface GradeData {
  id: number;
  courseCode: string;
  courseName: string;
  grade: string;
  credits: number;
  year: string;
  semester: string;
}

const gradesData: GradeData[] = [
  {
    id: 1,
    courseCode: "CS101",
    courseName: "Introduction to Computer Science",
    grade: "A",
    credits: 3,
    year: "1st Year",
    semester: "1st Semester",
  },
  {
    id: 2,
    courseCode: "CS102",
    courseName: "Programming Fundamentals",
    grade: "A-",
    credits: 3,
    year: "1st Year",
    semester: "2nd Semester",
  },
  {
    id: 3,
    courseCode: "CS201",
    courseName: "Data Structures",
    grade: "B+",
    credits: 4,
    year: "2nd Year",
    semester: "1st Semester",
  },
  {
    id: 4,
    courseCode: "CS202",
    courseName: "Algorithms",
    grade: "A",
    credits: 4,
    year: "2nd Year",
    semester: "2nd Semester",
  },
  {
    id: 5,
    courseCode: "CS301",
    courseName: "Database Systems",
    grade: "A-",
    credits: 4,
    year: "3rd Year",
    semester: "1st Semester",
  },
  {
    id: 6,
    courseCode: "CS302",
    courseName: "Software Engineering",
    grade: "B+",
    credits: 3,
    year: "3rd Year",
    semester: "2nd Semester",
  },
  {
    id: 7,
    courseCode: "CS401",
    courseName: "Machine Learning",
    grade: "A",
    credits: 4,
    year: "4th Year",
    semester: "1st Semester",
  },
  {
    id: 8,
    courseCode: "CS499",
    courseName: "Final Year Project",
    grade: "A",
    credits: 6,
    year: "4th Year",
    semester: "2nd Semester",
  },
];

const calculateGPA = (grades: GradeData[] = gradesData) => {
  const gradePoints: { [key: string]: number } = {
    "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, 
    "C+": 2.3, "C": 2.0, "C-": 1.7, "D": 1.0, "E": 0.0,
  };
  const totalPoints = grades.reduce((sum, grade) => sum + (gradePoints[grade.grade] || 0), 0);
  return grades.length > 0 ? (totalPoints / grades.length).toFixed(2) : "0.00";
};

export default function StudentGrades() {
  const [selectedYear, setSelectedYear] = useState("All Years");
  
  const filteredGrades = selectedYear === "All Years" 
    ? gradesData 
    : gradesData.filter(grade => grade.year === selectedYear);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Grades</h1>
          <p className="text-muted-foreground">View your academic performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-2xl font-medium text-foreground">Overall GPA</CardTitle>
              <Award className="h-10 w-10 text-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{calculateGPA(gradesData)}</div>
              <p className="text-sm text-muted-foreground">Out of 4.0</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-2xl font-medium text-foreground">Total Courses</CardTitle>
              <BookOpen className="h-10 w-10 text-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{gradesData.length}</div>
              <p className="text-sm text-muted-foreground">All years</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-2xl font-medium text-foreground">Total Credits</CardTitle>
              <TrendingUp className="h-10 w-10 text-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {gradesData.reduce((sum, grade) => sum + grade.credits, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total enrolled</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={selectedYear === "All Years" ? "default" : "outline"}
            onClick={() => setSelectedYear("All Years")}
            size="sm"
          >
            All Years
          </Button>
          <Button
            variant={selectedYear === "1st Year" ? "default" : "outline"}
            onClick={() => setSelectedYear("1st Year")}
            size="sm"
          >
            1st Year
          </Button>
          <Button
            variant={selectedYear === "2nd Year" ? "default" : "outline"}
            onClick={() => setSelectedYear("2nd Year")}
            size="sm"
          >
            2nd Year
          </Button>
          <Button
            variant={selectedYear === "3rd Year" ? "default" : "outline"}
            onClick={() => setSelectedYear("3rd Year")}
            size="sm"
          >
            3rd Year
          </Button>
          <Button
            variant={selectedYear === "4th Year" ? "default" : "outline"}
            onClick={() => setSelectedYear("4th Year")}
            size="sm"
          >
            4th Year
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedYear === "All Years" ? "4-Year Academic Results" : `${selectedYear} Results`}
            </CardTitle>
            <CardDescription>
              {selectedYear === "All Years" 
                ? "Complete academic record across all years" 
                : `Academic record for ${selectedYear}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredGrades.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Course Code</TableHead>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGrades.map((grade) => (
                    <TableRow key={grade.id}>
                      <TableCell className="font-medium">{grade.year}</TableCell>
                      <TableCell>{grade.semester}</TableCell>
                      <TableCell className="font-mono">{grade.courseCode}</TableCell>
                      <TableCell>{grade.courseName}</TableCell>
                      <TableCell>{grade.credits}</TableCell>
                      <TableCell>
                        <span className="font-bold">
                          {grade.grade}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No grade data available.</p>
                <p className="text-sm text-muted-foreground mt-2">Grades will appear here once they are entered into the system.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
          {["1st Year", "2nd Year", "3rd Year", "4th Year"].map((year) => {
            const yearGrades = gradesData.filter(g => g.year === year);
            const yearCredits = yearGrades.reduce((sum, g) => sum + g.credits, 0);
            const gradePoints: { [key: string]: number } = {
              "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, 
              "C+": 2.3, "C": 2.0, "C-": 1.7, "D": 1.0, "F": 0.0,
            };
            const yearGPA = yearGrades.length > 0 
              ? (yearGrades.reduce((sum, g) => sum + (gradePoints[g.grade] || 0), 0) / yearGrades.length).toFixed(2)
              : "0.00";
            
            return (
              <Card 
                key={year} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedYear === year ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedYear(year)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className={`text-lg ${selectedYear === year ? 'text-primary' : 'text-foreground'}`}>
                    {year}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Courses:</span>
                      <span className="font-semibold text-foreground">{yearGrades.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Credits:</span>
                      <span className="font-semibold text-foreground">{yearCredits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">GPA:</span>
                      <span className="font-semibold text-foreground">{yearGPA}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end">
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>
    </div>
  );
}