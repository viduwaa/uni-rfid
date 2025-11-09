import { pool } from "@/lib/db";
import { BaseStudent } from "@/types/student";

export interface AttendanceRecord {
    id: string;
    student_id: string;
    course_id: string;
    course_code: string;
    course_name: string;
    lecturer_name: string;
    date: string;
    checked_in: string;
    created_at: string;
}

export interface GradeRecord {
    id: string;
    student_id: string;
    course_id: string;
    course_code: string;
    course_name: string;
    credits: number;
    grade: string;
    exam_date: string;
    remarks: string;
    published_at: string;
}

export interface StudentDashboardStats {
    totalCourses: number;
    totalAttendancePercentage: number;
    currentGPA: number;
    currentBalance: number;
    overdueBooks: number;
    pendingFines: number;
    activeBorrowedBooks: number;
}

// Get student by user ID
export async function getStudentByUserId(
    userId: string
): Promise<BaseStudent | null> {
    try {
        const result = await pool.query(
            `SELECT 
        s.user_id,
        s.register_number,
        s.full_name,
        s.initial_name,
        s.nic_no,
        s.email,
        s.faculty,
        s.year_of_study,
        s.address,
        s.phone,
        s.photo,
        s.date_of_birth,
        s.created_at,
        s.updated_at,
        rc.card_uid,
        COALESCE(rc.balance, 0) as card_balance
      FROM students s
      LEFT JOIN rfid_cards rc ON s.user_id = rc.assigned_student
      WHERE s.user_id = $1`,
            [userId]
        );

        return result.rows[0] || null;
    } catch (error) {
        console.error("Error fetching student:", error);
        throw error;
    }
}

// Get student dashboard statistics
export async function getStudentDashboardStats(
    studentId: string
): Promise<StudentDashboardStats> {
    try {
        // Get total enrolled courses
        const coursesResult = await pool.query(
            `SELECT COUNT(*) as total FROM student_courses WHERE student_id = $1`,
            [studentId]
        );

        // Get attendance percentage (simplified calculation)
        const attendanceResult = await pool.query(
            `SELECT 
        COUNT(DISTINCT a.course_id) as attended_courses,
        COUNT(a.id) as total_attendance
      FROM attendance a
      WHERE a.student_id = $1`,
            [studentId]
        );

        // Calculate attendance percentage (simplified - this could be more complex)
        const attendancePercentage =
            attendanceResult.rows[0]?.total_attendance || 0;

        // Get current GPA
        const gpaResult = await pool.query(
            `SELECT 
        COALESCE(AVG(CASE 
          WHEN er.grade = 'A+' THEN 4.0
          WHEN er.grade = 'A' THEN 4.0
          WHEN er.grade = 'A-' THEN 3.7
          WHEN er.grade = 'B+' THEN 3.3
          WHEN er.grade = 'B' THEN 3.0
          WHEN er.grade = 'B-' THEN 2.7
          WHEN er.grade = 'C+' THEN 2.3
          WHEN er.grade = 'C' THEN 2.0
          WHEN er.grade = 'C-' THEN 1.7
          WHEN er.grade = 'D' THEN 1.0
          WHEN er.grade = 'E' THEN 0.0
          ELSE 0.0
        END), 0) as gpa
      FROM exam_results er
      WHERE er.student_id = $1`,
            [studentId]
        );

        // Get card balance
        const balanceResult = await pool.query(
            `SELECT COALESCE(balance, 0) as balance FROM rfid_cards WHERE assigned_student = $1`,
            [studentId]
        );

        // Get overdue books
        const overdueResult = await pool.query(
            `SELECT COUNT(*) as overdue_count
      FROM book_loans bl
      WHERE bl.student_id = $1 
        AND bl.status = 'active' 
        AND bl.due_date < CURRENT_DATE`,
            [studentId]
        );

        // Get pending fines
        const finesResult = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) as pending_fines
      FROM library_fines
      WHERE student_id = $1 AND status = 'pending'`,
            [studentId]
        );

        // Get active borrowed books count
        const activeBooksResult = await pool.query(
            `SELECT COUNT(*) as active_books
      FROM book_loans bl
      WHERE bl.student_id = $1 AND bl.status = 'active'`,
            [studentId]
        );

        return {
            totalCourses: parseInt(coursesResult.rows[0]?.total || "0"),
            totalAttendancePercentage: Math.round(
                (attendancePercentage * 85) / 100
            ), // Simplified calculation
            currentGPA: parseFloat(gpaResult.rows[0]?.gpa || "0"),
            currentBalance: parseFloat(balanceResult.rows[0]?.balance || "0"),
            overdueBooks: parseInt(overdueResult.rows[0]?.overdue_count || "0"),
            pendingFines: parseFloat(finesResult.rows[0]?.pending_fines || "0"),
            activeBorrowedBooks: parseInt(activeBooksResult.rows[0]?.active_books || "0"),
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        // Return default values on error
        return {
            totalCourses: 0,
            totalAttendancePercentage: 0,
            currentGPA: 0,
            currentBalance: 0,
            overdueBooks: 0,
            pendingFines: 0,
            activeBorrowedBooks: 0,
        };
    }
}

// Get student attendance records
export async function getStudentAttendance(
    studentId: string,
    year?: string,
    semester?: string
): Promise<AttendanceRecord[]> {
    try {
        let query_text = `
      SELECT 
        a.id,
        a.student_id,
        a.course_id,
        c.course_code,
        c.course_name,
        COALESCE(l.full_name, 'Unknown') as lecturer_name,
        a.date::text,
        a.checked_in::text,
        a.created_at::text
      FROM attendance a
      JOIN courses c ON a.course_id = c.id
      LEFT JOIN lecturers l ON a.lecturer_id = l.id
      WHERE a.student_id = $1
    `;

        const params = [studentId];

        // Add year filter if provided
        if (year && year !== "All Years") {
            query_text += ` AND c.year = $${params.length + 1}`;
            params.push(year.replace(/\D/g, "")); // Extract year number
        }

        query_text += ` ORDER BY a.date DESC, a.checked_in DESC`;

        const result = await pool.query(query_text, params);
        return result.rows;
    } catch (error) {
        console.error("Error fetching attendance:", error);
        return [];
    }
}

// Get student grades
export async function getStudentGrades(
    studentId: string,
    year?: string
): Promise<GradeRecord[]> {
    try {
        let query_text = `
      SELECT 
        er.id,
        er.student_id,
        er.course_id,
        c.course_code,
        c.course_name,
        COALESCE(c.credits, 3) as credits,
        er.grade,
        er.exam_date::text,
        COALESCE(er.remarks, '') as remarks,
        er.published_at::text
      FROM exam_results er
      JOIN courses c ON er.course_id = c.id
      WHERE er.student_id = $1
    `;

        const params = [studentId];

        // Add year filter if provided
        if (year && year !== "All Years") {
            query_text += ` AND c.year = $${params.length + 1}`;
            params.push(year.replace(/\D/g, "")); // Extract year number
        }

        query_text += ` ORDER BY er.published_at DESC`;

        const result = await pool.query(query_text, params);
        return result.rows;
    } catch (error) {
        console.error("Error fetching grades:", error);
        return [];
    }
}

// Get attendance summary by course
export async function getAttendanceSummary(studentId: string): Promise<any[]> {
    try {
        const result = await pool.query(
            `SELECT 
        c.course_code,
        c.course_name,
        c.year,
        COUNT(a.id) as attended_classes,
        -- Assuming each course has roughly 30 classes per semester
        30 as total_classes,
        ROUND((COUNT(a.id)::decimal / 30) * 100, 2) as attendance_percentage
      FROM courses c
      JOIN student_courses sc ON c.id = sc.course_id
      LEFT JOIN attendance a ON c.id = a.course_id AND a.student_id = $1
      WHERE sc.student_id = $1
      GROUP BY c.id, c.course_code, c.course_name, c.year
      ORDER BY c.year, c.course_code`,
            [studentId]
        );

        return result.rows;
    } catch (error) {
        console.error("Error fetching attendance summary:", error);
        return [];
    }
}

// Get student courses
export async function getStudentCourses(studentId: string): Promise<any[]> {
    try {
        const result = await pool.query(
            `SELECT 
        c.id,
        c.course_code,
        c.course_name,
        c.faculty,
        c.year,
        COALESCE(c.credits, 3) as credits,
        sc.enrolled_at
      FROM courses c
      JOIN student_courses sc ON c.id = sc.course_id
      WHERE sc.student_id = $1
      ORDER BY c.year, c.course_code`,
            [studentId]
        );

        return result.rows;
    } catch (error) {
        console.error("Error fetching student courses:", error);
        return [];
    }
}

// Calculate GPA for specific year or overall
export async function calculateStudentGPA(
    studentId: string,
    year?: string
): Promise<number> {
    try {
        let query_text = `
      SELECT 
        COALESCE(AVG(CASE 
          WHEN er.grade = 'A+' THEN 4.0
          WHEN er.grade = 'A' THEN 4.0
          WHEN er.grade = 'A-' THEN 3.7
          WHEN er.grade = 'B+' THEN 3.3
          WHEN er.grade = 'B' THEN 3.0
          WHEN er.grade = 'B-' THEN 2.7
          WHEN er.grade = 'C+' THEN 2.3
          WHEN er.grade = 'C' THEN 2.0
          WHEN er.grade = 'C-' THEN 1.7
          WHEN er.grade = 'D' THEN 1.0
          WHEN er.grade = 'E' THEN 0.0
          ELSE 0.0
        END), 0) as gpa
      FROM exam_results er
      JOIN courses c ON er.course_id = c.id
      WHERE er.student_id = $1
    `;

        const params = [studentId];

        if (year && year !== "All Years") {
            query_text += ` AND c.year = $${params.length + 1}`;
            params.push(year.replace(/\D/g, ""));
        }

        const result = await pool.query(query_text, params);
        return parseFloat(result.rows[0]?.gpa || "0");
    } catch (error) {
        console.error("Error calculating GPA:", error);
        return 0;
    }
}

// Get student transaction history
export async function getStudentTransactionHistory(
    studentId: string,
    limit: number = 50
): Promise<any[]> {
    try {
        const result = await pool.query(
            `SELECT 
        ct.id,
        ct.transaction_id,
        ct.amount,
        COALESCE(ct.description, '') as description,
        ct.status,
        ct.transaction_date,
        COALESCE(ct.payment_method, 'RFID') as payment_method,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'name', mi.name,
              'category', mi.category,
              'quantity', cti.quantity,
              'unit_price', cti.unit_price,
              'total_price', cti.total_price
            )
          ) FILTER (WHERE mi.id IS NOT NULL), 
          '[]'::json
        ) as items
      FROM canteen_transactions ct
      LEFT JOIN canteen_transaction_items cti ON ct.id = cti.transaction_id
      LEFT JOIN menu_items mi ON cti.menu_item_id = mi.id
      WHERE ct.student_id = $1
      GROUP BY ct.id, ct.transaction_id, ct.amount, ct.description, ct.status, ct.transaction_date, ct.payment_method
      ORDER BY ct.transaction_date DESC
      LIMIT $2`,
            [studentId, limit]
        );

        return result.rows;
    } catch (error) {
        console.error("Error fetching transaction history:", error);
        return [];
    }
}

// Get student library loans
export async function getStudentLibraryLoans(
    studentId: string
): Promise<any[]> {
    try {
        const result = await pool.query(
            `SELECT 
        bl.id,
        b.title,
        b.author,
        bc.barcode,
        bl.borrowed_at,
        bl.due_date,
        bl.returned_at,
        bl.status,
        CASE 
          WHEN bl.due_date < CURRENT_DATE AND bl.status = 'active' THEN 'overdue'
          ELSE bl.status::text
        END as loan_status,
        CASE 
          WHEN bl.due_date < CURRENT_DATE AND bl.status = 'active' 
          THEN CURRENT_DATE - bl.due_date 
          ELSE 0 
        END as days_overdue
      FROM book_loans bl
      JOIN book_copies bc ON bl.book_copy_id = bc.id
      JOIN books b ON bc.book_id = b.id
      WHERE bl.student_id = $1
      ORDER BY bl.borrowed_at DESC`,
            [studentId]
        );

        return result.rows;
    } catch (error) {
        console.error("Error fetching library loans:", error);
        return [];
    }
}
