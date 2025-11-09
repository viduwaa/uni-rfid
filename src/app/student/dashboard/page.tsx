"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
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
  Home,
  Key,
} from "lucide-react";
import LogoutButton from "@/components/Logout";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import { getFacultyName } from "@/lib/utils";
import { SkeletonDashboard } from "@/components/ui/skeleton";

export default function StudentDashboard() {
  const { data, loading, error } = useStudentDashboard();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedYearTab, setSelectedYearTab] = useState<number>(1);
  const [selectedSemesterTab, setSelectedSemesterTab] = useState<number>(1);
  const [transactionsCount, setTransactionsCount] = useState<number | null>(
    null
  );
  const [totalSpent, setTotalSpent] = useState<number | null>(null);
  const yearLabels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const yearColors: Record<number, string> = {
    1: "bg-pink-50 text-pink-800 dark:bg-pink-900/30 dark:text-pink-200",
    2: "bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
    3: "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200",
    4: "bg-purple-50 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200",
  };

  useEffect(() => {
    // fetch a reasonable limit of transactions to display the total count on the dashboard
    const fetchTransactionsCount = async () => {
      try {
        const res = await fetch("/api/student/transactions?limit=1000");
        if (!res.ok) return;
        const json = await res.json();
        if (json && json.success && Array.isArray(json.data)) {
          const tx = json.data as any[];
          setTransactionsCount(tx.length);
          // compute total spent for completed transactions
          const spent = tx
            .filter((t) => String(t.status).toLowerCase() === "completed")
            .reduce(
              (sum, t) =>
                sum + (parseFloat(t.amount?.toString?.() ?? "0") || 0),
              0
            );
          setTotalSpent(spent);
        }
      } catch (e) {
        // ignore errors for dashboard count/total
      }
    };

    fetchTransactionsCount();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto p-6">
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
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top bar: Greeting (center) | Profile (right) */}
        <div className="relative flex flex-col md:flex-row items-center md:justify-between mt-7 mb-10 space-y-4 md:space-y-0">
          {/* Greeting (center) */}
          <div className="flex-1 flex items-center justify-center space-x-3 px-4 md:absolute md:left-1/2 md:-translate-x-1/2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Welcome, {data?.student?.full_name || "Student"}
            </h1>
          </div>

          {/* Actions (right): Profile */}
          <div className="flex items-center space-x-3 md:ml-auto">
            <Button
              onClick={() => setIsProfileOpen(true)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
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
              {/* Profile actions (reset password moved here) */}
              <div className="pt-4 border-t mt-4">
                <div className="flex justify-center">
                  <Link href="/forgot-password">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Key className="h-4 w-4" />
                      Reset Password
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className=" backdrop-blur-sm border-blue-200">
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
              <p className="text-xs text-gray-600 dark:text-gray-300 ">Active this semester</p>
            </CardContent>
          </Card>

          <Card className=" backdrop-blur-sm border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">
                {data?.stats?.currentGPA?.toFixed(2) || "0.00"}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300">Cumulative GPA</p>
            </CardContent>
          </Card>

          <Card className=" backdrop-blur-sm border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Card Balance
              </CardTitle>
              <CreditCard className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">
                Rs. {data?.stats?.currentBalance?.toFixed(2) || "0.00"}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300">Available balance</p>
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
                  You have {data?.stats?.overdueBooks ?? 0} overdue library
                  book(s)
                </p>
              )}
              {(data?.stats?.pendingFines ?? 0) > 0 && (
                <p className="text-sm text-red-700">
                  Outstanding library fines: Rs.{" "}
                  {(data?.stats?.pendingFines ?? 0).toFixed(2)}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/student/grades" className="block group">
            <Card className="h-full transition-all hover:shadow-lg hover:scale-105 backdrop-blur-sm border-pink-200 group-hover:border-pink-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Award className="h-8 w-8 text-pink-600" />
                  <div>
                    <CardTitle className="text-lg dark:text-white">
                      Academic Results
                    </CardTitle>
                    <CardDescription className="text-sm dark:text-gray-300">
                      View grades and transcripts
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Access detailed grade reports, assignment feedback, and track
                  your academic performance across all courses.
                </p>
                {(data?.stats?.currentGPA ?? 0) > 0 && (
                  <div className="mt-3 p-2 bg-pink-50 dark:bg-pink-900/30 rounded-lg">
                    <p className="text-sm font-medium text-pink-800 dark:text-gray-300">
                      Current GPA: {(data?.stats?.currentGPA ?? 0).toFixed(2)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link href="/student/gpa-tracking" className="block group">
            <Card className="h-full transition-all hover:shadow-lg hover:scale-105 backdrop-blur-sm border-blue-200 group-hover:border-blue-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <ChartLine className="h-8 w-8 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">GPA Calculator</CardTitle>
                    <CardDescription className="text-sm">
                      Track and calculate GPA
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Monitor your cumulative GPA, semester progress, and use our
                  GPA calculator for future planning.
                </p>
                {data?.courses && data.courses.length > 0 && (
                  <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 dark:text-gray-300">
                      Enrolled Courses: {data.courses.length}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link href="/student/attendance" className="block group">
            <Card className="h-full transition-all hover:shadow-lg hover:scale-105 backdrop-blur-sm border-green-200 group-hover:border-green-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <CalendarClock className="h-8 w-8 text-green-600" />
                  <div>
                    <CardTitle className="text-lg">Attendance Record</CardTitle>
                    <CardDescription className="text-sm">
                      Monitor class attendance
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Track attendance percentages, view missed classes, and ensure
                  you meet attendance requirements.
                </p>
                {(data?.stats?.totalAttendancePercentage ?? 0) > 0 && (
                  <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Overall:{" "}
                      {(data?.stats?.totalAttendancePercentage ?? 0).toFixed(1)}
                      %
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link href="/student/transactions" className="block group">
            <Card className="h-full transition-all hover:shadow-lg hover:scale-105 backdrop-blur-sm border-orange-200 group-hover:border-orange-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-8 w-8 text-orange-600" />
                  <div>
                    <CardTitle className="text-lg">Transactions</CardTitle>
                    <CardDescription className="text-sm">
                      View payment history
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Check your canteen purchases, card balance, and transaction
                  history.
                </p>
                {totalSpent !== null ? (
                  <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                      Total Spent: Rs. {totalSpent.toFixed(2)}
                    </p>
                  </div>
                ) : transactionsCount !== null && transactionsCount > 0 ? (
                  <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                      Transactions: {transactionsCount}
                    </p>
                  </div>
                ) : (
                  (data?.stats?.currentBalance ?? 0) > 0 && (
                    <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                        Balance: Rs.{" "}
                        {(data?.stats?.currentBalance ?? 0).toFixed(2)}
                      </p>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Library Status & Current Courses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Library Status */}
          <Link href="/student/library" className="block group">
            <Card className="h-full transition-all hover:shadow-lg hover:scale-105 backdrop-blur-sm border-purple-200 group-hover:border-purple-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                  <div>
                    <CardTitle className="text-lg dark:text-white">
                      Library Status
                    </CardTitle>
                    <CardDescription className="text-sm dark:text-gray-300">
                      Active borrowed books
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                    <span className="text-sm font-medium text-purple-900 dark:text-purple-200">
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
                          className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                            {book.title}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                            by {book.author}
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Due:{" "}
                              {new Date(book.due_date).toLocaleDateString()}
                            </span>
                            {book.loan_status === "overdue" ? (
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
                  <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      {(data?.stats?.overdueBooks ?? 0) > 0 &&
                        `${data?.stats?.overdueBooks ?? 0} overdue books`}
                      {(data?.stats?.overdueBooks ?? 0) > 0 &&
                        (data?.stats?.pendingFines ?? 0) > 0 &&
                        ", "}
                      {(data?.stats?.pendingFines ?? 0) > 0 &&
                        `Rs. ${(data?.stats?.pendingFines ?? 0).toFixed(2)} fines`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>

          {/* Courses (tabbed by year + semester) */}
          {data?.courses && data.courses.length > 0 && (
            <Card className="h-full transition-all hover:shadow-lg  border-purple-200 group-hover:border-purple-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                  <div>
                    <CardTitle className="text-lg"> Courses</CardTitle>
                    <CardDescription className="text-sm">
                      View your enrolled courses by year and semester
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Year tabs */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {yearLabels.map((label, idx) => {
                      const y = idx + 1;
                      return (
                        <button
                          key={label}
                          onClick={() => setSelectedYearTab(y)}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${selectedYearTab === y ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"}`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Semester toggles */}
                  <div className="flex items-center gap-2">
                    {[1, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSemesterTab(s)}
                        className={`px-3 py-1 rounded text-sm ${selectedSemesterTab === s ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"}`}
                      >
                        {s === 1 ? "1st Semester" : "2nd Semester"}
                      </button>
                    ))}
                  </div>

                  {/* Course list filtered */}
                  <div className="grid grid-cols-1 gap-3 max-h-[360px] overflow-y-auto">
                    {data.courses
                      .filter((course: any) => {
                        // try to match year (number or string) and semester (contains 1 or 2)
                        const courseYear =
                          Number(course.year) ||
                          Number(String(course.year).match(/\d+/)?.[0]) ||
                          1;
                        const courseSem =
                          Number(String(course.semester).match(/\d+/)?.[0]) ||
                          1;
                        return (
                          courseYear === selectedYearTab &&
                          courseSem === selectedSemesterTab
                        );
                      })
                      .map((course: any) => (
                        <div
                          key={course.id}
                          className="p-3 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                        >
                          <div>
                            <div className="font-medium text-sm">
                              {course.course_code}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              {course.course_name}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${yearColors[selectedYearTab]}`}
                            >
                              {yearLabels[selectedYearTab - 1]}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {course.credits} Credits
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
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
