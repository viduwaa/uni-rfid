import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coffee, BookOpen, ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/ui/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen px-5" >
      <div className="container mx-auto py-10">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            University NFC Card System
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Manage attendance, canteen services, and student information
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="transition-all hover:shadow-md">
            <CardHeader>
              <ShieldCheck className="h-8 w-8 text-primary" />
              <CardTitle className="mt-2">Admin Portal</CardTitle>
              <CardDescription>
                Manage students, lecturers, and system settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Add or modify student records, manage lecturer accounts, and
                configure system parameters.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/admin/adminlogin" className="w-full">
                <Button className="w-full cursor-pointer" variant="outline">
                  Admin Login
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="transition-all hover:shadow-md">
            <CardHeader>
              <BookOpen className="h-8 w-8 text-primary" />
              <CardTitle className="mt-2">Lecture Portal</CardTitle>
              <CardDescription>
                Manage class attendance and student records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Take attendance, view student information, and manage
                course-related activities.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/admin/lecturerlogin" className="w-full">
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
              <CardDescription>
                Manage canteen transactions and services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Process food purchases, manage meal plans, and track student
                canteen usage.
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

          <Card className="transition-all hover:shadow-md">
            <CardHeader>
              <Coffee className="h-8 w-8 text-primary" />
              <CardTitle className="mt-2">Library Portal</CardTitle>
              <CardDescription>
                Manage book inventories, borrowing records, and fines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track issued books, handle returns, manage library users, and
                update book availability and categories.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/canteen/login" className="w-full">
                <Button className="w-full cursor-pointer" variant="outline">
                  Library Login
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="transition-all hover:shadow-md">
            <CardHeader>
              <Coffee className="h-8 w-8 text-primary" />
              <CardTitle className="mt-2">Student Portal</CardTitle>
              <CardDescription>
                View academic performance and personal records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Check grades, GPA, attendance, and access course-related
                information. Stay updated with academic progress and
                notifications.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/canteen/login" className="w-full">
                <Button className="w-full cursor-pointer" variant="outline">
                  Student Login
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
