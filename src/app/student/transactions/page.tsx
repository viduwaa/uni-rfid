"use client";
import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    CreditCard,
    ArrowLeft,
    Loader2,
    ShoppingCart,
    Calendar,
    Receipt,
    TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface Transaction {
    id: string;
    transaction_id: string;
    amount: number;
    description: string;
    status: string;
    transaction_date: string;
    payment_method: string;
    items: Array<{
        name: string;
        category: string;
        quantity: number;
        unit_price: number;
        total_price: number;
    }>;
}

export default function StudentTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/student/transactions?limit=50");

            if (!response.ok) {
                throw new Error("Failed to fetch transactions");
            }

            const result = await response.json();

            if (result.success) {
                setTransactions(result.data);
                setError(null);
            } else {
                throw new Error(
                    result.message || "Failed to fetch transactions"
                );
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed":
                return "bg-green-100 text-green-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "failed":
                return "bg-red-100 text-red-800";
            case "cancelled":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const totalSpent = transactions
        .filter((t) => t.status === "completed")
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-96">
                    <CardHeader>
                        <CardTitle className="text-red-600">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4 mb-8">
                    <Link href="/student/dashboard">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Transaction History
                        </h1>
                        <p className="text-gray-600">
                            View your canteen and payment transactions
                        </p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Transactions
                            </CardTitle>
                            <Receipt className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-700">
                                {transactions.length}
                            </div>
                            <p className="text-xs text-gray-600">All time</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-green-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Spent
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-700">
                                Rs. {totalSpent.toFixed(2)}
                            </div>
                            <p className="text-xs text-gray-600">
                                Completed transactions
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                This Month
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-700">
                                {
                                    transactions.filter((t) => {
                                        const transactionDate = new Date(
                                            t.transaction_date
                                        );
                                        const now = new Date();
                                        return (
                                            transactionDate.getMonth() ===
                                                now.getMonth() &&
                                            transactionDate.getFullYear() ===
                                                now.getFullYear()
                                        );
                                    }).length
                                }
                            </div>
                            <p className="text-xs text-gray-600">
                                Transactions
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Transactions Table */}
                <Card className="bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <CreditCard className="h-5 w-5" />
                            <span>Recent Transactions</span>
                        </CardTitle>
                        <CardDescription>
                            Your complete transaction history
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {transactions.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                Transaction ID
                                            </TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>
                                                Payment Method
                                            </TableHead>
                                            <TableHead>Items</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.map((transaction) => (
                                            <TableRow key={transaction.id}>
                                                <TableCell className="font-mono text-sm">
                                                    {transaction.transaction_id}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(
                                                        transaction.transaction_date
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        }
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    Rs.{" "}
                                                    {parseFloat(transaction.amount.toString()).toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={getStatusColor(
                                                            transaction.status
                                                        )}
                                                    >
                                                        {transaction.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {
                                                            transaction.payment_method
                                                        }
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {transaction.items &&
                                                    transaction.items.length >
                                                        0 ? (
                                                        <div className="space-y-1">
                                                            {transaction.items
                                                                .slice(0, 2)
                                                                .map(
                                                                    (
                                                                        item,
                                                                        index
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="text-sm"
                                                                        >
                                                                            {
                                                                                item.quantity
                                                                            }
                                                                            x{" "}
                                                                            {
                                                                                item.name
                                                                            }
                                                                        </div>
                                                                    )
                                                                )}
                                                            {transaction.items
                                                                .length > 2 && (
                                                                <div className="text-xs text-gray-500">
                                                                    +
                                                                    {transaction
                                                                        .items
                                                                        .length -
                                                                        2}{" "}
                                                                    more items
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-500 text-sm">
                                                            -
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No Transactions
                                </h3>
                                <p className="text-gray-600">
                                    You haven't made any transactions yet. Your
                                    transaction history will appear here.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
