import { pool } from "./db";
import {
    ReportFilters,
    AttendanceReportRow,
    AttendanceSummary,
    CanteenFinancialRow,
    CanteenFinancialSummary,
    LibraryFinancialRow,
    LibraryFinancialSummary,
    StudentPerformanceRow,
    StudentPerformanceSummary,
    CourseAnalyticsRow,
    CourseAnalyticsSummary,
    LibraryUsageRow,
    LibraryUsageSummary,
    CardUsageRow,
    CardUsageSummary,
    SystemUsageReport,
} from "@/types/reports";

// Helper function to build WHERE clauses from filters
function buildWhereClause(
    filters: ReportFilters,
    tableAlias?: string
): { where: string; params: any[] } {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;
    const prefix = tableAlias ? `${tableAlias}.` : "";

    if (filters.dateRange) {
        conditions.push(`${prefix}date >= $${paramIndex++}`);
        params.push(filters.dateRange.startDate);
        conditions.push(`${prefix}date <= $${paramIndex++}`);
        params.push(filters.dateRange.endDate);
    }

    if (filters.faculty) {
        conditions.push(`${prefix}faculty = $${paramIndex++}`);
        params.push(filters.faculty);
    }

    if (filters.year) {
        conditions.push(`${prefix}year_of_study = $${paramIndex++}`);
        params.push(filters.year);
    }

    if (filters.courseId) {
        conditions.push(`${prefix}course_id = $${paramIndex++}`);
        params.push(filters.courseId);
    }

    if (filters.lecturerId) {
        conditions.push(`${prefix}lecturer_id = $${paramIndex++}`);
        params.push(filters.lecturerId);
    }

    if (filters.studentId) {
        conditions.push(`${prefix}student_id = $${paramIndex++}`);
        params.push(filters.studentId);
    }

    return {
        where: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
        params,
    };
}

// ATTENDANCE REPORTS
export async function getAttendanceReport(
    filters: ReportFilters
): Promise<AttendanceReportRow[]> {
    const { where, params } = buildWhereClause(filters, "a");

    const query = `
        SELECT 
            s.user_id as student_id,
            s.register_number,
            s.full_name,
            s.faculty,
            s.year_of_study,
            c.course_code,
            c.course_name,
            l.full_name as lecturer_name,
            a.date,
            a.checked_in,
            CASE 
                WHEN a.checked_in IS NOT NULL THEN 'present'::text
                ELSE 'absent'::text
            END as attendance_status
        FROM attendance a
        JOIN students s ON a.student_id = s.user_id
        JOIN courses c ON a.course_id = c.id
        LEFT JOIN lecturers l ON a.lecturer_id = l.user_id
        ${where}
        ORDER BY a.date DESC, s.register_number
    `;

    const result = await pool.query(query, params);
    return result.rows;
}

export async function getAttendanceSummary(
    filters: ReportFilters
): Promise<AttendanceSummary> {
    const { where, params } = buildWhereClause(filters, "a");

    // Overall summary
    const overallQuery = `
        SELECT 
            COUNT(DISTINCT a.id) as total_classes,
            COUNT(DISTINCT a.student_id) as total_students,
            COUNT(CASE WHEN a.checked_in IS NOT NULL THEN 1 END) as total_present,
            COUNT(CASE WHEN a.checked_in IS NULL THEN 1 END) as total_absent,
            ROUND(
                (COUNT(CASE WHEN a.checked_in IS NOT NULL THEN 1 END)::numeric / 
                NULLIF(COUNT(a.id), 0) * 100)::numeric, 
                2
            ) as attendance_rate
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        ${where}
    `;

    // By course
    const byCourseQuery = `
        SELECT 
            c.course_code,
            c.course_name,
            COUNT(DISTINCT a.id) as total_classes,
            ROUND(
                (COUNT(CASE WHEN a.checked_in IS NOT NULL THEN 1 END)::numeric / 
                NULLIF(COUNT(a.id), 0) * 100)::numeric, 
                2
            ) as attendance_rate
        FROM attendance a
        JOIN courses c ON a.course_id = c.id
        JOIN students s ON a.student_id = s.id
        ${where}
        GROUP BY c.course_code, c.course_name
        ORDER BY attendance_rate DESC
    `;

    // By faculty
    const byFacultyQuery = `
        SELECT 
            s.faculty,
            COUNT(DISTINCT s.id) as total_students,
            ROUND(
                (COUNT(CASE WHEN a.checked_in IS NOT NULL THEN 1 END)::numeric / 
                NULLIF(COUNT(a.id), 0) * 100)::numeric, 
                2
            ) as attendance_rate
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        ${where}
        GROUP BY s.faculty
        ORDER BY attendance_rate DESC
    `;

    const [overallResult, byCourseResult, byFacultyResult] = await Promise.all([
        pool.query(overallQuery, params),
        pool.query(byCourseQuery, params),
        pool.query(byFacultyQuery, params),
    ]);

    return {
        total_classes: parseInt(overallResult.rows[0].total_classes) || 0,
        total_students: parseInt(overallResult.rows[0].total_students) || 0,
        total_present: parseInt(overallResult.rows[0].total_present) || 0,
        total_absent: parseInt(overallResult.rows[0].total_absent) || 0,
        attendance_rate: parseFloat(overallResult.rows[0].attendance_rate) || 0,
        by_course: byCourseResult.rows,
        by_faculty: byFacultyResult.rows,
    };
}

// CANTEEN FINANCIAL REPORTS
export async function getCanteenFinancialReport(
    filters: ReportFilters
): Promise<CanteenFinancialRow[]> {
    let whereConditions = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (filters.dateRange) {
        whereConditions.push(`DATE(ct.transaction_date) >= $${paramIndex++}`);
        params.push(filters.dateRange.startDate);
        whereConditions.push(`DATE(ct.transaction_date) <= $${paramIndex++}`);
        params.push(filters.dateRange.endDate);
    }

    if (filters.faculty) {
        whereConditions.push(`s.faculty = $${paramIndex++}`);
        params.push(filters.faculty);
    }

    if (filters.studentId) {
        whereConditions.push(`ct.student_id = $${paramIndex++}`);
        params.push(filters.studentId);
    }

    const where =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(" AND ")}`
            : "";

    const query = `
        SELECT 
            ct.transaction_id,
            ct.transaction_date,
            ct.student_id,
            s.register_number,
            s.full_name,
            s.faculty,
            ct.amount,
            ct.payment_method,
            ct.status,
            COUNT(cti.id) as item_count,
            json_agg(
                json_build_object(
                    'item_name', mi.name,
                    'quantity', cti.quantity,
                    'unit_price', cti.unit_price,
                    'total_price', cti.total_price
                )
            ) FILTER (WHERE mi.id IS NOT NULL) as items
        FROM canteen_transactions ct
        JOIN students s ON ct.student_id = s.user_id
        LEFT JOIN canteen_transaction_items cti ON ct.id = cti.transaction_id
        LEFT JOIN menu_items mi ON cti.menu_item_id = mi.id
        ${where}
        GROUP BY ct.id, ct.transaction_id, ct.transaction_date, ct.student_id, 
                 s.register_number, s.full_name, s.faculty, ct.amount, 
                 ct.payment_method, ct.status
        ORDER BY ct.transaction_date DESC
    `;

    const result = await pool.query(query, params);
    return result.rows;
}

export async function getCanteenFinancialSummary(
    filters: ReportFilters
): Promise<CanteenFinancialSummary> {
    let whereConditions = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (filters.dateRange) {
        whereConditions.push(`DATE(ct.transaction_date) >= $${paramIndex++}`);
        params.push(filters.dateRange.startDate);
        whereConditions.push(`DATE(ct.transaction_date) <= $${paramIndex++}`);
        params.push(filters.dateRange.endDate);
    }

    if (filters.faculty) {
        whereConditions.push(`s.faculty = $${paramIndex++}`);
        params.push(filters.faculty);
    }

    const where =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(" AND ")}`
            : "";

    // Overall summary
    const overallQuery = `
        SELECT 
            COALESCE(SUM(ct.amount), 0) as total_revenue,
            COUNT(ct.id) as total_transactions,
            COALESCE(AVG(ct.amount), 0) as average_transaction_value,
            COALESCE(SUM(cti.quantity), 0) as total_items_sold
        FROM canteen_transactions ct
        JOIN students s ON ct.student_id = s.user_id
        LEFT JOIN canteen_transaction_items cti ON ct.id = cti.transaction_id
        ${where} AND ct.status = 'completed'
    `;

    // By payment method
    const byPaymentQuery = `
        SELECT 
            ct.payment_method,
            COUNT(ct.id) as transaction_count,
            COALESCE(SUM(ct.amount), 0) as total_amount
        FROM canteen_transactions ct
        JOIN students s ON ct.student_id = s.user_id
        ${where} AND ct.status = 'completed'
        GROUP BY ct.payment_method
    `;

    // By category
    const byCategoryQuery = `
        SELECT 
            mi.category,
            SUM(cti.quantity) as items_sold,
            SUM(cti.total_price) as revenue
        FROM canteen_transactions ct
        JOIN students s ON ct.student_id = s.user_id
        JOIN canteen_transaction_items cti ON ct.id = cti.transaction_id
        JOIN menu_items mi ON cti.menu_item_id = mi.id
        ${where} AND ct.status = 'completed'
        GROUP BY mi.category
        ORDER BY revenue DESC
    `;

    // Top selling items
    const topItemsQuery = `
        SELECT 
            mi.name as item_name,
            SUM(cti.quantity) as quantity_sold,
            SUM(cti.total_price) as revenue
        FROM canteen_transactions ct
        JOIN students s ON ct.student_id = s.user_id
        JOIN canteen_transaction_items cti ON ct.id = cti.transaction_id
        JOIN menu_items mi ON cti.menu_item_id = mi.id
        ${where} AND ct.status = 'completed'
        GROUP BY mi.name
        ORDER BY quantity_sold DESC
        LIMIT 10
    `;

    // Daily breakdown
    const dailyQuery = `
        SELECT 
            DATE(ct.transaction_date) as date,
            COUNT(ct.id) as transaction_count,
            SUM(ct.amount) as revenue
        FROM canteen_transactions ct
        JOIN students s ON ct.student_id = s.user_id
        ${where} AND ct.status = 'completed'
        GROUP BY DATE(ct.transaction_date)
        ORDER BY date DESC
    `;

    const [
        overallResult,
        byPaymentResult,
        byCategoryResult,
        topItemsResult,
        dailyResult,
    ] = await Promise.all([
        pool.query(overallQuery, params),
        pool.query(byPaymentQuery, params),
        pool.query(byCategoryQuery, params),
        pool.query(topItemsQuery, params),
        pool.query(dailyQuery, params),
    ]);

    return {
        total_revenue: parseFloat(overallResult.rows[0].total_revenue) || 0,
        total_transactions:
            parseInt(overallResult.rows[0].total_transactions) || 0,
        average_transaction_value:
            parseFloat(overallResult.rows[0].average_transaction_value) || 0,
        total_items_sold: parseInt(overallResult.rows[0].total_items_sold) || 0,
        by_payment_method: byPaymentResult.rows,
        by_category: byCategoryResult.rows,
        top_selling_items: topItemsResult.rows,
        daily_breakdown: dailyResult.rows,
    };
}

// LIBRARY FINANCIAL REPORTS
export async function getLibraryFinancialReport(
    filters: ReportFilters
): Promise<LibraryFinancialRow[]> {
    let whereConditions = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (filters.dateRange) {
        whereConditions.push(`DATE(lf.created_at) >= $${paramIndex++}`);
        params.push(filters.dateRange.startDate);
        whereConditions.push(`DATE(lf.created_at) <= $${paramIndex++}`);
        params.push(filters.dateRange.endDate);
    }

    if (filters.faculty) {
        whereConditions.push(`s.faculty = $${paramIndex++}`);
        params.push(filters.faculty);
    }

    if (filters.studentId) {
        whereConditions.push(`lf.student_id = $${paramIndex++}`);
        params.push(filters.studentId);
    }

    const where =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(" AND ")}`
            : "";

    const query = `
        SELECT 
            lf.id as fine_id,
            lf.student_id,
            s.register_number,
            s.full_name,
            s.faculty,
            lf.amount,
            lf.reason,
            lf.status,
            lf.created_at,
            lf.paid_at
        FROM library_fines lf
        JOIN students s ON lf.student_id = s.user_id
        ${where}
        ORDER BY lf.created_at DESC
    `;

    const result = await pool.query(query, params);
    return result.rows;
}

export async function getLibraryFinancialSummary(
    filters: ReportFilters
): Promise<LibraryFinancialSummary> {
    let whereConditions = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (filters.dateRange) {
        whereConditions.push(`DATE(lf.created_at) >= $${paramIndex++}`);
        params.push(filters.dateRange.startDate);
        whereConditions.push(`DATE(lf.created_at) <= $${paramIndex++}`);
        params.push(filters.dateRange.endDate);
    }

    if (filters.faculty) {
        whereConditions.push(`s.faculty = $${paramIndex++}`);
        params.push(filters.faculty);
    }

    const where =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(" AND ")}`
            : "";

    const summaryQuery = `
        SELECT 
            SUM(lf.amount) as total_fines_generated,
            SUM(CASE WHEN lf.status = 'paid' THEN lf.amount ELSE 0 END) as total_fines_collected,
            SUM(CASE WHEN lf.status = 'pending' THEN lf.amount ELSE 0 END) as pending_fines,
            SUM(CASE WHEN lf.status = 'waived' THEN lf.amount ELSE 0 END) as waived_fines
        FROM library_fines lf
        JOIN students s ON lf.student_id = s.user_id
        ${where}
    `;

    const byReasonQuery = `
        SELECT 
            lf.reason,
            COUNT(*) as count,
            SUM(lf.amount) as total_amount
        FROM library_fines lf
        JOIN students s ON lf.student_id = s.user_id
        ${where}
        GROUP BY lf.reason
        ORDER BY total_amount DESC
    `;

    const byFacultyQuery = `
        SELECT 
            s.faculty,
            SUM(lf.amount) as total_fines,
            SUM(CASE WHEN lf.status = 'pending' THEN lf.amount ELSE 0 END) as pending_amount
        FROM library_fines lf
        JOIN students s ON lf.student_id = s.user_id
        ${where}
        GROUP BY s.faculty
        ORDER BY total_fines DESC
    `;

    const [summaryResult, byReasonResult, byFacultyResult] = await Promise.all([
        pool.query(summaryQuery, params),
        pool.query(byReasonQuery, params),
        pool.query(byFacultyQuery, params),
    ]);

    return {
        total_fines_generated:
            parseFloat(summaryResult.rows[0].total_fines_generated) || 0,
        total_fines_collected:
            parseFloat(summaryResult.rows[0].total_fines_collected) || 0,
        pending_fines: parseFloat(summaryResult.rows[0].pending_fines) || 0,
        waived_fines: parseFloat(summaryResult.rows[0].waived_fines) || 0,
        by_reason: byReasonResult.rows,
        by_faculty: byFacultyResult.rows,
    };
}

// STUDENT PERFORMANCE REPORTS
export async function getStudentPerformanceReport(
    filters: ReportFilters
): Promise<StudentPerformanceRow[]> {
    let whereConditions = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (filters.faculty) {
        whereConditions.push(`s.faculty = $${paramIndex++}`);
        params.push(filters.faculty);
    }

    if (filters.year) {
        whereConditions.push(`s.year_of_study = $${paramIndex++}`);
        params.push(filters.year);
    }

    if (filters.courseId) {
        whereConditions.push(`er.course_id = $${paramIndex++}`);
        params.push(filters.courseId);
    }

    if (filters.studentId) {
        whereConditions.push(`s.id = $${paramIndex++}`);
        params.push(filters.studentId);
    }

    const where =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(" AND ")}`
            : "";

    const query = `
        SELECT 
            s.user_id as student_id,
            s.register_number,
            s.full_name,
            s.faculty,
            s.year_of_study,
            c.course_code,
            c.course_name,
            er.grade,
            COALESCE(
                (SELECT AVG(
                    CASE grade
                        WHEN 'A+' THEN 4.0
                        WHEN 'A' THEN 4.0
                        WHEN 'A-' THEN 3.7
                        WHEN 'B+' THEN 3.3
                        WHEN 'B' THEN 3.0
                        WHEN 'B-' THEN 2.7
                        WHEN 'C+' THEN 2.3
                        WHEN 'C' THEN 2.0
                        WHEN 'C-' THEN 1.7
                        WHEN 'D+' THEN 1.3
                        WHEN 'D' THEN 1.0
                        ELSE 0
                    END
                )
                FROM exam_results
                WHERE student_id = s.user_id), 0
            ) as gpa,
            COALESCE(
                (SELECT ROUND(
                    (COUNT(CASE WHEN checked_in IS NOT NULL THEN 1 END)::numeric / 
                    NULLIF(COUNT(*), 0) * 100)::numeric, 2
                )
                FROM attendance
                WHERE student_id = s.user_id AND course_id = c.id), 0
            ) as attendance_rate
        FROM students s
        JOIN exam_results er ON s.user_id = er.student_id
        JOIN courses c ON er.course_id = c.id
        ${where}
        ORDER BY s.register_number, c.course_code
    `;

    const result = await pool.query(query, params);
    return result.rows;
}

export async function getStudentPerformanceSummary(
    filters: ReportFilters
): Promise<StudentPerformanceSummary> {
    let whereConditions = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (filters.faculty) {
        whereConditions.push(`s.faculty = $${paramIndex++}`);
        params.push(filters.faculty);
    }

    if (filters.year) {
        whereConditions.push(`s.year_of_study = $${paramIndex++}`);
        params.push(filters.year);
    }

    const where =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(" AND ")}`
            : "";

    const overallQuery = `
        SELECT 
            COUNT(DISTINCT s.user_id) as total_students,
            AVG(
                CASE er.grade
                    WHEN 'A+' THEN 4.0
                    WHEN 'A' THEN 4.0
                    WHEN 'A-' THEN 3.7
                    WHEN 'B+' THEN 3.3
                    WHEN 'B' THEN 3.0
                    WHEN 'B-' THEN 2.7
                    WHEN 'C+' THEN 2.3
                    WHEN 'C' THEN 2.0
                    WHEN 'C-' THEN 1.7
                    WHEN 'D+' THEN 1.3
                    WHEN 'D' THEN 1.0
                    ELSE 0
                END
            ) as average_gpa
        FROM students s
        JOIN exam_results er ON s.user_id = er.student_id
        ${where}
    `;

    const byGradeQuery = `
        SELECT 
            er.grade,
            COUNT(*) as count,
            ROUND((COUNT(*)::numeric / (SELECT COUNT(*) FROM exam_results er2 
                JOIN students s2 ON er2.student_id = s2.user_id ${where}) * 100)::numeric, 2) as percentage
        FROM students s
        JOIN exam_results er ON s.user_id = er.student_id
        ${where}
        GROUP BY er.grade
        ORDER BY 
            CASE er.grade
                WHEN 'A+' THEN 1 WHEN 'A' THEN 2 WHEN 'A-' THEN 3
                WHEN 'B+' THEN 4 WHEN 'B' THEN 5 WHEN 'B-' THEN 6
                WHEN 'C+' THEN 7 WHEN 'C' THEN 8 WHEN 'C-' THEN 9
                WHEN 'D+' THEN 10 WHEN 'D' THEN 11 WHEN 'F' THEN 12
            END
    `;

    const byFacultyQuery = `
        SELECT 
            s.faculty,
            COUNT(DISTINCT s.user_id) as total_students,
            AVG(
                CASE er.grade
                    WHEN 'A+' THEN 4.0 WHEN 'A' THEN 4.0 WHEN 'A-' THEN 3.7
                    WHEN 'B+' THEN 3.3 WHEN 'B' THEN 3.0 WHEN 'B-' THEN 2.7
                    WHEN 'C+' THEN 2.3 WHEN 'C' THEN 2.0 WHEN 'C-' THEN 1.7
                    WHEN 'D+' THEN 1.3 WHEN 'D' THEN 1.0 ELSE 0
                END
            ) as average_gpa
        FROM students s
        JOIN exam_results er ON s.user_id = er.student_id
        ${where}
        GROUP BY s.faculty
        ORDER BY average_gpa DESC
    `;

    const topPerformersQuery = `
        SELECT DISTINCT ON (s.user_id)
            s.register_number,
            s.full_name,
            s.faculty,
            AVG(
                CASE er.grade
                    WHEN 'A+' THEN 4.0 WHEN 'A' THEN 4.0 WHEN 'A-' THEN 3.7
                    WHEN 'B+' THEN 3.3 WHEN 'B' THEN 3.0 WHEN 'B-' THEN 2.7
                    WHEN 'C+' THEN 2.3 WHEN 'C' THEN 2.0 WHEN 'C-' THEN 1.7
                    WHEN 'D+' THEN 1.3 WHEN 'D' THEN 1.0 ELSE 0
                END
            ) as gpa
        FROM students s
        JOIN exam_results er ON s.user_id = er.student_id
        ${where}
        GROUP BY s.user_id, s.register_number, s.full_name, s.faculty
        ORDER BY s.user_id, gpa DESC
        LIMIT 10
    `;

    const [overallResult, byGradeResult, byFacultyResult, topPerformersResult] =
        await Promise.all([
            pool.query(overallQuery, params),
            pool.query(byGradeQuery, params),
            pool.query(byFacultyQuery, params),
            pool.query(topPerformersQuery, params),
        ]);

    return {
        total_students: parseInt(overallResult.rows[0].total_students) || 0,
        average_gpa: parseFloat(overallResult.rows[0].average_gpa) || 0,
        by_grade: byGradeResult.rows,
        by_faculty: byFacultyResult.rows,
        top_performers: topPerformersResult.rows,
    };
}

// COURSE ANALYTICS REPORTS
export async function getCourseAnalyticsReport(
    filters: ReportFilters
): Promise<CourseAnalyticsRow[]> {
    let whereConditions = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (filters.faculty) {
        whereConditions.push(`c.faculty = $${paramIndex++}`);
        params.push(filters.faculty);
    }

    if (filters.year) {
        whereConditions.push(`c.year = $${paramIndex++}`);
        params.push(filters.year);
    }

    if (filters.courseId) {
        whereConditions.push(`c.id = $${paramIndex++}`);
        params.push(filters.courseId);
    }

    const where =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(" AND ")}`
            : "";

    const query = `
        SELECT 
            c.id as course_id,
            c.course_code,
            c.course_name,
            c.faculty,
            c.year,
            c.credits,
            (SELECT COUNT(DISTINCT student_id) FROM attendance WHERE course_id = c.id) as enrolled_students,
            COALESCE(
                (SELECT ROUND(
                    (COUNT(CASE WHEN checked_in IS NOT NULL THEN 1 END)::numeric / 
                    NULLIF(COUNT(*), 0) * 100)::numeric, 2
                )
                FROM attendance WHERE course_id = c.id), 0
            ) as average_attendance_rate,
            COALESCE(
                (SELECT AVG(
                    CASE grade
                        WHEN 'A+' THEN 4.0 WHEN 'A' THEN 4.0 WHEN 'A-' THEN 3.7
                        WHEN 'B+' THEN 3.3 WHEN 'B' THEN 3.0 WHEN 'B-' THEN 2.7
                        WHEN 'C+' THEN 2.3 WHEN 'C' THEN 2.0 WHEN 'C-' THEN 1.7
                        WHEN 'D+' THEN 1.3 WHEN 'D' THEN 1.0 ELSE 0
                    END
                ) FROM exam_results WHERE course_id = c.id), 0
            ) as average_grade,
            COALESCE(
                (SELECT ROUND(
                    (COUNT(CASE WHEN grade NOT IN ('F', 'D') THEN 1 END)::numeric / 
                    NULLIF(COUNT(*), 0) * 100)::numeric, 2
                )
                FROM exam_results WHERE course_id = c.id), 0
            ) as pass_rate,
            (SELECT l.full_name FROM lecturers l 
             JOIN lecturer_courses lc ON l.user_id = lc.lecturer_id 
             WHERE lc.course_id = c.id LIMIT 1) as lecturer_name
        FROM courses c
        ${where}
        ORDER BY c.course_code
    `;

    const result = await pool.query(query, params);
    return result.rows;
}

export async function getCourseAnalyticsSummary(
    filters: ReportFilters
): Promise<CourseAnalyticsSummary> {
    let whereConditions = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (filters.faculty) {
        whereConditions.push(`c.faculty = $${paramIndex++}`);
        params.push(filters.faculty);
    }

    if (filters.year) {
        whereConditions.push(`c.year = $${paramIndex++}`);
        params.push(filters.year);
    }

    const where =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(" AND ")}`
            : "";

    const overallQuery = `
        SELECT 
            COUNT(DISTINCT c.id) as total_courses,
            COUNT(DISTINCT a.student_id) as total_enrollments,
            COALESCE(AVG(enrollment_count), 0) as average_enrollment
        FROM courses c
        LEFT JOIN attendance a ON c.id = a.course_id
        LEFT JOIN (
            SELECT course_id, COUNT(DISTINCT student_id) as enrollment_count
            FROM attendance
            GROUP BY course_id
        ) enrollments ON c.id = enrollments.course_id
        ${where}
    `;

    const byFacultyQuery = `
        SELECT 
            c.faculty,
            COUNT(DISTINCT c.id) as course_count,
            COUNT(DISTINCT a.student_id) as total_enrollments,
            COALESCE(ROUND(
                AVG((SELECT COUNT(CASE WHEN a2.checked_in IS NOT NULL THEN 1 END)::numeric / 
                    NULLIF(COUNT(*), 0) * 100
                FROM attendance a2 WHERE a2.course_id = c.id))::numeric, 2
            ), 0) as average_attendance
        FROM courses c
        LEFT JOIN attendance a ON c.id = a.course_id
        ${where}
        GROUP BY c.faculty
        ORDER BY course_count DESC
    `;

    const mostEnrolledQuery = `
        SELECT 
            c.course_code,
            c.course_name,
            COUNT(DISTINCT a.student_id) as enrollment_count
        FROM courses c
        LEFT JOIN attendance a ON c.id = a.course_id
        ${where}
        GROUP BY c.id, c.course_code, c.course_name
        ORDER BY enrollment_count DESC
        LIMIT 10
    `;

    const lowestAttendanceQuery = `
        SELECT 
            c.course_code,
            c.course_name,
            COALESCE(ROUND(
                (COUNT(CASE WHEN a.checked_in IS NOT NULL THEN 1 END)::numeric / 
                NULLIF(COUNT(a.id), 0) * 100)::numeric, 2
            ), 0) as attendance_rate
        FROM courses c
        LEFT JOIN attendance a ON c.id = a.course_id
        ${where}
        GROUP BY c.id, c.course_code, c.course_name
        HAVING COUNT(a.id) > 0
        ORDER BY attendance_rate ASC
        LIMIT 10
    `;

    const [
        overallResult,
        byFacultyResult,
        mostEnrolledResult,
        lowestAttendanceResult,
    ] = await Promise.all([
        pool.query(overallQuery, params),
        pool.query(byFacultyQuery, params),
        pool.query(mostEnrolledQuery, params),
        pool.query(lowestAttendanceQuery, params),
    ]);

    return {
        total_courses: parseInt(overallResult.rows[0].total_courses) || 0,
        total_enrollments:
            parseInt(overallResult.rows[0].total_enrollments) || 0,
        average_enrollment:
            parseFloat(overallResult.rows[0].average_enrollment) || 0,
        by_faculty: byFacultyResult.rows,
        most_enrolled: mostEnrolledResult.rows,
        lowest_attendance: lowestAttendanceResult.rows,
    };
}

// LIBRARY USAGE REPORTS
export async function getLibraryUsageReport(
    filters: ReportFilters
): Promise<LibraryUsageRow[]> {
    let whereConditions = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (filters.dateRange) {
        whereConditions.push(`DATE(bl.borrowed_at) >= $${paramIndex++}`);
        params.push(filters.dateRange.startDate);
        whereConditions.push(`DATE(bl.borrowed_at) <= $${paramIndex++}`);
        params.push(filters.dateRange.endDate);
    }

    if (filters.faculty) {
        whereConditions.push(`s.faculty = $${paramIndex++}`);
        params.push(filters.faculty);
    }

    if (filters.studentId) {
        whereConditions.push(`bl.student_id = $${paramIndex++}`);
        params.push(filters.studentId);
    }

    const where =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(" AND ")}`
            : "";

    const query = `
        SELECT 
            bl.id as loan_id,
            bl.student_id,
            s.register_number,
            s.full_name,
            s.faculty,
            b.title as book_title,
            b.author,
            b.isbn,
            bl.borrowed_at,
            bl.due_date,
            bl.returned_at,
            bl.status,
            CASE 
                WHEN bl.returned_at IS NULL AND bl.due_date < CURRENT_DATE 
                THEN CURRENT_DATE - bl.due_date
                WHEN bl.returned_at IS NOT NULL AND bl.returned_at::date > bl.due_date
                THEN bl.returned_at::date - bl.due_date
                ELSE 0
            END as days_overdue
        FROM book_loans bl
        JOIN students s ON bl.student_id = s.user_id
        JOIN book_copies bc ON bl.book_copy_id = bc.id
        JOIN books b ON bc.book_id = b.id
        ${where}
        ORDER BY bl.borrowed_at DESC
    `;

    const result = await pool.query(query, params);
    return result.rows;
}

export async function getLibraryUsageSummary(
    filters: ReportFilters
): Promise<LibraryUsageSummary> {
    let whereConditions = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (filters.dateRange) {
        whereConditions.push(`DATE(bl.borrowed_at) >= $${paramIndex++}`);
        params.push(filters.dateRange.startDate);
        whereConditions.push(`DATE(bl.borrowed_at) <= $${paramIndex++}`);
        params.push(filters.dateRange.endDate);
    }

    if (filters.faculty) {
        whereConditions.push(`s.faculty = $${paramIndex++}`);
        params.push(filters.faculty);
    }

    const where =
        whereConditions.length > 0
            ? `WHERE ${whereConditions.join(" AND ")}`
            : "";

    const summaryQuery = `
        SELECT 
            COUNT(*) as total_loans,
            COUNT(CASE WHEN bl.status = 'active' THEN 1 END) as active_loans,
            COUNT(CASE WHEN bl.status = 'overdue' THEN 1 END) as overdue_loans,
            COUNT(CASE WHEN bl.status = 'returned' THEN 1 END) as total_returns,
            COALESCE(AVG(
                CASE WHEN bl.returned_at IS NOT NULL 
                THEN EXTRACT(DAY FROM (bl.returned_at - bl.borrowed_at))
                ELSE NULL END
            ), 0) as average_loan_duration
        FROM book_loans bl
        JOIN students s ON bl.student_id = s.user_id
        ${where}
    `;

    const mostBorrowedQuery = `
        SELECT 
            b.title as book_title,
            b.author,
            COUNT(bl.id) as loan_count
        FROM book_loans bl
        JOIN students s ON bl.student_id = s.user_id
        JOIN book_copies bc ON bl.book_copy_id = bc.id
        JOIN books b ON bc.book_id = b.id
        ${where}
        GROUP BY b.id, b.title, b.author
        ORDER BY loan_count DESC
        LIMIT 10
    `;

    const byCategoryQuery = `
        SELECT 
            b.category,
            COUNT(bl.id) as loan_count
        FROM book_loans bl
        JOIN students s ON bl.student_id = s.user_id
        JOIN book_copies bc ON bl.book_copy_id = bc.id
        JOIN books b ON bc.book_id = b.id
        ${where}
        GROUP BY b.category
        ORDER BY loan_count DESC
    `;

    const byFacultyQuery = `
        SELECT 
            s.faculty,
            COUNT(DISTINCT s.user_id) as active_members,
            COUNT(bl.id) as total_loans
        FROM book_loans bl
        JOIN students s ON bl.student_id = s.user_id
        ${where}
        GROUP BY s.faculty
        ORDER BY total_loans DESC
    `;

    const [
        summaryResult,
        mostBorrowedResult,
        byCategoryResult,
        byFacultyResult,
    ] = await Promise.all([
        pool.query(summaryQuery, params),
        pool.query(mostBorrowedQuery, params),
        pool.query(byCategoryQuery, params),
        pool.query(byFacultyQuery, params),
    ]);

    return {
        total_loans: parseInt(summaryResult.rows[0].total_loans) || 0,
        active_loans: parseInt(summaryResult.rows[0].active_loans) || 0,
        overdue_loans: parseInt(summaryResult.rows[0].overdue_loans) || 0,
        total_returns: parseInt(summaryResult.rows[0].total_returns) || 0,
        average_loan_duration:
            parseFloat(summaryResult.rows[0].average_loan_duration) || 0,
        most_borrowed_books: mostBorrowedResult.rows,
        by_category: byCategoryResult.rows,
        by_faculty: byFacultyResult.rows,
    };
}

// CARD USAGE REPORTS
export async function getCardUsageReport(
    filters: ReportFilters
): Promise<CardUsageRow[]> {
    let whereConditions = ["rc.assigned_student IS NOT NULL"];
    let params: any[] = [];
    let paramIndex = 1;

    if (filters.faculty) {
        whereConditions.push(`s.faculty = $${paramIndex++}`);
        params.push(filters.faculty);
    }

    if (filters.year) {
        whereConditions.push(`s.year_of_study = $${paramIndex++}`);
        params.push(filters.year);
    }

    const where = `WHERE ${whereConditions.join(" AND ")}`;

    const query = `
        SELECT 
            rc.card_uid as card_id,
            s.user_id as student_id,
            s.register_number,
            s.full_name,
            s.faculty,
            COALESCE((SELECT COUNT(*) FROM nfc_attendance_log WHERE student_id = s.user_id), 0) +
            COALESCE((SELECT COUNT(*) FROM canteen_transactions WHERE student_id = s.user_id), 0) as total_swipes,
            GREATEST(
                COALESCE((SELECT MAX(swipe_timestamp) FROM nfc_attendance_log WHERE student_id = s.user_id), '1970-01-01'::timestamp),
                COALESCE((SELECT MAX(transaction_date) FROM canteen_transactions WHERE student_id = s.user_id), '1970-01-01'::timestamp)
            ) as last_used,
            rc.status as card_status,
            COALESCE(rc.balance, 0) as current_balance,
            COALESCE((SELECT SUM(amount) FROM canteen_transactions WHERE student_id = s.user_id AND status = 'completed'), 0) as total_spent
        FROM rfid_cards rc
        JOIN students s ON rc.assigned_student = s.user_id
        ${where}
        ORDER BY total_swipes DESC
    `;

    const result = await pool.query(query, params);
    return result.rows;
}

export async function getCardUsageSummary(
    filters: ReportFilters
): Promise<CardUsageSummary> {
    let whereConditions = ["rc.assigned_student IS NOT NULL"];
    let params: any[] = [];
    let paramIndex = 1;

    if (filters.faculty) {
        whereConditions.push(`s.faculty = $${paramIndex++}`);
        params.push(filters.faculty);
    }

    const where = `WHERE ${whereConditions.join(" AND ")}`;

    const summaryQuery = `
        SELECT 
            COUNT(*) as total_active_cards,
            SUM(COALESCE((SELECT COUNT(*) FROM nfc_attendance_log WHERE student_id = s.user_id), 0) +
                COALESCE((SELECT COUNT(*) FROM canteen_transactions WHERE student_id = s.user_id), 0)) as total_swipes,
            SUM(COALESCE(rc.balance, 0)) as total_balance,
            AVG(COALESCE(rc.balance, 0)) as average_balance
        FROM rfid_cards rc
        JOIN students s ON rc.assigned_student = s.user_id
        ${where}
    `;

    const byFacultyQuery = `
        SELECT 
            s.faculty,
            COUNT(*) as active_cards,
            SUM(COALESCE((SELECT COUNT(*) FROM canteen_transactions WHERE student_id = s.user_id), 0)) as total_transactions,
            SUM(COALESCE(rc.balance, 0)) as total_balance
        FROM rfid_cards rc
        JOIN students s ON rc.assigned_student = s.user_id
        ${where}
        GROUP BY s.faculty
        ORDER BY total_transactions DESC
    `;

    const [summaryResult, byFacultyResult] = await Promise.all([
        pool.query(summaryQuery, params),
        pool.query(byFacultyQuery, params),
    ]);

    return {
        total_active_cards:
            parseInt(summaryResult.rows[0].total_active_cards) || 0,
        total_swipes: parseInt(summaryResult.rows[0].total_swipes) || 0,
        total_balance: parseFloat(summaryResult.rows[0].total_balance) || 0,
        average_balance: parseFloat(summaryResult.rows[0].average_balance) || 0,
        by_faculty: byFacultyResult.rows,
    };
}

// SYSTEM USAGE REPORT
export async function getSystemUsageReport(
    filters: ReportFilters
): Promise<SystemUsageReport> {
    const dateFilter = filters.dateRange
        ? `WHERE DATE(transaction_date) BETWEEN '${filters.dateRange.startDate}' AND '${filters.dateRange.endDate}'`
        : "";

    const overallQuery = `
        SELECT 
            (SELECT COUNT(*) FROM students) + (SELECT COUNT(*) FROM lecturers) as total_users,
            (SELECT COUNT(*) FROM rfid_cards WHERE assigned_student IS NOT NULL) as active_students,
            (SELECT COUNT(*) FROM lecturers) as active_lecturers,
            (SELECT COUNT(*) FROM nfc_attendance_log ${dateFilter.replace("transaction_date", "swipe_timestamp")}) as total_nfc_events
    `;

    const canteenQuery = `
        SELECT 
            COUNT(*) as transactions,
            COALESCE(SUM(amount), 0) as revenue,
            COUNT(DISTINCT student_id) as active_users
        FROM canteen_transactions
        ${dateFilter}
    `;

    const libraryQuery = `
        SELECT 
            COUNT(CASE WHEN status IN ('active', 'overdue') THEN 1 END) as loans,
            COUNT(CASE WHEN status = 'returned' THEN 1 END) as returns,
            COUNT(DISTINCT student_id) as active_users
        FROM book_loans
        ${dateFilter.replace("transaction_date", "borrowed_at")}
    `;

    const attendanceQuery = `
        SELECT 
            COUNT(*) as total_records,
            COUNT(DISTINCT student_id) as unique_students,
            COUNT(DISTINCT course_id) as unique_courses
        FROM attendance
        ${dateFilter.replace("transaction_date", "date")}
    `;

    const [overallResult, canteenResult, libraryResult, attendanceResult] =
        await Promise.all([
            pool.query(overallQuery),
            pool.query(canteenQuery),
            pool.query(libraryQuery),
            pool.query(attendanceQuery),
        ]);

    return {
        date_range: filters.dateRange || { startDate: "", endDate: "" },
        total_users: parseInt(overallResult.rows[0].total_users) || 0,
        active_students: parseInt(overallResult.rows[0].active_students) || 0,
        active_lecturers: parseInt(overallResult.rows[0].active_lecturers) || 0,
        total_nfc_events: parseInt(overallResult.rows[0].total_nfc_events) || 0,
        by_module: {
            canteen: {
                transactions: parseInt(canteenResult.rows[0].transactions) || 0,
                revenue: parseFloat(canteenResult.rows[0].revenue) || 0,
                active_users: parseInt(canteenResult.rows[0].active_users) || 0,
            },
            library: {
                loans: parseInt(libraryResult.rows[0].loans) || 0,
                returns: parseInt(libraryResult.rows[0].returns) || 0,
                active_users: parseInt(libraryResult.rows[0].active_users) || 0,
            },
            attendance: {
                total_records:
                    parseInt(attendanceResult.rows[0].total_records) || 0,
                unique_students:
                    parseInt(attendanceResult.rows[0].unique_students) || 0,
                unique_courses:
                    parseInt(attendanceResult.rows[0].unique_courses) || 0,
            },
        },
    };
}
