"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Book,
  ArrowLeft,
  Loader2,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Home,
  User,
} from "lucide-react";
import Link from "next/link";

interface LibraryLoan {
  id: string;
  title: string;
  author: string;
  barcode: string;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  status: string;
  loan_status: string;
  days_overdue: number;
}

export default function StudentLibrary() {
  const [loans, setLoans] = useState<LibraryLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLibraryData();
  }, []);

  const fetchLibraryData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/student/library");

      if (!response.ok) {
        throw new Error("Failed to fetch library data");
      }

      const result = await response.json();

      if (result.success) {
        setLoans(result.data);
        setError(null);
      } else {
        throw new Error(result.message || "Failed to fetch library data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-blue-100 text-blue-800";
      case "returned":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Clock className="h-4 w-4" />;
      case "returned":
        return <CheckCircle className="h-4 w-4" />;
      case "overdue":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Book className="h-4 w-4" />;
    }
  };

  const activeLoans = loans.filter((loan) => loan.status === "active");
  const overdueLoans = loans.filter((loan) => loan.loan_status === "overdue");
  const returnedBooks = loans.filter(
    (loan) => loan.status === "returned"
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb (highest) */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-250">
          <Link
            href="/student/dashboard"
            className="flex items-center hover:text-gray-700"
          >
            <Home className="h-4 w-4 mr-1" />
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-300 font-medium">
            Library Status
          </span>
        </nav>

        {/* Back row with centered title (same horizontal line on md+) */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 mb-6">
          <div className="flex items-center">
            <Link href="/student/dashboard">
              <Button variant="outline" size="sm" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Library Status
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your borrowed books and library account
            </p>
          </div>

          <div className="hidden md:block" />
        </div>

        {/* Alert for overdue books */}
        {overdueLoans.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                <span>Overdue Books Alert</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">
                You have {overdueLoans.length} overdue book(s). Please return
                them as soon as possible to avoid additional fines.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className=" backdrop-blur-sm border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Loans
              </CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {activeLoans.length}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300">Currently borrowed</p>
            </CardContent>
          </Card>

          <Card className=" backdrop-blur-sm border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Overdue Books
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">
                {overdueLoans.length}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300">Need immediate return</p>
            </CardContent>
          </Card>

          <Card className=" backdrop-blur-sm border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Books Returned
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                {returnedBooks}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Current Loans */}
        <Card className=" backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Book className="h-5 w-5" />
              <span>Current Borrowed Books</span>
            </CardTitle>
            <CardDescription>Books you currently have on loan</CardDescription>
          </CardHeader>
          <CardContent>
            {activeLoans.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Barcode</TableHead>
                      <TableHead>Borrowed Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Days Overdue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeLoans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell className="font-medium max-w-64">
                          <div className="truncate" title={loan.title}>
                            {loan.title}
                          </div>
                        </TableCell>
                        <TableCell>{loan.author}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {loan.barcode}
                        </TableCell>
                        <TableCell>
                          {new Date(loan.borrowed_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(loan.due_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(loan.loan_status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(loan.loan_status)}
                              <span>{loan.loan_status}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {loan.days_overdue > 0 ? (
                            <span className="text-red-600 font-medium">
                              {loan.days_overdue} days
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Active Loans
                </h3>
                <p className="text-gray-600">
                  You don't have any books currently on loan.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loan History */}
        <Card className=" backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Loan History</span>
            </CardTitle>
            <CardDescription>
              Complete history of your library loans
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loans.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Borrowed Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Returned Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loans.slice(0, 10).map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell className="font-medium max-w-64">
                          <div className="truncate" title={loan.title}>
                            {loan.title}
                          </div>
                        </TableCell>
                        <TableCell>{loan.author}</TableCell>
                        <TableCell>
                          {new Date(loan.borrowed_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(loan.due_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {loan.returned_at
                            ? new Date(loan.returned_at).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(loan.loan_status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(loan.loan_status)}
                              <span>{loan.loan_status}</span>
                            </div>
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {loans.length > 10 && (
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Showing latest 10 loans of {loans.length} total
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Library History
                </h3>
                <p className="text-gray-600">
                  You haven't borrowed any books from the library yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
