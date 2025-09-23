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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Award, Trash2, Edit } from "lucide-react";

interface GPAData {
  semester: string;
  gpa: number;
}

const gpaData: GPAData[] = [
  { semester: "1st Semester", gpa: 3.85 },
  { semester: "2nd Semester", gpa: 3.75 },
  { semester: "3rd Semester", gpa: 3.9 },
  { semester: "4th Semester", gpa: 3.8 },
];

export default function GPATracking() {
  const [grades, setGrades] = useState<
    { subject: string; grade: string; credits: number; year: string; semester: string }[]
  >([
    { subject: "Mathematics", grade: "A", credits: 3, year: "1", semester: "1st Semester" },
    { subject: "Physics", grade: "B+", credits: 4, year: "2", semester: "1st Semester" },
  ]);
  const [newSubject, setNewSubject] = useState("");
  const [newGrade, setNewGrade] = useState("A");
  const [newCredits, setNewCredits] = useState(0);
  const [newYear, setNewYear] = useState("");
  const [newSemester, setNewSemester] = useState("");

  const handleAddGrade = () => {
    if (newSubject && newGrade && newCredits > 0 && newYear && newSemester) {
      setGrades([
        ...grades,
        { subject: newSubject, grade: newGrade, credits: newCredits, year: newYear, semester: newSemester },
      ]);
      setNewSubject("");
      setNewGrade("A");
      setNewCredits(0);
      setNewYear("");
      setNewSemester("");
    }
  };

  const handleDeleteGrade = (index: number) => {
    setGrades(grades.filter((_, i) => i !== index));
  };

  const handleEditGrade = (index: number) => {
    const gradeToEdit = grades[index];
    setNewSubject(gradeToEdit.subject);
    setNewGrade(gradeToEdit.grade);
    setNewCredits(gradeToEdit.credits);
    setGrades(grades.filter((_, i) => i !== index));
  };

  const calculateGPA = () => {
    const totalCredits = grades.reduce((sum, record) => sum + record.credits, 0);
    const weightedGrades = grades.reduce((sum, record) => {
      const gradePoints: Record<string, number> = {
        "A+": 4.0,
        "A": 4.0,
        "A-": 3.7,
        "B+": 3.3,
        "B": 3.0,
        "B-": 2.7,
        "C+": 2.3,
        "C": 2.0,
        "C-": 1.7,
        "D+": 1.3,
        "D": 1.0,
        "E": 0.0,
      };
      return sum + gradePoints[record.grade] * record.credits;
    }, 0);
    return (weightedGrades / totalCredits).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">GPA Tracking</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-2xl font-medium text-foreground">
                Total GPA
              </CardTitle>
              <Award className="h-10 w-10 text-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground">
                  {gpaData.reduce((sum, record) => sum + record.gpa, 0) / gpaData.length}
                </div>
                <p className="text-lg text-muted-foreground">First Class</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-medium text-foreground">
                Semester by Semester GPA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Semester</TableHead>
                    <TableHead>GPA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gpaData.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {record.semester}
                      </TableCell>
                      <TableCell>{record.gpa}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>GPA Calculator</CardTitle>
            <CardDescription>
              Enter year, semester, subject name, credits, and grades to calculate your GPA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Year
                </label>
                <input
                  type="text"
                  placeholder="Year"
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  className="border rounded p-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Semester
                </label>
                <input
                  type="text"
                  placeholder="Semester"
                  value={newSemester}
                  onChange={(e) => setNewSemester(e.target.value)}
                  className="border rounded p-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  placeholder="Subject Name"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="border rounded p-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Credits
                </label>
                <input
                  type="number"
                  placeholder="Credits"
                  value={newCredits}
                  onChange={(e) => setNewCredits(parseFloat(e.target.value))}
                  className="border rounded p-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Grade
                </label>
                <select
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  className="border rounded p-2 w-full"
                >
                  <option value="A+">A+</option>
                  <option value="A">A</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B">B</option>
                  <option value="B-">B-</option>
                  <option value="C+">C+</option>
                  <option value="C">C</option>
                  <option value="C-">C-</option>
                  <option value="D+">D+</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                </select>
              </div>
            </div>
            <Button onClick={handleAddGrade}>Add</Button>

            {grades.length > 0 && (
              <div className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grades.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell>{record.year}</TableCell>
                        <TableCell>{record.semester}</TableCell>
                        <TableCell>{record.subject}</TableCell>
                        <TableCell>{record.credits}</TableCell>
                        <TableCell>{record.grade}</TableCell>
                        <TableCell className="flex gap-2">
                          <Edit
                            className="h-5 w-5 text-black cursor-pointer"
                            onClick={() => handleEditGrade(index)}
                          />
                          <Trash2
                            className="h-5 w-5 text-black cursor-pointer"
                            onClick={() => handleDeleteGrade(index)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-4 text-xl font-bold">
                  Calculated GPA: {calculateGPA()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-end">
          <Button>Download Report</Button>
        </div>
      </div>
    </div>
  );
}
