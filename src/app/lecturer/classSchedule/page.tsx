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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
    ArrowLeft,
    MapPin,
    Clock,
    Plus,
    Calendar,
    Users,
    BookOpen,
    Trash2,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/breadcrumb";

interface Course {
    id: string;
    course_code: string;
    course_name: string;
    faculty: string;
    year: number;
    enrolled_students: number;
}

interface ScheduleItem {
    id: string;
    course_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    room: string;
    created_at: string;
    course_code: string;
    course_name: string;
    course_faculty: string;
    course_year: number;
    enrolled_students: string;
}

interface WeekDate {
    date: string;
    dayName: string;
    dayShort: string;
    isToday: boolean;
}

interface ScheduleSummary {
    totalClasses: number;
    uniqueCourses: number;
    totalStudents: number;
    averageClassesPerDay: number;
}

interface WeekInfo {
    startDate: string;
    endDate: string;
    weekOffset: number;
}

export default function ClassSchedule() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [weekDates, setWeekDates] = useState<WeekDate[]>([]);
    const [summary, setSummary] = useState<ScheduleSummary | null>(null);
    const [weekInfo, setWeekInfo] = useState<WeekInfo | null>(null);
    const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [newSchedule, setNewSchedule] = useState({
        courseId: "",
        dayOfWeek: 0,
        startTime: "",
        endTime: "",
        room: "",
    });

    useEffect(() => {
        fetchCourses();
        fetchSchedule();
    }, [currentWeekOffset]);

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

    const fetchSchedule = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (currentWeekOffset !== 0) {
                params.append("weekOffset", currentWeekOffset.toString());
            }

            const response = await fetch(
                `/api/lecturer/schedule?${params.toString()}`
            );
            const data = await response.json();

            if (data.success) {
                setSchedule(data.schedule);
                setWeekDates(data.weekDates);
                setSummary(data.summary);
                setWeekInfo(data.weekInfo);
            } else {
                toast.error(data.message || "Failed to fetch schedule");
            }
        } catch (error) {
            toast.error("Error fetching schedule");
            console.error("Error fetching schedule:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSchedule = async () => {
        if (
            !newSchedule.courseId ||
            !newSchedule.startTime ||
            !newSchedule.endTime ||
            !newSchedule.room
        ) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch("/api/lecturer/schedule", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newSchedule),
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Schedule added successfully");
                setIsAddDialogOpen(false);
                setNewSchedule({
                    courseId: "",
                    dayOfWeek: 0,
                    startTime: "",
                    endTime: "",
                    room: "",
                });
                fetchSchedule(); // Refresh schedule
            } else {
                toast.error(data.message || "Failed to add schedule");
            }
        } catch (error) {
            toast.error("Error adding schedule");
            console.error("Error adding schedule:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSchedule = async (scheduleId: string) => {
        try {
            const response = await fetch(
                `/api/lecturer/schedule?scheduleId=${scheduleId}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (data.success) {
                toast.success("Schedule deleted successfully");
                fetchSchedule(); // Refresh schedule
            } else {
                toast.error(data.message || "Failed to delete schedule");
            }
        } catch (error) {
            toast.error("Error deleting schedule");
            console.error("Error deleting schedule:", error);
        }
    };

    const navigateWeek = (direction: "prev" | "next") => {
        if (direction === "prev") {
            setCurrentWeekOffset(currentWeekOffset - 1);
        } else {
            setCurrentWeekOffset(currentWeekOffset + 1);
        }
    };

    const resetToCurrentWeek = () => {
        setCurrentWeekOffset(0);
    };

    // Generate time slots for the schedule grid
    const timeSlots = [];
    for (let hour = 6; hour <= 18; hour++) {
        const time24 = `${hour.toString().padStart(2, "0")}:00`;
        let displayHour = hour;
        let period = "AM";

        if (hour === 12) {
            period = "PM";
        } else if (hour > 12) {
            displayHour = hour - 12;
            period = "PM";
        }

        const displayTime =
            hour === 12 && hour === 12 ? "Noon" : `${displayHour} ${period}`;

        timeSlots.push({
            time24,
            display: displayTime,
        });
    }

    // Helper function to get schedule items for a specific day and time
    const getScheduleForDayTime = (dayOfWeek: number, timeSlot: string) => {
        return schedule.filter((item) => {
            const itemStartTime = item.start_time.substring(0, 5); // Get HH:mm format
            const itemEndTime = item.end_time.substring(0, 5);
            const slotTime = timeSlot.substring(0, 5);

            return (
                item.day_of_week === dayOfWeek &&
                itemStartTime <= slotTime &&
                itemEndTime > slotTime
            );
        });
    };

    // Helper function to format time for display
    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(":");
        const hour = parseInt(hours);
        const period = hour >= 12 ? "PM" : "AM";
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes} ${period}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <PageHeader
                    title="Class Schedule"
                    breadcrumbs={[
                        { label: "Dashboard", href: "/lecturer/dashboard" },
                        { label: "Class Schedule", current: true },
                    ]}
                    backButton={{
                        href: "/lecturer/dashboard",
                        label: "Back to Dashboard",
                    }}
                />

                {/* Add Schedule Dialog */}
                <Dialog
                    open={isAddDialogOpen}
                    onOpenChange={setIsAddDialogOpen}
                >
                    <div className="flex justify-end mb-6">
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Schedule
                            </Button>
                        </DialogTrigger>
                    </div>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add New Schedule</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Course
                                </label>
                                <Select
                                    value={newSchedule.courseId}
                                    onValueChange={(value) =>
                                        setNewSchedule({
                                            ...newSchedule,
                                            courseId: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
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
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Day of Week
                                </label>
                                <Select
                                    value={newSchedule.dayOfWeek.toString()}
                                    onValueChange={(value) =>
                                        setNewSchedule({
                                            ...newSchedule,
                                            dayOfWeek: parseInt(value),
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Day" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[
                                            "Monday",
                                            "Tuesday",
                                            "Wednesday",
                                            "Thursday",
                                            "Friday",
                                            "Saturday",
                                            "Sunday",
                                        ].map((day, index) => (
                                            <SelectItem
                                                key={index}
                                                value={index.toString()}
                                            >
                                                {day}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">
                                        Start Time
                                    </label>
                                    <Input
                                        type="time"
                                        value={newSchedule.startTime}
                                        onChange={(e) =>
                                            setNewSchedule({
                                                ...newSchedule,
                                                startTime: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">
                                        End Time
                                    </label>
                                    <Input
                                        type="time"
                                        value={newSchedule.endTime}
                                        onChange={(e) =>
                                            setNewSchedule({
                                                ...newSchedule,
                                                endTime: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Room
                                </label>
                                <Input
                                    value={newSchedule.room}
                                    onChange={(e) =>
                                        setNewSchedule({
                                            ...newSchedule,
                                            room: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., Room 101, Lab A, etc."
                                />
                            </div>

                            <Button
                                onClick={handleAddSchedule}
                                disabled={isSubmitting}
                                className="w-full"
                            >
                                {isSubmitting ? "Adding..." : "Add Schedule"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Week Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigateWeek("prev")}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-sm font-medium">
                            {weekInfo && (
                                <>
                                    Week: {weekInfo.startDate} to{" "}
                                    {weekInfo.endDate}
                                </>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigateWeek("next")}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    {currentWeekOffset !== 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={resetToCurrentWeek}
                        >
                            Current Week
                        </Button>
                    )}
                </div>

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {summary.totalClasses}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Total Classes
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="h-8 w-8 text-green-600" />
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {summary.uniqueCourses}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Unique Courses
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <Users className="h-8 w-8 text-purple-600" />
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {summary.totalStudents}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Total Students
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-8 w-8 text-orange-600" />
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {summary.averageClassesPerDay}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Avg Classes/Day
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Schedule Grid */}
                <Card className="bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">
                            Weekly Schedule
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-8 text-gray-500">
                                Loading schedule...
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                {/* Days Header */}
                                <div className="grid grid-cols-8 gap-2 mb-4">
                                    <div className="text-sm font-medium text-gray-500 p-2">
                                        Time
                                    </div>
                                    {weekDates.map((day, index) => (
                                        <div
                                            key={index}
                                            className={`text-center p-2 rounded-lg ${day.isToday ? "bg-blue-100 text-blue-800" : "bg-gray-50"}`}
                                        >
                                            <div className="text-sm font-medium">
                                                {day.dayShort}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                {new Date(day.date).getDate()}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Time Slots */}
                                <div className="space-y-1">
                                    {timeSlots.map((timeSlot, timeIndex) => (
                                        <div
                                            key={timeIndex}
                                            className="grid grid-cols-8 gap-2"
                                        >
                                            <div className="text-xs text-gray-500 p-2 border-r">
                                                {timeSlot.display}
                                            </div>
                                            {weekDates.map((day, dayIndex) => {
                                                const daySchedule =
                                                    getScheduleForDayTime(
                                                        dayIndex,
                                                        timeSlot.time24
                                                    );
                                                return (
                                                    <div
                                                        key={dayIndex}
                                                        className="min-h-[60px] border border-gray-200 rounded p-1"
                                                    >
                                                        {daySchedule.map(
                                                            (item) => (
                                                                <div
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    className="bg-blue-100 text-blue-800 p-2 rounded text-xs mb-1 relative group"
                                                                >
                                                                    <div className="font-medium">
                                                                        {
                                                                            item.course_code
                                                                        }
                                                                    </div>
                                                                    <div className="text-xs opacity-80">
                                                                        {
                                                                            item.room
                                                                        }
                                                                    </div>
                                                                    <div className="text-xs opacity-80">
                                                                        {formatTime(
                                                                            item.start_time
                                                                        )}{" "}
                                                                        -{" "}
                                                                        {formatTime(
                                                                            item.end_time
                                                                        )}
                                                                    </div>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="absolute top-0 right-0 h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                                                                        onClick={() =>
                                                                            handleDeleteSchedule(
                                                                                item.id
                                                                            )
                                                                        }
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
