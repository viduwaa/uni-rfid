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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import RFIDStudentReader from "@/components/RFIDStudentReader";
import RFIDBookReader from "@/components/RFIDBookReader";
import { getFacultyName } from "@/lib/utils";
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
    const [bookSelectionMethod, setBookSelectionMethod] = useState<
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
                            `Automatically paid ${fineResult.paid_count} pending fines (Rs. ${fineResult.total_amount.toFixed(2)})`
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

    const handleBookScanned = async (bookData: any) => {
        if (!selectedStudent) {
            toast.error("Please select a student first");
            return;
        }

        if (!bookData.is_available) {
            toast.error(
                `Book "${bookData.book_title}" is currently checked out`
            );
            return;
        }

        // Create a BookWithAvailability object from scanned book data
        // Mark it with a special property to indicate it's from RFID
        const book: BookWithAvailability & { book_copy_id?: string } = {
            id: bookData.book_copy_id, // This is actually the copy ID for RFID books
            isbn: bookData.book_isbn || "",
            title: bookData.book_title,
            author: bookData.book_author,
            publisher: "",
            publication_year: 0,
            category: "",
            description: "",
            location: "",
            total_copies: 1,
            available_copies: 1,
            physical_copies: 1,
            available_physical_copies: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: "",
            book_copy_id: bookData.book_copy_id, // Store the actual copy ID
        };

        addBook(book);
        toast.success(`Added: ${bookData.book_title}`);
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
                let bookCopyId;

                // Check if this book was scanned via RFID (has book_copy_id property)
                if ("book_copy_id" in book && (book as any).book_copy_id) {
                    // Use the specific copy that was scanned
                    bookCopyId = (book as any).book_copy_id;
                } else {
                    // Manual selection - need to find an available copy
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

                    bookCopyId = copyData.copies[0].id; // Get the first available copy
                }

                // Now create the loan
                const loanResponse = await fetch("/api/library/loans", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        student_id: selectedStudent.student_id,
                        book_copy_id: bookCopyId,
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
            {/* Header */}

            <div className="flex items-center gap-4 mb-8">
                <Link href="/library/self-service" className="mr-4">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <BookOpenCheck className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Book Checkout</h1>
                {selectedStudent && (
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

                {/* Selected Student Details */}
                {selectedStudent && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Verified Student
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold">
                                        Student Information
                                    </h3>
                                    <Badge
                                        variant={
                                            selectedStudent.can_checkout
                                                ? "default"
                                                : "destructive"
                                        }
                                    >
                                        {selectedStudent.can_checkout
                                            ? "Eligible"
                                            : "Restricted"}
                                    </Badge>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <strong>ID:</strong>{" "}
                                            {selectedStudent.register_number}
                                        </div>
                                        <div>
                                            <strong>Year:</strong>{" "}
                                            {selectedStudent.year_of_study}
                                        </div>
                                        <div className="col-span-2">
                                            <strong>Name:</strong>{" "}
                                            {selectedStudent.full_name}
                                        </div>
                                        <div className="col-span-2">
                                            <strong>Faculty:</strong>{" "}
                                            {selectedStudent.faculty}
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div className="text-center">
                                            <div className="font-medium">
                                                {selectedStudent.current_loans}
                                            </div>
                                            <div className="text-muted-foreground">
                                                Current Loans
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-medium">
                                                {selectedStudent.overdue_loans}
                                            </div>
                                            <div className="text-muted-foreground">
                                                Overdue
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-medium">
                                                Rs.{" "}
                                                {selectedStudent.pending_fines.toFixed(
                                                    2
                                                )}
                                            </div>
                                            <div className="text-muted-foreground">
                                                Fines
                                            </div>
                                        </div>
                                    </div>

                                    {selectedStudent.checkout_restrictions
                                        .length > 0 && (
                                        <>
                                            <Separator />
                                            <div>
                                                <div className="text-red-600 font-medium mb-1">
                                                    Restrictions:
                                                </div>
                                                <ul className="text-xs text-red-600 space-y-1">
                                                    {selectedStudent.checkout_restrictions.map(
                                                        (
                                                            restriction: string,
                                                            index: number
                                                        ) => (
                                                            <li key={index}>
                                                                • {restriction}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
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
                        {/* Book Selection Method Tabs */}
                        {selectedStudent && (
                            <Tabs
                                value={bookSelectionMethod}
                                onValueChange={(value) =>
                                    setBookSelectionMethod(
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
                                        RFID Scan
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
                                    <RFIDBookReader
                                        onBookScanned={handleBookScanned}
                                        isActive={
                                            bookSelectionMethod === "rfid"
                                        }
                                        waitingMessage="Scan book RFID tag to add to checkout..."
                                    />
                                </TabsContent>

                                <TabsContent
                                    value="manual"
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="bookSearch">
                                            Search Books
                                        </Label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="bookSearch"
                                                placeholder="Enter book title, author, or ISBN"
                                                className="pl-10"
                                                value={bookSearch}
                                                onChange={(e) =>
                                                    setBookSearch(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        )}

                        {!selectedStudent && (
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
                                        disabled={true}
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Please select a student first
                                </p>
                            </div>
                        )}

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

                        {/* Book Search Results - Only show in manual mode */}
                        {bookSelectionMethod === "manual" &&
                            books.length > 0 &&
                            selectedStudent && (
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
                                                <Badge variant="outline">
                                                    Add
                                                </Badge>
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
