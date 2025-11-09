"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, momentLocalizer, View, SlotInfo } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    ArrowLeft,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Plus,
    Edit2,
    Trash2,
    BookOpen,
    Users,
    Save,
    X,
} from "lucide-react";
import Link from "next/link";

const localizer = momentLocalizer(moment);

interface Course {
    id: string;
    course_code: string;
    course_name: string;
    faculty: string;
    year: number;
    enrolled_students: number;
}

interface ScheduleEvent {
    id: string;
    course_id: string;
    event_type: "recurring" | "one-time";
    day_of_week: number | null;
    specific_date: string | null;
    start_time: string;
    end_time: string;
    room: string;
    color: string;
    notes: string;
    lecturer_id: string;
    course_code: string;
    course_name: string;
    course_faculty: string;
    course_year: number;
    enrolled_students: number;
}

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: ScheduleEvent;
    color?: string;
}

interface EventFormData {
    id?: string;
    courseId: string;
    eventType: "recurring" | "one-time";
    dayOfWeek: number;
    specificDate: string;
    startTime: string;
    endTime: string;
    room: string;
    color: string;
    notes: string;
}

const COLORS = [
    { value: "#3b82f6", label: "Blue" },
    { value: "#10b981", label: "Green" },
    { value: "#f59e0b", label: "Orange" },
    { value: "#ef4444", label: "Red" },
    { value: "#8b5cf6", label: "Purple" },
    { value: "#ec4899", label: "Pink" },
    { value: "#06b6d4", label: "Cyan" },
    { value: "#14b8a6", label: "Teal" },
];

const DAY_NAMES = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

export default function CalendarSchedule() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [view, setView] = useState<View>("week");
    const [date, setDate] = useState(new Date());
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
        null
    );
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState<EventFormData>({
        courseId: "",
        eventType: "recurring",
        dayOfWeek: 0,
        specificDate: "",
        startTime: "09:00",
        endTime: "10:00",
        room: "",
        color: "#3b82f6",
        notes: "",
    });

    useEffect(() => {
        fetchCourses();
        fetchSchedules();
    }, []);

    useEffect(() => {
        // Convert schedule events to calendar events
        convertToCalendarEvents();
    }, [scheduleEvents, date]);

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

    const fetchSchedules = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/lecturer/calendar");
            const data = await response.json();

            if (data.success) {
                setScheduleEvents(data.events);
            } else {
                toast.error(data.message || "Failed to fetch schedules");
            }
        } catch (error) {
            toast.error("Error fetching schedules");
            console.error("Error fetching schedules:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const convertToCalendarEvents = () => {
        const events: CalendarEvent[] = [];
        const startOfView = moment(date)
            .startOf(view as any)
            .toDate();
        const endOfView = moment(date)
            .endOf(view as any)
            .toDate();

        scheduleEvents.forEach((scheduleEvent) => {
            if (
                scheduleEvent.event_type === "one-time" &&
                scheduleEvent.specific_date
            ) {
                // One-time event
                const eventDate = new Date(scheduleEvent.specific_date);
                if (eventDate >= startOfView && eventDate <= endOfView) {
                    const [startHour, startMin] =
                        scheduleEvent.start_time.split(":");
                    const [endHour, endMin] = scheduleEvent.end_time.split(":");

                    const start = new Date(eventDate);
                    start.setHours(parseInt(startHour), parseInt(startMin), 0);

                    const end = new Date(eventDate);
                    end.setHours(parseInt(endHour), parseInt(endMin), 0);

                    events.push({
                        id: scheduleEvent.id,
                        title: `${scheduleEvent.course_code} - ${scheduleEvent.room}`,
                        start,
                        end,
                        resource: scheduleEvent,
                        color: scheduleEvent.color,
                    });
                }
            } else if (
                scheduleEvent.event_type === "recurring" &&
                scheduleEvent.day_of_week !== null
            ) {
                // Recurring event - generate occurrences for the view period
                const current = new Date(startOfView);
                while (current <= endOfView) {
                    // Monday is 0, Sunday is 6 in our system
                    const dayOfWeek = current.getDay();
                    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to our system

                    if (adjustedDay === scheduleEvent.day_of_week) {
                        const [startHour, startMin] =
                            scheduleEvent.start_time.split(":");
                        const [endHour, endMin] =
                            scheduleEvent.end_time.split(":");

                        const start = new Date(current);
                        start.setHours(
                            parseInt(startHour),
                            parseInt(startMin),
                            0
                        );

                        const end = new Date(current);
                        end.setHours(parseInt(endHour), parseInt(endMin), 0);

                        events.push({
                            id: `${scheduleEvent.id}-${current.toISOString().split("T")[0]}`,
                            title: `${scheduleEvent.course_code} - ${scheduleEvent.room}`,
                            start,
                            end,
                            resource: scheduleEvent,
                            color: scheduleEvent.color,
                        });
                    }
                    current.setDate(current.getDate() + 1);
                }
            }
        });

        setCalendarEvents(events);
    };

    const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
        const startTime = moment(slotInfo.start).format("HH:mm");
        const endTime = moment(slotInfo.end).format("HH:mm");
        const specificDate = moment(slotInfo.start).format("YYYY-MM-DD");
        const dayOfWeek = slotInfo.start.getDay();
        const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        setFormData({
            courseId: "",
            eventType: "one-time",
            dayOfWeek: adjustedDay,
            specificDate,
            startTime,
            endTime,
            room: "",
            color: "#3b82f6",
            notes: "",
        });
        setSelectedEvent(null);
        setIsDialogOpen(true);
    }, []);

    const handleSelectEvent = useCallback((event: CalendarEvent) => {
        setSelectedEvent(event);
        const resource = event.resource;
        setFormData({
            id: resource.id,
            courseId: resource.course_id,
            eventType: resource.event_type,
            dayOfWeek: resource.day_of_week ?? 0,
            specificDate: resource.specific_date ?? "",
            startTime: resource.start_time,
            endTime: resource.end_time,
            room: resource.room,
            color: resource.color,
            notes: resource.notes || "",
        });
        setIsDialogOpen(true);
    }, []);

    const handleSaveEvent = async () => {
        // Validation
        if (
            !formData.courseId ||
            !formData.startTime ||
            !formData.endTime ||
            !formData.room
        ) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (
            formData.eventType === "recurring" &&
            formData.dayOfWeek === undefined
        ) {
            toast.error("Please select a day of week for recurring events");
            return;
        }

        if (formData.eventType === "one-time" && !formData.specificDate) {
            toast.error("Please select a specific date for one-time events");
            return;
        }

        setIsSaving(true);
        try {
            const method = formData.id ? "PUT" : "POST";
            const endpoint = "/api/lecturer/calendar";

            const response = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(
                    formData.id
                        ? "Event updated successfully"
                        : "Event created successfully"
                );
                setIsDialogOpen(false);
                await fetchSchedules();
                resetForm();
            } else {
                toast.error(data.message || "Failed to save event");
            }
        } catch (error) {
            toast.error("Error saving event");
            console.error("Error saving event:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteEvent = async () => {
        if (!formData.id) return;

        setIsSaving(true);
        try {
            const response = await fetch(
                `/api/lecturer/calendar?id=${formData.id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (data.success) {
                toast.success("Event deleted successfully");
                setIsDeleteDialogOpen(false);
                setIsDialogOpen(false);
                await fetchSchedules();
                resetForm();
            } else {
                toast.error(data.message || "Failed to delete event");
            }
        } catch (error) {
            toast.error("Error deleting event");
            console.error("Error deleting event:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({
            courseId: "",
            eventType: "recurring",
            dayOfWeek: 0,
            specificDate: "",
            startTime: "09:00",
            endTime: "10:00",
            room: "",
            color: "#3b82f6",
            notes: "",
        });
        setSelectedEvent(null);
    };

    const eventStyleGetter = (event: CalendarEvent) => {
        return {
            style: {
                backgroundColor: event.color || "#3b82f6",
                borderRadius: "5px",
                opacity: 0.8,
                color: "white",
                border: "0px",
                display: "block",
            },
        };
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/lecturer/dashboard">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <CalendarIcon className="h-8 w-8 text-blue-600" />
                                Class Schedule Calendar
                            </h1>
                            <p className="text-muted-foreground">
                                Manage your teaching schedule with an
                                interactive calendar
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => {
                            resetForm();
                            setIsDialogOpen(true);
                        }}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Class
                    </Button>
                </div>

                {/* Legend */}
                <div className="flex gap-2 mb-4 flex-wrap">
                    <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-800"
                    >
                        Recurring Classes
                    </Badge>
                    <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800"
                    >
                        One-time Events
                    </Badge>
                </div>

                {/* Calendar */}
                <Card>
                    <CardContent className="p-6">
                        {isLoading ? (
                            <div className="text-center py-20 text-gray-500">
                                Loading calendar...
                            </div>
                        ) : (
                            <div style={{ height: "700px" }}>
                                <Calendar
                                    localizer={localizer}
                                    events={calendarEvents}
                                    startAccessor="start"
                                    endAccessor="end"
                                    style={{ height: "100%" }}
                                    onSelectSlot={handleSelectSlot}
                                    onSelectEvent={handleSelectEvent}
                                    selectable
                                    view={view}
                                    onView={setView}
                                    date={date}
                                    onNavigate={setDate}
                                    eventPropGetter={eventStyleGetter}
                                    step={30}
                                    timeslots={2}
                                    min={new Date(2000, 0, 1, 7, 0, 0)}
                                    max={new Date(2000, 0, 1, 20, 0, 0)}
                                    formats={{
                                        timeGutterFormat: "HH:mm",
                                        eventTimeRangeFormat: ({
                                            start,
                                            end,
                                        }) =>
                                            `${moment(start).format("HH:mm")} - ${moment(end).format("HH:mm")}`,
                                    }}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Event Dialog */}
                <Dialog
                    open={isDialogOpen}
                    onOpenChange={(open) => {
                        if (!open) resetForm();
                        setIsDialogOpen(open);
                    }}
                >
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {formData.id
                                    ? "Edit Class Schedule"
                                    : "Add New Class Schedule"}
                            </DialogTitle>
                            <DialogDescription>
                                Create or edit class schedules for your courses
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {/* Course Selection */}
                            <div>
                                <Label htmlFor="course">Course *</Label>
                                <Select
                                    value={formData.courseId}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            courseId: value,
                                        })
                                    }
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
                                                    <Badge
                                                        variant="secondary"
                                                        className="ml-2"
                                                    >
                                                        <Users className="h-3 w-3 mr-1" />
                                                        {
                                                            course.enrolled_students
                                                        }
                                                    </Badge>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Event Type */}
                            <div>
                                <Label htmlFor="eventType">Event Type *</Label>
                                <Select
                                    value={formData.eventType}
                                    onValueChange={(
                                        value: "recurring" | "one-time"
                                    ) =>
                                        setFormData({
                                            ...formData,
                                            eventType: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="recurring">
                                            Recurring (Weekly)
                                        </SelectItem>
                                        <SelectItem value="one-time">
                                            One-time Event
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Day of Week (for recurring) */}
                            {formData.eventType === "recurring" && (
                                <div>
                                    <Label htmlFor="dayOfWeek">
                                        Day of Week *
                                    </Label>
                                    <Select
                                        value={formData.dayOfWeek.toString()}
                                        onValueChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                dayOfWeek: parseInt(value),
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DAY_NAMES.map((day, index) => (
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
                            )}

                            {/* Specific Date (for one-time) */}
                            {formData.eventType === "one-time" && (
                                <div>
                                    <Label htmlFor="specificDate">Date *</Label>
                                    <Input
                                        id="specificDate"
                                        type="date"
                                        value={formData.specificDate}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                specificDate: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            )}

                            {/* Time */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="startTime">
                                        Start Time *
                                    </Label>
                                    <Input
                                        id="startTime"
                                        type="time"
                                        value={formData.startTime}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                startTime: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="endTime">End Time *</Label>
                                    <Input
                                        id="endTime"
                                        type="time"
                                        value={formData.endTime}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                endTime: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            {/* Room */}
                            <div>
                                <Label htmlFor="room">Room / Location *</Label>
                                <Input
                                    id="room"
                                    placeholder="e.g., Room 101, Lab A, Hall B"
                                    value={formData.room}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            room: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* Color */}
                            <div>
                                <Label htmlFor="color">Color</Label>
                                <Select
                                    value={formData.color}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            color: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COLORS.map((color) => (
                                            <SelectItem
                                                key={color.value}
                                                value={color.value}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-4 h-4 rounded"
                                                        style={{
                                                            backgroundColor:
                                                                color.value,
                                                        }}
                                                    />
                                                    {color.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Notes */}
                            <div>
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Add any additional information..."
                                    value={formData.notes}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            notes: e.target.value,
                                        })
                                    }
                                    rows={3}
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            {formData.id && (
                                <Button
                                    variant="destructive"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                    disabled={isSaving}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                onClick={() => {
                                    resetForm();
                                    setIsDialogOpen(false);
                                }}
                                disabled={isSaving}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveEvent}
                                disabled={isSaving}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {isSaving ? "Saving..." : "Save"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Class Schedule</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this class
                                schedule? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteDialogOpen(false)}
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteEvent}
                                disabled={isSaving}
                            >
                                {isSaving ? "Deleting..." : "Delete"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
