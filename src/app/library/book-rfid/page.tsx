"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, BookOpen, Tags, ClipboardList } from "lucide-react";
import WriteBookTagComponent from "@/components/WriteBookTag";
import ReadBookTagComponent from "@/components/ReadBookTag";
import { toast } from "sonner";
import Link from "next/link";

interface BookCopy {
    id: string;
    book_id: string;
    barcode: string;
    condition: string;
    is_available: boolean;
    has_rfid_tag: boolean;
    book_title?: string;
    book_author?: string;
    book_isbn?: string;
    rfid_uid?: string;
    rfid_status?: string;
}

export default function BookRFIDManagementPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchType, setSearchType] = useState<"barcode" | "title" | "isbn">(
        "barcode"
    );
    const [bookCopies, setBookCopies] = useState<BookCopy[]>([]);
    const [selectedBookCopy, setSelectedBookCopy] = useState<BookCopy | null>(
        null
    );
    const [isSearching, setIsSearching] = useState(false);
    const [isWriting, setIsWriting] = useState(false);

    // Search for book copies
    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            toast.error("Please enter a search term");
            return;
        }

        setIsSearching(true);
        try {
            // Search books API
            const response = await fetch(
                `/api/library/books?search=${encodeURIComponent(searchTerm)}&limit=20`
            );
            const result = await response.json();

            if (result.success && result.data) {
                // Get book copies for found books
                const copiesPromises = result.data.map((book: any) =>
                    fetch(`/api/library/book-copies?book_id=${book.id}`).then(
                        (res) => res.json()
                    )
                );

                const copiesResults = await Promise.all(copiesPromises);
                const allCopies = copiesResults
                    .flatMap((res) => res.data || [])
                    .map((copy: any, index: number) => ({
                        ...copy,
                        book_title:
                            result.data.find((b: any) => b.id === copy.book_id)
                                ?.title || "Unknown",
                        book_author:
                            result.data.find((b: any) => b.id === copy.book_id)
                                ?.author || "Unknown",
                        book_isbn:
                            result.data.find((b: any) => b.id === copy.book_id)
                                ?.isbn || "",
                    }));

                setBookCopies(allCopies);
                if (allCopies.length === 0) {
                    toast.info("No book copies found");
                }
            } else {
                toast.error("Failed to search books");
                setBookCopies([]);
            }
        } catch (error) {
            console.error("Search error:", error);
            toast.error("Error searching for books");
            setBookCopies([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectBookCopy = (copy: BookCopy) => {
        if (copy.has_rfid_tag) {
            toast.warning("This book copy already has an RFID tag");
            return;
        }
        setSelectedBookCopy(copy);
        toast.success(`Selected: ${copy.book_title} (${copy.barcode})`);
    };

    const handleStartWrite = () => {
        if (!selectedBookCopy) {
            toast.error("Please select a book copy first");
            return;
        }
        setIsWriting(true);
        toast.info("Place RFID tag on the reader...");
    };

    const handleWriteComplete = (
        success: boolean,
        message: string,
        rfidUID?: string
    ) => {
        setIsWriting(false);
        if (success) {
            toast.success(`RFID tag written successfully! UID: ${rfidUID}`);
            // Refresh the book copy list
            handleSearch();
            setSelectedBookCopy(null);
        } else {
            toast.error(`Write failed: ${message}`);
        }
    };

    const handleTagRead = (bookData: any) => {
        toast.success(`Book found: ${bookData.book_title}`);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Tags className="h-8 w-8" />
                        Book RFID Tag Management
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Write and manage RFID tags for library book copies
                    </p>
                </div>
                <Link href="/library/book-rfid/issue-tags">
                    <Button className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        Issue Tags to Untagged Books
                    </Button>
                </Link>
            </div>

            <Tabs defaultValue="write" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="write">Write Tag</TabsTrigger>
                    <TabsTrigger value="read">Read Tag</TabsTrigger>
                </TabsList>

                {/* Write Tag Tab */}
                <TabsContent value="write" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Search Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Search className="h-5 w-5" />
                                    Search Book Copies
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Search Type</Label>
                                    <Select
                                        value={searchType}
                                        onValueChange={(value: any) =>
                                            setSearchType(value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="barcode">
                                                Barcode
                                            </SelectItem>
                                            <SelectItem value="title">
                                                Title
                                            </SelectItem>
                                            <SelectItem value="isbn">
                                                ISBN
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Search Term</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder={`Enter ${searchType}...`}
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    handleSearch();
                                                }
                                            }}
                                        />
                                        <Button
                                            onClick={handleSearch}
                                            disabled={isSearching}
                                        >
                                            {isSearching
                                                ? "Searching..."
                                                : "Search"}
                                        </Button>
                                    </div>
                                </div>

                                {/* Search Results */}
                                <div className="space-y-2">
                                    <Label>Search Results</Label>
                                    <div className="border rounded-lg max-h-96 overflow-y-auto">
                                        {bookCopies.length === 0 ? (
                                            <div className="p-4 text-center text-muted-foreground">
                                                No results. Search for books to
                                                tag.
                                            </div>
                                        ) : (
                                            <div className="divide-y">
                                                {bookCopies.map((copy) => (
                                                    <div
                                                        key={copy.id}
                                                        className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                                                            selectedBookCopy?.id ===
                                                            copy.id
                                                                ? "bg-blue-50"
                                                                : ""
                                                        }`}
                                                        onClick={() =>
                                                            handleSelectBookCopy(
                                                                copy
                                                            )
                                                        }
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1">
                                                                <p className="font-semibold">
                                                                    {
                                                                        copy.book_title
                                                                    }
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {
                                                                        copy.book_author
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    Barcode:{" "}
                                                                    {
                                                                        copy.barcode
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <Badge
                                                                    variant={
                                                                        copy.has_rfid_tag
                                                                            ? "default"
                                                                            : "outline"
                                                                    }
                                                                >
                                                                    {copy.has_rfid_tag
                                                                        ? "Has RFID"
                                                                        : "No RFID"}
                                                                </Badge>
                                                                <Badge
                                                                    variant={
                                                                        copy.is_available
                                                                            ? "default"
                                                                            : "destructive"
                                                                    }
                                                                >
                                                                    {copy.is_available
                                                                        ? "Available"
                                                                        : "Checked Out"}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Selected Book Copy */}
                                {selectedBookCopy && (
                                    <Card className="bg-blue-50 border-blue-200">
                                        <CardContent className="pt-4">
                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-blue-900">
                                                    Selected Book Copy
                                                </h4>
                                                <div className="text-sm space-y-1">
                                                    <p>
                                                        <strong>Title:</strong>{" "}
                                                        {
                                                            selectedBookCopy.book_title
                                                        }
                                                    </p>
                                                    <p>
                                                        <strong>Author:</strong>{" "}
                                                        {
                                                            selectedBookCopy.book_author
                                                        }
                                                    </p>
                                                    <p>
                                                        <strong>
                                                            Barcode:
                                                        </strong>{" "}
                                                        {
                                                            selectedBookCopy.barcode
                                                        }
                                                    </p>
                                                </div>
                                                <Button
                                                    onClick={handleStartWrite}
                                                    disabled={isWriting}
                                                    className="w-full"
                                                >
                                                    {isWriting
                                                        ? "Writing..."
                                                        : "Write RFID Tag"}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </CardContent>
                        </Card>

                        {/* Write Component */}
                        {selectedBookCopy && (
                            <WriteBookTagComponent
                                bookCopy={selectedBookCopy}
                                isWriting={isWriting}
                                onWriteComplete={handleWriteComplete}
                            />
                        )}
                    </div>
                </TabsContent>

                {/* Read Tag Tab */}
                <TabsContent value="read">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    Instructions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm">
                                    <p>
                                        <strong>1.</strong> Make sure the NFC
                                        reader is connected and ready
                                    </p>
                                    <p>
                                        <strong>2.</strong> Place a book RFID
                                        tag on the reader
                                    </p>
                                    <p>
                                        <strong>3.</strong> The book information
                                        will be displayed automatically
                                    </p>
                                    <p>
                                        <strong>4.</strong> Use this to verify
                                        tags and check book status
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <ReadBookTagComponent onTagRead={handleTagRead} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
