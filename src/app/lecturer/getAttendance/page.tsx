"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
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
import {
    ArrowLeft,
    UserCheck,
    Search,
    RefreshCw,
    Radio,
    Zap,
    GraduationCap,
    Users,
    BookOpen,
    Save,
    CheckCircle,
    Clock,
    Building,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import DeviceStatus from "@/components/DeviceStatus";
import { RFIDLogger } from "@/components/RFIDLogger";

const SOCKET_SERVER_URL =
    process.env.NEXT_PUBLIC_SOCKET_SERVER_URI || "http://localhost:4000";

interface Course {
    id: string;
    course_code: string;
    course_name: string;
    faculty: string;
    year: number;
    enrolled_students: number;
}

interface Student {
    student_id: string;
    full_name: string;
    register_number: string;
    faculty: string;
    card_uid: string | null;
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
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedHall, setSelectedHall] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [attendanceRecords, setAttendanceRecords] = useState<
        AttendanceRecord[]
    >([]);
    const [summary, setSummary] = useState<AttendanceSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [eventLog, setEventLog] = useState<string[]>([]);

    // NFC Socket state
    const [socket, setSocket] = useState<Socket | null>(null);
    const [nfcStatus, setNfcStatus] = useState({
        status: "disconnected",
        reader: null,
    });
    const [waitingForCard, setWaitingForCard] = useState(false);

    const currentDate = new Date().toISOString().split("T")[0];
    const currentTime = new Date().toTimeString().split(" ")[0].substring(0, 5);

    // Filtered students based on search query
    const filteredStudents = useMemo(() => {
        if (!searchQuery.trim()) return students;

        const query = searchQuery.toLowerCase().trim();
        return students.filter(
            (student) =>
                student.full_name?.toLowerCase().includes(query) ||
                student.register_number?.toLowerCase().includes(query) ||
                student.card_uid?.toLowerCase().includes(query)
        );
    }, [students, searchQuery]);

    // Fetch lecturer's courses
    useEffect(() => {
        fetchCourses();
    }, []);

    // Initialize NFC Socket.IO connection
    useEffect(() => {
        const newSocket = io(SOCKET_SERVER_URL);

        newSocket.on("connect", () => {
            console.log("🔌 Connected to NFC server");
            setEventLog((prev) => [...prev, "🔌 Connected to NFC server"]);
            newSocket.emit("get-nfc-status");
        });

        newSocket.on("nfc-reader-status", (status) => {
            console.log("📶 NFC Status:", status);
            setNfcStatus(status);
            setEventLog((prev) => [...prev, `📶 NFC Reader: ${status.status}`]);
        });

        newSocket.on("nfc-swipe", (cardData) => {
            console.log("💳 Card detected:", cardData.uid);
            setEventLog((prev) => [...prev, `💳 Card swiped: ${cardData.uid}`]);
            if (isSessionActive) {
                recordAttendanceByCard(cardData.uid);
            } else {
                toast.info("Please start an attendance session first");
            }
        });

        newSocket.on("nfc-swipe-end", () => {
            console.log("📤 Card removed");
            setEventLog((prev) => [...prev, "📤 Card removed"]);
            setWaitingForCard(false);
        });

        newSocket.on("disconnect", () => {
            console.log("❌ Disconnected from NFC server");
            setEventLog((prev) => [...prev, "❌ Disconnected from NFC server"]);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [isSessionActive]);

    const fetchCourses = async () => {
        try {
            const response = await fetch("/api/lecturer/courses");

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Invalid response format - expected JSON");
            }

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

    const fetchEnrolledStudents = async (courseId: string) => {
        setLoading(true);
        try {
            const response = await fetch(
                `/api/lecturer/courses/${courseId}/students`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Invalid response format - expected JSON");
            }

            const data = await response.json();

            if (data.success) {
                setStudents(data.students);
                toast.success(
                    `Loaded ${data.students.length} enrolled students`
                );
            } else {
                throw new Error(data.message || "Failed to fetch students");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Error fetching students", {
                description: (error as Error).message,
            });
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchTodayAttendance = async () => {
        if (!selectedCourse) return;

        try {
            const response = await fetch(
                `/api/lecturer/attendance?courseId=${selectedCourse}&date=${currentDate}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Invalid response format - expected JSON");
            }

            const data = await response.json();

            if (data.success) {
                setAttendanceRecords(data.attendance);
                setSummary(data.summary);
            }
        } catch (error) {
            console.error("Error fetching attendance:", error);
            toast.error("Error fetching attendance", {
                description: (error as Error).message,
            });
        }
    };

    const handleCourseSelect = async (courseId: string) => {
        setSelectedCourse(courseId);
        setStudents([]);
        setAttendanceRecords([]);
        setSummary(null);
        setSearchQuery("");
        await fetchEnrolledStudents(courseId);
        await fetchTodayAttendance();
    };

    const startNFCReading = () => {
        if (!isSessionActive) {
            toast.error("Please start an attendance session first");
            return;
        }
        setWaitingForCard(true);
        setEventLog((prev) => [...prev, "⏳ Waiting for card swipe..."]);
        toast.info("Please swipe or tap the card on the reader");
    };

    const startSession = async () => {
        if (!selectedCourse || !selectedHall) {
            toast.error("Please select both course and lecture hall");
            return;
        }

        setIsSessionActive(true);
        await fetchTodayAttendance();
        toast.success("Attendance session started", {
            description: `Ready to record attendance for ${selectedHall}`,
        });
    };

    const saveAndEndSession = async () => {
        if (!isSessionActive) return;

        try {
            // Save the session data
            const response = await fetch("/api/lecturer/attendance/session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    courseId: selectedCourse,
                    hall: selectedHall,
                    date: currentDate,
                    totalPresent: summary?.total_present || 0,
                    totalEnrolled: summary?.total_enrolled || 0,
                    attendanceRecords: attendanceRecords.map((r) => r.id),
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Invalid response format - expected JSON");
            }

            const data = await response.json();

            if (data.success) {
                toast.success("Session saved successfully", {
                    description: `${summary?.total_present || 0} students marked present`,
                });
                setIsSessionActive(false);
            } else {
                throw new Error(data.message || "Failed to save session");
            }
        } catch (error) {
            console.error("Save session error:", error);
            toast.error("Failed to save session", {
                description: (error as Error).message,
            });
        }
    };

    const recordAttendanceByCard = async (cardUID: string) => {
        setEventLog((prev) => [...prev, `🔍 Looking up card: ${cardUID}`]);

        try {
            // Find the student by card UID
            const student = students.find((s) => s.card_uid === cardUID);

            if (!student) {
                toast.error("Card not recognized", {
                    description: "Student not enrolled in this course",
                });
                setEventLog((prev) => [...prev, `❌ Card not found`]);
                return;
            }

            // Check if already marked present
            const alreadyPresent = attendanceRecords.some(
                (r) => r.student_id === student.student_id
            );

            if (alreadyPresent) {
                toast.warning(`${student.full_name} already marked present`);
                setEventLog((prev) => [
                    ...prev,
                    `⚠️ ${student.full_name} already present`,
                ]);
                return;
            }

            // Record attendance
            await recordAttendance(student.student_id);

            toast.success("Attendance recorded!", {
                description: `${student.full_name} - ${student.register_number}`,
            });
            setEventLog((prev) => [
                ...prev,
                `✅ Attendance recorded: ${student.full_name}`,
            ]);
        } catch (error) {
            console.error("Card lookup error:", error);
            toast.error("Failed to process card");
            setEventLog((prev) => [
                ...prev,
                `❌ Process failed: ${(error as Error).message}`,
            ]);
        }
    };

    const recordAttendance = async (studentId: string) => {
        if (!selectedCourse) {
            toast.error("Please select a course first");
            return;
        }

        try {
            const response = await fetch("/api/lecturer/attendance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    studentId,
                    courseId: selectedCourse,
                    date: currentDate,
                    time: currentTime,
                    hall: selectedHall,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Invalid response format - expected JSON");
            }

            const data = await response.json();

            if (data.success) {
                await fetchTodayAttendance(); // Refresh the list
            } else {
                toast.error(data.message || "Failed to record attendance");
            }
        } catch (error) {
            toast.error("Error recording attendance", {
                description: (error as Error).message,
            });
            console.error("Error recording attendance:", error);
        }
    };

    const handleStudentSelect = async (student: Student) => {
        if (!isSessionActive) {
            toast.error("Please start an attendance session first");
            return;
        }

        // Check if already marked present
        const alreadyPresent = attendanceRecords.some(
            (r) => r.student_id === student.student_id
        );

        if (alreadyPresent) {
            toast.warning(`${student.full_name} already marked present today`);
            return;
        }

        await recordAttendance(student.student_id);
    };

    const getFacultyBadgeColor = (faculty: string) => {
        const colors: Record<string, string> = {
            tec: "bg-blue-100 text-blue-800",
            app: "bg-green-100 text-green-800",
            ssh: "bg-purple-100 text-purple-800",
            mgt: "bg-orange-100 text-orange-800",
            agr: "bg-yellow-100 text-yellow-800",
            med: "bg-red-100 text-red-800",
        };
        return colors[faculty] || "bg-gray-100 text-gray-800";
    };

    const selectedCourseData = courses.find((c) => c.id === selectedCourse);

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/lecturer/dashboard">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <UserCheck className="h-8 w-8 text-blue-600" />
                            Get Attendance
                        </h1>
                        <p className="text-muted-foreground">
                            Record student attendance via NFC or manual
                            selection
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {isSessionActive && (
                        <Badge
                            variant="default"
                            className="bg-green-600 text-white"
                        >
                            <Clock className="h-3 w-3 mr-1 animate-pulse" />
                            Session Active
                        </Badge>
                    )}
                    <DeviceStatus />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Student Selection Panel */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Student Selection</CardTitle>
                                <CardDescription>
                                    Swipe card or manually select student
                                </CardDescription>
                            </div>
                            <Badge
                                variant={
                                    nfcStatus.status === "connected"
                                        ? "default"
                                        : "secondary"
                                }
                                className="flex items-center gap-1"
                            >
                                <Radio
                                    className={`h-3 w-3 ${
                                        nfcStatus.status === "connected"
                                            ? "animate-pulse"
                                            : ""
                                    }`}
                                />
                                {nfcStatus.status === "connected"
                                    ? "NFC Ready"
                                    : "NFC Offline"}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Course Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="course">Course</Label>
                            <Select
                                value={selectedCourse}
                                onValueChange={handleCourseSelect}
                                disabled={isSessionActive}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map((course) => (
                                        <SelectItem
                                            key={course.id}
                                            value={course.id}
                                        >
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="h-4 w-4" />
                                                {course.course_code} -{" "}
                                                {course.course_name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedCourseData && (
                                <p className="text-xs text-muted-foreground">
                                    {selectedCourseData.enrolled_students}{" "}
                                    enrolled students
                                </p>
                            )}
                        </div>

                        {/* Lecture Hall Input */}
                        <div className="space-y-2">
                            <Label htmlFor="hall">
                                Lecture Hall / Location
                            </Label>
                            <div className="relative">
                                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="hall"
                                    placeholder="Enter hall name (e.g., Hall A, Lab 1)"
                                    value={selectedHall}
                                    onChange={(e) =>
                                        setSelectedHall(e.target.value)
                                    }
                                    disabled={isSessionActive}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Session Control */}
                        {!isSessionActive ? (
                            <Button
                                onClick={startSession}
                                className="w-full"
                                size="lg"
                                disabled={!selectedCourse || !selectedHall}
                            >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Start Attendance Session
                            </Button>
                        ) : (
                            <>
                                {/* NFC Swipe Button */}
                                <Button
                                    onClick={startNFCReading}
                                    disabled={
                                        nfcStatus.status !== "connected" ||
                                        waitingForCard
                                    }
                                    variant="outline"
                                    className="w-full border-2 border-dashed border-blue-400 hover:bg-blue-50 hover:border-blue-500"
                                >
                                    {waitingForCard ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            Waiting for card swipe...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="mr-2 h-4 w-4" />
                                            Swipe Card on Reader
                                        </>
                                    )}
                                </Button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">
                                            Or select manually
                                        </span>
                                    </div>
                                </div>

                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name or reg number..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="pl-10"
                                    />
                                </div>

                                {/* Students List */}
                                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                    {loading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : filteredStudents.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p>No students found</p>
                                        </div>
                                    ) : (
                                        filteredStudents.map((student) => {
                                            const isPresent =
                                                attendanceRecords.some(
                                                    (r) =>
                                                        r.student_id ===
                                                        student.student_id
                                                );
                                            return (
                                                <div
                                                    key={student.student_id}
                                                    onClick={() =>
                                                        !isPresent &&
                                                        handleStudentSelect(
                                                            student
                                                        )
                                                    }
                                                    className={`p-4 border rounded-lg transition-all ${
                                                        isPresent
                                                            ? "border-green-500 bg-green-50 dark:bg-green-950 opacity-60"
                                                            : "border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer"
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="space-y-1">
                                                            <p className="font-semibold">
                                                                {
                                                                    student.full_name
                                                                }
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {
                                                                    student.register_number
                                                                }
                                                            </p>
                                                            <Badge
                                                                variant="secondary"
                                                                className={getFacultyBadgeColor(
                                                                    student.faculty
                                                                )}
                                                            >
                                                                {student.faculty.toUpperCase()}
                                                            </Badge>
                                                        </div>
                                                        <div>
                                                            {isPresent && (
                                                                <Badge
                                                                    variant="default"
                                                                    className="bg-green-600"
                                                                >
                                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                                    Present
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Attendance Summary Panel */}
                <Card>
                    <CardHeader>
                        <CardTitle>Today's Attendance</CardTitle>
                        <CardDescription>
                            {selectedCourseData
                                ? `${selectedCourseData.course_code} - ${selectedHall || "Select hall"}`
                                : "Select a course to begin"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {!isSessionActive && !selectedCourse ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">
                                    No Active Session
                                </p>
                                <p className="text-sm">
                                    Select a course and hall to start recording
                                    attendance
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Summary Stats */}
                                {summary && (
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                                            <p className="text-2xl font-bold text-green-600">
                                                {summary.total_present}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Present
                                            </p>
                                        </div>
                                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                            <p className="text-2xl font-bold text-blue-600">
                                                {summary.total_enrolled}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Total
                                            </p>
                                        </div>
                                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                                            <p className="text-2xl font-bold text-purple-600">
                                                {Math.round(
                                                    summary.attendance_percentage ||
                                                        0
                                                )}
                                                %
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Rate
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Attendance List */}
                                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                    {attendanceRecords.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">
                                                No attendance recorded yet
                                            </p>
                                            <p className="text-xs">
                                                {nfcStatus.status ===
                                                "connected"
                                                    ? "Swipe cards or select students manually"
                                                    : "Select students manually to mark attendance"}
                                            </p>
                                        </div>
                                    ) : (
                                        attendanceRecords
                                            .sort(
                                                (a, b) =>
                                                    new Date(
                                                        b.created_at
                                                    ).getTime() -
                                                    new Date(
                                                        a.created_at
                                                    ).getTime()
                                            )
                                            .map((record, index) => (
                                                <div
                                                    key={record.id}
                                                    className={`flex items-center justify-between p-3 border rounded-lg ${
                                                        index === 0
                                                            ? "bg-gradient-to-r from-green-100 to-blue-100 border-green-300 shadow-sm"
                                                            : "bg-green-50 border-green-200"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <UserCheck
                                                            className={`h-5 w-5 ${
                                                                index === 0
                                                                    ? "text-blue-600"
                                                                    : "text-green-600"
                                                            }`}
                                                        />
                                                        <div>
                                                            <p className="font-medium text-sm">
                                                                {
                                                                    record.student_name
                                                                }
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {
                                                                    record.register_number
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium text-green-600">
                                                            {record.checked_in}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {new Date(
                                                                record.created_at
                                                            ).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                </div>

                                {/* Save Session Button */}
                                {isSessionActive &&
                                    attendanceRecords.length > 0 && (
                                        <Button
                                            onClick={saveAndEndSession}
                                            className="w-full bg-green-600 hover:bg-green-700"
                                            size="lg"
                                        >
                                            <Save className="mr-2 h-4 w-4" />
                                            Save & End Session
                                        </Button>
                                    )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* RFID Activity Logger */}
            <div className="mt-6">
                <RFIDLogger />
            </div>
        </div>
    );
}
