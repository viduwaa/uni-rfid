"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, BookOpenCheck, ArrowLeft, Check, X } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function BookCheckout() {
  const [searchQuery, setSearchQuery] = useState("");
  const [memberId, setMemberId] = useState("");
  const [memberInfo, setMemberInfo] = useState<null | {
    id: string;
    name: string;
    type: string;
    status: string;
  }>(null);
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set());
  const [books, setBooks] = useState([
    {
      id: "BK001",
      title: "Introduction to React",
      author: "John Doe",
      available: true,
      dueDate: "",
    },
    {
      id: "BK002",
      title: "Advanced TypeScript",
      author: "Jane Smith",
      available: false,
      dueDate: "2023-12-15",
    },
    {
      id: "BK003",
      title: "Clean Code",
      author: "Robert Martin",
      available: true,
      dueDate: "",
    },
  ]);

  // Mock function to find member
  const findMember = () => {
    if (memberId === "MEM001") {
      setMemberInfo({
        id: "MEM001",
        name: "Alex Johnson",
        type: "Student",
        status: "Active",
      });
    } else if (memberId === "MEM002") {
      setMemberInfo({
        id: "MEM002",
        name: "Dr. Sarah Williams",
        type: "Faculty",
        status: "Active",
      });
    } else {
      setMemberInfo(null);
      alert("Member not found");
    }
  };

  // Toggle book selection
  const toggleBookSelection = (bookId: string) => {
    const newSelection = new Set(selectedBooks);
    if (newSelection.has(bookId)) {
      newSelection.delete(bookId);
    } else {
      newSelection.add(bookId);
    }
    setSelectedBooks(newSelection);
  };

  // Process checkout
  const processCheckout = () => {
    if (selectedBooks.size === 0) {
      alert("Please select at least one book");
      return;
    }

    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + (memberInfo?.type === "Faculty" ? 30 : 14));

    // Update books with due dates (in a real app, this would be an API call)
    const updatedBooks = books.map(book => {
      if (selectedBooks.has(book.id)) {
        return {
          ...book,
          available: false,
          dueDate: dueDate.toISOString().split('T')[0],
        };
      }
      return book;
    });

    setBooks(updatedBooks);
    setSelectedBooks(new Set());
    alert(`Checkout successful! Due date: ${dueDate.toDateString()}`);
  };

  // Filter books based on search
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Link href="/admin/books" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold flex items-center">
          <BookOpenCheck className="h-8 w-8 mr-2 text-primary" />
          Book Checkout
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Member Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Member ID"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                />
                <Button onClick={findMember}>
                  <Search className="h-4 w-4 mr-2" />
                  Find
                </Button>
              </div>

              {memberInfo && (
                <div className="space-y-2 border rounded-lg p-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span>{memberInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Member Type:</span>
                    <span>{memberInfo.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <Badge variant={memberInfo.status === "Active" ? "default" : "destructive"}>
                      {memberInfo.status}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Checkout Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Checkout Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {memberInfo ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Selected Books:</h3>
                  {selectedBooks.size > 0 ? (
                    <ul className="space-y-1">
                      {Array.from(selectedBooks).map(bookId => {
                        const book = books.find(b => b.id === bookId);
                        return book ? (
                          <li key={bookId} className="flex justify-between">
                            <span>{book.title}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleBookSelection(bookId)}
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </li>
                        ) : null;
                      })}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No books selected</p>
                  )}
                </div>

                {selectedBooks.size > 0 && (
                  <div className="pt-4 border-t">
                    <Button className="w-full" onClick={processCheckout}>
                      <Check className="h-4 w-4 mr-2" />
                      Complete Checkout
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Please find a member to begin checkout
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Book Search and Selection */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Available Books</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search books by title, author, or ID"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Select</TableHead>
                <TableHead>Book ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBooks.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedBooks.has(book.id)}
                      onChange={() => toggleBookSelection(book.id)}
                      disabled={!book.available}
                      className="h-4 w-4"
                    />
                  </TableCell>
                  <TableCell>{book.id}</TableCell>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>
                    {book.available ? (
                      <Badge variant="outline">Available</Badge>
                    ) : (
                      <Badge variant="destructive">
                        Checked out until {book.dueDate}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}