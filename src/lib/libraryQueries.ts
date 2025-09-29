import { pool } from "./db";
import type {
    Book,
    BookCopy,
    BookLoan,
    LibraryFine,
    LibraryMember,
    BookWithAvailability,
    LoanWithDetails,
    MemberSummary,
    AddBookRequest,
    PopularBooksReport,
    CheckoutRequest,
    ReturnRequest,
    FineRequest,
    SearchBooksQuery,
    LibraryStats,
    CirculationReport,
    FinancialReport,
    InventoryReport,
    BookCondition,
    FineStatus,
    LoanStatus,
} from "@/types/library";

// Book Management
export async function getAllBooks(): Promise<BookWithAvailability[]> {
    const query = `SELECT * FROM books_with_availability ORDER BY title`;
    const result = await pool.query(query);
    return result.rows;
}

export async function searchBooks(
    params: SearchBooksQuery
): Promise<BookWithAvailability[]> {
    const {
        search,
        category,
        author,
        available_only,
        limit = 50,
        offset = 0,
    } = params;

    let query = `SELECT * FROM books_with_availability WHERE 1=1`;
    const values: any[] = [];
    let paramIndex = 1;

    if (search) {
        query += ` AND (title ILIKE $${paramIndex} OR author ILIKE $${paramIndex} OR isbn ILIKE $${paramIndex})`;
        values.push(`%${search}%`);
        paramIndex++;
    }

    if (category) {
        query += ` AND category = $${paramIndex}`;
        values.push(category);
        paramIndex++;
    }

    if (author) {
        query += ` AND author ILIKE $${paramIndex}`;
        values.push(`%${author}%`);
        paramIndex++;
    }

    if (available_only) {
        query += ` AND available_copies > 0`;
    }

    query += ` ORDER BY title LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
}

export async function getBookById(
    bookId: string
): Promise<BookWithAvailability | null> {
    const query = `SELECT * FROM books_with_availability WHERE id = $1`;
    const result = await pool.query(query, [bookId]);
    return result.rows[0] || null;
}

export async function addBook(
    bookData: AddBookRequest,
    createdBy: string
): Promise<Book> {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Insert book
        const bookQuery = `
      INSERT INTO books (isbn, title, author, publisher, publication_year, category, 
                        description, location, total_copies, available_copies)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
        const bookResult = await client.query(bookQuery, [
            bookData.isbn,
            bookData.title,
            bookData.author,
            bookData.publisher,
            bookData.publication_year,
            bookData.category,
            bookData.description,
            bookData.location,
            bookData.copies,
            bookData.copies,
        ]);

        const book = bookResult.rows[0];

        // Create book copies
        for (let i = 1; i <= bookData.copies; i++) {
            const barcode = `${book.id}-${i.toString().padStart(3, "0")}`;
            await client.query(
                "INSERT INTO book_copies (book_id, barcode, condition, is_available) VALUES ($1, $2, $3, $4)",
                [book.id, barcode, "Good", true]
            );
        }

        await client.query("COMMIT");
        return book;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function updateBook(
    bookId: string,
    updates: Partial<Book>
): Promise<Book> {
    const fields = Object.keys(updates).filter(
        (key) => key !== "id" && key !== "created_at"
    );
    const setClause = fields
        .map((field, index) => `${field} = $${index + 2}`)
        .join(", ");
    const values = [
        bookId,
        ...fields.map((field) => updates[field as keyof Book]),
    ];

    const query = `UPDATE books SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
}

export async function deleteBook(bookId: string): Promise<boolean> {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Check if book has active loans
        const activeLoansQuery =
            "SELECT id FROM book_loans bl JOIN book_copies bc ON bl.book_copy_id = bc.id WHERE bc.book_id = $1 AND bl.status = $2";
        const activeLoans = await client.query(activeLoansQuery, [
            bookId,
            "active",
        ]);

        if (activeLoans.rows.length > 0) {
            throw new Error("Cannot delete book with active loans");
        }

        // Delete book copies first (due to foreign key constraint)
        await client.query("DELETE FROM book_copies WHERE book_id = $1", [
            bookId,
        ]);

        // Delete book
        const result = await client.query("DELETE FROM books WHERE id = $1", [
            bookId,
        ]);

        await client.query("COMMIT");
        return (result.rowCount ?? 0) > 0;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

// Book Copy Management
export async function getBookCopiesByBookId(
    bookId: string
): Promise<BookCopy[]> {
    const query = `SELECT * FROM book_copies WHERE book_id = $1 ORDER BY barcode`;
    const result = await pool.query(query, [bookId]);
    return result.rows;
}

export async function getBookCopyByBarcode(
    barcode: string
): Promise<BookCopy | null> {
    const query = `SELECT * FROM book_copies WHERE barcode = $1`;
    const result = await pool.query(query, [barcode]);
    return result.rows[0] || null;
}

export async function updateBookCopyCondition(
    copyId: string,
    condition: BookCondition,
    notes?: string
): Promise<BookCopy> {
    const query = `
    UPDATE book_copies 
    SET condition = $2, notes = $3, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $1 
    RETURNING *
  `;
    const result = await pool.query(query, [copyId, condition, notes]);
    return result.rows[0];
}

// Loan Management
export async function checkoutBook(
    checkoutData: CheckoutRequest,
    issuedBy: string
): Promise<BookLoan> {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Check if book copy is available
        const copyCheck = await client.query(
            "SELECT * FROM book_copies WHERE id = $1 AND is_available = true",
            [checkoutData.book_copy_id]
        );

        if (copyCheck.rows.length === 0) {
            throw new Error("Book copy is not available for checkout");
        }

        // Create loan record
        const loanQuery = `
      INSERT INTO book_loans (student_id, book_copy_id, due_date, notes, status)
      VALUES ($1, $2, $3, $4,'active')
      RETURNING *
    `;
        const loanResult = await client.query(loanQuery, [
            checkoutData.student_id,
            checkoutData.book_copy_id,
            checkoutData.due_date,
            checkoutData.notes,
        ]);

        // Update book copy availability
        await client.query(
            "UPDATE book_copies SET is_available = false WHERE id = $1",
            [checkoutData.book_copy_id]
        );

        // Update book availability count
        await client.query(
            `
      UPDATE books 
      SET available_copies = available_copies - 1 
      WHERE id = (SELECT book_id FROM book_copies WHERE id = $1)
    `,
            [checkoutData.book_copy_id]
        );

        await client.query("COMMIT");
        return loanResult.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function returnBook(
    returnData: ReturnRequest,
    returnedTo: string
): Promise<BookLoan> {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Update loan record
        const loanQuery = `
      UPDATE book_loans 
      SET returned_at = CURRENT_TIMESTAMP, return_condition = $2, notes = $3, 
          returned_to = $4, status = 'returned', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status = 'active'
      RETURNING *
    `;
        const loanResult = await client.query(loanQuery, [
            returnData.loan_id,
            returnData.return_condition,
            returnData.notes,
            returnedTo,
        ]);

        if (loanResult.rows.length === 0) {
            throw new Error("Active loan not found");
        }

        const loan = loanResult.rows[0];

        // Update book copy availability and condition
        await client.query(
            "UPDATE book_copies SET is_available = true, condition = $2 WHERE id = $1",
            [loan.book_copy_id, returnData.return_condition]
        );

        // Update book availability count
        await client.query(
            `
      UPDATE books 
      SET available_copies = available_copies + 1 
      WHERE id = (SELECT book_id FROM book_copies WHERE id = $1)
    `,
            [loan.book_copy_id]
        );

        // Check if return is late and create fine if necessary
        const today = new Date();
        const dueDate = new Date(loan.due_date);
        if (today > dueDate) {
            const daysLate = Math.ceil(
                (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            const fineAmount = daysLate * 5; // $5 per day late fee

            await client.query(
                `
        INSERT INTO library_fines (student_id, loan_id, amount, reason, status)
        VALUES ($1, $2, $3, $4, 'pending')
      `,
                [
                    loan.student_id,
                    loan.id,
                    fineAmount,
                    `Late return - ${daysLate} days overdue`,
                ]
            );
        }

        await client.query("COMMIT");
        return loanResult.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function getActiveLoans(): Promise<LoanWithDetails[]> {
    const query = `SELECT * FROM active_loans_with_details ORDER BY due_date`;
    const result = await pool.query(query);
    return result.rows;
}

export async function getStudentLoans(
    studentId: string,
    status?: string | null
): Promise<LoanWithDetails[]> {
    let query = `
    SELECT bl.*, s.register_number, s.full_name as student_name, s.email as student_email,
           b.title as book_title, b.author as book_author, bc.barcode,
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
    JOIN students s ON bl.student_id = s.user_id
    JOIN book_copies bc ON bl.book_copy_id = bc.id
    JOIN books b ON bc.book_id = b.id
    WHERE bl.student_id = $1`;

    const params = [studentId];

    if (status) {
        query += ` AND bl.status = $2`;
        params.push(status);
    }

    query += ` ORDER BY bl.borrowed_at DESC`;

    const result = await pool.query(query, params);
    return result.rows;
}

export async function getLoansByBarcode(
    barcode: string,
    status?: string | null
): Promise<LoanWithDetails[]> {
    let query = `
    SELECT bl.*, s.register_number, s.full_name as student_name, s.email as student_email,
           b.title as book_title, b.author as book_author, bc.barcode,
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
    JOIN students s ON bl.student_id = s.user_id
    JOIN book_copies bc ON bl.book_copy_id = bc.id
    JOIN books b ON bc.book_id = b.id
    WHERE bc.barcode = $1`;

    const params = [barcode];

    if (status) {
        query += ` AND bl.status = $2`;
        params.push(status);
    }

    query += ` ORDER BY bl.borrowed_at DESC`;

    const result = await pool.query(query, params);
    return result.rows;
}

export async function renewLoan(
    loanId: string,
    newDueDate: string
): Promise<BookLoan> {
    const query = `
    UPDATE book_loans 
    SET due_date = $2, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $1 AND status = 'active'
    RETURNING *
  `;
    const result = await pool.query(query, [loanId, newDueDate]);
    if (result.rows.length === 0) {
        throw new Error("Active loan not found");
    }
    return result.rows[0];
}

// Fine Management
export async function createFine(fineData: FineRequest): Promise<LibraryFine> {
    const query = `
    INSERT INTO library_fines (student_id, loan_id, amount, reason, status)
    VALUES ($1, $2, $3, $4, 'pending')
    RETURNING *
  `;
    const result = await pool.query(query, [
        fineData.student_id,
        fineData.loan_id,
        fineData.amount,
        fineData.reason,
    ]);
    return result.rows[0];
}

export async function payFine(
    fineId: string,
    paidBy: string,
    notes?: string
): Promise<LibraryFine> {
    const query = `
    UPDATE library_fines 
    SET status = 'paid', paid_at = CURRENT_TIMESTAMP, paid_by = $2, notes = $3
    WHERE id = $1 AND status = 'pending'
    RETURNING *
  `;
    const result = await pool.query(query, [fineId, paidBy, notes]);
    if (result.rows.length === 0) {
        throw new Error("Pending fine not found");
    }
    return result.rows[0];
}

export async function waiveFine(
    fineId: string,
    paidBy: string,
    notes?: string
): Promise<LibraryFine> {
    const query = `
    UPDATE library_fines 
    SET status = 'waived', paid_at = CURRENT_TIMESTAMP, paid_by = $2, notes = $3
    WHERE id = $1 AND status = 'pending'
    RETURNING *
  `;
    const result = await pool.query(query, [fineId, paidBy, notes]);
    if (result.rows.length === 0) {
        throw new Error("Pending fine not found");
    }
    return result.rows[0];
}

export async function getStudentFines(
    studentId: string
): Promise<LibraryFine[]> {
    const query = `SELECT * FROM library_fines WHERE student_id = $1 ORDER BY created_at DESC`;
    const result = await pool.query(query, [studentId]);
    return result.rows;
}

export async function getPendingFines(): Promise<LibraryFine[]> {
    const query = `
    SELECT lf.*, s.register_number, s.full_name as student_name
    FROM library_fines lf
    JOIN students s ON lf.student_id = s.user_id
    WHERE lf.status = 'pending'
    ORDER BY lf.created_at DESC
  `;
    const result = await pool.query(query);
    return result.rows;
}

// Member Management
export async function getAllMembers(): Promise<MemberSummary[]> {
    const query = `SELECT * FROM library_member_summary ORDER BY full_name`;
    const result = await pool.query(query);
    return result.rows;
}

export async function getMemberByStudentId(
    studentId: string
): Promise<MemberSummary | null> {
    const query = `SELECT * FROM library_member_summary WHERE student_id = $1`;
    const result = await pool.query(query, [studentId]);
    return result.rows[0] || null;
}

export async function updateMemberStatus(
    studentId: string,
    status: string,
    maxBooks: number,
    notes?: string
): Promise<LibraryMember> {
    const query = `
    UPDATE library_members 
    SET membership_status = $2, max_books_allowed = $3, notes = $4, updated_at = CURRENT_TIMESTAMP
    WHERE student_id = $1
    RETURNING *
  `;
    const result = await pool.query(query, [
        studentId,
        status,
        maxBooks,
        notes,
    ]);
    return result.rows[0];
}

// Statistics and Reports
export async function getLibraryStats(): Promise<LibraryStats> {
    const statsQuery = `
    SELECT 
      (SELECT COUNT(*) FROM books) as total_books,
      (SELECT COUNT(*) FROM book_copies) as total_copies,
      (SELECT COUNT(*) FROM book_copies WHERE is_available = true) as available_copies,
      (SELECT COUNT(*) FROM book_loans WHERE status = 'active') as total_loans,
      (SELECT COUNT(*) FROM book_loans WHERE status = 'active' AND due_date < CURRENT_DATE) as overdue_loans,
      (SELECT COUNT(*) FROM library_members WHERE membership_status = 'active') as total_members,
      (SELECT COUNT(*) FROM library_fines WHERE status = 'pending') as pending_fines,
      (SELECT COALESCE(SUM(amount), 0) FROM library_fines WHERE status = 'pending') as total_fines_amount
  `;
    const result = await pool.query(statsQuery);
    return result.rows[0];
}

export async function getCirculationReport(
    startDate: string,
    endDate: string
): Promise<any> {
    const reportQuery = `
    SELECT 
      COUNT(CASE WHEN borrowed_at::date BETWEEN $1 AND $2 THEN 1 END) as total_loans,
      COUNT(CASE WHEN status = 'active' THEN 1 END) as active_loans,
      COUNT(CASE WHEN returned_at::date BETWEEN $1 AND $2 THEN 1 END) as returned_loans,
      COUNT(CASE WHEN status = 'active' AND due_date < CURRENT_DATE THEN 1 END) as overdue_loans
    FROM book_loans
  `;
    const reportResult = await pool.query(reportQuery, [startDate, endDate]);

    return {
        ...reportResult.rows[0],
        period: `${startDate} to ${endDate}`,
    };
}

export async function getFinancialReport(
    startDate: string,
    endDate: string
): Promise<any> {
    const reportQuery = `
    SELECT 
      COALESCE(SUM(CASE WHEN created_at::date BETWEEN $1 AND $2 THEN amount ELSE 0 END), 0) as total_fines,
      COALESCE(SUM(CASE WHEN paid_at::date BETWEEN $1 AND $2 AND status = 'paid' THEN amount ELSE 0 END), 0) as paid_fines,
      COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_fines,
      COALESCE(SUM(CASE WHEN status = 'waived' THEN amount ELSE 0 END), 0) as waived_fines
    FROM library_fines
  `;
    const reportResult = await pool.query(reportQuery, [startDate, endDate]);

    return {
        ...reportResult.rows[0],
        period: `${startDate} to ${endDate}`,
    };
}

export async function getInventoryReport(): Promise<any> {
    const totalQuery = `
    SELECT 
      COUNT(DISTINCT b.id) as total_books,
      COUNT(bc.id) as total_copies,
      COUNT(CASE WHEN bc.is_available = true THEN 1 END) as available_copies,
      COUNT(CASE WHEN bc.is_available = false THEN 1 END) as checked_out_copies
    FROM books b
    LEFT JOIN book_copies bc ON b.id = bc.book_id
  `;
    const totalResult = await pool.query(totalQuery);

    const categoryQuery = `
    SELECT 
      COALESCE(category, 'Uncategorized') as category,
      COUNT(DISTINCT b.id) as count
    FROM books b
    LEFT JOIN book_copies bc ON b.id = bc.book_id
    WHERE category IS NOT NULL AND category != ''
    GROUP BY category
    ORDER BY count DESC
    LIMIT 10
  `;
    const categoryResult = await pool.query(categoryQuery);

    return {
        total_books: parseInt(totalResult.rows[0].total_books) || 0,
        total_copies: parseInt(totalResult.rows[0].total_copies) || 0,
        available_copies: parseInt(totalResult.rows[0].available_copies) || 0,
        checked_out_copies:
            parseInt(totalResult.rows[0].checked_out_copies) || 0,
        categories: categoryResult.rows.map((row) => ({
            category: row.category,
            count: parseInt(row.count),
        })),
    };
}

// Popular books report
export async function getPopularBooksReport(
    startDate: string,
    endDate: string,
    limit: number = 10
): Promise<{ books: PopularBooksReport[] }> {
    const result = await pool.query(
        `
    SELECT 
      b.id as book_id,
      b.title,
      b.author,
      COUNT(bl.id) as loan_count
    FROM books b
    JOIN book_copies bc ON b.id = bc.book_id
    JOIN book_loans bl ON bc.id = bl.book_copy_id
    WHERE bl.borrowed_at >= $1 AND bl.borrowed_at <= $2
    GROUP BY b.id, b.title, b.author
    ORDER BY loan_count DESC
    LIMIT $3
  `,
        [startDate, endDate, limit]
    );

    return {
        books: result.rows.map((row) => ({
            book_id: row.book_id,
            title: row.title,
            author: row.author,
            loan_count: parseInt(row.loan_count),
        })),
    };
}
