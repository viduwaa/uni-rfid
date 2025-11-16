"use client";

import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpenCheck, BookMarked, ArrowLeft, Sparkles } from "lucide-react";

export default function SelfServicePortal() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto py-10 px-6 space-y-8">
                {/* Header with back button */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/library">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link> 
                </div>

                {/* Hero Section */}
                <div className="text-center space-y-4 mb-12">
                    <div className="flex items-center justify-center gap-3">
                        <Sparkles className="h-8 w-8 text-primary" />
                        <h1 className="text-4xl font-bold text-foreground">
                            Self Service Library Portal
                        </h1>
                    </div>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Fast, Easy, and Contactless - Manage your book borrowing
                        and returns
                    </p>
                </div>

                {/* Service Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {/* Borrow Books Card */}
                    <Link href="/library/book-checkout" className="block group">
                        <Card className="h-full transition-all duration-200 hover:shadow-lg border">
                            <CardHeader>
                                <div className="flex items-center justify-center mb-4">
                                    <div className="p-3 bg-primary/10 rounded-full">
                                        <BookOpenCheck className="h-8 w-8 text-primary" />
                                    </div>
                                </div>
                                <CardTitle className="text-2xl text-center font-bold">
                                    Borrow Books
                                </CardTitle>
                                <CardDescription className="text-center text-sm mt-2">
                                    Quick and easy book checkout
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2 text-sm">
                                        <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mt-1.5" />
                                        <p className="text-muted-foreground">
                                            Scan your student card
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm">
                                        <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mt-1.5" />
                                        <p className="text-muted-foreground">
                                            Scan books you want to borrow
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm">
                                        <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mt-1.5" />
                                        <p className="text-muted-foreground">
                                            Confirm and complete checkout
                                        </p>
                                    </div>
                                </div>
                                <Button className="w-full">
                                    Start Borrowing →
                                </Button>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Return Books Card */}
                    <Link href="/library/book-returns" className="block group">
                        <Card className="h-full transition-all duration-200 hover:shadow-lg border">
                            <CardHeader>
                                <div className="flex items-center justify-center mb-4">
                                    <div className="p-3 bg-primary/10 rounded-full">
                                        <BookMarked className="h-8 w-8 text-primary" />
                                    </div>
                                </div>
                                <CardTitle className="text-2xl text-center font-bold">
                                    Return Books
                                </CardTitle>
                                <CardDescription className="text-center text-sm mt-2">
                                    Automated book return process
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2 text-sm">
                                        <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mt-1.5" />
                                        <p className="text-muted-foreground">
                                            Scan book RFID tag
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm">
                                        <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mt-1.5" />
                                        <p className="text-muted-foreground">
                                            System shows borrower details
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm">
                                        <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full mt-1.5" />
                                        <p className="text-muted-foreground">
                                            Confirm and complete return
                                        </p>
                                    </div>
                                </div>
                                <Button className="w-full">
                                    Start Returning →
                                </Button>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Info Banner */}
                <div className="max-w-3xl mx-auto mt-12">
                    <Card className="border bg-muted/50">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-base mb-2">
                                        Quick & Contactless Service
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Our RFID-enabled self-service system
                                        makes borrowing and returning books
                                        faster than ever. Simply scan your items
                                        and you're done!
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
