// Report filter types
export interface DateRangeFilter {
    startDate: string; // ISO date string
    endDate: string; // ISO date string
}

export interface ReportFilters {
    dateRange?: DateRangeFilter;
    faculty?: string;
    year?: number;
    courseId?: string;
    lecturerId?: string;
    studentId?: string;
}

// Attendance Reports
export interface AttendanceReportRow {
    student_id: string;
    register_number: string;
    full_name: string;
    faculty: string;
    year_of_study: number;
    course_code: string;
    course_name: string;
    lecturer_name: string;
    date: string;
    checked_in: string;
    attendance_status: "present" | "absent" | "late";
}

export interface AttendanceSummary {
    total_classes: number;
    total_students: number;
    total_present: number;
    total_absent: number;
    attendance_rate: number;
    by_course: Array<{
        course_code: string;
        course_name: string;
        total_classes: number;
        attendance_rate: number;
    }>;
    by_faculty: Array<{
        faculty: string;
        total_students: number;
        attendance_rate: number;
    }>;
}

// Financial Reports - Canteen
export interface CanteenFinancialRow {
    transaction_id: string;
    transaction_date: string;
    student_id: string;
    register_number: string;
    full_name: string;
    faculty: string;
    amount: number;
    payment_method: string;
    status: string;
    item_count: number;
    items: Array<{
        item_name: string;
        quantity: number;
        unit_price: number;
        total_price: number;
    }>;
}

export interface CanteenFinancialSummary {
    total_revenue: number;
    total_transactions: number;
    average_transaction_value: number;
    total_items_sold: number;
    by_payment_method: Array<{
        payment_method: string;
        transaction_count: number;
        total_amount: number;
    }>;
    by_category: Array<{
        category: string;
        items_sold: number;
        revenue: number;
    }>;
    top_selling_items: Array<{
        item_name: string;
        quantity_sold: number;
        revenue: number;
    }>;
    daily_breakdown: Array<{
        date: string;
        transaction_count: number;
        revenue: number;
    }>;
}

// Financial Reports - Library
export interface LibraryFinancialRow {
    fine_id: string;
    student_id: string;
    register_number: string;
    full_name: string;
    faculty: string;
    amount: number;
    reason: string;
    status: string;
    created_at: string;
    paid_at?: string;
}

export interface LibraryFinancialSummary {
    total_fines_generated: number;
    total_fines_collected: number;
    pending_fines: number;
    waived_fines: number;
    by_reason: Array<{
        reason: string;
        count: number;
        total_amount: number;
    }>;
    by_faculty: Array<{
        faculty: string;
        total_fines: number;
        pending_amount: number;
    }>;
}

// Student Performance Reports
export interface StudentPerformanceRow {
    student_id: string;
    register_number: string;
    full_name: string;
    faculty: string;
    year_of_study: number;
    course_code: string;
    course_name: string;
    marks: number;
    grade: string;
    gpa: number;
    attendance_rate: number;
}

export interface StudentPerformanceSummary {
    total_students: number;
    average_gpa: number;
    by_grade: Array<{
        grade: string;
        count: number;
        percentage: number;
    }>;
    by_faculty: Array<{
        faculty: string;
        average_gpa: number;
        total_students: number;
    }>;
    top_performers: Array<{
        register_number: string;
        full_name: string;
        gpa: number;
        faculty: string;
    }>;
}

// Course Analytics Reports
export interface CourseAnalyticsRow {
    course_id: string;
    course_code: string;
    course_name: string;
    faculty: string;
    year: number;
    credits: number;
    enrolled_students: number;
    average_attendance_rate: number;
    average_grade: number;
    pass_rate: number;
    lecturer_name: string;
}

export interface CourseAnalyticsSummary {
    total_courses: number;
    total_enrollments: number;
    average_enrollment: number;
    by_faculty: Array<{
        faculty: string;
        course_count: number;
        total_enrollments: number;
        average_attendance: number;
    }>;
    most_enrolled: Array<{
        course_code: string;
        course_name: string;
        enrollment_count: number;
    }>;
    lowest_attendance: Array<{
        course_code: string;
        course_name: string;
        attendance_rate: number;
    }>;
}

// Library Usage Reports
export interface LibraryUsageRow {
    loan_id: string;
    student_id: string;
    register_number: string;
    full_name: string;
    faculty: string;
    book_title: string;
    author: string;
    isbn: string;
    borrowed_at: string;
    due_date: string;
    returned_at?: string;
    status: string;
    days_overdue: number;
}

export interface LibraryUsageSummary {
    total_loans: number;
    active_loans: number;
    overdue_loans: number;
    total_returns: number;
    average_loan_duration: number;
    most_borrowed_books: Array<{
        book_title: string;
        author: string;
        loan_count: number;
    }>;
    by_category: Array<{
        category: string;
        loan_count: number;
    }>;
    by_faculty: Array<{
        faculty: string;
        active_members: number;
        total_loans: number;
    }>;
}

// Card Usage Reports
export interface CardUsageRow {
    card_id: string;
    student_id: string;
    register_number: string;
    full_name: string;
    faculty: string;
    total_swipes: number;
    last_used: string;
    card_status: string;
    current_balance: number;
    total_spent: number;
}

export interface CardUsageSummary {
    total_active_cards: number;
    total_swipes: number;
    total_balance: number;
    average_balance: number;
    by_faculty: Array<{
        faculty: string;
        active_cards: number;
        total_transactions: number;
        total_balance: number;
    }>;
}

// System Reports
export interface SystemUsageReport {
    date_range: DateRangeFilter;
    total_users: number;
    active_students: number;
    active_lecturers: number;
    total_nfc_events: number;
    by_module: {
        canteen: {
            transactions: number;
            revenue: number;
            active_users: number;
        };
        library: {
            loans: number;
            returns: number;
            active_users: number;
        };
        attendance: {
            total_records: number;
            unique_students: number;
            unique_courses: number;
        };
    };
}

// Combined Report Response
export interface ReportResponse<T> {
    success: boolean;
    data: T;
    filters: ReportFilters;
    generated_at: string;
    total_records: number;
}

// CSV Export types
export interface CSVExportOptions {
    reportType: ReportType;
    filters: ReportFilters;
    filename?: string;
}

export type ReportType =
    | "attendance"
    | "canteen-financial"
    | "library-financial"
    | "student-performance"
    | "course-analytics"
    | "library-usage"
    | "card-usage"
    | "system-usage";

// Combined detailed report for all data
export interface DetailedReport {
    type: ReportType;
    summary: any; // Will be one of the summary types above
    details: any[]; // Will be array of row types above
    filters: ReportFilters;
}
