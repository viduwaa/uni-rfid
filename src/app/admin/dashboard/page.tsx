import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    GraduationCap,
    UserCheck,
    BookOpen,
    BarChart3,
    IdCard,
    UserPlus,
    Users,
    Wallet,
} from "lucide-react";
import LogoutButton from "@/components/Logout";

export default function AdminDashboard() {
    return (
        <div className="min-h-screen">
            <div className="mb-10 bg-[rgba(255,255,255,0.47)] h-[100px] flex flex-col items-center justify-center w-full">
                <h1 className="text-3xl font-bold tracking-tight text-center">
                    Admin Dashboard
                </h1>
                <p className="mt-2 text-muted-foreground text-center">
                    Manage all aspects of the university NFC card system
                </p>
            </div>
            <div className="container mx-auto py-10 p-6 space-y-8">
                {/* Main Management Sections */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 px-5">
                    {/* Students Section */}
                    <Link href="/admin/students" className="block">
                        <Card className="h-full transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-blue-400">
                            <CardHeader className="text-center">
                                <div className="flex justify-center">
                                    <GraduationCap className="h-12 w-12 text-blue-600" />
                                </div>
                                <CardTitle className="mt-4 text-xl">
                                    Students
                                </CardTitle>
                                <CardDescription>
                                    Student management system
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground text-center">
                                    Add, edit, delete students and manage course
                                    enrollments
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Lecturers Section */}
                    <Link href="/admin/lecturers" className="block">
                        <Card className="h-full transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-green-400">
                            <CardHeader className="text-center">
                                <div className="flex justify-center">
                                    <UserCheck className="h-12 w-12 text-green-600" />
                                </div>
                                <CardTitle className="mt-4 text-xl">
                                    Lecturers
                                </CardTitle>
                                <CardDescription>
                                    Lecturer management system
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground text-center">
                                    Add, edit, delete lecturers and assign
                                    courses
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Courses Section */}
                    <Link href="/admin/courses" className="block">
                        <Card className="h-full transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-purple-400">
                            <CardHeader className="text-center">
                                <div className="flex justify-center">
                                    <BookOpen className="h-12 w-12 text-purple-600" />
                                </div>
                                <CardTitle className="mt-4 text-xl">
                                    Courses
                                </CardTitle>
                                <CardDescription>
                                    Course management system
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground text-center">
                                    Add, edit, delete courses and view
                                    enrollment stats
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Reports Section */}
                    <Link href="/admin/reports" className="block">
                        <Card className="h-full transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-red-400">
                            <CardHeader className="text-center">
                                <div className="flex justify-center">
                                    <BarChart3 className="h-12 w-12 text-red-600" />
                                </div>
                                <CardTitle className="mt-4 text-xl">
                                    Reports
                                </CardTitle>
                                <CardDescription>
                                    Analytics & statistics
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground text-center">
                                    View attendance reports and system analytics
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Quick Actions & RFID Management */}
                <div className="px-5">
                    <h2 className="text-xl font-semibold mb-4">
                        Quick Actions & Card Management
                    </h2>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {/* Quick Add Student */}
                        <Link href="/admin/students/add" className="block">
                            <Card className="h-full transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-cyan-400">
                                <CardHeader className="text-center">
                                    <div className="flex justify-center">
                                        <UserPlus className="h-12 w-12 text-cyan-600" />
                                    </div>
                                    <CardTitle className="mt-4 text-xl">
                                        Quick Add Student
                                    </CardTitle>
                                    <CardDescription>
                                        Fast student registration
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground text-center">
                                        Quickly register a new student with
                                        basic details
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Quick Add Lecturer */}
                        <Link href="/admin/lecturers/add" className="block">
                            <Card className="h-full transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-indigo-400">
                                <CardHeader className="text-center">
                                    <div className="flex justify-center">
                                        <Users className="h-12 w-12 text-indigo-600" />
                                    </div>
                                    <CardTitle className="mt-4 text-xl">
                                        Quick Add Lecturer
                                    </CardTitle>
                                    <CardDescription>
                                        Fast lecturer registration
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground text-center">
                                        Quickly register a new lecturer with
                                        basic details
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* RFID Card Management */}
                        <Link href="/admin/rfid" className="block">
                            <Card className="h-full transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-orange-400">
                                <CardHeader className="text-center">
                                    <div className="flex justify-center">
                                        <IdCard className="h-12 w-12 text-orange-600" />
                                    </div>
                                    <CardTitle className="mt-4 text-xl">
                                        RFID Cards
                                    </CardTitle>
                                    <CardDescription>
                                        Issue & manage cards
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground text-center">
                                        Issue new cards and manage card
                                        registrations
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Recharge Cards */}
                        <Link href="/admin/rfid/recharge" className="block">
                            <Card className="h-full transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-emerald-400">
                                <CardHeader className="text-center">
                                    <div className="flex justify-center">
                                        <Wallet className="h-12 w-12 text-emerald-600" />
                                    </div>
                                    <CardTitle className="mt-4 text-xl">
                                        Recharge Cards
                                    </CardTitle>
                                    <CardDescription>
                                        Add balance to cards
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground text-center">
                                        Recharge student cards and manage
                                        balance top-ups
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>

                <div className="mt-8 flex justify-end px-5">
                    <LogoutButton />
                </div>
            </div>
        </div>
    );
}
