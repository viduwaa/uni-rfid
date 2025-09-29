"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    ArrowLeft,
    Clock,
    GraduationCap,
    Play,
    Users,
    UserCheck,
    Percent,
    Search,
    Plus,
    X,
    Zap,
    Wifi,
    Activity,
} from "lucide-react";
import Link from "next/link";
import { useNFCAttendance } from "@/hooks/useNFCAttendance";
import NFCStatus from "@/components/NFCStatus";
import { PageHeader } from "@/components/ui/breadcrumb";

interface Course {
    id: string;
    course_code: string;
    course_name: string;
    faculty: string;
    year: number;
    enrolled_students: number;
}

interface AttendanceRecord {
    id: string;
    student_id: string;
    register_number: string;
    student_name: string;
    checked_in: string;
    created_at: string;
}

interface AttendanceSummary {
    total_present: number;
    total_enrolled: number;
    attendance_percentage: number;
}

export default function GetAttendance() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedHall, setSelectedHall] = useState("");
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [attendanceRecords, setAttendanceRecords] = useState<
        AttendanceRecord[]
    >([]);
    const [summary, setSummary] = useState<AttendanceSummary | null>(null);
    const [studentIdInput, setStudentIdInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [lastNFCSwipe, setLastNFCSwipe] = useState<string | null>(null);

    const currentDate = new Date().toISOString().split("T")[0];
    const currentTime = new Date().toTimeString().split(" ")[0].substring(0, 5);

    const currentDateTime = new Date().toLocaleString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    // Initialize NFC attendance hook
    const {
        nfcStatus,
        isProcessing: isNFCProcessing,
        requestNFCStatus,
        isConnected: isSocketConnected,
    } = useNFCAttendance({
        courseId: selectedCourse,
        isSessionActive,
        onAttendanceRecorded: (data) => {
            // Handle real-time attendance updates
            console.log("📊 Attendance recorded via NFC:", data);
            setLastNFCSwipe(data.student.full_name);
            fetchTodayAttendance();

            // Clear the last swipe indicator after 5 seconds
            setTimeout(() => setLastNFCSwipe(null), 5000);
        },
    });

    // Fetch lecturer's courses
    useEffect(() => {
        fetchCourses();
    }, []);

    // Auto-refresh attendance when session is active
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isSessionActive && autoRefresh && selectedCourse) {
            interval = setInterval(() => {
                fetchTodayAttendance();
            }, 30000); // Refresh every 30 seconds
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isSessionActive, autoRefresh, selectedCourse]);

    const fetchCourses = async () => {
        try {
            const response = await fetch("/api/lecturer/courses");
            const data = await response.json();

            if (data.success) {
                setCourses(data.courses);
            } else {
                toast.error(data.message || "Failed to fetch courses");
            }
        } catch (error) {
            toast.error("Error fetching courses");
            console.error("Error fetching courses:", error);
        }
    };

    const fetchTodayAttendance = async () => {
        if (!selectedCourse) return;

        try {
            const response = await fetch(
                `/api/lecturer/attendance?courseId=${selectedCourse}&date=${currentDate}`
            );
            const data = await response.json();

            if (data.success) {
                setAttendanceRecords(data.attendance);
                setSummary(data.summary);
            }
        } catch (error) {
            console.error("Error fetching attendance:", error);
        }
    };

    const startSession = async () => {
        if (!selectedCourse || !selectedHall) {
            toast.error("Please select both course and lecture hall");
            return;
        }

        setIsSessionActive(true);
        setAutoRefresh(true);
        await fetchTodayAttendance();
        toast.success("Attendance session started");
    };

    const stopSession = () => {
        setIsSessionActive(false);
        setAutoRefresh(false);
        toast.info("Attendance session stopped");
    };

    const recordAttendance = async (studentId: string) => {
        if (!selectedCourse) {
            toast.error("Please select a course first");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("/api/lecturer/attendance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    studentId,
                    regno: studentIdInput,
                    courseId: selectedCourse,
                    date: currentDate,
                    time: currentTime,
                    hall: selectedHall,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(`Attendance recorded for student ${studentId}`);
                setStudentIdInput("");
                await fetchTodayAttendance(); // Refresh the list
            } else {
                toast.error(data.message || "Failed to record attendance");
            }
        } catch (error) {
            toast.error("Error recording attendance");
            console.error("Error recording attendance:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStudentIdSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (studentIdInput.trim()) {
            recordAttendance(studentIdInput.trim());
        }
    };

    const selectedCourseData = courses.find((c) => c.id === selectedCourse);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <PageHeader
                    title="Get Attendance"
                    breadcrumbs={[
                        { label: "Dashboard", href: "/lecturer/dashboard" },
                        { label: "Get Attendance", current: true },
                    ]}
                    backButton={{
                        href: "/lecturer/dashboard",
                        label: "Back to Dashboard",
                    }}
                >
                    {isSessionActive && (
                        <Badge variant="default" className="bg-green-600">
                            <Activity className="h-3 w-3 mr-1" />
                            Session Active
                        </Badge>
                    )}
                    {isNFCProcessing && (
                        <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-300"
                        >
                            <Zap className="h-3 w-3 mr-1" />
                            Processing NFC
                        </Badge>
                    )}
                    {lastNFCSwipe && (
                        <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-300"
                        >
                            <UserCheck className="h-3 w-3 mr-1" />
                            {lastNFCSwipe}
                        </Badge>
                    )}
                </PageHeader>

                {/* NFC Status Card */}
                <div className="mb-6">
                    <NFCStatus
                        status={nfcStatus}
                        isSocketConnected={isSocketConnected}
                        onRefresh={requestNFCStatus}
                    />
                </div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Session Setup Card */}
                    <Card className="bg-white shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold">
                                Session Setup
                            </CardTitle>
                            <p className="text-sm text-gray-600">
                                Configure your attendance session
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Course Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Course
                                </label>
                                <Select
                                    value={selectedCourse}
                                    onValueChange={setSelectedCourse}
                                    disabled={isSessionActive}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map((course) => (
                                            <SelectItem
                                                key={course.id}
                                                value={course.id}
                                            >
                                                {course.course_code} -{" "}
                                                {course.course_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedCourseData && (
                                    <p className="text-xs text-gray-500">
                                        {selectedCourseData.enrolled_students}{" "}
                                        enrolled students
                                    </p>
                                )}
                            </div>

                            {/* Lecture Hall Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Lecture Hall
                                </label>
                                <Select
                                    value={selectedHall}
                                    onValueChange={setSelectedHall}
                                    disabled={isSessionActive}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Lecture Hall" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hall-a">
                                            Hall A
                                        </SelectItem>
                                        <SelectItem value="hall-b">
                                            Hall B
                                        </SelectItem>
                                        <SelectItem value="hall-c">
                                            Hall C
                                        </SelectItem>
                                        <SelectItem value="lab-1">
                                            Computer Lab 1
                                        </SelectItem>
                                        <SelectItem value="lab-2">
                                            Computer Lab 2
                                        </SelectItem>
                                        <SelectItem value="auditorium">
                                            Main Auditorium
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Current Date & Time */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Current Date & Time
                                </label>
                                <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">
                                        {currentDateTime}
                                    </span>
                                </div>
                            </div>

                            {/* Session Control */}
                            {!isSessionActive ? (
                                <Button
                                    onClick={startSession}
                                    className="w-full bg-black hover:bg-gray-800 text-white py-3"
                                    disabled={!selectedCourse || !selectedHall}
                                >
                                    <Play className="h-4 w-4 mr-2" />
                                    Start Attendance Session
                                </Button>
                            ) : (
                                <div className="space-y-4">
                                    {/* NFC Scanning Status */}
                                    <div className="p-3 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Wifi
                                                className={`h-4 w-4 ${
                                                    nfcStatus.status ===
                                                    "connected"
                                                        ? "text-green-600"
                                                        : "text-gray-400"
                                                }`}
                                            />
                                            <span className="text-sm font-medium text-gray-700">
                                                NFC Attendance Mode
                                            </span>
                                            {nfcStatus.status ===
                                                "connected" && (
                                                <Badge
                                                    variant="outline"
                                                    className="bg-green-100 text-green-700 border-green-300"
                                                >
                                                    Ready
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600">
                                            {nfcStatus.status === "connected"
                                                ? `Tap NFC cards on ${nfcStatus.reader} to record attendance automatically`
                                                : "Connect NFC reader to enable automatic card scanning"}
                                        </p>
                                    </div>

                                    {/* Manual Entry Fallback */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Manual Entry (Fallback)
                                        </label>
                                        <form
                                            onSubmit={handleStudentIdSubmit}
                                            className="flex gap-2"
                                        >
                                            <Input
                                                placeholder="Student ID or Register Number"
                                                value={studentIdInput}
                                                onChange={(e) =>
                                                    setStudentIdInput(
                                                        e.target.value
                                                    )
                                                }
                                                className="flex-1 text-sm"
                                            />
                                            <Button
                                                type="submit"
                                                disabled={
                                                    isLoading ||
                                                    !studentIdInput.trim()
                                                }
                                                size="sm"
                                            >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Add
                                            </Button>
                                        </form>
                                    </div>

                                    <Button
                                        onClick={stopSession}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Stop Session
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Live Attendance Card */}
                    <Card className="bg-white shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-semibold">
                                        Live Attendance
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
                                        {isSessionActive
                                            ? "Session in progress"
                                            : "Start a session to begin recording"}
                                    </p>
                                </div>
                                {summary && (
                                    <div className="flex gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">
                                                {summary.total_present}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Present
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-gray-700">
                                                {summary.total_enrolled}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Total
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {Math.round(
                                                    summary.attendance_percentage ||
                                                        0
                                                )}
                                                %
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Rate
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {!isSessionActive && !selectedCourse ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="mb-6">
                                        <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-2" />
                                    </div>
                                    <p className="text-gray-500 text-sm max-w-xs">
                                        Select a course and lecture hall to
                                        start attendance session
                                    </p>
                                </div>
                            ) : attendanceRecords.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <Users className="h-12 w-12 text-gray-300 mb-4" />
                                    <p className="text-gray-500 text-sm mb-2">
                                        No attendance recorded yet today
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {nfcStatus.status === "connected"
                                            ? "Tap NFC cards or use manual entry above"
                                            : "Use manual entry above or connect NFC reader"}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {attendanceRecords
                                        .sort(
                                            (a, b) =>
                                                new Date(
                                                    b.created_at
                                                ).getTime() -
                                                new Date(a.created_at).getTime()
                                        )
                                        .map((record, index) => (
                                            <div
                                                key={record.id}
                                                className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-300 ${
                                                    index === 0 &&
                                                    lastNFCSwipe ===
                                                        record.student_name
                                                        ? "bg-gradient-to-r from-green-100 to-blue-100 border-green-300 shadow-sm"
                                                        : "bg-green-50 border-green-200"
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <UserCheck
                                                        className={`h-5 w-5 ${
                                                            index === 0 &&
                                                            lastNFCSwipe ===
                                                                record.student_name
                                                                ? "text-blue-600"
                                                                : "text-green-600"
                                                        }`}
                                                    />
                                                    <div>
                                                        <p className="font-medium text-sm">
                                                            {
                                                                record.student_name
                                                            }
                                                            {index === 0 &&
                                                                lastNFCSwipe ===
                                                                    record.student_name && (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="ml-2 bg-blue-100 text-blue-700 border-blue-300 text-xs"
                                                                    >
                                                                        <Zap className="h-2 w-2 mr-1" />
                                                                        Just
                                                                        Added
                                                                    </Badge>
                                                                )}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {
                                                                record.register_number
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p
                                                        className={`text-sm font-medium ${
                                                            index === 0 &&
                                                            lastNFCSwipe ===
                                                                record.student_name
                                                                ? "text-blue-600"
                                                                : "text-green-600"
                                                        }`}
                                                    >
                                                        {record.checked_in}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(
                                                            record.created_at
                                                        ).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
