import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/Logout";
import {
    BookPlus,
    BookOpenCheck,
    BookMarked,
    UserPlus,
    Users,
    LibraryBig,
    FileSearch,
    BarChart3,
    Settings,
    CreditCard,
    ArrowLeftRight,
    Tag,
    Sparkles,
} from "lucide-react";

export default function LibraryDashboard() {
    return (
        <div className="min-h-screen">
            <div className="container mx-auto py-10 p-6 space-y-6">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold tracking-tight text-center">
                        Library Management System
                    </h1>
                    <p className="mt-2 text-muted-foreground text-center">
                        Comprehensive tools for library administration
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 px-5">
                    {/* Self Service Portal - Featured */}
                    <Link
                        href="./self-service/"
                        className="block md:col-span-2 lg:col-span-1"
                    >
                        <Card className="h-full transition-all hover:shadow-2xl border-2 bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 dark:from-purple-950 dark:via-blue-950 dark:to-pink-950 border-purple-300 dark:border-purple-700 relative overflow-hidden group">
                            {/* Animated glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-blue-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />

                            <CardHeader className="relative z-10">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-8 w-8 text-purple-600 animate-pulse" />
                                    <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full font-semibold shadow-lg">
                                        ✨ SELF SERVICE
                                    </span>
                                </div>
                                <CardTitle className="mt-2 text-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
                                    Self Service Portal
                                </CardTitle>
                                <CardDescription className="text-base">
                                    Quick borrow & return with RFID
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <p className="text-sm text-muted-foreground mb-4">
                                    Fast, contactless self-service for borrowing
                                    and returning books using RFID technology
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                                        📚 Borrow
                                    </span>
                                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                                        📖 Return
                                    </span>
                                    <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                                        ⚡ Instant
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Book Management */}
                    <Link href="./book-add/" className="block">
                        <Card className="h-full transition-all hover:shadow-md">
                            <CardHeader>
                                <BookPlus className="h-8 w-8 text-primary" />
                                <CardTitle className="mt-2">
                                    Add New Books
                                </CardTitle>
                                <CardDescription>
                                    Catalog new books into the library
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Add book details including title, author,
                                    ISBN, and category
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Issue RFID Tags */}
                    <Link href="./issue-tags/" className="block">
                        <Card className="h-full transition-all hover:shadow-md border-2 border-purple-200 dark:border-purple-800">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Tag className="h-8 w-8 text-purple-600" />
                                    <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                                        RFID
                                    </span>
                                </div>
                                <CardTitle className="mt-2">
                                    Issue Book Tags
                                </CardTitle>
                                <CardDescription>
                                    Write RFID tags to untagged books
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Search and issue RFID tags to book copies
                                    that don't have tags yet
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Member Management */}
                    <Link href="./member-management/" className="block">
                        <Card className="h-full transition-all hover:shadow-md">
                            <CardHeader>
                                <UserPlus className="h-8 w-8 text-primary" />
                                <CardTitle className="mt-2">
                                    Member Management
                                </CardTitle>
                                <CardDescription>
                                    Manage library memberships
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Register and manage students, faculty, and
                                    staff members
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Catalog Search */}
                    <Link href="./catalog-search/" className="block">
                        <Card className="h-full transition-all hover:shadow-md">
                            <CardHeader>
                                <FileSearch className="h-8 w-8 text-primary" />
                                <CardTitle className="mt-2">
                                    Catalog Search
                                </CardTitle>
                                <CardDescription>
                                    Search the entire library collection
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Advanced search by title, author, subject,
                                    or ISBN
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Reports */}
                    <Link href="./reports/" className="block">
                        <Card className="h-full transition-all hover:shadow-md">
                            <CardHeader>
                                <BarChart3 className="h-8 w-8 text-primary" />
                                <CardTitle className="mt-2">
                                    Library Reports
                                </CardTitle>
                                <CardDescription>
                                    Generate library usage statistics
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Circulation reports, overdue books, and
                                    inventory status
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                <div className="mt-8 flex justify-end px-5">
                    <LogoutButton />
                </div>
            </div>
        </div>
    );
}
