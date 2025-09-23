import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartColumn,
  CalendarCheck2,
  Users,
  History,
  UserCheck,
} from "lucide-react";

export default function LectureDashboard() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-10 p-6 space-y-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-center">
            Lecture Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground text-center">
            Manage  attendance, view reports and track  participation 
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 px-5">
          <Link href="/lecturer/getAttendance/" className="block">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <UserCheck className="h-8 w-8 text-primary" />
                <CardTitle className="mt-2">Get Attendance</CardTitle>
                <CardDescription>
                  Record students attendance for your classes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Select course, lecture hall, and start recordings attendance using NFC cards.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/lecturer/genarateReports/" className="block">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <ChartColumn className="h-8 w-8 text-primary" />
                <CardTitle className="mt-2">Generate Reports</CardTitle>
                <CardDescription>
                  View attendance reports and analytics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generate detailed attendance reports by course, date range and students.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/lecturer/myStudents/" className="block">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <Users className="h-8 w-8 text-primary" />
                <CardTitle className="mt-2">My Students</CardTitle>
                <CardDescription>
                  View students enrolled in your courses and add marks.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Access students information, add marks and attendance history for your course.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/lecturer/classSchedule/" className="block">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <CalendarCheck2 className="h-8 w-8 text-primary" />
                <CardTitle className="mt-2">Class Schedule</CardTitle>
                <CardDescription>View your lecturing schedule.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Check your upcoming classes and manage your teaching schedule.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/lecturer/attendanceHistory/" className="block">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <History className="h-8 w-8 text-primary" />
                <CardTitle className="mt-2">Attendance History</CardTitle>
                <CardDescription>View past attendance records</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Review historical attendance date and track students participation trends.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="mt-8 flex justify-end px-5">
          <Link href="/">
            <Button variant="outline">Logout</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
