"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  Users,
  BarChart3,
  Download,
  FileBarChart,
  Link,
} from "lucide-react";

export default function GenerateReports() {
  const [reportType, setReportType] = useState("session-reports");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const statisticsData = [
    {
      title: "Total Session",
      value: "3",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Avg Attendance",
      value: "92.2%",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Students",
      value: "3",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Good Attendance",
      value: "3",
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const attendanceData = [
    {
      date: "2024-01-15",
      course: "CS101",
      hall: "Lecture Hall A",
      present: 42,
      total: 45,
      rate: 93.3,
      duration: "1h 30m",
    },
    {
      date: "2024-01-14",
      course: "CS201",
      hall: "Computer Lab 1",
      present: 28,
      total: 30,
      rate: 93.3,
      duration: "2h 00m",
    },
    {
      date: "2024-01-13",
      course: "CS301",
      hall: "Lecture Hall B",
      present: 45,
      total: 50,
      rate: 90.0,
      duration: "1h 45m",
    },
  ];

  const handleGenerateReport = () => {
    console.log("Generating report with:", {
      reportType,
      selectedCourse,
      startDate,
      endDate,
    });
  };

  const handleExportCSV = () => {
    console.log("Exporting to CSV...");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/lecturer/dashboard">
            <Button variant="outline" size="icon" className="rounded-lg bg-transparent">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Generate Reports</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Report Filter Card */}
          <Card className="bg-white shadow-sm lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Report Filter
              </CardTitle>
              <p className="text-sm text-gray-600">
                Configure your report parameters
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Report Type
                </label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="session-reports">
                      Session Reports
                    </SelectItem>
                    <SelectItem value="student-reports">
                      Student Reports
                    </SelectItem>
                    <SelectItem value="course-reports">
                      Course Reports
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Course Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Course
                </label>
                <Select
                  value={selectedCourse}
                  onValueChange={setSelectedCourse}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cs101">Computer Science 101</SelectItem>
                    <SelectItem value="cs201">Computer Science 201</SelectItem>
                    <SelectItem value="cs301">Computer Science 301</SelectItem>
                    <SelectItem value="math201">Mathematics 201</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Button
                  className="w-full bg-black hover:bg-gray-800 text-white py-3 cursor-pointer"
                  onClick={handleGenerateReport}
                >
                  <FileBarChart className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
                <Button
                  variant="outline"
                  className="w-full py-3 cursor-pointer bg-transparent"
                  onClick={handleExportCSV}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export to CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right Side Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statisticsData.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <Card key={index} className="bg-white shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            {stat.title}
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {stat.value}
                          </p>
                        </div>
                        <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                          <IconComponent className={`h-5 w-5 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Session Attendance Reports Table */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Session Attendance Reports
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Detailed attendance data for each session
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">
                          Course
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">
                          Hall
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">
                          Present/Total
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">
                          Attendance Rate
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">
                          Duration
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceData.map((row, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {row.date}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {row.course}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {row.hall}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {row.present}/{row.total}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm font-medium text-green-600">
                              {row.rate}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {row.duration}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
