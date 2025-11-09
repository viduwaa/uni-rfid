"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    BookOpenCheck,
    ArrowLeft,
    Loader2,
    Search,
    Users,
    BookOpen,
    CreditCard,
    User,
    RefreshCw,
    CheckCircle,
} from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import RFIDStudentReader from "@/components/RFIDStudentReader";
import RFIDBookReader from "@/components/RFIDBookReader";
import { getFacultyName } from "@/lib/utils";
import formatCurrency from "@/lib/formatCurrency";
import type { BookWithAvailability, MemberSummary } from "@/types/library";

interface CheckoutBook extends BookWithAvailability {
    loan_date: string;
    due_date: string;
}

interface VerifiedStudent extends MemberSummary {
    card_uid: string;
    balance: number;
    card_status: string;
    current_loans: number;
    overdue_loans: number;
    pending_fines: number;
    can_checkout: boolean;
    checkout_restrictions: string[];
    created_at: string;
    updated_at: string;
}

export default function BookCheckout() {
    const [studentSearch, setStudentSearch] = useState("");
    const [bookSearch, setBookSearch] = useState("");
    const [selectedStudent, setSelectedStudent] =
        useState<VerifiedStudent | null>(null);
    const [selectedBooks, setSelectedBooks] = useState<CheckoutBook[]>([]);
    const [students, setStudents] = useState<MemberSummary[]>([]);
    const [books, setBooks] = useState<BookWithAvailability[]>([]);
    const [loading, setLoading] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [studentSelectionMethod, setStudentSelectionMethod] = useState<
        "rfid" | "manual"
    >("rfid");

    // Search for students (manual search)
    useEffect(() => {
        if (studentSelectionMethod !== "manual") return;

        const searchStudents = async () => {
            if (studentSearch.trim().length < 2) {
                setStudents([]);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(
                    `/api/library/members?search=${encodeURIComponent(studentSearch.trim())}`
                );
                if (!response.ok) throw new Error("Failed to search students");

                const data = await response.json();
                setStudents(data.members || []);
            } catch (error) {
                console.error("Error searching students:", error);
                toast.error("Failed to search students");
                setStudents([]);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(searchStudents, 300);
        return () => clearTimeout(timeoutId);
    }, [studentSearch, studentSelectionMethod]);

    // Search for books
    useEffect(() => {
        const searchBooks = async () => {
            if (bookSearch.trim().length < 2) {
                setBooks([]);
                return;
            }

            try {
                const params = new URLSearchParams({
                    search: bookSearch.trim(),
                    available_only: "true",
                });

                const response = await fetch(`/api/library/books?${params}`);
                if (!response.ok) throw new Error("Failed to search books");

                const data = await response.json();
                setBooks(data.books || []);
            } catch (error) {
                console.error("Error searching books:", error);
                toast.error("Failed to search books");
                setBooks([]);
            }
        };

        const timeoutId = setTimeout(searchBooks, 300);
        return () => clearTimeout(timeoutId);
    }, [bookSearch]);

    const handleStudentVerified = async (student: any) => {
        if (!student) {
            setSelectedStudent(null);
            return;
        }

        const verifiedStudent: VerifiedStudent = {
            id: student.user_id,
            student_id: student.user_id,
            register_number: student.register_number,
            full_name: student.full_name,
            email: student.email,
            faculty: student.faculty,
            year_of_study: student.year_of_study,
            membership_status: student.membership_status,
            max_books_allowed: student.max_books_allowed,
            membership_date: student.membership_date,
            notes: student.notes,
            card_uid: student.card_uid,
            balance: student.balance,
            card_status: student.card_status,
            current_loans: student.current_loans,
            overdue_loans: student.overdue_loans,
            pending_fines: student.pending_fines,
            can_checkout: student.can_checkout,
            checkout_restrictions: student.checkout_restrictions,
            created_at: student.created_at || new Date().toISOString(),
            updated_at: student.updated_at || new Date().toISOString(),
        };

        // Auto-pay any pending fines when student is verified
        if (verifiedStudent.pending_fines > 0) {
            try {
                const finePaymentResponse = await fetch(
                    "/api/library/fines/bulk-pay",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            student_id: verifiedStudent.student_id,
                            action: "pay",
                            notes: "Auto-paid during checkout process",
                        }),
                    }
                );

                if (finePaymentResponse.ok) {
                    const fineResult = await finePaymentResponse.json();
                    if (fineResult.paid_count > 0) {
                        toast.success(
                            `Automatically paid ${fineResult.paid_count} pending fines (${formatCurrency(fineResult.total_amount)})`
                        );
                        // Update student data with cleared fines
                        verifiedStudent.pending_fines = 0;
                        // Re-evaluate checkout restrictions without pending fines
                        verifiedStudent.checkout_restrictions =
                            verifiedStudent.checkout_restrictions.filter(
                                (restriction) =>
                                    !restriction.includes("Pending fines")
                            );
                        // Update can_checkout status
                        verifiedStudent.can_checkout =
                            verifiedStudent.membership_status === "active" &&
                            verifiedStudent.overdue_loans === 0 &&
                            verifiedStudent.current_loans <
                                verifiedStudent.max_books_allowed;
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
        setStudents([]);

        if (!verifiedStudent.can_checkout) {
            toast.warning(
                "Student has checkout restrictions. Please review before proceeding."
            );
        } else {
            toast.success(`Student verified: ${verifiedStudent.full_name}`);
        }
    };

    const selectStudent = (student: MemberSummary) => {
        // Convert regular member summary to verified student format
        const verifiedStudent: VerifiedStudent = {
            ...student,
            card_uid: "",
            balance: 0,
            card_status: "ACTIVE",
            current_loans: 0,
            overdue_loans: 0,
            pending_fines: 0,
            can_checkout: student.membership_status === "active",
            checkout_restrictions:
                student.membership_status !== "active"
                    ? [`Membership is ${student.membership_status}`]
                    : [],
            created_at: student.created_at || new Date().toISOString(),
            updated_at: student.updated_at || new Date().toISOString(),
        };

        setSelectedStudent(verifiedStudent);
        setStudentSearch(student.register_number);
        setStudents([]);
    };

    const addBook = (book: BookWithAvailability) => {
        if (!selectedStudent) {
            toast.error("Please select a student first");
            return;
        }

        if (
            !selectedStudent.can_checkout &&
            selectedStudent.checkout_restrictions.length > 0
        ) {
            toast.error(
                "Student has checkout restrictions. Please resolve them first."
            );
            return;
        }

        if (selectedBooks.length >= (selectedStudent.max_books_allowed || 3)) {
            toast.error(
                `Maximum ${selectedStudent.max_books_allowed || 3} books allowed`
            );
            return;
        }

        if (selectedBooks.find((b) => b.id === book.id)) {
            toast.error("Book already selected");
            return;
        }

        const today = new Date();
        const dueDate = new Date();
        dueDate.setDate(today.getDate() + 14); // 14-day loan period

        const checkoutBook: CheckoutBook = {
            ...book,
            loan_date: today.toISOString().split("T")[0],
            due_date: dueDate.toISOString().split("T")[0],
        };

        setSelectedBooks([...selectedBooks, checkoutBook]);
        setBookSearch("");
        setBooks([]);
    };

    const removeBook = (bookId: string) => {
        setSelectedBooks(selectedBooks.filter((book) => book.id !== bookId));
    };

    const processCheckout = async () => {
        if (!selectedStudent || selectedBooks.length === 0) {
            toast.error("Please select student and books");
            return;
        }

        if (
            !selectedStudent.can_checkout &&
            selectedStudent.checkout_restrictions.length > 0
        ) {
            toast.error("Cannot proceed with checkout due to restrictions");
            return;
        }

        setCheckoutLoading(true);

        try {
            // Process each book checkout individually
            const checkoutResults = [];

            for (const book of selectedBooks) {
                // First, get an available book copy for this book
                const copyResponse = await fetch(
                    `/api/library/books/${book.id}/copies?available_only=true`
                );
                if (!copyResponse.ok) {
                    throw new Error(
                        `Failed to get available copy for "${book.title}"`
                    );
                }

                const copyData = await copyResponse.json();
                if (!copyData.copies || copyData.copies.length === 0) {
                    throw new Error(
                        `No available copies found for "${book.title}"`
                    );
                }

                const availableCopy = copyData.copies[0]; // Get the first available copy

                // Now create the loan
                const loanResponse = await fetch("/api/library/loans", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        student_id: selectedStudent.student_id,
                        book_copy_id: availableCopy.id,
                        due_date: book.due_date,
                        notes: `Checked out via library system`,
                    }),
                });

                if (!loanResponse.ok) {
                    const error = await loanResponse.json();
                    throw new Error(
                        error.error || `Failed to checkout "${book.title}"`
                    );
                }

                const loanResult = await loanResponse.json();
                checkoutResults.push(loanResult);
            }

            toast.success(
                `Successfully checked out ${selectedBooks.length} books to ${selectedStudent.full_name}`
            );

            // Reset form
            resetForm();
        } catch (error) {
            console.error("Checkout error:", error);
            toast.error(
                error instanceof Error ? error.message : "Checkout failed"
            );
        } finally {
            setCheckoutLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedStudent(null);
        setSelectedBooks([]);
        setStudentSearch("");
        setBookSearch("");
        setStudents([]);
        setBooks([]);
    };

    return (
        <div className="container mx-auto py-6 px-4 space-y-6">
            <PageHeader
                title="Book Checkout"
                breadcrumbs={[
                    { label: "Library", href: "/library" },
                    { label: "Self Service", href: "/library/self-service" },
                    { label: "Book Checkout" },
                ]}
                backHref="/library/self-service"
                centerIcon={
                    <BookOpenCheck className="h-8 w-8 text-primary mx-auto" />
                }
                right={
                    selectedStudent ? (
                        <Button variant="outline" size="sm" onClick={resetForm}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                    ) : null
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Student Selection */}
                {!selectedStudent && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Student Verification
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Selection Method Tabs */}
                            <Tabs
                                value={studentSelectionMethod}
                                onValueChange={(value) =>
                                    setStudentSelectionMethod(
                                        value as "rfid" | "manual"
                                    )
                                }
                            >
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger
                                        value="rfid"
                                        className="flex items-center gap-2"
                                    >
                                        <CreditCard className="h-4 w-4" />
                                        RFID Card
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="manual"
                                        className="flex items-center gap-2"
                                    >
                                        <Search className="h-4 w-4" />
                                        Manual Search
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="rfid" className="space-y-4">
                                    <RFIDStudentReader
                                        onStudentVerified={
                                            handleStudentVerified
                                        }
                                    />
                                </TabsContent>

                                <TabsContent
                                    value="manual"
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="studentSearch">
                                            Search Student
                                        </Label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="studentSearch"
                                                placeholder="Enter student ID or name"
                                                className="pl-10"
                                                value={studentSearch}
                                                onChange={(e) =>
                                                    setStudentSearch(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* Student Search Results */}
                                    {students.length > 0 && (
                                        <div className="border rounded-lg max-h-48 overflow-y-auto">
                                            {students.map((student) => (
                                                <div
                                                    key={student.id}
                                                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                                    onClick={() =>
                                                        selectStudent(student)
                                                    }
                                                >
                                                    <div className="font-medium">
                                                        {
                                                            student.register_number
                                                        }
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {student.full_name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {getFacultyName(
                                                            student.faculty
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                )}

                {/* Book Selection */}
                <Card className={selectedStudent ? "lg:col-span-2" : ""}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Select Books ({selectedBooks.length}/
                                {selectedStudent?.max_books_allowed || 3})
                            </CardTitle>

                            {/* Checkout Button in Header */}
                            {selectedStudent && selectedBooks.length > 0 && (
                                <Button
                                    onClick={processCheckout}
                                    disabled={
                                        checkoutLoading ||
                                        (!selectedStudent.can_checkout &&
                                            selectedStudent
                                                .checkout_restrictions.length >
                                                0)
                                    }
                                    className="ml-4"
                                >
                                    {checkoutLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Checkout {selectedBooks.length}{" "}
                                            Books
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="bookSearch">Search Books</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="bookSearch"
                                    placeholder="Enter book title, author, or ISBN"
                                    className="pl-10"
                                    value={bookSearch}
                                    onChange={(e) =>
                                        setBookSearch(e.target.value)
                                    }
                                    disabled={!selectedStudent}
                                />
                            </div>
                        </div>

                        {/* Checkout Restrictions Warning */}
                        {selectedStudent &&
                            selectedStudent.checkout_restrictions.length >
                                0 && (
                                <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800 rounded-lg">
                                    <div className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                                        ⚠️ Checkout Restrictions
                                    </div>
                                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                                        {selectedStudent.checkout_restrictions.map(
                                            (restriction, index) => (
                                                <li key={index}>
                                                    • {restriction}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            )}

                        {/* Book Search Results */}
                        {books.length > 0 && selectedStudent && (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {books.map((book) => (
                                    <div
                                        key={book.id}
                                        className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                                        onClick={() => addBook(book)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-medium">
                                                    {book.title}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {book.author}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Available:{" "}
                                                    {book.available_copies}/
                                                    {book.total_copies}
                                                </div>
                                            </div>
                                            <Badge variant="outline">Add</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Selected Books */}
                        {selectedBooks.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-medium">Selected Books:</h4>
                                {selectedBooks.map((book) => (
                                    <div
                                        key={book.id}
                                        className="border rounded-lg p-3 bg-green-50 dark:bg-green-950"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-medium">
                                                    {book.title}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {book.author}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Due: {book.due_date}
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    removeBook(book.id)
                                                }
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!selectedStudent && (
                            <div className="text-center py-8 text-muted-foreground">
                                <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>
                                    Please verify a student first to search for
                                    books
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
