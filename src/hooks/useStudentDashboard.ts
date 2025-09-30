import { useState, useEffect } from "react";

export interface DashboardData {
    student: {
        user_id: string;
        register_number: string;
        full_name: string;
        email: string;
        faculty: string;
        year_of_study: number;
        card_balance: number;
    };
    stats: {
        totalCourses: number;
        totalAttendancePercentage: number;
        currentGPA: number;
        currentBalance: number;
        overdueBooks: number;
        pendingFines: number;
    };
    courses: Array<{
        id: string;
        course_code: string;
        course_name: string;
        faculty: string;
        year: number;
        credits: number;
    }>;
}

export function useStudentDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/student/dashboard");

            if (!response.ok) {
                throw new Error("Failed to fetch dashboard data");
            }

            const result = await response.json();

            if (result.success) {
                setData(result.data);
                setError(null);
            } else {
                throw new Error(
                    result.message || "Failed to fetch dashboard data"
                );
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    return { data, loading, error, refetch: fetchDashboard };
}
