"use client";

import { useState } from "react";
import LoginForm from "@/components/LoginForm";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { BookOpen, UserCircle, Sparkles, FileSearch } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LibraryLanding() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<
        "login" | "self-service" | "catalog"
    >("login");

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto py-10 px-4">
                {/* Header */}
                <div className="text-center mb-12 space-y-4">
                    <div className="flex items-center justify-center gap-3">
                        <BookOpen className="h-10 w-10 text-primary" />
                        <h1 className="text-5xl font-bold text-foreground">
                            Library Portal
                        </h1>
                    </div>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Choose your access method
                    </p>
                </div>

                {/* Tab Selection */}
                <div className="flex justify-center gap-4 mb-8 max-w-3xl mx-auto">
                    <Button
                        variant={activeTab === "login" ? "default" : "outline"}
                        className="flex-1 h-12 text-base"
                        onClick={() => setActiveTab("login")}
                    >
                        <UserCircle className="h-4 w-4 mr-2" />
                        Staff Login
                    </Button>
                    <Button
                        variant={
                            activeTab === "self-service" ? "default" : "outline"
                        }
                        className="flex-1 h-12 text-base"
                        onClick={() => setActiveTab("self-service")}
                    >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Self Service
                    </Button>
                    <Button
                        variant={
                            activeTab === "catalog" ? "default" : "outline"
                        }
                        className="flex-1 h-12 text-base"
                        onClick={() => setActiveTab("catalog")}
                    >
                        <FileSearch className="h-4 w-4 mr-2" />
                        Catalog Search
                    </Button>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto">
                    {activeTab === "login" ? (
                        <div className="animate-in fade-in duration-300">
                            <LoginForm role="library" />
                        </div>
                    ) : activeTab === "catalog" ? (
                        <div className="animate-in fade-in duration-300">
                            <Card>
                                <CardHeader className="text-center space-y-4">
                                    <div className="mx-auto p-4 bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center">
                                        <FileSearch className="h-10 w-10 text-primary" />
                                    </div>
                                    <CardTitle className="text-2xl font-bold">
                                        Library Catalog
                                    </CardTitle>
                                    <CardDescription className="text-base">
                                        Search and browse our complete library
                                        collection
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-3 p-4 bg-muted rounded-lg border">
                                        <h3 className="font-semibold text-base">
                                            📚 Available Features
                                        </h3>
                                        <ul className="space-y-2 text-sm text-muted-foreground">
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary mt-1">
                                                    ✓
                                                </span>
                                                <span>
                                                    Search by title, author, or
                                                    ISBN
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary mt-1">
                                                    ✓
                                                </span>
                                                <span>
                                                    Filter by category and
                                                    availability
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary mt-1">
                                                    ✓
                                                </span>
                                                <span>
                                                    View book details and
                                                    location
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-primary mt-1">
                                                    ✓
                                                </span>
                                                <span>
                                                    Check availability status
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                    <Button
                                        className="w-full h-12"
                                        onClick={() =>
                                            router.push(
                                                "/library/catalog-search"
                                            )
                                        }
                                    >
                                        <FileSearch className="h-4 w-4 mr-2" />
                                        Browse Catalog
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-300">
                            <Card>
                                <CardHeader className="text-center space-y-4">
                                    <div className="mx-auto p-4 bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center">
                                        <Sparkles className="h-10 w-10 text-primary" />
                                    </div>
                                    <CardTitle className="text-2xl font-bold">
                                        Self-Service Library
                                    </CardTitle>
                                    <CardDescription className="text-base">
                                        Quick and easy book borrowing and
                                        returns with RFID technology
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-3 p-4 bg-muted rounded-lg border">
                                            <h3 className="font-semibold text-base">
                                                📚 Borrow Books
                                            </h3>
                                            <ul className="space-y-2 text-sm text-muted-foreground">
                                                <li className="flex items-start gap-2">
                                                    <span className="text-primary mt-1">
                                                        ✓
                                                    </span>
                                                    <span>
                                                        Scan your student card
                                                    </span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-primary mt-1">
                                                        ✓
                                                    </span>
                                                    <span>
                                                        Scan book RFID tags
                                                    </span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-primary mt-1">
                                                        ✓
                                                    </span>
                                                    <span>
                                                        Instant checkout
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="space-y-3 p-4 bg-muted rounded-lg border">
                                            <h3 className="font-semibold text-base">
                                                📖 Return Books
                                            </h3>
                                            <ul className="space-y-2 text-sm text-muted-foreground">
                                                <li className="flex items-start gap-2">
                                                    <span className="text-primary mt-1">
                                                        ✓
                                                    </span>
                                                    <span>
                                                        Scan book RFID tag
                                                    </span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-primary mt-1">
                                                        ✓
                                                    </span>
                                                    <span>
                                                        Auto borrower ID
                                                    </span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-primary mt-1">
                                                        ✓
                                                    </span>
                                                    <span>Instant return</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full h-12"
                                        onClick={() =>
                                            router.push("/library/self-service")
                                        }
                                    >
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Enter Self-Service Portal
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
