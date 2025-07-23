"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Student {
    name: string
    studentId: string
    indexNo: string
    phoneNumber: string
    email: string
}

interface Batch {
    id: string
    label: string
    students: Student[]
}

export default function MyStudents() {
    const [selectedBatch, setSelectedBatch] = useState("18/19")

    const batches: Batch[] = [
        {
            id: "18/19",
            label: "18/19\nBatch",
            students: [
                {
                    name: "A.D.C.Kumara",
                    studentId: "ITT/2019/000",
                    indexNo: "0000",
                    phoneNumber: "0770567413",
                    email: "ittt1019056@tec.rjt.ac.lk",
                },
                {
                    name: "D.G.K.Nimal",
                    studentId: "ITT/2019/000",
                    indexNo: "4932",
                    phoneNumber: "0780567413",
                    email: "ittt1019078@tec.rjt.ac.lk",
                },
                {
                    name: "K.P.Saman Kumara",
                    studentId: "ITT/2019/000",
                    indexNo: "5639",
                    phoneNumber: "0710567413",
                    email: "ittt1019086@tec.rjt.ac.lk",
                },
            ],
        },
        {
            id: "19/20",
            label: "19/20\nBatch",
            students: [
                {
                    name: "S.M.Silva",
                    studentId: "ITT/2020/001",
                    indexNo: "1001",
                    phoneNumber: "0771234567",
                    email: "ittt2020001@tec.rjt.ac.lk",
                },
                {
                    name: "R.P.Fernando",
                    studentId: "ITT/2020/002",
                    indexNo: "1002",
                    phoneNumber: "0782345678",
                    email: "ittt2020002@tec.rjt.ac.lk",
                },
            ],
        },
        {
            id: "20/21",
            label: "20/21\nBatch",
            students: [
                {
                    name: "M.A.Perera",
                    studentId: "ITT/2021/001",
                    indexNo: "2001",
                    phoneNumber: "0773456789",
                    email: "ittt2021001@tec.rjt.ac.lk",
                },
            ],
        },
        {
            id: "21/22",
            label: "21/22\nBatch",
            students: [
                {
                    name: "N.K.Jayasinghe",
                    studentId: "ITT/2022/001",
                    indexNo: "3001",
                    phoneNumber: "0774567890",
                    email: "ittt2022001@tec.rjt.ac.lk",
                },
            ],
        },
    ]

    const currentBatch = batches.find((batch) => batch.id === selectedBatch)

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/lecturer/dashboard">
                        <Button variant="outline" size="icon" className="rounded-lg bg-transparent">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">My Students</h1>
                </div>

                {/* Main Content */}
                <div className="flex gap-6">
                    {/* Batch Sidebar */}
                    <div className="flex flex-col gap-2 min-w-[140px]">
                        {batches.map((batch) => (
                            <Button
                                key={batch.id}
                                variant={selectedBatch === batch.id ? "default" : "outline"}
                                className={`h-20 p-4 text-center whitespace-pre-line ${selectedBatch === batch.id
                                        ? "bg-white text-gray-900 border-2 border-gray-300 shadow-md"
                                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                                    }`}
                                onClick={() => setSelectedBatch(batch.id)}
                            >
                                {batch.label}
                            </Button>
                        ))}
                    </div>

                    {/* Students Details Card */}
                    <Card className="flex-1 bg-white shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold">Students Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Student ID</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Index No</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Phone number</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentBatch?.students.map((student, index) => (
                                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4 text-sm text-gray-900 font-medium">{student.name}</td>
                                                <td className="py-3 px-4 text-sm text-gray-900">{student.studentId}</td>
                                                <td className="py-3 px-4 text-sm text-gray-900">{student.indexNo}</td>
                                                <td className="py-3 px-4 text-sm text-gray-900">{student.phoneNumber}</td>
                                                <td className="py-3 px-4 text-sm text-gray-900">{student.email}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {(!currentBatch?.students || currentBatch.students.length === 0) && (
                                    <div className="text-center py-8 text-gray-500">No students found for this batch.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
