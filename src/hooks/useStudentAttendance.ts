import { useState, useEffect } from "react";

export interface AttendanceRecord {
    id: string;
    course_code: string;
    course_name: string;
    lecturer_name: string;
    date: string;
    checked_in: string;
}

export interface AttendanceSummary {
    course_code: string;
    course_name: string;
    year: number;
    attended_classes: number;
    total_classes: number;
    attendance_percentage: number;
}

export function useStudentAttendance(year?: string, semester?: string) {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [summary, setSummary] = useState<AttendanceSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAttendance = async () => {
        try {
            setLoading(true);

            // Fetch detailed records
            const params = new URLSearchParams();
            if (year) params.append("year", year);
            if (semester) params.append("semester", semester);

            const recordsResponse = await fetch(
                `/api/student/attendance?${params}`
            );

            // Fetch summary
            const summaryResponse = await fetch(
                "/api/student/attendance?summary=true"
            );

            if (!recordsResponse.ok || !summaryResponse.ok) {
                throw new Error("Failed to fetch attendance data");
            }

            const recordsResult = await recordsResponse.json();
            const summaryResult = await summaryResponse.json();

            if (recordsResult.success && summaryResult.success) {
                setRecords(recordsResult.data);
                setSummary(summaryResult.data);
                setError(null);
            } else {
                throw new Error("Failed to fetch attendance data");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setRecords([]);
            setSummary([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [year, semester]);

    return { records, summary, loading, error, refetch: fetchAttendance };
}
