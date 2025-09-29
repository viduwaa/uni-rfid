"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    BookOpen,
    Users,
    AlertTriangle,
    DollarSign,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
} from "lucide-react";

interface LibraryStats {
    total_books: number;
    available_books: number;
    checked_out_books: number;
    total_members: number;
    active_members: number;
    total_loans: number;
    overdue_loans: number;
    pending_fines: number;
    todays_checkouts: number;
    todays_returns: number;
}

export default function LibraryStatus() {
    const [stats, setStats] = useState<LibraryStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const fetchStats = async () => {
        try {
            const response = await fetch("/api/library/stats");
            if (!response.ok) throw new Error("Failed to fetch stats");

            const data = await response.json();
            setStats(data.stats);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Error fetching library stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();

        // Refresh stats every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="pb-3">
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!stats) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                        Failed to load library statistics
                    </div>
                </CardContent>
            </Card>
        );
    }

    const utilizationRate =
        stats.total_books > 0
            ? Math.round((stats.checked_out_books / stats.total_books) * 100)
            : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold tracking-tight">
                    Library Status
                </h2>
                <div className="text-sm text-muted-foreground">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Books */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Books
                        </CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.total_books.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.available_books} available,{" "}
                            {stats.checked_out_books} on loan
                        </p>
                    </CardContent>
                </Card>

                {/* Active Members */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Library Members
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.total_members.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.active_members} active memberships
                        </p>
                    </CardContent>
                </Card>

                {/* Overdue Books */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Overdue Books
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {stats.overdue_loans}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Out of {stats.total_loans} active loans
                        </p>
                    </CardContent>
                </Card>

                {/* Pending Fines */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pending Fines
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            Rs. {stats.pending_fines.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Outstanding payments
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Today's Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Today's Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm">Checkouts</span>
                            </div>
                            <Badge variant="outline">
                                {stats.todays_checkouts}
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-blue-600" />
                                <span className="text-sm">Returns</span>
                            </div>
                            <Badge variant="outline">
                                {stats.todays_returns}
                            </Badge>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                                Net Change
                            </span>
                            <Badge
                                variant={
                                    stats.todays_checkouts -
                                        stats.todays_returns >=
                                    0
                                        ? "destructive"
                                        : "default"
                                }
                            >
                                {stats.todays_checkouts - stats.todays_returns >
                                0
                                    ? "+"
                                    : ""}
                                {stats.todays_checkouts - stats.todays_returns}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Collection Utilization */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Collection Utilization
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Books on Loan</span>
                                <span>{utilizationRate}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${utilizationRate}%` }}
                                ></div>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-center">
                                <div className="font-medium text-green-600">
                                    {stats.available_books}
                                </div>
                                <div className="text-muted-foreground">
                                    Available
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="font-medium text-blue-600">
                                    {stats.checked_out_books}
                                </div>
                                <div className="text-muted-foreground">
                                    On Loan
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Status Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium">
                                    System Status
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    All systems operational
                                </div>
                            </div>
                            <Badge variant="default" className="bg-green-600">
                                Online
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium">
                                    Overdue Alert
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {stats.overdue_loans > 0
                                        ? `${stats.overdue_loans} items overdue`
                                        : "No overdue items"}
                                </div>
                            </div>
                            <Badge
                                variant={
                                    stats.overdue_loans > 0
                                        ? "destructive"
                                        : "default"
                                }
                            >
                                {stats.overdue_loans > 0 ? "Alert" : "Clear"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium">
                                    Fine Collection
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {stats.pending_fines > 0
                                        ? `Rs. ${stats.pending_fines.toFixed(2)} pending`
                                        : "All fines cleared"}
                                </div>
                            </div>
                            <Badge
                                variant={
                                    stats.pending_fines > 0
                                        ? "destructive"
                                        : "default"
                                }
                            >
                                {stats.pending_fines > 0 ? "Pending" : "Clear"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
