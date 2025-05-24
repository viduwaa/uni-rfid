import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus,IdCard , Users, BookOpen, BarChart3, Settings } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-center">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground text-center">Manage all aspects of the university NFC card system</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 px-5">
          <Link href="/admin/students/add" className="block">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <UserPlus className="h-8 w-8 text-primary" />
                <CardTitle className="mt-2">Add Student</CardTitle>
                <CardDescription>Register new students in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Add student details including photo, name, register number, and email.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/lecturers/add" className="block">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-primary" />
                <CardTitle className="mt-2">Add Lecturer</CardTitle>
                <CardDescription>Register new lecturers in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Add lecturer details including photo, name, department, and contact information.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/students/add" className="block">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <IdCard  className="h-8 w-8 text-primary" />
                <CardTitle className="mt-2">Manage RFID Cards</CardTitle>
                <CardDescription>Register new cards or manage the cards</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Access card details, edit currency and payments
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/students" className="block">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <Users className="h-8 w-8 text-primary" />
                <CardTitle className="mt-2">Manage Students</CardTitle>
                <CardDescription>View and edit student records</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Search, view, edit, or delete student information in the system.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/reports" className="block">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-primary" />
                <CardTitle className="mt-2">Reports</CardTitle>
                <CardDescription>View system usage statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Access attendance reports, canteen usage, and other system analytics.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/settings" className="block">
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <Settings className="h-8 w-8 text-primary" />
                <CardTitle className="mt-2">Settings</CardTitle>
                <CardDescription>Configure system parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Adjust system settings, permissions, and integration options.
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
  )
}
