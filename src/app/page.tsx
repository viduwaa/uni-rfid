import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Coffee, BookOpen, ShieldCheck } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto py-10">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight">University NFC Card System</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Manage attendance, canteen services, and student information
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="transition-all hover:shadow-md">
            <CardHeader>
              <ShieldCheck className="h-8 w-8 text-primary" />
              <CardTitle className="mt-2">Admin Portal</CardTitle>
              <CardDescription>Manage students, lecturers, and system settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Add or modify student records, manage lecturer accounts, and configure system parameters.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/admin/login" className="w-full">
                <Button className="w-full cursor-pointer">Admin Login</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="transition-all hover:shadow-md">
            <CardHeader>
              <BookOpen className="h-8 w-8 text-primary" />
              <CardTitle className="mt-2">Lecture Portal</CardTitle>
              <CardDescription>Manage class attendance and student records</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Take attendance, view student information, and manage course-related activities.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/lecture/login" className="w-full">
                <Button className="w-full cursor-pointer" variant="outline">
                  Lecture Login
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="transition-all hover:shadow-md">
            <CardHeader>
              <Coffee className="h-8 w-8 text-primary" />
              <CardTitle className="mt-2">Canteen Portal</CardTitle>
              <CardDescription>Manage canteen transactions and services</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Process food purchases, manage meal plans, and track student canteen usage.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/canteen/login" className="w-full">
                <Button className="w-full cursor-pointer" variant="outline">
                  Canteen Login
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
