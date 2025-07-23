"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, MapPin, Clock } from "lucide-react"
import Link from "next/link"

interface ClassEvent {
    id: string
    course: string
    room: string
    startTime: string
    endTime: string
    day: number // 0 = Monday, 1 = Tuesday, etc.
    color: string
    textColor: string
}

export default function ClassSchedule() {
    const currentDate = new Date()
    const currentTime = currentDate.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    })

    // Days of the week with dates
    const days = [
        { name: "Mon", date: "30", isToday: false },
        { name: "Tue", date: "1", isToday: true },
        { name: "Wed", date: "2", isToday: false },
        { name: "Thu", date: "3", isToday: false },
        { name: "Fri", date: "4", isToday: false },
        { name: "Sat", date: "5", isToday: false },
        { name: "Sun", date: "6", isToday: false },
    ]

    // Time slots
    const timeSlots = [
        "6 AM",
        "7 AM",
        "8 AM",
        "9 AM",
        "10 AM",
        "11 AM",
        "Noon",
        "1 PM",
        "2 PM",
        "3 PM",
        "4 PM",
        "5 PM",
        "6 PM",
    ]

    // Class events
    const classEvents: ClassEvent[] = [
        {
            id: "1",
            course: "ICT - 2308",
            room: "S 201",
            startTime: "8:30",
            endTime: "10:30",
            day: 0, // Monday
            color: "bg-blue-200",
            textColor: "text-blue-800",
        },
        {
            id: "2",
            course: "ICT - 2308",
            room: "S 201",
            startTime: "12:30",
            endTime: "2:30",
            day: 1, // Tuesday
            color: "bg-blue-200",
            textColor: "text-blue-800",
        },
        {
            id: "3",
            course: "ICT - 3308",
            room: "S 201",
            startTime: "8:30",
            endTime: "10:30",
            day: 2, // Wednesday
            color: "bg-red-200",
            textColor: "text-red-800",
        },
        {
            id: "4",
            course: "ICT - 1308",
            room: "S 202",
            startTime: "12:30",
            endTime: "2:30",
            day: 2, // Wednesday
            color: "bg-green-200",
            textColor: "text-green-800",
        },
        {
            id: "5",
            course: "ICT - 1308",
            room: "S 202",
            startTime: "8:30",
            endTime: "10:30",
            day: 3, // Thursday
            color: "bg-green-200",
            textColor: "text-green-800",
        },
        {
            id: "6",
            course: "ICT - 4308",
            room: "S 205",
            startTime: "10:30",
            endTime: "12:30",
            day: 3, // Thursday
            color: "bg-yellow-200",
            textColor: "text-yellow-800",
        },
        {
            id: "7",
            course: "ICT - 2308",
            room: "S 201",
            startTime: "4:45",
            endTime: "19:00",
            day: 5, // Sat
            color: "bg-blue-200",
            textColor: "text-blue-800",
        },
    ]

    const getTimeSlotIndex = (time: string) => {
        const timeMap: { [key: string]: number } = {
            "6:00": -0.6,
            "6:15": -0.35,
            "6:30": -0.22,
            "6:45": 0,
            "7:00": 0.35,
            "7:15": 0.6,
            "7:30": 0.76,
            "7:45": 0.95,
            "8:00": 1.35,
            "8:15": 1.60,
            "8:30": 1.75,
            "8:45": 2,
            "9:00": 2.34,
            "9:15": 2.55,
            "9:30": 2.75,
            "9:45": 3,
            "10:00": 3.34,
            "10:15": 3.55,
            "10:30": 3.75,
            "10:45": 4,
            "11:00": 4.34,
            "11:15": 4.55,
            "11:30": 4.75,
            "11:45": 5,
            "12:00": 5.34,
            "12:15": 5.55,
            "12:30": 5.75,
            "12:45": 6,
            "1:00": 6.34,
            "1:15": 6.55,
            "1:30": 6.75,
            "1:45": 7,
            "2:00": 7.34,
            "2:15": 7.55,
            "2:30": 7.75,
            "2:45": 8,
            "3:00": 8.34,
            "3:15": 8.55,
            "3:30": 8.75,
            "3:45": 9,
            "4:00": 9.34,
            "4:15": 9.55,
            "4:30": 9.75,
            "4:45": 10,
            "5:00": 10.34,
            "5:15": 10.55,
            "5:30": 10.75,
            "5:45": 11.1,
            "18:00": 11.34,
            "18:15": 11.55,
            "18:30": 11.75,
            "18:45": 12,
            "19:00": 12.34,
        }

        // Convert time to 24-hour format for mapping
        let convertedTime = time.replace(" AM", "").replace(" PM", "")
        if (time.includes("PM") && !time.includes("12:")) {
            const [hours, minutes] = convertedTime.split(":")
            convertedTime = `${Number.parseInt(hours) + 12}:${minutes || "00"}`
        }

        return timeMap[convertedTime] || 0
    }

    const calculateEventPosition = (event: ClassEvent) => {
        const startIndex = getTimeSlotIndex(event.startTime)
        const endTime = event.endTime.replace(" AM", "").replace(" PM", "")
        let endIndex = getTimeSlotIndex(endTime)

        if (event.endTime.includes("PM") && !event.endTime.includes("12:")) {
            const [hours] = endTime.split(":")
            endIndex = getTimeSlotIndex(`${Number.parseInt(hours) + 12}:00`)
        }

        const duration = endIndex - startIndex

        return {
            top: `${startIndex * 60 + 40}px`, // 60px per hour + header offset
            height: `${duration * 60 - 4}px`, // -4px for gap
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/lecturer/dashboard">
                            <Button variant="outline" size="icon" className="rounded-lg bg-transparent">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Class Schedule</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" className="bg-white">
                            Add Schedule
                        </Button>
                        <div className="text-right">
                            <div className="text-blue-600 font-medium">Jul 1, 2025</div>
                            <div className="text-gray-500 text-sm">9:41 AM</div>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                <Card className="bg-white shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                        <div className="grid grid-cols-8 border-b">
                            {/* Empty cell for time column */}
                            <div className="p-4 border-r bg-gray-50"></div>

                            {/* Day headers */}
                            {days.map((day, index) => (
                                <div
                                    key={index}
                                    className={`p-4 text-center border-r font-medium ${day.isToday ? "bg-red-500 text-white" : "bg-gray-50 text-gray-700"
                                        }`}
                                >
                                    {day.name} - {day.date}
                                </div>
                            ))}
                        </div>

                        {/* Calendar body */}
                        <div className="relative">
                            <div className="grid grid-cols-8">
                                {/* Time column */}
                                <div className="border-r bg-gray-50">
                                    {timeSlots.map((time, index) => (
                                        <div
                                            key={index}
                                            className="h-15 p-3 border-b text-sm text-gray-600 flex items-center"
                                            style={{ height: "60px" }}
                                        >
                                            {time}
                                        </div>
                                    ))}
                                </div>

                                {/* Day columns */}
                                {days.map((day, dayIndex) => (
                                    <div key={dayIndex} className="border-r relative">
                                        {timeSlots.map((_, timeIndex) => (
                                            <div key={timeIndex} className="border-b" style={{ height: "60px" }}></div>
                                        ))}

                                        {/* Class events for this day */}
                                        {classEvents
                                            .filter((event) => event.day === dayIndex)
                                            .map((event) => {
                                                const position = calculateEventPosition(event)
                                                return (
                                                    <div
                                                        key={event.id}
                                                        className={`absolute left-1 right-1 ${event.color} ${event.textColor} rounded-md p-2 text-xs font-medium shadow-sm`}
                                                        style={{
                                                            top: position.top,
                                                            height: position.height,
                                                        }}
                                                    >
                                                        <div className="font-semibold">{event.course}</div>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <MapPin className="h-3 w-3" />
                                                            <span>{event.room}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <Clock className="h-3 w-3" />
                                                            <span>
                                                                {event.startTime} - {event.endTime}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
