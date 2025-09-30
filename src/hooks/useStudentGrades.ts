import { useState, useEffect } from "react";

export interface GradeRecord {
    id: string;
    course_code: string;
    course_name: string;
    credits: number;
    grade: string;
    exam_date: string;
    remarks: string;
}

export function useStudentGrades(year?: string) {
    const [grades, setGrades] = useState<GradeRecord[]>([]);
    const [gpa, setGpa] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGrades = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            if (year) params.append("year", year);

            const response = await fetch(`/api/student/grades?${params}`);

            if (!response.ok) {
                throw new Error("Failed to fetch grades data");
            }

            const result = await response.json();

            if (result.success) {
                setGrades(result.data.grades);
                setGpa(result.data.gpa);
                setError(null);
            } else {
                throw new Error(
                    result.message || "Failed to fetch grades data"
                );
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setGrades([]);
            setGpa(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGrades();
    }, [year]);

    return { grades, gpa, loading, error, refetch: fetchGrades };
}
