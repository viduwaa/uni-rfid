"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReportSummaryCard } from "./ReportComponents";
import {
    ReportFilters,
    SystemUsageReport as SystemUsageReportType,
} from "@/types/reports";
import {
    Users,
    Activity,
    ShoppingCart,
    BookOpen,
    UserCheck,
    Loader2,
} from "lucide-react";

export default function SystemUsageReport() {
    const [filters, setFilters] = useState<ReportFilters>({});
    const [data, setData] = useState<SystemUsageReportType | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const generateReport = async () => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (filters.dateRange?.startDate)
                queryParams.append("startDate", filters.dateRange.startDate);
            if (filters.dateRange?.endDate)
                queryParams.append("endDate", filters.dateRange.endDate);

            const response = await fetch(
                `/api/admin/reports/system-usage?${queryParams}`
            );
            const result = await response.json();

            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error("Error generating system usage report:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Date Range Filter</CardTitle>
                    <CardDescription>
                        Select period for system usage analysis
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={filters.dateRange?.startDate || ""}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        dateRange: {
                                            ...filters.dateRange,
                                            startDate: e.target.value,
                                            endDate:
                                                filters.dateRange?.endDate ||
                                                "",
                                        },
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={filters.dateRange?.endDate || ""}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        dateRange: {
                                            startDate:
                                                filters.dateRange?.startDate ||
                                                "",
                                            endDate: e.target.value,
                                        },
                                    })
                                }
                            />
                        </div>
                    </div>
                    <Button
                        onClick={generateReport}
                        disabled={isLoading}
                        className="mt-4"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            "Generate Report"
                        )}
                    </Button>
                </CardContent>
            </Card>

            {data && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <ReportSummaryCard
                            title="Total Users"
                            value={data.total_users}
                            icon={<Users className="h-4 w-4 text-blue-600" />}
                        />
                        <ReportSummaryCard
                            title="Active Students"
                            value={data.active_students}
                            icon={
                                <UserCheck className="h-4 w-4 text-green-600" />
                            }
                        />
                        <ReportSummaryCard
                            title="Active Lecturers"
                            value={data.active_lecturers}
                            icon={<Users className="h-4 w-4 text-purple-600" />}
                        />
                        <ReportSummaryCard
                            title="NFC Events"
                            value={data.total_nfc_events}
                            icon={
                                <Activity className="h-4 w-4 text-orange-600" />
                            }
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5" />
                                    Canteen Module
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Transactions:
                                    </span>
                                    <span className="font-semibold">
                                        {data.by_module.canteen.transactions}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Revenue:
                                    </span>
                                    <span className="font-semibold">
                                        $
                                        {data.by_module.canteen.revenue.toFixed(
                                            2
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Active Users:
                                    </span>
                                    <span className="font-semibold">
                                        {data.by_module.canteen.active_users}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    Library Module
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Loans:
                                    </span>
                                    <span className="font-semibold">
                                        {data.by_module.library.loans}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Returns:
                                    </span>
                                    <span className="font-semibold">
                                        {data.by_module.library.returns}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Active Users:
                                    </span>
                                    <span className="font-semibold">
                                        {data.by_module.library.active_users}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserCheck className="h-5 w-5" />
                                    Attendance Module
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Total Records:
                                    </span>
                                    <span className="font-semibold">
                                        {
                                            data.by_module.attendance
                                                .total_records
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Unique Students:
                                    </span>
                                    <span className="font-semibold">
                                        {
                                            data.by_module.attendance
                                                .unique_students
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Unique Courses:
                                    </span>
                                    <span className="font-semibold">
                                        {
                                            data.by_module.attendance
                                                .unique_courses
                                        }
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
