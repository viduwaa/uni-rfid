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
  Award,
  ChartLine,
  CalendarClock
  
} from "lucide-react";
import LogoutButton from "@/components/Logout";

export default function StudentDashboard() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-10 p-6 space-y-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-center">
            Student Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground text-center">
            Manage all aspects of the university NFC card system
          </p>
        </div>


        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 px-5">
          <Link href="/student/grades" className="block">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <Award className="h-8 w-8 text-primary" />
                <CardTitle className="mt-2">Check Grades</CardTitle>
                <CardDescription>
                  View your latest assignment and exam results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Access detailed grade reports, assignment feedback, and track your academic performance across all courses.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href=" " className="block">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <ChartLine className="h-8 w-8 text-primary" />
                <CardTitle className="mt-2">GPA Tracking</CardTitle>
                <CardDescription>
                  Monitor your cumulative GPA and semester progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  See your current GPA and track your grades over time.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href=" " className="block">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <CalendarClock className="h-8 w-8 text-primary" />
                <CardTitle className="mt-2">Check Attendance</CardTitle>
                <CardDescription>
                  Track your class attendance and participation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Monitor attendance percentages, view missed classes, and ensure you meet attendance requirements.
                </p>
              </CardContent>
            </Card>
          </Link>

        </div>

        <div className="mt-8 flex justify-end px-5">
          <LogoutButton/>
        </div>
      </div>
    </div>
  );
}
