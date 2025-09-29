"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    BookX,
    ArrowLeft,
    Loader2,
    Search,
    QrCode,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    CreditCard,
    User,
    RefreshCw,
    BookOpen,
} from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import RFIDStudentReader from "@/components/RFIDStudentReader";
import type { LoanWithDetails } from "@/types/library";

interface ReturnItem extends Omit<LoanWithDetails, "days_overdue"> {
    fine_amount?: number;
    return_date: string;
    is_late: boolean;
    days_overdue?: number;
}

interface VerifiedStudent {
    user_id: string;
    register_number: string;
    full_name: string;
    email: string;
    faculty: string;
    year_of_study: number;
    card_uid: string;
    balance: number;
    card_status: string;
    current_loans: number;
    overdue_loans: number;
    pending_fines: number;
    membership_status: string;
    max_books_allowed: number;
}

export default function BookReturns() {
    const [studentSearch, setStudentSearch] = useState("");
    const [bookBarcodeSearch, setBarcodeSearch] = useState("");
    const [selectedStudent, setSelectedStudent] =
        useState<VerifiedStudent | null>(null);
    const [studentLoans, setStudentLoans] = useState<LoanWithDetails[]>([]);
    const [selectedReturns, setSelectedReturns] = useState<ReturnItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [returnLoading, setReturnLoading] = useState(false);
    const [returnMethod, setReturnMethod] = useState<"student" | "barcode">(
        "student"
    );

    // Fetch student loans when student is selected
    useEffect(() => {
        const fetchStudentLoans = async () => {
            if (!selectedStudent) {
                setStudentLoans([]);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(
                    `/api/library/loans?student_id=${selectedStudent.user_id}&status=active`
                );
                if (!response.ok)
                    throw new Error("Failed to fetch student loans");

                const data = await response.json();
                setStudentLoans(data.loans || []);
            } catch (error) {
                console.error("Error fetching student loans:", error);
                toast.error("Failed to fetch student loans");
                setStudentLoans([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentLoans();
    }, [selectedStudent]);

    // Handle barcode scanning for direct book returns
    useEffect(() => {
        const handleBarcodeReturn = async () => {
            if (bookBarcodeSearch.trim().length < 3) return;

            try {
                // Search for active loan by book barcode
                const response = await fetch(
                    `/api/library/loans?barcode=${encodeURIComponent(bookBarcodeSearch.trim())}&status=active`
                );
                if (!response.ok)
                    throw new Error("Book not found or not currently loaned");

                const data = await response.json();
                if (data.loans && data.loans.length > 0) {
                    const loan = data.loans[0];
                    addToReturns(loan);
                    setBarcodeSearch("");
                    toast.success(`Book "${loan.book_title}" added to returns`);
                } else {
                    toast.error("No active loan found for this book");
                }
            } catch (error) {
                console.error("Error finding book loan:", error);
                toast.error("Failed to find book loan");
            }
        };

        const timeoutId = setTimeout(handleBarcodeReturn, 500);
        return () => clearTimeout(timeoutId);
    }, [bookBarcodeSearch]);

    const handleStudentVerified = async (student: any) => {
        if (!student) {
            setSelectedStudent(null);
            return;
        }

        const verifiedStudent: VerifiedStudent = {
            user_id: student.user_id,
            register_number: student.register_number,
            full_name: student.full_name,
            email: student.email,
            faculty: student.faculty,
            year_of_study: student.year_of_study,
            card_uid: student.card_uid,
            balance: student.balance,
            card_status: student.card_status,
            current_loans: student.current_loans,
            overdue_loans: student.overdue_loans,
            pending_fines: student.pending_fines,
            membership_status: student.membership_status,
            max_books_allowed: student.max_books_allowed,
        };

        // Auto-pay any pending fines when student is verified for returns
        if (verifiedStudent.pending_fines > 0) {
            try {
                const finePaymentResponse = await fetch(
                    "/api/library/fines/bulk-pay",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            student_id: verifiedStudent.user_id,
                            action: "pay",
                            notes: "Auto-paid during return process",
                        }),
                    }
                );

                if (finePaymentResponse.ok) {
                    const fineResult = await finePaymentResponse.json();
                    if (fineResult.paid_count > 0) {
                        toast.success(
                            `Automatically paid ${fineResult.paid_count} pending fines (Rs. ${fineResult.total_amount.toFixed(2)})`
                        );
                        // Update student data with cleared fines
                        verifiedStudent.pending_fines = 0;
                    }
                }
            } catch (error) {
                console.error("Error auto-paying fines:", error);
                toast.warning(
                    "Could not auto-pay pending fines. Please pay manually."
                );
            }
        }

        setSelectedStudent(verifiedStudent);
        setStudentSearch(verifiedStudent.register_number);

        toast.success(`Student verified: ${verifiedStudent.full_name}`);
        if (verifiedStudent.current_loans === 0) {
            toast.info("Student has no active loans");
        }
    };

    const addToReturns = (loan: LoanWithDetails) => {
        if (selectedReturns.find((item) => item.id === loan.id)) {
            toast.error("Book already selected for return");
            return;
        }

        const today = new Date();
        const dueDate = new Date(loan.due_date);
        const isLate = today > dueDate;
        const daysOverdue = isLate
            ? Math.ceil(
                  (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
              )
            : 0;

        // Calculate fine (e.g., Rs. 5 per day overdue)
        const fineAmount = isLate ? daysOverdue * 5 : 0;

        const returnItem: ReturnItem = {
            ...loan,
            return_date: today.toISOString().split("T")[0],
            is_late: isLate,
            days_overdue: daysOverdue,
            fine_amount: fineAmount,
        };

        setSelectedReturns([...selectedReturns, returnItem]);
    };

    const removeFromReturns = (loanId: string) => {
        setSelectedReturns(
            selectedReturns.filter((item) => item.id !== loanId)
        );
    };

    const processReturns = async () => {
        if (selectedReturns.length === 0) {
            toast.error("Please select books to return");
            return;
        }

        setReturnLoading(true);

        try {
            const response = await fetch("/api/library/loans/return", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    returns: selectedReturns.map((item) => ({
                        loan_id: item.id,
                        return_date: item.return_date,
                        fine_amount: item.fine_amount || 0,
                        notes: item.is_late
                            ? `Returned ${item.days_overdue} days late`
                            : "Returned on time",
                    })),
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Return failed");
            }

            const result = await response.json();
            const totalFines = selectedReturns.reduce(
                (sum, item) => sum + (item.fine_amount || 0),
                0
            );

            toast.success(
                `Successfully returned ${selectedReturns.length} books` +
                    (totalFines > 0
                        ? ` (Fine: Rs. ${totalFines.toFixed(2)})`
                        : "")
            );

            // Reset form
            setSelectedReturns([]);
            setBarcodeSearch("");

            // Refresh student data and loans if student is selected
            if (selectedStudent) {
                // Refetch complete student data to get accurate counts
                const studentResponse = await fetch(
                    `/api/library/student-lookup/${selectedStudent.card_uid}`
                );
                if (studentResponse.ok) {
                    const studentData = await studentResponse.json();
                    if (studentData.success) {
                        // Update student with fresh data from backend
                        const updatedStudent = {
                            ...selectedStudent,
                            current_loans: studentData.data.current_loans,
                            overdue_loans: studentData.data.overdue_loans,
                            pending_fines: studentData.data.pending_fines,
                            can_checkout: studentData.data.can_checkout,
                            checkout_restrictions:
                                studentData.data.checkout_restrictions,
                        };
                        setSelectedStudent(updatedStudent);
                    }
                }

                // Refetch loans
                const loansResponse = await fetch(
                    `/api/library/loans?student_id=${selectedStudent.user_id}&status=active`
                );
                if (loansResponse.ok) {
                    const loansData = await loansResponse.json();
                    setStudentLoans(loansData.loans || []);
                }
            }
        } catch (error) {
            console.error("Return error:", error);
            toast.error(
                error instanceof Error ? error.message : "Return failed"
            );
        } finally {
            setReturnLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedStudent(null);
        setStudentLoans([]);
        setSelectedReturns([]);
        setStudentSearch("");
        setBarcodeSearch("");
    };

    const totalFines = selectedReturns.reduce(
        (sum, item) => sum + (item.fine_amount || 0),
        0
    );

    return (
        <div className="container mx-auto py-6 px-4 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/library/dashboard" className="mr-4">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <BookX className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Book Returns</h1>
                {(selectedStudent || selectedReturns.length > 0) && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={resetForm}
                        className="ml-auto"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Return Methods */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Return Method
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Tabs
                            value={returnMethod}
                            onValueChange={(value) =>
                                setReturnMethod(value as "student" | "barcode")
                            }
                        >
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger
                                    value="student"
                                    className="flex items-center gap-2"
                                >
                                    <CreditCard className="h-4 w-4" />
                                    Student Card
                                </TabsTrigger>
                                <TabsTrigger
                                    value="barcode"
                                    className="flex items-center gap-2"
                                >
                                    <QrCode className="h-4 w-4" />
                                    Book Barcode
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="student" className="space-y-4">
                                <div className="text-sm text-muted-foreground mb-3">
                                    Scan student's RFID card to view all their
                                    current loans
                                </div>
                                <RFIDStudentReader
                                    onStudentVerified={handleStudentVerified}
                                />
                            </TabsContent>

                            <TabsContent value="barcode" className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="barcodeSearch">
                                        Scan Book Barcode
                                    </Label>
                                    <div className="relative">
                                        <QrCode className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="barcodeSearch"
                                            placeholder="Scan or enter book barcode"
                                            className="pl-10"
                                            value={bookBarcodeSearch}
                                            onChange={(e) =>
                                                setBarcodeSearch(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Scan book barcode to directly add to
                                        returns
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Current Loans / Return Processing */}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookX className="h-5 w-5" />
                            {selectedStudent
                                ? "Current Loans"
                                : "Ready to Return"}{" "}
                            ({selectedReturns.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Student's Current Loans */}
                        {selectedStudent && studentLoans.length > 0 && (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                <h4 className="font-medium text-sm">
                                    Available for Return:
                                </h4>
                                {studentLoans.map((loan) => {
                                    const dueDate = new Date(loan.due_date);
                                    const today = new Date();
                                    const isOverdue = today > dueDate;
                                    const isSelected = selectedReturns.find(
                                        (item) => item.id === loan.id
                                    );

                                    return (
                                        <div
                                            key={loan.id}
                                            className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                                                isSelected
                                                    ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                                                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                                            }`}
                                            onClick={() =>
                                                isSelected
                                                    ? removeFromReturns(loan.id)
                                                    : addToReturns(loan)
                                            }
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="font-medium">
                                                        {loan.book_title}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {loan.book_author}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        <span>
                                                            Due: {loan.due_date}
                                                        </span>
                                                        {isOverdue && (
                                                            <span className="text-red-600 ml-2">
                                                                (Overdue)
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isOverdue && (
                                                        <AlertTriangle className="h-4 w-4 text-red-500" />
                                                    )}
                                                    {isSelected ? (
                                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                                    ) : (
                                                        <Badge variant="outline">
                                                            Select
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Selected Returns Summary */}
                        {selectedReturns.length > 0 && (
                            <>
                                {selectedStudent && <Separator />}
                                <div className="space-y-2">
                                    <h4 className="font-medium text-sm">
                                        Ready to Return:
                                    </h4>
                                    {selectedReturns.map((item) => (
                                        <div
                                            key={item.id}
                                            className="border rounded-lg p-3 bg-green-50 dark:bg-green-950"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="font-medium">
                                                        {item.book_title}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {item.book_author}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        <span>
                                                            Due: {item.due_date}
                                                        </span>
                                                        {item.is_late && (
                                                            <span className="text-red-600 ml-2">
                                                                (
                                                                {
                                                                    item.days_overdue
                                                                }{" "}
                                                                days late -
                                                                Fine: Rs.{" "}
                                                                {item.fine_amount?.toFixed(
                                                                    2
                                                                )}
                                                                )
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        removeFromReturns(
                                                            item.id
                                                        )
                                                    }
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    {totalFines > 0 && (
                                        <div className="border rounded-lg p-3 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                                            <div className="font-medium text-yellow-800 dark:text-yellow-200">
                                                Total Fines: Rs.{" "}
                                                {totalFines.toFixed(2)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Empty States */}
                        {selectedStudent && studentLoans.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No active loans found for this student</p>
                            </div>
                        )}

                        {!selectedStudent && selectedReturns.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <BookX className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>
                                    Scan student card or book barcode to start
                                    returns
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Process Returns Button */}
            {selectedReturns.length > 0 && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {totalFines > 0 && (
                                <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800 rounded-lg">
                                    <div className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                                        📋 Return Summary
                                    </div>
                                    <div className="text-sm text-yellow-700 dark:text-yellow-300">
                                        Total books: {selectedReturns.length} |
                                        Late returns:{" "}
                                        {
                                            selectedReturns.filter(
                                                (item) => item.is_late
                                            ).length
                                        }{" "}
                                        | Total fines: Rs.{" "}
                                        {totalFines.toFixed(2)}
                                    </div>
                                </div>
                            )}

                            <Button
                                className="w-full"
                                size="lg"
                                onClick={processReturns}
                                disabled={returnLoading}
                            >
                                {returnLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing Returns...
                                    </>
                                ) : (
                                    <>
                                        Process Return of{" "}
                                        {selectedReturns.length} Books
                                        {totalFines > 0 &&
                                            ` (Fine: Rs. ${totalFines.toFixed(2)})`}
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
