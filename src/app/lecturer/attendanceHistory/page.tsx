"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Calendar, TrendingUp, Users, BarChart3, Download, FileBarChart } from "lucide-react"
import Link from "next/link"

export default function AttendanceHistory() {
  const [selectedCourse, setSelectedCourse] = useState("")
  const [dateRangeEnabled, setDateRangeEnabled] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

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
  ]

  // Session data (when date range is enabled)
  const sessionData = [
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
  ]

  // Student data (when date range is disabled)
  const studentData = [
    {
      registrationNo: "ITT/2022/084",
      index: "2056",
      name: "S.K.P.Sanidu",
      present: 3,
      total: 5,
      rate: 60.0,
      result: "A-",
    },
    {
      registrationNo: "ITT/2022/038",
      index: "2056",
      name: "L.K.Nuwan",
      present: 4,
      total: 5,
      rate: 80.0,
      result: "B-",
    },
    {
      registrationNo: "ITT/2022/045",
      index: "2056",
      name: "J.K.Ruwani",
      present: 1,
      total: 5,
      rate: 20.0,
      result: "C+",
    },
  ]

  const handleGenerateReport = () => {
    console.log("Generating report with:", {
      selectedCourse,
      dateRangeEnabled,
      startDate,
      endDate,
    })
  }

  const handleExportCSV = () => {
    console.log("Exporting to CSV...")
  }

  const getRateColor = (rate: number) => {
    if (rate >= 80) return "text-green-600"
    if (rate >= 60) return "text-yellow-600"
    return "text-red-600"
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Attendance History</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Attendance Filter Card */}
          <Card className="bg-white shadow-sm lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Attendance Filter</CardTitle>
              <p className="text-sm text-gray-600">Configure your attendance parameters</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Course Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Course</label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
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

              {/* Date Range Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="dateRange"
                  checked={dateRangeEnabled}
                  onChange={(e) => setDateRangeEnabled(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="dateRange" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Date Range
                </label>
              </div>

              {/* Conditional Date Fields */}
              {dateRangeEnabled && (
                <>
                  {/* Start Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Select Date</label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full"
                      placeholder="mm/dd/yyyy"
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">End Date</label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full"
                      placeholder="mm/dd/yyyy"
                    />
                  </div>
                </>
              )}

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
                const IconComponent = stat.icon
                return (
                  <Card key={index} className="bg-white shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">{stat.title}</p>
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                        <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                          <IconComponent className={`h-5 w-5 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Dynamic Report Table */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  {dateRangeEnabled ? "Session Attendance Report" : "Attendance Report"}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {dateRangeEnabled
                    ? "Detailed attendance data for each session"
                    : "Detailed attendance data for each session"}
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  {dateRangeEnabled ? (
                    // Session Report Table
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Course</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Hall</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Present/Total</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Rate</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Duration</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessionData.map((row, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-900">{row.date}</td>
                            <td className="py-3 px-4 text-sm text-gray-900">{row.course}</td>
                            <td className="py-3 px-4 text-sm text-gray-900">{row.hall}</td>
                            <td className="py-3 px-4 text-sm text-gray-900">
                              {row.present}/{row.total}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-sm font-medium ${getRateColor(row.rate)}`}>{row.rate}%</span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-900">{row.duration}</td>
                            <td className="py-3 px-4">
                              <Button variant="outline" size="sm" className="text-xs bg-transparent">
                                See details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    // Student Report Table
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Registration No</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Index</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Present/Total</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Rate</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentData.map((row, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-900">{row.registrationNo}</td>
                            <td className="py-3 px-4 text-sm text-gray-900">{row.index}</td>
                            <td className="py-3 px-4 text-sm text-gray-900">{row.name}</td>
                            <td className="py-3 px-4 text-sm text-gray-900">
                              {row.present}/{row.total}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-sm font-medium ${getRateColor(row.rate)}`}>{row.rate}%</span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-900 font-medium">{row.result}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
