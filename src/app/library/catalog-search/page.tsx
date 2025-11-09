"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    FileSearch,
    Search,
    ArrowLeft,
    BookOpen,
    MapPin,
    Hash,
    Users,
    Loader2,
    AlertCircle,
} from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { toast } from "sonner";
import type { BookWithAvailability } from "@/types/library";

interface SearchFilters {
    search: string;
    category: string;
    author: string;
    availableOnly: boolean;
}

export default function CatalogSearch() {
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({
        search: "",
        category: "all",
        author: "",
        availableOnly: false,
    });
    const [books, setBooks] = useState<BookWithAvailability[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<string[]>([]);

    // Fetch books from API
    const fetchBooks = async (filters?: SearchFilters) => {
        try {
            setLoading(true);
            setError(null);

            const currentFilters = filters || searchFilters;
            const params = new URLSearchParams();

            if (currentFilters.search.trim()) {
                params.append("search", currentFilters.search.trim());
            }
            if (currentFilters.category && currentFilters.category !== "all") {
                params.append("category", currentFilters.category);
            }
            if (currentFilters.author.trim()) {
                params.append("author", currentFilters.author.trim());
            }
            if (currentFilters.availableOnly) {
                params.append("available_only", "true");
            }

            const response = await fetch(`/api/library/books?${params}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch books");
            }

            const data = await response.json();
            setBooks(data.books);

            // Extract unique categories for filter dropdown
            const uniqueCategories = [
                ...new Set(
                    data.books
                        .map((book: BookWithAvailability) => book.category)
                        .filter(
                            (category: string | null | undefined) =>
                                category && category.trim() !== ""
                        )
                ),
            ].sort() as string[];
            setCategories(uniqueCategories);
        } catch (error) {
            console.error("Error fetching books:", error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch books";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchBooks(searchFilters);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchFilters]);

    const handleFilterChange = (
        key: keyof SearchFilters,
        value: string | boolean
    ) => {
        setSearchFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const clearAllFilters = () => {
        const clearedFilters: SearchFilters = {
            search: "",
            category: "all",
            author: "",
            availableOnly: false,
        };
        setSearchFilters(clearedFilters);
        fetchBooks(clearedFilters);
    };

    const hasActiveFilters =
        searchFilters.search.trim() !== "" ||
        (searchFilters.category !== "" && searchFilters.category !== "all") ||
        searchFilters.author.trim() !== "" ||
        searchFilters.availableOnly;

    const getAvailabilityStatus = (available: number, total: number) => {
        if (available === 0) {
            return {
                text: "Not Available",
                color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
            };
        } else if (available <= 2) {
            return {
                text: `${available} available`,
                color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
            };
        } else {
            return {
                text: `${available} available`,
                color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
            };
        }
    };

    const getCategoryColor = (category: string | null) => {
        if (!category)
            return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";

        const colors = [
            "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
            "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
            "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
            "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
            "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
        ];
        const hash = category
            .split("")
            .reduce((a, b) => a + b.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    if (error && books.length === 0) {
        return (
            <div className="container mx-auto py-6 px-4">
                <div className="flex items-center justify-center py-12">
                    <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
                    <span>Error: {error}</span>
                    <Button
                        onClick={() => fetchBooks()}
                        className="ml-4"
                        variant="outline"
                    >
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 px-4">
            {/* Header */}
            <PageHeader
                title="Catalog Search"
                breadcrumbs={[
                    { label: "Library", href: "/library/dashboard" },
                    { label: "Catalog Search" },
                ]}
                backHref="/library/dashboard"
                centerIcon={<FileSearch className="h-8 w-8 text-primary mx-auto" />}
                right={<div className="text-sm text-muted-foreground">{books.length} books found</div>}
            />

            {/* Search Section */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Search Library Catalog
                        </CardTitle>
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearAllFilters}
                            >
                                <span className="mr-2">×</span>
                                Clear All
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Search Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="search">Search Books</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Search by title, author, or ISBN"
                                    className="pl-10"
                                    value={searchFilters.search}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "search",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Filter by Category</Label>
                            <Select
                                value={searchFilters.category}
                                onValueChange={(value) =>
                                    handleFilterChange("category", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All categories
                                    </SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category}
                                            value={category}
                                        >
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="author">Filter by Author</Label>
                            <div className="relative">
                                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="author"
                                    placeholder="Enter author name"
                                    className="pl-10"
                                    value={searchFilters.author}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "author",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-8">
                            <input
                                type="checkbox"
                                id="available-only"
                                checked={searchFilters.availableOnly}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "availableOnly",
                                        e.target.checked
                                    )
                                }
                                className="h-4 w-4"
                            />
                            <Label
                                htmlFor="available-only"
                                className="text-sm font-normal"
                            >
                                Show available only
                            </Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Search Results
                        </span>
                        {loading && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {books.length === 0 && !loading ? (
                        <div className="text-center py-12">
                            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                                {hasActiveFilters
                                    ? "No books match your search criteria"
                                    : "No books found in the catalog"}
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {books.map((book) => {
                                const status = getAvailabilityStatus(
                                    book.available_copies,
                                    book.total_copies
                                );

                                return (
                                    <Card
                                        key={book.id}
                                        className="p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="font-semibold text-lg leading-tight">
                                                        {book.title}
                                                    </h3>
                                                    <Badge
                                                        className={status.color}
                                                    >
                                                        {status.text}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4" />
                                                        <span>
                                                            {book.author}
                                                        </span>
                                                    </div>

                                                    {book.isbn && (
                                                        <div className="flex items-center gap-2">
                                                            <Hash className="h-4 w-4" />
                                                            <span>
                                                                {book.isbn}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {book.location && (
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4" />
                                                            <span>
                                                                {book.location}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-2">
                                                        <BookOpen className="h-4 w-4" />
                                                        <span>
                                                            {
                                                                book.available_copies
                                                            }{" "}
                                                            of{" "}
                                                            {book.total_copies}{" "}
                                                            available
                                                        </span>
                                                    </div>
                                                </div>

                                                {book.description && (
                                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                                        {book.description}
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-2">
                                                    {book.category && (
                                                        <Badge
                                                            variant="outline"
                                                            className={getCategoryColor(
                                                                book.category
                                                            )}
                                                        >
                                                            {book.category}
                                                        </Badge>
                                                    )}
                                                    {book.publication_year && (
                                                        <Badge variant="outline">
                                                            {
                                                                book.publication_year
                                                            }
                                                        </Badge>
                                                    )}
                                                    {book.publisher && (
                                                        <Badge variant="outline">
                                                            {book.publisher}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {/* Loading indicator for search results */}
                    {loading && books.length === 0 && (
                        <div className="flex justify-center py-8">
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Searching catalog...</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
