"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileText,
  TrendingUp,
  DollarSign,
  BookOpen,
  Users,
  CreditCard,
  Activity,
  ArrowLeft,
  Home,
  ChevronRight,
} from "lucide-react";
import AttendanceReport from "@/components/reports/AttendanceReport";
import CanteenFinancialReport from "@/components/reports/CanteenFinancialReport";
import LibraryFinancialReport from "@/components/reports/LibraryFinancialReport";
import StudentPerformanceReport from "@/components/reports/StudentPerformanceReport";
import CourseAnalyticsReport from "@/components/reports/CourseAnalyticsReport";
import LibraryUsageReport from "@/components/reports/LibraryUsageReport";
import CardUsageReport from "@/components/reports/CardUsageReport";
import SystemUsageReport from "@/components/reports/SystemUsageReport";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("attendance");
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-10 p-6">
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Reports" },
          ]}
          title={"Reports & Analytics"}
          subtitle={
            "Generate comprehensive reports with filtering and CSV export"
          }
          backHref="/admin/dashboard"
        />
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-2">
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Attendance</span>
            </TabsTrigger>
            <TabsTrigger value="canteen" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Canteen</span>
            </TabsTrigger>
            <TabsTrigger
              value="library-financial"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Library Fines</span>
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Courses</span>
            </TabsTrigger>
            <TabsTrigger
              value="library-usage"
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Library</span>
            </TabsTrigger>
            <TabsTrigger value="cards" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Cards</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance">
            <AttendanceReport />
          </TabsContent>

          <TabsContent value="canteen">
            <CanteenFinancialReport />
          </TabsContent>

          <TabsContent value="library-financial">
            <LibraryFinancialReport />
          </TabsContent>

          <TabsContent value="performance">
            <StudentPerformanceReport />
          </TabsContent>

          <TabsContent value="courses">
            <CourseAnalyticsReport />
          </TabsContent>

          <TabsContent value="library-usage">
            <LibraryUsageReport />
          </TabsContent>

          <TabsContent value="cards">
            <CardUsageReport />
          </TabsContent>

          <TabsContent value="system">
            <SystemUsageReport />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
