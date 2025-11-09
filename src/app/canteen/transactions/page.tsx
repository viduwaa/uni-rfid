"use client";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ArrowLeft,
    Download,
    Calendar,
    Search,
    TrendingUp,
    DollarSign,
    ShoppingCart,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import formatCurrency from "@/lib/formatCurrency";

interface TransactionItem {
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_name: string;
}

interface Transaction {
  id: string;
  transaction_id: string;
  student_id: string;
  register_number: string;
  full_name: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "cancelled";
  created_at: string;
  items: TransactionItem[];
}

interface DailySummary {
  date: string;
  total_transactions: number;
  total_revenue: number;
  total_items_sold: number;
  average_transaction_value: number;
}

type SortField = "date" | "student" | "amount" | "items" | "status";
type SortDirection = "asc" | "desc";

export default function TransactionHistory() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [dailySummaries, setDailySummaries] = useState<
        Record<string, DailySummary>
    >({});
    const [error, setError] = useState<string | null>(null);
    const [sortField, setSortField] = useState<SortField>("date");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Load transactions from API
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: "50",
        });

        const response = await fetch(
          `/api/canteen/transactions?${params.toString()}`
        );
        const data = await response.json();

        console.log("API Response:", data); // Debug log to see the actual response

        if (data.success && data.data.success) {
          const transactionList = Array.isArray(data.data.data)
            ? data.data.data
            : [];
          setTransactions(transactionList);
          setTotalPages(data.data.pagination?.pages || 1);
          console.log("Transaction List:", transactionList);

          // Generate daily summaries from the loaded transactions
          generateDailySummaries(transactionList);
        } else {
          setError(
            data.message || data.data?.message || "Failed to load transactions"
          );
          console.error(
            "Failed to load transactions:",
            data.message || data.data?.message
          );
        }
      } catch (error) {
        setError("Network error loading transactions");
        console.error("Error loading transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [currentPage]);

  // Generate daily summaries from transactions
  const generateDailySummaries = (transactionData: Transaction[] | any) => {
    const summaries: Record<string, DailySummary> = {};

    // Ensure transactionData is an array
    if (!Array.isArray(transactionData)) {
      console.warn("Transaction data is not an array:", transactionData);
      setDailySummaries({});
      return;
    }

    transactionData.forEach((transaction) => {
      if (!transaction || !transaction.created_at) {
        console.warn("Invalid transaction data:", transaction);
        return;
      }

      const date = new Date(transaction.created_at).toDateString();

      if (!summaries[date]) {
        summaries[date] = {
          date,
          total_transactions: 0,
          total_revenue: 0,
          total_items_sold: 0,
          average_transaction_value: 0,
        };
      }

      if (transaction.status === "completed") {
        summaries[date].total_transactions += 1;
        summaries[date].total_revenue += Number(transaction.amount) || 0;
        summaries[date].total_items_sold +=
          transaction.items?.reduce(
            (sum: number, item: any) => sum + (Number(item.quantity) || 0),
            0
          ) || 0;
      }
    });

    // Calculate averages
    Object.keys(summaries).forEach((date) => {
      const summary = summaries[date];
      summary.average_transaction_value =
        summary.total_transactions > 0
          ? summary.total_revenue / summary.total_transactions
          : 0;
    });

    setDailySummaries(summaries);
  };

  // Filter transactions locally for search functionality
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      !searchQuery.trim() ||
      transaction.items?.some((item) =>
        item.item_name?.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      transaction.full_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction.register_number
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const transactionDate = new Date(transaction.created_at);
    const matchesStartDate =
      !startDate || transactionDate >= new Date(startDate);
    const matchesEndDate =
      !endDate || transactionDate <= new Date(endDate + "T23:59:59");

        return matchesSearch && matchesStartDate && matchesEndDate;
    });

    // Sorting function
    const sortedTransactions = useMemo(() => {
        const sorted = [...filteredTransactions];
        
        sorted.sort((a, b) => {
            let compareValue = 0;
            
            switch (sortField) {
                case "date":
                    compareValue = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                    break;
                case "student":
                    compareValue = a.full_name.localeCompare(b.full_name);
                    break;
                case "amount":
                    compareValue = a.amount - b.amount;
                    break;
                case "items":
                    const aItemCount = a.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                    const bItemCount = b.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                    compareValue = aItemCount - bItemCount;
                    break;
                case "status":
                    compareValue = a.status.localeCompare(b.status);
                    break;
            }
            
            return sortDirection === "asc" ? compareValue : -compareValue;
        });
        
        return sorted;
    }, [filteredTransactions, sortField, sortDirection]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) {
            return <ArrowUpDown className="h-4 w-4 ml-2 opacity-50" />;
        }
        return sortDirection === "asc" ? (
            <ArrowUp className="h-4 w-4 ml-2" />
        ) : (
            <ArrowDown className="h-4 w-4 ml-2" />
        );
    };

  // Filter daily summaries based on date range
  const filteredSummaries = Object.values(dailySummaries)
    .filter((summary) => {
      const summaryDate = new Date(summary.date);
      const matchesStartDate = !startDate || summaryDate >= new Date(startDate);
      const matchesEndDate = !endDate || summaryDate <= new Date(endDate);
      return matchesStartDate && matchesEndDate;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Apply search and date filters
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Export to Excel (CSV format)
  const exportToExcel = () => {
    if (filteredTransactions.length === 0) {
      alert("No transactions to export");
      return;
    }

    // Create CSV content
    const headers = [
      "Transaction ID",
      "Student ID",
      "Student Name",
      "Items",
      "Total",
      "Date",
      "Time",
      "Status",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map((transaction) =>
        [
          transaction.transaction_id,
          transaction.register_number,
          `"${transaction.full_name}"`,
          `"${transaction.items?.map((item) => `${item.item_name || "Unknown"} (${item.quantity}x)`).join(", ") || "No items"}"`,
          transaction.amount,
          new Date(transaction.created_at).toLocaleDateString(),
          new Date(transaction.created_at).toLocaleTimeString(),
          transaction.status,
        ].join(",")
      ),
    ].join("\n");

    // Download file
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `canteen_transactions_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

    const clearFilters = () => {
        setSearchQuery("");
        setStartDate("");
        setEndDate("");
        setCurrentPage(1);
        setSortField("date");
        setSortDirection("desc");
    };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <PageHeader
          title="Transaction History"
          breadcrumbs={[
            { label: "Canteen Portal", href: "/canteen" },
            { label: "Transaction History" },
          ]}
          backHref="/canteen"
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading transactions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <PageHeader
          title="Transaction History"
          breadcrumbs={[
            { label: "Canteen Portal", href: "/canteen" },
            { label: "Transaction History" },
          ]}
          backHref="/canteen"
        />
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p className="text-lg font-medium mb-2">
                Error Loading Transactions
              </p>
              <p className="mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <PageHeader
        title="Transaction History"
        breadcrumbs={[
          { label: "Canteen Portal", href: "/canteen" },
          { label: "Transaction History" },
        ]}
        backHref="/canteen"
        right={
          <Button
            variant="outline"
            onClick={exportToExcel}
            className="gap-2"
            disabled={filteredTransactions.length === 0}
          >
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
        }
      />

            {/* Daily Summaries Section */}
            {filteredSummaries.length > 0 && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Daily Summaries
                        </CardTitle>
                        <CardDescription>
                            Transaction summaries for each day
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            {filteredSummaries.map((summary) => (
                                <div
                                    key={summary.date}
                                    className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-semibold text-lg">
                                                {new Date(
                                                    summary.date
                                                ).toLocaleDateString("en-US", {
                                                    weekday: "long",
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <DollarSign className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                                            <p className="text-2xl font-bold text-blue-600">
                                                $
                                                {summary.total_revenue}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Revenue
                                            </p>
                                        </div>
                                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <Calendar className="h-5 w-5 mx-auto mb-1 text-green-600" />
                                            <p className="text-2xl font-bold text-green-600">
                                                {summary.total_transactions}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Transactions
                                            </p>
                                        </div>
                                        <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                            <ShoppingCart className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                                            <p className="text-2xl font-bold text-orange-600">
                                                {summary.total_items_sold}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Items Sold
                                            </p>
                                        </div>
                                        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                                            <p className="text-2xl font-bold text-purple-600">
                                                $
                                                {summary.average_transaction_value}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Avg. Transaction
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filters
          </CardTitle>
          <CardDescription>
            Filter transactions by food name or date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search by Food Name or Student</Label>
              <Input
                id="search"
                placeholder="Enter food name, student name, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex-1"
              >
                Clear Filters
              </Button>
              <Button onClick={handleSearch} size="sm" className="px-3">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredTransactions.length} transactions
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

            {/* Transactions List */}
            <Card>
                <CardHeader>
                    <CardTitle>Transactions</CardTitle>
                    <CardDescription>
                        Complete transaction history with sorting and filtering options
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {sortedTransactions.length === 0 ? (
                        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">
                                No transactions found
                            </p>
                            <p>Try adjusting your search or date filters</p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]"></TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleSort("date")}
                                                className="font-semibold hover:bg-transparent p-0"
                                            >
                                                Date & Time
                                                <SortIcon field="date" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleSort("student")}
                                                className="font-semibold hover:bg-transparent p-0"
                                            >
                                                Student
                                                <SortIcon field="student" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleSort("items")}
                                                className="font-semibold hover:bg-transparent p-0"
                                            >
                                                Items
                                                <SortIcon field="items" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleSort("amount")}
                                                className="font-semibold hover:bg-transparent p-0"
                                            >
                                                Amount
                                                <SortIcon field="amount" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleSort("status")}
                                                className="font-semibold hover:bg-transparent p-0"
                                            >
                                                Status
                                                <SortIcon field="status" />
                                            </Button>
                                        </TableHead>
                                        <TableHead className="w-[100px]">Transaction ID</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedTransactions.map((transaction) => {
                                        const isExpanded = expandedRow === transaction.id;
                                        const itemCount = transaction.items?.reduce(
                                            (sum, item) => sum + item.quantity,
                                            0
                                        ) || 0;

                                        return (
                                            <>
                                                <TableRow
                                                    key={transaction.id}
                                                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                                    onClick={() =>
                                                        setExpandedRow(
                                                            isExpanded ? null : transaction.id
                                                        )
                                                    }
                                                >
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            {isExpanded ? (
                                                                <ChevronUp className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronDown className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">
                                                                {formatDate(transaction.created_at)}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {formatTime(transaction.created_at)}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">
                                                                {transaction.full_name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {transaction.register_number}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <ShoppingCart className="h-4 w-4 text-gray-400" />
                                                            <span className="font-medium">
                                                                {itemCount} {itemCount === 1 ? "item" : "items"}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-bold text-lg">
                                                            ${transaction.amount}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={getStatusColor(
                                                                transaction.status
                                                            )}
                                                        >
                                                            {transaction.status
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                transaction.status.slice(1)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <code className="text-xs text-gray-500">
                                                            {transaction.transaction_id.slice(0, 8)}...
                                                        </code>
                                                    </TableCell>
                                                </TableRow>
                                                {isExpanded && (
                                                    <TableRow>
                                                        <TableCell colSpan={7} className="bg-gray-50 dark:bg-gray-900">
                                                            <div className="p-4">
                                                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                                    <ShoppingCart className="h-4 w-4" />
                                                                    Order Details
                                                                </h4>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                    {transaction.items?.map((item, index) => (
                                                                        <div
                                                                            key={index}
                                                                            className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg px-4 py-3 border"
                                                                        >
                                                                            <div className="flex-1">
                                                                                <div className="font-medium">
                                                                                    {item.item_name || "Unknown Item"}
                                                                                </div>
                                                                                <div className="text-sm text-gray-500">
                                                                                    ${item.unit_price || "0.00"} × {item.quantity}
                                                                                </div>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <div className="font-bold text-green-600">
                                                                                    ${item.total_price || "0.00"}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )) || (
                                                                        <div className="text-gray-500 italic col-span-3">
                                                                            No item details available
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                                                    <div className="text-sm text-gray-500">
                                                                        Transaction ID: <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{transaction.transaction_id}</code>
                                                                    </div>
                                                                    <div className="text-xl font-bold">
                                                                        Total: <span className="text-green-600">${transaction.amount}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
