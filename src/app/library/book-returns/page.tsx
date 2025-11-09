"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookX, ArrowLeft, Loader2, RefreshCw, BookOpen } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import RFIDBookReader from "@/components/RFIDBookReader";
import type { LoanWithDetails } from "@/types/library";

interface ReturnItem extends Omit<LoanWithDetails, "days_overdue"> {
    fine_amount?: number;
    return_date: string;
    is_late: boolean;
    days_overdue?: number;
}

export default function BookReturns() {
    const [selectedReturns, setSelectedReturns] = useState<ReturnItem[]>([]);
    const [returnLoading, setReturnLoading] = useState(false);

    const handleBookScanned = async (bookData: any) => {
        // Automated return - fetch loan directly from book scan
        try {
            const response = await fetch(
                `/api/library/loans?barcode=${encodeURIComponent(bookData.barcode)}&status=active`
            );
            const data = await response.json();

            if (data.success && data.loans && data.loans.length > 0) {
                const loan = data.loans[0];

                // Check if already in the returns list
                if (selectedReturns.find((item) => item.id === loan.id)) {
                    toast.warning(
                        `"${bookData.book_title}" is already in the return list`
                    );
                    return;
                }

                addToReturns(loan);
                toast.success(
                    `Added for return: ${bookData.book_title}` +
                        (loan.student_name
                            ? ` (Borrowed by: ${loan.student_name})`
                            : "")
                );
            } else {
                toast.error(
                    `"${bookData.book_title}" is not currently checked out`
                );
            }
        } catch (error) {
            console.error("Error fetching loan:", error);
            toast.error("Failed to fetch loan information");
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
        setSelectedReturns([]);
    };

    const totalFines = selectedReturns.reduce(
        (sum, item) => sum + (item.fine_amount || 0),
        0
    );

    return (
        <div className="container mx-auto py-6 px-4 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/library/self-service" className="mr-4">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <BookX className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Book Returns</h1>
                {selectedReturns.length > 0 && (
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
                {/* Scan Books Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Scan Book to Return
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-sm text-muted-foreground mb-3">
                            Scan any book's RFID tag. The system will
                            automatically fetch the loan details and borrower
                            information.
                        </div>

                        <RFIDBookReader
                            onBookScanned={handleBookScanned}
                            isActive={true}
                            waitingMessage="Scan book RFID tag to add to returns..."
                        />
                    </CardContent>
                </Card>

                {/* Return Queue Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookX className="h-5 w-5" />
                            Books to Return ({selectedReturns.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Selected Returns Summary */}
                        {selectedReturns.length > 0 ? (
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm">
                                    Ready to Return:
                                </h4>
                                {selectedReturns.map((item) => (
                                    <div
                                        key={item.id}
                                        className="border rounded-lg p-3 bg-green-50 dark:bg-green-950"
                                    >
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex-1">
                                                <div className="font-medium">
                                                    {item.book_title}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {item.book_author}
                                                </div>
                                                {item.student_name && (
                                                    <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1">
                                                        👤 Borrowed by:{" "}
                                                        {item.student_name}
                                                        {item.register_number &&
                                                            ` (${item.register_number})`}
                                                    </div>
                                                )}
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    <span>
                                                        Due: {item.due_date}
                                                    </span>
                                                    {item.is_late && (
                                                        <span className="text-red-600 ml-2">
                                                            ({item.days_overdue}{" "}
                                                            days late - Fine:
                                                            Rs.{" "}
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
                                                    removeFromReturns(item.id)
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
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <BookX className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>
                                    Scan a book's RFID tag to add it to the
                                    return queue
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
