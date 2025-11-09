"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  ArrowLeft,
  Download,
  FileText,
  BookOpen,
  Users,
  DollarSign,
  Package,
  AlertTriangle,
  Loader2,
  Home,
  ChevronRight,
} from "lucide-react";
import formatCurrency from "@/lib/formatCurrency";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface CirculationReport {
  total_loans: number;
  active_loans: number;
  returned_loans: number;
  overdue_loans: number;
  period: string;
}

interface FinancialReport {
  total_fines: number;
  paid_fines: number;
  pending_fines: number;
  waived_fines: number;
  period: string;
}

interface InventoryReport {
  total_books: number;
  total_copies: number;
  available_copies: number;
  checked_out_copies: number;
  categories: { category: string; count: number }[];
}

interface PopularBooksReport {
  book_id: string;
  title: string;
  author: string;
  loan_count: number;
}

export default function LibraryReports() {
  const [reportPeriod, setReportPeriod] = useState("7"); // 7 days default
  const [circulationData, setCirculationData] =
    useState<CirculationReport | null>(null);
  const [financialData, setFinancialData] = useState<FinancialReport | null>(
    null
  );
  const [inventoryData, setInventoryData] = useState<InventoryReport | null>(
    null
  );
  const [popularBooks, setPopularBooks] = useState<PopularBooksReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all reports data
  const fetchReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ period: reportPeriod });

      // Fetch all reports in parallel
      const [circulationRes, financialRes, inventoryRes, popularRes] =
        await Promise.all([
          fetch(`/api/library/reports/circulation?${params}`),
          fetch(`/api/library/reports/financial?${params}`),
          fetch(`/api/library/reports/inventory`),
          fetch(`/api/library/reports/popular-books?${params}`),
        ]);

      if (
        !circulationRes.ok ||
        !financialRes.ok ||
        !inventoryRes.ok ||
        !popularRes.ok
      ) {
        throw new Error("Failed to fetch reports");
      }

      const [circulation, financial, inventory, popular] = await Promise.all([
        circulationRes.json(),
        financialRes.json(),
        inventoryRes.json(),
        popularRes.json(),
      ]);

      setCirculationData(circulation);
      setFinancialData(financial);
      setInventoryData(inventory);
      setPopularBooks(popular.books || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch reports"
      );
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [reportPeriod]);

  const exportReport = async (reportType: string) => {
    try {
      const params = new URLSearchParams({
        period: reportPeriod,
        type: reportType,
        format: "csv",
      });

      const response = await fetch(`/api/library/reports/export?${params}`);
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `library-${reportType}-report.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`${reportType} report exported successfully`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export report");
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "7":
        return "Last 7 Days";
      case "30":
        return "Last 30 Days";
      case "90":
        return "Last 3 Months";
      case "365":
        return "Last Year";
      default:
        return "Custom Period";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading reports...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center py-12">
          <AlertTriangle className="h-8 w-8 text-red-500 mr-2" />
          <div className="text-center">
            <p className="text-lg">Error loading reports</p>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={fetchReports} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <PageHeader
        title="Library Reports"
        subtitle="Generate reports for circulation, finance and inventory"
        breadcrumbs={[
          { label: "Library", href: "/library/dashboard" },
          { label: "Reports" },
        ]}
        backHref="/library/dashboard"
        centerIcon={<BarChart3 className="h-8 w-8 text-primary mx-auto" />}
        right={
          <div className="hidden md:flex items-center justify-end gap-4">
            <Select value={reportPeriod} onValueChange={setReportPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 3 Months</SelectItem>
                <SelectItem value="365">Last Year</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => fetchReports()} variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Circulation Report */}
      {circulationData && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Circulation Statistics
              </CardTitle>
              <CardDescription>{getPeriodLabel(reportPeriod)}</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportReport("circulation")}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {circulationData.total_loans}
                </div>
                <div className="text-sm text-muted-foreground">Total Loans</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {circulationData.active_loans}
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Loans
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {circulationData.returned_loans}
                </div>
                <div className="text-sm text-muted-foreground">Returned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {circulationData.overdue_loans}
                </div>
                <div className="text-sm text-muted-foreground">Overdue</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Report */}
      {financialData && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Report
              </CardTitle>
              <CardDescription>{getPeriodLabel(reportPeriod)}</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportReport("financial")}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(financialData.total_fines)}
                </div>
                <div className="text-sm text-muted-foreground">Total Fines</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(financialData.paid_fines)}
                </div>
                <div className="text-sm text-muted-foreground">Paid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(financialData.pending_fines)}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {formatCurrency(financialData.waived_fines)}
                </div>
                <div className="text-sm text-muted-foreground">Waived</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Report */}
        {inventoryData && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Inventory Status
                </CardTitle>
                <CardDescription>Current collection overview</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportReport("inventory")}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">
                    {inventoryData.total_books}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Books
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">
                    {inventoryData.total_copies}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Copies
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-600">
                    {inventoryData.available_copies}
                  </div>
                  <div className="text-sm text-muted-foreground">Available</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-600">
                    {inventoryData.checked_out_copies}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Checked Out
                  </div>
                </div>
              </div>

              {inventoryData.categories.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Categories:</h4>
                  <div className="flex flex-wrap gap-2">
                    {inventoryData.categories.map((cat, index) => (
                      <Badge key={index} variant="outline">
                        {cat.category}: {cat.count}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Popular Books */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Popular Books
              </CardTitle>
              <CardDescription>{getPeriodLabel(reportPeriod)}</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportReport("popular")}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            {popularBooks.length > 0 ? (
              <div className="space-y-3">
                {popularBooks.slice(0, 5).map((book, index) => (
                  <div
                    key={book.book_id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{book.title}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {book.author}
                      </div>
                    </div>
                    <div className="ml-2 text-center">
                      <div className="text-lg font-bold text-primary">
                        {book.loan_count}
                      </div>
                      <div className="text-xs text-muted-foreground">loans</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No loan data available for this period
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
