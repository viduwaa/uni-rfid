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
    UserPlus,
    IdCard,
    Users,
    BookOpen,
    BarChart3,
    Settings,
    GraduationCap,
    UserCheck,
    Library,
} from "lucide-react";
import LogoutButton from "@/components/Logout";

export default function AdminDashboard() {
    return (
        <div className="min-h-screen">
            <div className="container mx-auto py-10 p-6 space-y-6">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold tracking-tight text-center">
                        Admin Dashboard
                    </h1>
                    <p className="mt-2 text-muted-foreground text-center">
                        Manage all aspects of the university NFC card system
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 px-5">
                    {/* Student Management */}
                    <Link href="/admin/students" className="block">
                        <Card className="h-full transition-all hover:shadow-md hover:scale-105">
                            <CardHeader>
                                <GraduationCap className="h-8 w-8 text-blue-600" />
                                <CardTitle className="mt-2">
                                    Manage Students
                                </CardTitle>
                                <CardDescription>
                                    Complete student management & course
                                    enrollment
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Add, edit, delete students and manage their
                                    course enrollments with full CRUD
                                    operations.
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Lecturer Management */}
                    <Link href="/admin/lecturers" className="block">
                        <Card className="h-full transition-all hover:shadow-md hover:scale-105">
                            <CardHeader>
                                <UserCheck className="h-8 w-8 text-green-600" />
                                <CardTitle className="mt-2">
                                    Manage Lecturers
                                </CardTitle>
                                <CardDescription>
                                    Complete lecturer management & course
                                    assignments
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Add, edit, delete lecturers and assign them
                                    to courses they teach.
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Course Management */}
                    <Link href="/admin/courses" className="block">
                        <Card className="h-full transition-all hover:shadow-md hover:scale-105">
                            <CardHeader>
                                <Library className="h-8 w-8 text-purple-600" />
                                <CardTitle className="mt-2">
                                    Manage Courses
                                </CardTitle>
                                <CardDescription>
                                    Complete course/subject management system
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Add, edit, delete courses and view
                                    enrollment statistics and lecturer
                                    assignments.
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* RFID Card Management */}
                    <Link href="/admin/rfid" className="block">
                        <Card className="h-full transition-all hover:shadow-md hover:scale-105">
                            <CardHeader>
                                <IdCard className="h-8 w-8 text-orange-600" />
                                <CardTitle className="mt-2">
                                    RFID Cards
                                </CardTitle>
                                <CardDescription>
                                    Issue and manage NFC/RFID cards
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Issue new cards, manage existing cards, and
                                    handle card registrations.
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Quick Add Student */}
                    <Link href="/admin/students/add" className="block">
                        <Card className="h-full transition-all hover:shadow-md hover:scale-105">
                            <CardHeader>
                                <UserPlus className="h-8 w-8 text-cyan-600" />
                                <CardTitle className="mt-2">
                                    Quick Add Student
                                </CardTitle>
                                <CardDescription>
                                    Fast student registration
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Quickly register a new student with basic
                                    details.
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Quick Add Lecturer */}
                    <Link href="/admin/lecturers/add" className="block">
                        <Card className="h-full transition-all hover:shadow-md hover:scale-105">
                            <CardHeader>
                                <BookOpen className="h-8 w-8 text-indigo-600" />
                                <CardTitle className="mt-2">
                                    Quick Add Lecturer
                                </CardTitle>
                                <CardDescription>
                                    Fast lecturer registration
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Quickly register a new lecturer with basic
                                    details.
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Reports & Analytics */}
                    <Link href="/admin/reports" className="block">
                        <Card className="h-full transition-all hover:shadow-md hover:scale-105">
                            <CardHeader>
                                <BarChart3 className="h-8 w-8 text-red-600" />
                                <CardTitle className="mt-2">
                                    Reports & Analytics
                                </CardTitle>
                                <CardDescription>
                                    System usage and statistics
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    View attendance reports, enrollment
                                    statistics, and system analytics.
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* System Settings */}
                    <Link href="/admin/settings" className="block">
                        <Card className="h-full transition-all hover:shadow-md hover:scale-105">
                            <CardHeader>
                                <Settings className="h-8 w-8 text-gray-600" />
                                <CardTitle className="mt-2">
                                    System Settings
                                </CardTitle>
                                <CardDescription>
                                    Configure system preferences
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Manage system settings, user permissions,
                                    and configurations.
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
