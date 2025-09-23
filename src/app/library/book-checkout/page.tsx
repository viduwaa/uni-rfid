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
} from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { BookWithAvailability, MemberSummary } from "@/types/library";

interface CheckoutBook extends BookWithAvailability {
  loan_date: string;
  due_date: string;
}

export default function BookCheckout() {
  const [studentSearch, setStudentSearch] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<MemberSummary | null>(
    null
  );
  const [selectedBooks, setSelectedBooks] = useState<CheckoutBook[]>([]);
  const [students, setStudents] = useState<MemberSummary[]>([]);
  const [books, setBooks] = useState<BookWithAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Search for students
  useEffect(() => {
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
  }, [studentSearch]);

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

  const selectStudent = (student: MemberSummary) => {
    setSelectedStudent(student);
    setStudentSearch(student.register_number);
    setStudents([]);
  };

  const addBook = (book: BookWithAvailability) => {
    if (selectedBooks.length >= 3) {
      toast.error("Maximum 3 books allowed");
      return;
    }

    if (!selectedStudent) {
      toast.error("Please select a student first");
      return;
    }

    if (selectedBooks.find((b) => b.id === book.id)) {
      toast.error("Book already selected");
      return;
    }

    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 14);

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

    setCheckoutLoading(true);

    try {
      const response = await fetch("/api/library/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: selectedStudent.id,
          loans: selectedBooks.map((book) => ({
            book_id: book.id,
            loan_date: book.loan_date,
            due_date: book.due_date,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Checkout failed");
      }

      toast.success(
        `Successfully checked out ${selectedBooks.length} books to ${selectedStudent.full_name}`
      );

      // Reset form
      setSelectedStudent(null);
      setSelectedBooks([]);
      setStudentSearch("");
      setBookSearch("");
      setStudents([]);
      setBooks([]);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setCheckoutLoading(false);
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
        <BookOpenCheck className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Book Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Student</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentSearch">Search Student</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="studentSearch"
                  placeholder="Enter student ID or name"
                  className="pl-10"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
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
                    onClick={() => selectStudent(student)}
                  >
                    <div className="font-medium">{student.register_number}</div>
                    <div className="text-sm text-muted-foreground">
                      {student.full_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {student.faculty}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Student */}
            {selectedStudent && (
              <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                <h3 className="font-semibold mb-2">Selected Student</h3>
                <div className="space-y-1 text-sm">
                  <div>ID: {selectedStudent.register_number}</div>
                  <div>Name: {selectedStudent.full_name}</div>
                  <div>Faculty: {selectedStudent.faculty}</div>
                  <Badge
                    variant={
                      selectedStudent.membership_status === "active"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {selectedStudent.membership_status}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Book Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Books ({selectedBooks.length}/3)</CardTitle>
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
                  onChange={(e) => setBookSearch(e.target.value)}
                  disabled={!selectedStudent}
                />
              </div>
            </div>

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
                        <div className="font-medium">{book.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {book.author}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Available: {book.available_copies}/{book.total_copies}
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
                {selectedBooks.map((book, index) => (
                  <div
                    key={book.id}
                    className="border rounded-lg p-3 bg-green-50 dark:bg-green-950"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{book.title}</div>
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
                        onClick={() => removeBook(book.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Checkout Button */}
      {selectedStudent && selectedBooks.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Button
              className="w-full"
              size="lg"
              onClick={processCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Checkout...
                </>
              ) : (
                `Checkout ${selectedBooks.length} Books to ${selectedStudent.full_name}`
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
