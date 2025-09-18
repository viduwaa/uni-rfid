"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const attendanceData = [
  
  { year: "1st Year", semester: "1st Semester", subject: "Mathematics", date: "2025-09-02", status: "Absent" },
  { year: "1st Year", semester: "2nd Semester", subject: "Physics", date: "2025-09-03", status: "Present" },
];

const calculateAttendancePercentage = (year: string, semester: string, subject: string) => {
  const subjectRecords = attendanceData.filter(
    (record) => record.year === year && record.semester === semester && record.subject === subject
  );
  const totalClasses = subjectRecords.length;
  const attendedClasses = subjectRecords.filter((record) => record.status === "Present").length;
  return ((attendedClasses / totalClasses) * 100).toFixed(2);
};

export default function AttendanceTracking() {
  const [selectedYear, setSelectedYear] = useState("1st Year");
  const [selectedSemester, setSelectedSemester] = useState("1st Semester");

  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const semesters = ["1st Semester", "2nd Semester"];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Attendance Tracking</h1>
        </div>

        <div className="mb-6 flex gap-4">
          {years.map((year) => (
            <Button
              key={year}
              variant={year === selectedYear ? "default" : "outline"}
              onClick={() => {
                setSelectedYear(year);
                setSelectedSemester("1st Semester");
              }}
            >
              {year}
            </Button>
          ))}
        </div>

        <div className="mb-6">
          <Select
            onValueChange={(value) => setSelectedSemester(value)}
            value={selectedSemester}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Semester" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((semester) => (
                <SelectItem key={semester} value={semester}>
                  {semester}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {attendanceData
          .filter((record) => record.year === selectedYear && record.semester === selectedSemester)
          .map((record, index) => (
            <Card key={index} className="mb-6">
              <CardHeader>
                <CardTitle>{record.subject}</CardTitle>
                <CardDescription>
                  Attendance Percentage: {calculateAttendancePercentage(selectedYear, selectedSemester, record.subject)}%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.status}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}