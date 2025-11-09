// CSV Generation Utility
export function convertToCSV(data: any[], headers?: string[]): string {
    if (!data || data.length === 0) {
        return "";
    }

    // If headers not provided, extract from first object
    const csvHeaders = headers || Object.keys(data[0]);

    // Escape and format cell value
    const formatCell = (value: any): string => {
        if (value === null || value === undefined) {
            return "";
        }

        const stringValue = String(value);

        // If value contains comma, newline, or quote, wrap in quotes and escape quotes
        if (
            stringValue.includes(",") ||
            stringValue.includes("\n") ||
            stringValue.includes('"')
        ) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }

        return stringValue;
    };

    // Create header row
    const headerRow = csvHeaders.map(formatCell).join(",");

    // Create data rows
    const dataRows = data.map((row) => {
        return csvHeaders
            .map((header) => {
                const value = row[header];
                return formatCell(value);
            })
            .join(",");
    });

    // Combine header and data rows
    return [headerRow, ...dataRows].join("\n");
}

// Download CSV file in browser
export function downloadCSV(
    csvContent: string,
    filename: string = "report.csv"
): void {
    // Add BOM for Excel UTF-8 support
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], {
        type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Format date for filename
export function formatDateForFilename(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}${month}${day}_${hours}${minutes}`;
}

// Generate filename based on report type and filters
export function generateReportFilename(
    reportType: string,
    filters?: { startDate?: string; endDate?: string; faculty?: string }
): string {
    const timestamp = formatDateForFilename();
    let filename = `${reportType}_report_${timestamp}`;

    if (filters?.startDate && filters?.endDate) {
        filename += `_${filters.startDate}_to_${filters.endDate}`;
    }

    if (filters?.faculty) {
        filename += `_${filters.faculty.replace(/\s+/g, "_")}`;
    }

    return `${filename}.csv`;
}

// Custom formatters for specific report types
export const reportFormatters = {
    attendance: (data: any[]) => {
        return data.map((row) => ({
            "Register Number": row.register_number,
            "Full Name": row.full_name,
            Faculty: row.faculty,
            "Year of Study": row.year_of_study,
            "Course Code": row.course_code,
            "Course Name": row.course_name,
            Lecturer: row.lecturer_name,
            Date: row.date,
            "Check-in Time": row.checked_in || "N/A",
            Status: row.attendance_status,
        }));
    },

    canteenFinancial: (data: any[]) => {
        return data.map((row) => ({
            "Transaction ID": row.transaction_id,
            Date: new Date(row.transaction_date).toLocaleString(),
            "Register Number": row.register_number,
            "Student Name": row.full_name,
            Faculty: row.faculty,
            Amount: row.amount,
            "Payment Method": row.payment_method,
            Status: row.status,
            "Items Purchased": row.item_count,
        }));
    },

    libraryFinancial: (data: any[]) => {
        return data.map((row) => ({
            "Fine ID": row.fine_id,
            "Register Number": row.register_number,
            "Student Name": row.full_name,
            Faculty: row.faculty,
            Amount: row.amount,
            Reason: row.reason,
            Status: row.status,
            "Created At": new Date(row.created_at).toLocaleString(),
            "Paid At": row.paid_at
                ? new Date(row.paid_at).toLocaleString()
                : "N/A",
        }));
    },

    studentPerformance: (data: any[]) => {
        return data.map((row) => ({
            "Register Number": row.register_number,
            "Student Name": row.full_name,
            Faculty: row.faculty,
            "Year of Study": row.year_of_study,
            "Course Code": row.course_code,
            "Course Name": row.course_name,
            Marks: row.marks,
            Grade: row.grade,
            GPA: row.gpa,
            "Attendance Rate": row.attendance_rate + "%",
        }));
    },

    courseAnalytics: (data: any[]) => {
        return data.map((row) => ({
            "Course Code": row.course_code,
            "Course Name": row.course_name,
            Faculty: row.faculty,
            Year: row.year,
            Credits: row.credits,
            "Enrolled Students": row.enrolled_students,
            "Average Attendance": row.average_attendance_rate + "%",
            "Average Grade": row.average_grade,
            "Pass Rate": row.pass_rate + "%",
            Lecturer: row.lecturer_name || "N/A",
        }));
    },

    libraryUsage: (data: any[]) => {
        return data.map((row) => ({
            "Loan ID": row.loan_id,
            "Register Number": row.register_number,
            "Student Name": row.full_name,
            Faculty: row.faculty,
            "Book Title": row.book_title,
            Author: row.author,
            ISBN: row.isbn || "N/A",
            "Borrowed At": new Date(row.borrowed_at).toLocaleString(),
            "Due Date": new Date(row.due_date).toLocaleDateString(),
            "Returned At": row.returned_at
                ? new Date(row.returned_at).toLocaleString()
                : "Not Returned",
            Status: row.status,
            "Days Overdue": row.days_overdue,
        }));
    },

    cardUsage: (data: any[]) => {
        return data.map((row) => ({
            "Card ID": row.card_id,
            "Register Number": row.register_number,
            "Student Name": row.full_name,
            Faculty: row.faculty,
            "Total Swipes": row.total_swipes,
            "Last Used": new Date(row.last_used).toLocaleString(),
            Status: row.card_status,
            "Current Balance": row.current_balance,
            "Total Spent": row.total_spent,
        }));
    },
};
