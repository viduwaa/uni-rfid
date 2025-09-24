"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BookMarked,
  ArrowLeft,
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { LoanWithDetails } from "@/types/library";

interface ReturnProcessing {
  loan: LoanWithDetails;
  fine_amount: number;
  return_condition: string;
  notes: string;
}

export default function BookReturns() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLoans, setActiveLoans] = useState<LoanWithDetails[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<LoanWithDetails | null>(
    null
  );
  const [returnDetails, setReturnDetails] = useState<ReturnProcessing | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Search for active loans
  useEffect(() => {
    const searchLoans = async () => {
      if (searchQuery.trim().length < 2) {
        setActiveLoans([]);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams({
          search: searchQuery.trim(),
          status: "active,overdue",
        });

        const response = await fetch(`/api/library/loans?${params}`);
        if (!response.ok) throw new Error("Failed to search loans");

        const data = await response.json();
        setActiveLoans(data.loans || []);
      } catch (error) {
        console.error("Error searching loans:", error);
        toast.error("Failed to search active loans");
        setActiveLoans([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchLoans, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const selectLoanForReturn = async (loan: LoanWithDetails) => {
    setSelectedLoan(loan);

    // Calculate fine if overdue
    const today = new Date();
    const dueDate = new Date(loan.due_date);
    const isOverdue = today > dueDate;
    const daysOverdue = isOverdue
      ? Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 3600 * 24))
      : 0;
    const finePerDay = 1.0; // $1 per day fine
    const fineAmount = daysOverdue * finePerDay;

    setReturnDetails({
      loan,
      fine_amount: fineAmount,
      return_condition: "Good",
      notes: "",
    });
  };

  const processReturn = async () => {
    if (!returnDetails) {
      toast.error("No book selected for return");
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(
        `/api/library/loans/${returnDetails.loan.id}/return`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            return_condition: returnDetails.return_condition,
            fine_amount: returnDetails.fine_amount,
            notes: returnDetails.notes,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Return processing failed");
      }

      const result = await response.json();

      if (returnDetails.fine_amount > 0) {
        toast.success(
          `Book returned successfully! Fine of $${returnDetails.fine_amount.toFixed(2)} applied to student account.`
        );
      } else {
        toast.success("Book returned successfully!");
      }

      // Reset form
      setSelectedLoan(null);
      setReturnDetails(null);
      setSearchQuery("");
      setActiveLoans([]);
    } catch (error) {
      console.error("Return processing error:", error);
      toast.error(
        error instanceof Error ? error.message : "Return processing failed"
      );
    } finally {
      setProcessing(false);
    }
  };

  const updateReturnCondition = (condition: string) => {
    if (returnDetails) {
      setReturnDetails({ ...returnDetails, return_condition: condition });
    }
  };

  const updateNotes = (notes: string) => {
    if (returnDetails) {
      setReturnDetails({ ...returnDetails, notes });
    }
  };

  const getStatusBadge = (loan: LoanWithDetails) => {
    const today = new Date();
    const dueDate = new Date(loan.due_date);
    const isOverdue = today > dueDate;

    if (isOverdue) {
      return (
        <Badge variant="destructive">Overdue ({loan.days_overdue} days)</Badge>
      );
    } else {
      return <Badge variant="default">Active</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/library/dashboard" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <BookMarked className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Book Returns</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search Active Loans */}
        <Card>
          <CardHeader>
            <CardTitle>Search Active Loans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loanSearch">
                Search by Student, Book Title, or Barcode
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="loanSearch"
                  placeholder="Enter student name, book title, or barcode"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {loading && (
                <div className="text-sm text-blue-600 bg-blue-50 dark:bg-blue-950 p-2 rounded-lg flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching active loans...
                </div>
              )}
            </div>

            {/* Active Loans Results */}
            {activeLoans.length > 0 && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <h4 className="font-medium">Active Loans Found:</h4>
                {activeLoans.map((loan) => (
                  <div
                    key={loan.id}
                    className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => selectLoanForReturn(loan)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="font-medium">{loan.book_title}</div>
                        <div className="text-sm text-muted-foreground">
                          {loan.book_author}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Student: {loan.student_name} ({loan.register_number})
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Due: {new Date(loan.due_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(loan)}
                        {loan.days_overdue > 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            Fine: ${(loan.days_overdue * 1.0).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 &&
              activeLoans.length === 0 &&
              !loading && (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No active loans found matching your search
                  </p>
                </div>
              )}
          </CardContent>
        </Card>

        {/* Return Processing */}
        <Card>
          <CardHeader>
            <CardTitle>Process Return</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!returnDetails ? (
              <div className="text-center py-8">
                <BookMarked className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Select an active loan to process return
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Loan Details */}
                <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                  <h3 className="font-semibold mb-3">Loan Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Book:</span>
                      <span>{returnDetails.loan.book_title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Author:</span>
                      <span>{returnDetails.loan.book_author}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Student:</span>
                      <span>{returnDetails.loan.student_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Borrowed:</span>
                      <span>
                        {new Date(
                          returnDetails.loan.borrowed_at
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Due Date:</span>
                      <span>
                        {new Date(
                          returnDetails.loan.due_date
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    {returnDetails.loan.days_overdue > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span className="font-medium">Days Overdue:</span>
                        <span>{returnDetails.loan.days_overdue}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Return Condition */}
                <div className="space-y-2">
                  <Label>Book Condition on Return</Label>
                  <div className="flex gap-2">
                    {["Good", "Fair", "Poor", "Damaged"].map((condition) => (
                      <Button
                        key={condition}
                        variant={
                          returnDetails.return_condition === condition
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => updateReturnCondition(condition)}
                      >
                        {condition}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Fine Information */}
                {returnDetails.fine_amount > 0 && (
                  <div className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-950">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium">Late Return Fine</span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      This book is {returnDetails.loan.days_overdue} days
                      overdue at $1.00 per day.
                    </div>
                    <div className="text-lg font-semibold text-yellow-700 dark:text-yellow-300">
                      Total Fine: ${returnDetails.fine_amount.toFixed(2)}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="returnNotes">Return Notes (Optional)</Label>
                  <textarea
                    id="returnNotes"
                    className="w-full p-2 border rounded-lg text-sm"
                    rows={3}
                    placeholder="Add any notes about the book condition or return process..."
                    value={returnDetails.notes}
                    onChange={(e) => updateNotes(e.target.value)}
                  />
                </div>

                {/* Process Return Button */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedLoan(null);
                      setReturnDetails(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={processReturn}
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing Return...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {returnDetails.fine_amount > 0
                          ? `Process Return (Fine: $${returnDetails.fine_amount.toFixed(2)})`
                          : "Process Return"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
