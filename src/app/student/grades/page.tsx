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