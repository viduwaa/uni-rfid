import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartColumn,
  CalendarCheck2,
  Users,
  History,
  UserCheck,
  GraduationCap,
} from "lucide-react";
import LogoutButton from "@/components/Logout";
import PageHeader from "@/components/PageHeader";

export default function LectureDashboard() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Lecturer Dashboard"
          subtitle={"Manage attendance, view reports and track participation"}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 px-5">
          {/* Get Attendance */}
          <Link href="/lecturer/getAttendance/" className="block">
            <Card className="h-full transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-blue-400">
              <CardHeader className="text-center">
                <div className="flex justify-center">
                  <UserCheck className="h-12 w-12 text-blue-600" />
                </div>
                <CardTitle className="mt-4 text-xl">Get Attendance</CardTitle>
                <CardDescription>Record students attendance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Select course, lecture hall, and start recording attendance
                  using NFC cards
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Generate Reports */}
          <Link href="/lecturer/genarateReports/" className="block">
            <Card className="h-full transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-green-400">
              <CardHeader className="text-center">
                <div className="flex justify-center">
                  <ChartColumn className="h-12 w-12 text-green-600" />
                </div>
                <CardTitle className="mt-4 text-xl">Generate Reports</CardTitle>
                <CardDescription>View attendance analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Generate detailed attendance reports by course, date range and
                  students
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* My Students */}
          <Link href="/lecturer/myStudents/" className="block">
            <Card className="h-full transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-purple-400">
              <CardHeader className="text-center">
                <div className="flex justify-center">
                  <Users className="h-12 w-12 text-purple-600" />
                </div>
                <CardTitle className="mt-4 text-xl">My Students</CardTitle>
                <CardDescription>View enrolled students</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Access student information and attendance history for your
                  courses
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Class Schedule */}
          <Link href="/lecturer/classSchedule/" className="block">
            <Card className="h-full transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-red-400">
              <CardHeader className="text-center">
                <div className="flex justify-center">
                  <CalendarCheck2 className="h-12 w-12 text-red-600" />
                </div>
                <CardTitle className="mt-4 text-xl">Class Schedule</CardTitle>
                <CardDescription>View lecturing schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Check your upcoming classes and manage your teaching schedule
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Attendance History */}
          <Link href="/lecturer/attendanceHistory/" className="block">
            <Card className="h-full transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-cyan-400">
              <CardHeader className="text-center">
                <div className="flex justify-center">
                  <History className="h-12 w-12 text-cyan-600" />
                </div>
                <CardTitle className="mt-4 text-xl">
                  Attendance History
                </CardTitle>
                <CardDescription>View past attendance records</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Review historical attendance data and track student
                  participation trends
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Student Results */}
          <Link href="/lecturer/results/" className="block">
            <Card className="h-full transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-orange-400">
              <CardHeader className="text-center">
                <div className="flex justify-center">
                  <GraduationCap className="h-12 w-12 text-orange-600" />
                </div>
                <CardTitle className="mt-4 text-xl">Student Results</CardTitle>
                <CardDescription>Manage exam results</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Add, view, and manage exam results for students in your
                  courses
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="mt-8 flex justify-end px-5">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
