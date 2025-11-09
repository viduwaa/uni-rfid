"use client";
import Link from "next/link";
import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Award,
    ChartLine,
    CalendarClock,
    CreditCard,
    BookOpen,
    AlertTriangle,
    User,
    GraduationCap,
    TrendingUp,
    Info,
} from "lucide-react";
import LogoutButton from "@/components/Logout";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import { getFacultyName } from "@/lib/utils";
import { SkeletonDashboard } from "@/components/ui/skeleton";

export default function StudentDashboard() {
    const { data, loading, error } = useStudentDashboard();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="container mx-auto py-10 p-6">
                    <SkeletonDashboard />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-96">
                    <CardHeader>
                        <CardTitle className="text-red-600">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto py-10 p-6 space-y-8">
                {/* Header Section */}
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-2">
                        <GraduationCap className="h-8 w-8 text-blue-600" />
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                            Welcome, {data?.student?.full_name || "Student"}
                        </h1>
                    </div>
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                        <Badge variant="outline">
                            {data?.student?.register_number}
                        </Badge>
                        <Badge variant="outline">
                            {getFacultyName(data?.student?.faculty || "")}
                        </Badge>
                        <Badge variant="outline">
                            Year {data?.student?.year_of_study}
                        </Badge>
                    </div>
                    <div className="mt-4">
                        <Button
                            onClick={() => setIsProfileOpen(true)}
                            variant="outline"
                            className="flex items-center space-x-2"
                        >
                            <Info className="h-4 w-4" />
                            <span>View Profile Summary</span>
                        </Button>
                    </div>
                </div>

                {/* Profile Summary Dialog */}
                <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                                <User className="h-5 w-5 text-blue-600" />
                                <span>Student Profile Summary</span>
                            </DialogTitle>
                            <DialogDescription>
                                Your complete student information
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-start pb-3 border-b">
                                    <span className="text-sm text-gray-600 font-medium">
                                        Full Name:
                                    </span>
                                    <span className="font-semibold text-right">
                                        {data?.student?.full_name}
                                    </span>
                                </div>
                                <div className="flex justify-between items-start pb-3 border-b">
                                    <span className="text-sm text-gray-600 font-medium">
                                        Student ID:
                                    </span>
                                    <span className="font-semibold">
                                        {data?.student?.register_number}
                                    </span>
                                </div>
                                <div className="flex justify-between items-start pb-3 border-b">
                                    <span className="text-sm text-gray-600 font-medium">
                                        Faculty:
                                    </span>
                                    <span className="font-semibold text-right">
                                        {getFacultyName(data?.student?.faculty || "")}
                                    </span>
                                </div>
                                <div className="flex justify-between items-start pb-3 border-b">
                                    <span className="text-sm text-gray-600 font-medium">
                                        Year of Study:
                                    </span>
                                    <span className="font-semibold">
                                        Year {data?.student?.year_of_study}
                                    </span>
                                </div>
                                <div className="flex justify-between items-start pb-3 border-b">
                                    <span className="text-sm text-gray-600 font-medium">
                                        Email:
                                    </span>
                                    <span className="font-semibold text-right break-all">
                                        {data?.student?.email}
                                    </span>
                                </div>
                                <div className="flex justify-between items-start pb-3 border-b">
                                    <span className="text-sm text-gray-600 font-medium">
                                        Current GPA:
                                    </span>
                                    <span className="font-semibold">
                                        {data?.stats?.currentGPA?.toFixed(2) || "0.00"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-start pb-3 border-b">
                                    <span className="text-sm text-gray-600 font-medium">
                                        Enrolled Courses:
                                    </span>
                                    <span className="font-semibold">
                                        {data?.stats?.totalCourses || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between items-start">
                                    <span className="text-sm text-gray-600 font-medium">
                                        Card Balance:
                                    </span>
                                    <span className="font-semibold">
                                        Rs. {data?.stats?.currentBalance?.toFixed(2) || "0.00"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Enrolled Courses
                            </CardTitle>
                            <BookOpen className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-700">
                                {data?.stats?.totalCourses || 0}
                            </div>
                            <p className="text-xs text-gray-600">
                                Active this semester
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Current GPA
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-700">
                                {data?.stats?.currentGPA?.toFixed(2) || "0.00"}
                            </div>
                            <p className="text-xs text-gray-600">
                                Cumulative GPA
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Card Balance
                            </CardTitle>
                            <CreditCard className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-700">
                                Rs.{" "}
                                {data?.stats?.currentBalance?.toFixed(2) ||
                                    "0.00"}
                            </div>
                            <p className="text-xs text-gray-600">
                                Available balance
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Alerts */}
                {((data?.stats?.overdueBooks ?? 0) > 0 ||
                    (data?.stats?.pendingFines ?? 0) > 0) && (
                    <Card className="border-red-200 bg-red-50">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 text-red-800">
                                <AlertTriangle className="h-5 w-5" />
                                <span>Attention Required</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {(data?.stats?.overdueBooks ?? 0) > 0 && (
                                <p className="text-sm text-red-700">
                                    You have {data?.stats?.overdueBooks ?? 0}{" "}
                                    overdue library book(s)
                                </p>
                            )}
                            {(data?.stats?.pendingFines ?? 0) > 0 && (
                                <p className="text-sm text-red-700">
                                    Outstanding library fines: Rs.{" "}
                                    {(data?.stats?.pendingFines ?? 0).toFixed(
                                        2
                                    )}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Main Navigation Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Link href="/student/grades" className="block group">
                        <Card className="h-full transition-all hover:shadow-lg hover:scale-105 bg-white/80 backdrop-blur-sm border-pink-200 group-hover:border-pink-300">
                            <CardHeader>
                                <div className="flex items-center space-x-3">
                                    <Award className="h-8 w-8 text-pink-600" />
                                    <div>
                                        <CardTitle className="text-lg">
                                            Academic Results
                                        </CardTitle>
                                        <CardDescription className="text-sm">
                                            View grades and transcripts
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600">
                                    Access detailed grade reports, assignment
                                    feedback, and track your academic
                                    performance across all courses.
                                </p>
                                {(data?.stats?.currentGPA ?? 0) > 0 && (
                                    <div className="mt-3 p-2 bg-pink-50 rounded-lg">
                                        <p className="text-sm font-medium text-pink-800">
                                            Current GPA:{" "}
                                            {(
                                                data?.stats?.currentGPA ?? 0
                                            ).toFixed(2)}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/student/gpa-tracking" className="block group">
                        <Card className="h-full transition-all hover:shadow-lg hover:scale-105 bg-white/80 backdrop-blur-sm border-blue-200 group-hover:border-blue-300">
                            <CardHeader>
                                <div className="flex items-center space-x-3">
                                    <ChartLine className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <CardTitle className="text-lg">
                                            GPA Calculator
                                        </CardTitle>
                                        <CardDescription className="text-sm">
                                            Track and calculate GPA
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600">
                                    Monitor your cumulative GPA, semester
                                    progress, and use our GPA calculator for
                                    future planning.
                                </p>
                                {data?.courses && data.courses.length > 0 && (
                                    <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                                        <p className="text-sm font-medium text-blue-800">
                                            Enrolled Courses:{" "}
                                            {data.courses.length}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/student/attendance" className="block group">
                        <Card className="h-full transition-all hover:shadow-lg hover:scale-105 bg-white/80 backdrop-blur-sm border-green-200 group-hover:border-green-300">
                            <CardHeader>
                                <div className="flex items-center space-x-3">
                                    <CalendarClock className="h-8 w-8 text-green-600" />
                                    <div>
                                        <CardTitle className="text-lg">
                                            Attendance Record
                                        </CardTitle>
                                        <CardDescription className="text-sm">
                                            Monitor class attendance
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600">
                                    Track attendance percentages, view missed
                                    classes, and ensure you meet attendance
                                    requirements.
                                </p>
                                {(data?.stats?.totalAttendancePercentage ?? 0) >
                                    0 && (
                                    <div className="mt-3 p-2 bg-green-50 rounded-lg">
                                        <p className="text-sm font-medium text-green-800">
                                            Overall:{" "}
                                            {(
                                                data?.stats
                                                    ?.totalAttendancePercentage ??
                                                0
                                            ).toFixed(1)}
                                            %
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/student/transactions" className="block group">
                        <Card className="h-full transition-all hover:shadow-lg hover:scale-105 bg-white/80 backdrop-blur-sm border-orange-200 group-hover:border-orange-300">
                            <CardHeader>
                                <div className="flex items-center space-x-3">
                                    <CreditCard className="h-8 w-8 text-orange-600" />
                                    <div>
                                        <CardTitle className="text-lg">
                                            Transactions
                                        </CardTitle>
                                        <CardDescription className="text-sm">
                                            View payment history
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600">
                                    Check your canteen purchases, card balance,
                                    and transaction history.
                                </p>
                                {(data?.stats?.currentBalance ?? 0) > 0 && (
                                    <div className="mt-3 p-2 bg-orange-50 rounded-lg">
                                        <p className="text-sm font-medium text-orange-800">
                                            Balance: Rs.{" "}
                                            {(
                                                data?.stats?.currentBalance ?? 0
                                            ).toFixed(2)}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Library Status & Current Courses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Library Status */}
                    <Link href="/student/library" className="block group">
                        <Card className="h-full transition-all hover:shadow-lg hover:scale-105 bg-white/80 backdrop-blur-sm border-purple-200 group-hover:border-purple-300">
                            <CardHeader>
                                <div className="flex items-center space-x-3">
                                    <BookOpen className="h-8 w-8 text-purple-600" />
                                    <div>
                                        <CardTitle className="text-lg">
                                            Library Status
                                        </CardTitle>
                                        <CardDescription className="text-sm">
                                            Active borrowed books
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                        <span className="text-sm font-medium text-purple-900">
                                            Active Books:
                                        </span>
                                        <Badge variant="default" className="bg-purple-600">
                                            {data?.stats?.activeBorrowedBooks || 0}
                                        </Badge>
                                    </div>
                                    
                                    {data?.borrowedBooks && data.borrowedBooks.length > 0 ? (
                                        <div className="space-y-2 max-h-[250px] overflow-y-auto">
                                            {data.borrowedBooks.slice(0, 3).map((book) => (
                                                <div
                                                    key={book.id}
                                                    className="p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                                >
                                                    <div className="font-medium text-sm text-gray-900 truncate">
                                                        {book.title}
                                                    </div>
                                                    <div className="text-xs text-gray-600 mt-1">
                                                        by {book.author}
                                                    </div>
                                                    <div className="flex justify-between items-center mt-2">
                                                        <span className="text-xs text-gray-500">
                                                            Due: {new Date(book.due_date).toLocaleDateString()}
                                                        </span>
                                                        {book.loan_status === 'overdue' ? (
                                                            <Badge variant="destructive" className="text-xs">
                                                                Overdue
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-xs">
                                                                Active
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {data.borrowedBooks.length > 3 && (
                                                <p className="text-xs text-gray-500 text-center pt-2">
                                                    +{data.borrowedBooks.length - 3} more books
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-600 text-center py-4">
                                            No active borrowed books
                                        </p>
                                    )}
                                </div>
                                
                                {((data?.stats?.overdueBooks ?? 0) > 0 ||
                                    (data?.stats?.pendingFines ?? 0) > 0) && (
                                    <div className="mt-3 p-2 bg-red-50 rounded-lg">
                                        <p className="text-sm font-medium text-red-800">
                                            {(data?.stats?.overdueBooks ?? 0) >
                                                0 &&
                                                `${data?.stats?.overdueBooks ?? 0} overdue books`}
                                            {(data?.stats?.overdueBooks ?? 0) >
                                                0 &&
                                                (data?.stats?.pendingFines ??
                                                    0) > 0 &&
                                                ", "}
                                            {(data?.stats?.pendingFines ?? 0) >
                                                0 &&
                                                `Rs. ${(data?.stats?.pendingFines ?? 0).toFixed(2)} fines`}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Current Courses */}
                    {data?.courses && data.courses.length > 0 && (
                        <Card className="bg-white/80 backdrop-blur-sm h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <BookOpen className="h-5 w-5" />
                                    <span>Current Courses</span>
                                </CardTitle>
                                <CardDescription>
                                    Courses you are enrolled in this semester
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto">
                                    {data.courses.slice(0, 6).map((course) => (
                                        <div
                                            key={course.id}
                                            className="p-4 border rounded-lg bg-gray-50"
                                        >
                                            <div className="font-medium text-sm">
                                                {course.course_code}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {course.course_name}
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {course.credits} Credits
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    Year {course.year}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {data.courses.length > 6 && (
                                    <p className="text-sm text-gray-500 mt-4 text-center">
                                        +{data.courses.length - 6} more courses
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Logout Button */}
                <div className="flex justify-end">
                    <LogoutButton />
                </div>
            </div>
        </div>
    );
}
