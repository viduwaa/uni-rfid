"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    UserPlus,
    Search,
    ArrowLeft,
    Loader2,
    AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { MemberSummary } from "@/types/library";

export default function MemberManagement() {
    const [searchQuery, setSearchQuery] = useState("");
    const [members, setMembers] = useState<MemberSummary[]>([]);
    const [filteredMembers, setFilteredMembers] = useState<MemberSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch library members from API
    const fetchMembers = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("/api/library/members");
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch members");
            }

            const data = await response.json();
            setMembers(data.members);
            setFilteredMembers(data.members);
        } catch (error) {
            console.error("Error fetching members:", error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch members";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    // Live search functionality
    useEffect(() => {
        const performSearch = () => {
            if (searchQuery.trim() === "") {
                setFilteredMembers(members);
                return;
            }

            const filtered = members.filter(
                (member) =>
                    member.full_name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    member.register_number
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    member.email
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    member.faculty
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
            );

            setFilteredMembers(filtered);
        };

        const timeoutId = setTimeout(performSearch, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, members]);

    const getMembershipStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            case "suspended":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            case "inactive":
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
        }
    };

    const getFacultyColor = (faculty: string) => {
        const colors = [
            "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
            "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
            "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
            "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
            "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
        ];
        const hash = faculty.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    if (loading) {
        return (
            <div className="container mx-auto py-6 px-4">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading members...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-6 px-4">
                <div className="flex items-center justify-center py-12">
                    <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
                    <span>Error: {error}</span>
                    <Button
                        onClick={fetchMembers}
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
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/library/dashboard">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <UserPlus className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold">Member Management</h1>
                </div>
                <div className="text-sm text-muted-foreground">
                    Total Members: {members.length}
                </div>
            </div>

            <Card>
                <CardHeader className="pb-4">
                    <CardTitle>Library Members</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        All students are automatically registered as library
                        members when they join the university
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Search */}
                    <div className="space-y-2">
                        <Label htmlFor="search">Search Members</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="search"
                                placeholder="Search by name, student ID, email, or faculty"
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Members Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-4 font-medium">
                                        Student ID
                                    </th>
                                    <th className="text-left p-4 font-medium">
                                        Name
                                    </th>
                                    <th className="text-left p-4 font-medium">
                                        Email
                                    </th>
                                    <th className="text-left p-4 font-medium">
                                        Faculty
                                    </th>
                                    <th className="text-left p-4 font-medium">
                                        Year
                                    </th>
                                    <th className="text-left p-4 font-medium">
                                        Status
                                    </th>
                                    <th className="text-left p-4 font-medium">
                                        Current Books
                                    </th>
                                    <th className="text-left p-4 font-medium">
                                        Overdue
                                    </th>
                                    <th className="text-left p-4 font-medium">
                                        Pending Fines
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMembers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="text-center p-8 text-muted-foreground"
                                        >
                                            {searchQuery.trim() === ""
                                                ? "No members found"
                                                : "No members match your search"}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMembers.map((member) => (
                                        <tr
                                            key={member.id}
                                            className="border-b hover:bg-muted/50"
                                        >
                                            <td className="p-4 font-mono text-sm">
                                                {member.register_number}
                                            </td>
                                            <td className="p-4 font-medium">
                                                {member.full_name}
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                {member.email}
                                            </td>
                                            <td className="p-4">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs ${getFacultyColor(member.faculty)}`}
                                                >
                                                    {member.faculty}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="text-sm">
                                                    Year {member.year_of_study}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <Badge
                                                    className={`text-xs capitalize ${getMembershipStatusColor(member.membership_status)}`}
                                                >
                                                    {member.membership_status}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        member.current_loans > 0
                                                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                                                    }`}
                                                >
                                                    {member.current_loans}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        member.overdue_loans > 0
                                                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                    }`}
                                                >
                                                    {member.overdue_loans}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        member.pending_fines > 0
                                                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                                                    }`}
                                                >
                                                    ${member.pending_fines}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary Stats */}
                    {filteredMembers.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {
                                        filteredMembers.filter(
                                            (m) =>
                                                m.membership_status === "active"
                                        ).length
                                    }
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Active Members
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {filteredMembers.reduce(
                                        (sum, m) => sum + m.current_loans,
                                        0
                                    )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Books Checked Out
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">
                                    {filteredMembers.reduce(
                                        (sum, m) => sum + m.overdue_loans,
                                        0
                                    )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Overdue Books
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-600">
                                    $
                                    {filteredMembers.reduce(
                                        (sum, m) => sum + m.pending_fines,
                                        0
                                    )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Pending Fines
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {filteredMembers.length > 0 && (
                        <div className="flex justify-between items-center pt-4 border-t">
                            <div className="text-sm text-muted-foreground">
                                Showing <span className="font-medium">1</span>{" "}
                                to{" "}
                                <span className="font-medium">
                                    {filteredMembers.length}
                                </span>{" "}
                                of{" "}
                                <span className="font-medium">
                                    {filteredMembers.length}
                                </span>{" "}
                                members
                            </div>
                            <Button
                                onClick={fetchMembers}
                                variant="outline"
                                size="sm"
                            >
                                Refresh Data
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
