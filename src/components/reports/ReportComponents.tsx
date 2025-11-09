"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Download, RefreshCw, Loader2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    convertToCSV,
    downloadCSV,
    generateReportFilename,
    reportFormatters,
} from "@/lib/csvUtils";
import { ReportFilters } from "@/types/reports";

interface ReportSummaryCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
}

export function ReportSummaryCard({
    title,
    value,
    description,
    icon,
}: ReportSummaryCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

interface FilterPanelProps {
    onFilterChange: (filters: ReportFilters) => void;
    onGenerate: () => void;
    isLoading: boolean;
    showDateRange?: boolean;
    showFaculty?: boolean;
    showYear?: boolean;
    showCourse?: boolean;
    showLecturer?: boolean;
    showStudent?: boolean;
}

export function FilterPanel({
    onFilterChange,
    onGenerate,
    isLoading,
    showDateRange = true,
    showFaculty = true,
    showYear = false,
    showCourse = false,
    showLecturer = false,
    showStudent = false,
}: FilterPanelProps) {
    const [filters, setFilters] = useState<ReportFilters>({});

    const handleFilterUpdate = (key: string, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleDateRangeUpdate = (
        field: "startDate" | "endDate",
        value: string
    ) => {
        const dateRange = filters.dateRange || { startDate: "", endDate: "" };
        const newDateRange = { ...dateRange, [field]: value };
        const newFilters = { ...filters, dateRange: newDateRange };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Configure report parameters</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {showDateRange && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={filters.dateRange?.startDate || ""}
                                    onChange={(e) =>
                                        handleDateRangeUpdate(
                                            "startDate",
                                            e.target.value
                                        )
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
                                        handleDateRangeUpdate(
                                            "endDate",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                        </>
                    )}

                    {showFaculty && (
                        <div className="space-y-2">
                            <Label htmlFor="faculty">Faculty</Label>
                            <Select
                                value={filters.faculty || "all"}
                                onValueChange={(value) =>
                                    handleFilterUpdate(
                                        "faculty",
                                        value === "all" ? undefined : value
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Faculties" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Faculties
                                    </SelectItem>
                                    <SelectItem value="Engineering">
                                        Engineering
                                    </SelectItem>
                                    <SelectItem value="Science">
                                        Science
                                    </SelectItem>
                                    <SelectItem value="Arts">Arts</SelectItem>
                                    <SelectItem value="Medicine">
                                        Medicine
                                    </SelectItem>
                                    <SelectItem value="Business">
                                        Business
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {showYear && (
                        <div className="space-y-2">
                            <Label htmlFor="year">Year of Study</Label>
                            <Select
                                value={filters.year?.toString() || "all"}
                                onValueChange={(value) =>
                                    handleFilterUpdate(
                                        "year",
                                        value === "all"
                                            ? undefined
                                            : parseInt(value)
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Years" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Years
                                    </SelectItem>
                                    <SelectItem value="1">Year 1</SelectItem>
                                    <SelectItem value="2">Year 2</SelectItem>
                                    <SelectItem value="3">Year 3</SelectItem>
                                    <SelectItem value="4">Year 4</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex gap-2">
                    <Button onClick={onGenerate} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Generate Report
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

interface DataTableProps {
    columns: Array<{ key: string; label: string }>;
    data: any[];
    onExportCSV: () => void;
    isLoading?: boolean;
}

export function DataTable({
    columns,
    data,
    onExportCSV,
    isLoading = false,
}: DataTableProps) {
    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">
                        No data available. Generate a report to see results.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Detailed Report</CardTitle>
                    <CardDescription>
                        {data.length} records found
                    </CardDescription>
                </div>
                <Button onClick={onExportCSV} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map((col) => (
                                    <TableHead key={col.key}>
                                        {col.label}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((row, idx) => (
                                <TableRow key={idx}>
                                    {columns.map((col) => (
                                        <TableCell key={col.key}>
                                            {row[col.key] ?? "N/A"}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
