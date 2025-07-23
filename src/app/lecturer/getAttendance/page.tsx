import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Clock, GraduationCap, Play } from "lucide-react"
import Link from "next/link"

export default function GetAttendance() {
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedHall, setSelectedHall] = useState("")

  const currentDateTime = new Date().toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })

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
          <h1 className="text-3xl font-bold text-gray-900">Get Attendance</h1>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Session Setup Card */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Session Setup</CardTitle>
              <p className="text-sm text-gray-600">Configure your attendance session</p>
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
                    <SelectItem value="math201">Mathematics 201</SelectItem>
                    <SelectItem value="phys301">Physics 301</SelectItem>
                    <SelectItem value="eng102">English 102</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Lecture Hall Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Lecture Hall</label>
                <Select value={selectedHall} onValueChange={setSelectedHall}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Lecture Hall" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hall-a">Hall A</SelectItem>
                    <SelectItem value="hall-b">Hall B</SelectItem>
                    <SelectItem value="hall-c">Hall C</SelectItem>
                    <SelectItem value="auditorium">Main Auditorium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Current Date & Time */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Current Date & Time</label>
                <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{currentDateTime}</span>
                </div>
              </div>

              {/* Start Button */}
              <Link href="#">
                <Button
                  className="w-full bg-black hover:bg-gray-800 text-white py-3"
                  disabled={!selectedCourse || !selectedHall}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Attendance Session
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Live Attendance Card */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold">Live Attendance</CardTitle>
                  <p className="text-sm text-gray-600">Start a session to begin recording attendance</p>
                </div>
                <div className="flex gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">100</div>
                    <div className="text-xs text-gray-500">Present</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-700">117</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">85%</div>
                    <div className="text-xs text-gray-500">Rate</div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-6">
                  <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-2" />
                </div>
                <p className="text-gray-500 text-sm max-w-xs">Select a course and lecture hall to view attendance</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
