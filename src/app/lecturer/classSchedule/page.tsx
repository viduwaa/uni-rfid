"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, MapPin, Clock, Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

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
    const [currentTime, setCurrentTime] = useState(new Date())
    const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false)
    const [formData, setFormData] = useState({
        course: "",
        lectureHall: "",
        date: "",
        startTime: "",
        endTime: "",
    })

    // Generate time slots from 6:00 AM to 6:00 PM in 15-minute intervals
    const generateTimeSlots = () => {
        const slots = []
        for (let hour = 6; hour <= 18; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                const time24 = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`

                // Convert to 12-hour format for display
                let displayHour = hour
                let period = "AM"

                if (hour === 0) {
                    displayHour = 12
                } else if (hour === 12) {
                    period = "PM"
                } else if (hour > 12) {
                    displayHour = hour - 12
                    period = "PM"
                }

                const displayTime = `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`

                slots.push({
                    value: time24,
                    label: displayTime,
                })
            }
        }
        return slots
    }

    const timeSlots = generateTimeSlots()

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    // Get current week dates
    const getCurrentWeekDates = () => {
        const today = new Date()
        const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, etc.
        const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay // Adjust for Monday start

        const monday = new Date(today)
        monday.setDate(today.getDate() + mondayOffset)

        const weekDates = []
        for (let i = 0; i < 7; i++) {
            const date = new Date(monday)
            date.setDate(monday.getDate() + i)
            weekDates.push(date)
        }

        return weekDates
    }

    const weekDates = getCurrentWeekDates()
    const today = new Date()

    // Generate days array with current week dates
    const days = weekDates.map((date, index) => {
        const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        const isToday = date.toDateString() === today.toDateString()

        return {
            name: dayNames[index],
            date: date.getDate().toString(),
            isToday: isToday,
        }
    })

    // Format current time for display
    const formattedTime = currentTime.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    })

    // Calendar time slots for display
    const calendarTimeSlots = [
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

    const handleAddSchedule = () => {
        console.log("Adding schedule:", formData)
        // Here you would typically save the schedule
        setIsAddScheduleOpen(false)
        setFormData({
            course: "",
            lectureHall: "",
            date: "",
            startTime: "",
            endTime: "",
        })
    }

    const handleCancel = () => {
        setIsAddScheduleOpen(false)
        setFormData({
            course: "",
            lectureHall: "",
            date: "",
            startTime: "",
            endTime: "",
        })
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" className="rounded-lg bg-transparent">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-3xl font-bold text-gray-900">Class Schedule</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" className="bg-white" onClick={() => setIsAddScheduleOpen(true)}>
                            Add Schedule
                        </Button>
                        <div className="text-right">
                            <div className="text-blue-600 font-medium">
                                {currentTime.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </div>
                            <div className="text-gray-500 text-sm">
                                {currentTime.toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                })}
                            </div>
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
                                    {calendarTimeSlots.map((time, index) => (
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
                                        {calendarTimeSlots.map((_, timeIndex) => (
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
            {/* Add Schedule Modal */}
            {isAddScheduleOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Add Schedule</h2>
                                <p className="text-sm text-gray-600 mt-1">Schedule a future lecture</p>
                            </div>

                            <div className="space-y-6">
                                {/* Course Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Course</label>
                                    <Select
                                        value={formData.course}
                                        onValueChange={(value) => setFormData({ ...formData, course: value })}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Course" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ICT-1308">ICT - 1308</SelectItem>
                                            <SelectItem value="ICT-2308">ICT - 2308</SelectItem>
                                            <SelectItem value="ICT-3308">ICT - 3308</SelectItem>
                                            <SelectItem value="ICT-4308">ICT - 4308</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Lecture Hall Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Lecture Hall</label>
                                    <Select
                                        value={formData.lectureHall}
                                        onValueChange={(value) => setFormData({ ...formData, lectureHall: value })}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Lecture Hall" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="S 201">S 201</SelectItem>
                                            <SelectItem value="S 202">S 202</SelectItem>
                                            <SelectItem value="S 205">S 205</SelectItem>
                                            <SelectItem value="Computer Lab 1">Computer Lab 1</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Date Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Date</label>
                                    <Input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        min={new Date().toISOString().split("T")[0]}
                                        className="w-full"
                                    />
                                </div>

                                {/* Time Selection */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Start Time</label>
                                        <Select
                                            value={formData.startTime}
                                            onValueChange={(value) => setFormData({ ...formData, startTime: value })}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select Start Time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeSlots.map((slot) => (
                                                    <SelectItem key={slot.value} value={slot.value}>
                                                        {slot.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">End Time</label>
                                        <Select
                                            value={formData.endTime}
                                            onValueChange={(value) => setFormData({ ...formData, endTime: value })}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select End Time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeSlots.map((slot) => (
                                                    <SelectItem key={slot.value} value={slot.value}>
                                                        {slot.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3 mt-6">
                                <Button
                                    className="w-full bg-black hover:bg-gray-800 text-white py-3 cursor-pointer"
                                    onClick={handleAddSchedule}
                                    disabled={
                                        !formData.course ||
                                        !formData.lectureHall ||
                                        !formData.date ||
                                        !formData.startTime ||
                                        !formData.endTime
                                    }
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add a Schedule
                                </Button>
                                <Button variant="outline" className="w-full py-3 cursor-pointer bg-transparent" onClick={handleCancel}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
