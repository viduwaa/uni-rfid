"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Search,
    Tags,
    BookOpen,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
    Home,
    Library,
    ListChecks,
    Clock,
    Package,
} from "lucide-react";
import WriteBookTagComponent from "@/components/WriteBookTag";
import ReadBookTagComponent from "@/components/ReadBookTag";
import { toast } from "sonner";
import { BookCopy } from "@/types/library";

interface UntaggedBookCopy extends BookCopy {
    book_id: string;
    book_title: string;
    book_author: string;
    book_isbn: string;
    publisher: string;
    publication_year: number;
    category: string;
    location: string;
}

interface TaggedBookCopy {
    id: string;
    book_id: string;
    barcode: string;
    book_title: string;
    book_author: string;
    book_isbn: string;
    condition: string;
    rfid_uid: string;
    tag_status: string;
    issued_at: string;
    is_available: boolean;
    current_loan?: {
        id: string;
        student_name: string;
        student_register: string;
        borrowed_at: string;
        due_date: string;
        status: string;
    };
}

export default function IssueBookTagsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchType, setSearchType] = useState<"title" | "isbn" | "barcode">(
        "title"
    );
    const [untaggedBooks, setUntaggedBooks] = useState<UntaggedBookCopy[]>([]);
    const [taggedBooks, setTaggedBooks] = useState<TaggedBookCopy[]>([]);
    const [selectedBook, setSelectedBook] = useState<UntaggedBookCopy | null>(
        null
    );
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingTagged, setIsLoadingTagged] = useState(false);
    const [isWriting, setIsWriting] = useState(false);
    const [totalUntagged, setTotalUntagged] = useState(0);
    const [totalTagged, setTotalTagged] = useState(0);
    const [currentStep, setCurrentStep] = useState<
        "search" | "verify" | "write" | "complete"
    >("search");
    const [activeTab, setActiveTab] = useState<"issue" | "view">("issue");
    const [taggedSearchTerm, setTaggedSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<
        "all" | "available" | "checked_out"
    >("all");

    // Load all untagged books on mount
    useEffect(() => {
        loadUntaggedBooks();
    }, []);

    // Load tagged books when tab changes
    useEffect(() => {
        if (activeTab === "view") {
            loadTaggedBooks();
        }
    }, [activeTab]);

    const loadTaggedBooks = async (search?: string, status?: string) => {
        setIsLoadingTagged(true);
        try {
            const params = new URLSearchParams({
                limit: "100",
                offset: "0",
            });

            if (search) {
                params.append("search", search);
            }

            if (status && status !== "all") {
                params.append("status", status);
            }

            const response = await fetch(
                `/api/library/rfid/tagged-books?${params}`
            );
            const result = await response.json();

            if (result.success) {
                setTaggedBooks(result.data || []);
                setTotalTagged(result.pagination?.total || 0);
            } else {
                toast.error("Failed to load tagged books");
            }
        } catch (error) {
            console.error("Error loading tagged books:", error);
            toast.error("Error loading tagged books");
        } finally {
            setIsLoadingTagged(false);
        }
    };

    const handleTaggedSearch = () => {
        loadTaggedBooks(taggedSearchTerm, statusFilter);
    };

    const loadUntaggedBooks = async (search?: string, type?: string) => {
        setIsSearching(true);
        try {
            const params = new URLSearchParams({
                limit: "50",
                offset: "0",
            });

            if (search) {
                params.append("search", search);
                params.append("search_type", type || searchType);
            }

            const response = await fetch(
                `/api/library/rfid/untagged-books?${params}`
            );
            const result = await response.json();

            if (result.success) {
                setUntaggedBooks(result.data || []);
                setTotalUntagged(result.pagination?.total || 0);
                if (result.data.length === 0) {
                    toast.info("No untagged books found");
                }
            } else {
                toast.error("Failed to load untagged books");
            }
        } catch (error) {
            console.error("Error loading untagged books:", error);
            toast.error("Error loading untagged books");
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearch = () => {
        if (searchTerm.trim()) {
            loadUntaggedBooks(searchTerm, searchType);
        } else {
            loadUntaggedBooks();
        }
    };

    const handleSelectBook = (book: UntaggedBookCopy) => {
        setSelectedBook(book);
        setCurrentStep("verify");
        toast.success(`Selected: ${book.book_title}`);
    };

    const handleStartWrite = () => {
        if (!selectedBook) {
            toast.error("Please select a book first");
            return;
        }
        setCurrentStep("write");
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
            setCurrentStep("complete");
            toast.success(`RFID tag issued successfully! UID: ${rfidUID}`);

            // Refresh the list after a short delay
            setTimeout(() => {
                loadUntaggedBooks();
                handleReset();
            }, 2000);
        } else {
            toast.error(`Write failed: ${message}`);
            setCurrentStep("verify");
        }
    };

    const handleTagRead = (bookData: any) => {
        toast.success(`Verified: ${bookData.book_title}`);
    };

    const handleReset = () => {
        setSelectedBook(null);
        setCurrentStep("search");
        setIsWriting(false);
    };

    const getStepBadge = (step: string) => {
        const steps = ["search", "verify", "write", "complete"];
        const currentIndex = steps.indexOf(currentStep);
        const stepIndex = steps.indexOf(step);

        if (stepIndex < currentIndex) {
            return <CheckCircle className="h-4 w-4 text-green-600" />;
        } else if (stepIndex === currentIndex) {
            return <AlertCircle className="h-4 w-4 text-blue-600" />;
        }
        return (
            <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
        );
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link
                    href="/library/dashboard"
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                    <Home className="h-4 w-4" />
                    <span>Library</span>
                </Link>
                <span>/</span>
                <span className="text-foreground font-medium">
                    Issue RFID Tags
                </span>
            </div>

            {/* Header with Back Button */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/library/dashboard">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Tags className="h-8 w-8" />
                            Book RFID Tags Management
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Issue RFID tags and view tagged books status
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="text-lg">
                        {totalUntagged} Untagged
                    </Badge>
                    <Badge variant="default" className="text-lg">
                        {totalTagged} Tagged
                    </Badge>
                </div>
            </div>

            {/* Main Tabs */}
            <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as "issue" | "view")}
            >
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                        value="issue"
                        className="flex items-center gap-2"
                    >
                        <Tags className="h-4 w-4" />
                        Issue Tags
                    </TabsTrigger>
                    <TabsTrigger
                        value="view"
                        className="flex items-center gap-2"
                    >
                        <ListChecks className="h-4 w-4" />
                        View Tagged Books
                    </TabsTrigger>
                </TabsList>

                {/* Issue Tags Tab */}
                <TabsContent value="issue" className="space-y-6 mt-6">
                    {/* Progress Steps */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {getStepBadge("search")}
                                    <span
                                        className={
                                            currentStep === "search"
                                                ? "font-semibold"
                                                : ""
                                        }
                                    >
                                        1. Search & Select
                                    </span>
                                </div>
                                <div className="flex-1 h-px bg-gray-300 mx-4" />
                                <div className="flex items-center gap-2">
                                    {getStepBadge("verify")}
                                    <span
                                        className={
                                            currentStep === "verify"
                                                ? "font-semibold"
                                                : ""
                                        }
                                    >
                                        2. Verify Details
                                    </span>
                                </div>
                                <div className="flex-1 h-px bg-gray-300 mx-4" />
                                <div className="flex items-center gap-2">
                                    {getStepBadge("write")}
                                    <span
                                        className={
                                            currentStep === "write"
                                                ? "font-semibold"
                                                : ""
                                        }
                                    >
                                        3. Write Tag
                                    </span>
                                </div>
                                <div className="flex-1 h-px bg-gray-300 mx-4" />
                                <div className="flex items-center gap-2">
                                    {getStepBadge("complete")}
                                    <span
                                        className={
                                            currentStep === "complete"
                                                ? "font-semibold"
                                                : ""
                                        }
                                    >
                                        4. Complete
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Search & List */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Search Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Search className="h-5 w-5" />
                                        Search Untagged Books
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Search By</Label>
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
                                                    <SelectItem value="title">
                                                        Title
                                                    </SelectItem>
                                                    <SelectItem value="isbn">
                                                        ISBN
                                                    </SelectItem>
                                                    <SelectItem value="barcode">
                                                        Barcode
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <Label>Search Term</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder={`Search by ${searchType}...`}
                                                    value={searchTerm}
                                                    onChange={(e) =>
                                                        setSearchTerm(
                                                            e.target.value
                                                        )
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
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSearchTerm("");
                                                        loadUntaggedBooks();
                                                    }}
                                                >
                                                    Clear
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Books Table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Untagged Book Copies</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="border rounded-lg">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Title</TableHead>
                                                    <TableHead>
                                                        Author
                                                    </TableHead>
                                                    <TableHead>ISBN</TableHead>
                                                    <TableHead>
                                                        Barcode
                                                    </TableHead>
                                                    <TableHead>
                                                        Condition
                                                    </TableHead>
                                                    <TableHead>
                                                        Action
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {untaggedBooks.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={6}
                                                            className="text-center text-muted-foreground"
                                                        >
                                                            {isSearching
                                                                ? "Loading..."
                                                                : "No untagged books found"}
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    untaggedBooks.map(
                                                        (book) => (
                                                            <TableRow
                                                                key={book.id}
                                                                className={
                                                                    selectedBook?.id ===
                                                                    book.id
                                                                        ? "bg-blue-50"
                                                                        : ""
                                                                }
                                                            >
                                                                <TableCell className="font-medium">
                                                                    {
                                                                        book.book_title
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        book.book_author
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {book.book_isbn ||
                                                                        "N/A"}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        book.barcode
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant="outline">
                                                                        {
                                                                            book.condition
                                                                        }
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            handleSelectBook(
                                                                                book
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            selectedBook?.id ===
                                                                                book.id &&
                                                                            currentStep !==
                                                                                "search"
                                                                        }
                                                                    >
                                                                        Select
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    )
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Selected Book & Actions */}
                        <div className="space-y-6">
                            {/* Selected Book Details */}
                            {selectedBook && (
                                <Card className="border-2 border-blue-300">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BookOpen className="h-5 w-5" />
                                            Selected Book
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <strong>Title:</strong>
                                                <p className="text-muted-foreground">
                                                    {selectedBook.book_title}
                                                </p>
                                            </div>
                                            <div>
                                                <strong>Author:</strong>
                                                <p className="text-muted-foreground">
                                                    {selectedBook.book_author}
                                                </p>
                                            </div>
                                            <div>
                                                <strong>ISBN:</strong>
                                                <p className="text-muted-foreground">
                                                    {selectedBook.book_isbn ||
                                                        "N/A"}
                                                </p>
                                            </div>
                                            <div>
                                                <strong>Barcode:</strong>
                                                <p className="text-muted-foreground">
                                                    {selectedBook.barcode}
                                                </p>
                                            </div>
                                            <div>
                                                <strong>Publisher:</strong>
                                                <p className="text-muted-foreground">
                                                    {selectedBook.publisher ||
                                                        "N/A"}
                                                </p>
                                            </div>
                                            <div>
                                                <strong>Location:</strong>
                                                <p className="text-muted-foreground">
                                                    {selectedBook.location ||
                                                        "N/A"}
                                                </p>
                                            </div>
                                        </div>

                                        {currentStep === "verify" && (
                                            <div className="space-y-2 pt-4 border-t">
                                                <Button
                                                    onClick={handleStartWrite}
                                                    className="w-full"
                                                >
                                                    Proceed to Write Tag
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={handleReset}
                                                    className="w-full"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        )}

                                        {currentStep === "complete" && (
                                            <div className="space-y-2 pt-4 border-t">
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                                                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                                    <p className="text-sm font-semibold text-green-800">
                                                        Tag Issued Successfully!
                                                    </p>
                                                </div>
                                                <Button
                                                    onClick={handleReset}
                                                    className="w-full"
                                                >
                                                    Issue Another Tag
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Write Component */}
                            {selectedBook && currentStep === "write" && (
                                <WriteBookTagComponent
                                    bookCopy={selectedBook}
                                    isWriting={isWriting}
                                    onWriteComplete={handleWriteComplete}
                                />
                            )}

                            {/* Read Component for Verification */}
                            {!selectedBook && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Verify Tagged Books
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Use the reader below to verify newly
                                            tagged books
                                        </p>
                                        <ReadBookTagComponent
                                            onTagRead={handleTagRead}
                                        />
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* View Tagged Books Tab */}
                <TabsContent value="view" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="h-5 w-5" />
                                Search Tagged Books
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Search by title, ISBN, barcode, or RFID UID..."
                                        value={taggedSearchTerm}
                                        onChange={(e) =>
                                            setTaggedSearchTerm(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                handleTaggedSearch();
                                            }
                                        }}
                                    />
                                </div>
                                <Select
                                    value={statusFilter}
                                    onValueChange={(value: any) =>
                                        setStatusFilter(value)
                                    }
                                >
                                    <SelectTrigger className="w-48">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Books
                                        </SelectItem>
                                        <SelectItem value="available">
                                            Available
                                        </SelectItem>
                                        <SelectItem value="checked_out">
                                            Checked Out
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    onClick={handleTaggedSearch}
                                    disabled={isLoadingTagged}
                                >
                                    {isLoadingTagged
                                        ? "Searching..."
                                        : "Search"}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setTaggedSearchTerm("");
                                        setStatusFilter("all");
                                        loadTaggedBooks();
                                    }}
                                >
                                    Clear
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Tagged Book Copies ({totalTagged})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Author</TableHead>
                                            <TableHead>Barcode</TableHead>
                                            <TableHead>RFID UID</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Current Loan</TableHead>
                                            <TableHead>Issued At</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {taggedBooks.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={7}
                                                    className="text-center text-muted-foreground"
                                                >
                                                    {isLoadingTagged
                                                        ? "Loading..."
                                                        : "No tagged books found"}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            taggedBooks.map((book) => (
                                                <TableRow key={book.id}>
                                                    <TableCell className="font-medium">
                                                        {book.book_title}
                                                    </TableCell>
                                                    <TableCell>
                                                        {book.book_author}
                                                    </TableCell>
                                                    <TableCell>
                                                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                                            {book.barcode}
                                                        </code>
                                                    </TableCell>
                                                    <TableCell>
                                                        <code className="bg-blue-100 px-2 py-1 rounded text-xs">
                                                            {book.rfid_uid}
                                                        </code>
                                                    </TableCell>
                                                    <TableCell>
                                                        {book.is_available ? (
                                                            <Badge
                                                                variant="default"
                                                                className="bg-green-600"
                                                            >
                                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                                Available
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="destructive">
                                                                <Package className="h-3 w-3 mr-1" />
                                                                Checked Out
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {book.current_loan ? (
                                                            <div className="text-sm">
                                                                <div className="font-medium">
                                                                    {
                                                                        book
                                                                            .current_loan
                                                                            .student_name
                                                                    }
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {
                                                                        book
                                                                            .current_loan
                                                                            .student_register
                                                                    }
                                                                </div>
                                                                <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    Due:{" "}
                                                                    {new Date(
                                                                        book.current_loan.due_date
                                                                    ).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground">
                                                                -
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {new Date(
                                                            book.issued_at
                                                        ).toLocaleDateString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
