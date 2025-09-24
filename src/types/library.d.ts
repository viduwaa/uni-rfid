export type BookCondition =
  | "New"
  | "Good"
  | "Fair"
  | "Poor"
  | "Damaged"
  | "Lost";
export type FineStatus = "pending" | "paid" | "waived";
export type LoanStatus = "active" | "returned" | "overdue";

export interface Book {
  id: string;
  isbn?: string;
  title: string;
  author: string;
  publisher?: string;
  publication_year?: number;
  category?: string;
  description?: string;
  location?: string;
  total_copies: number;
  available_copies: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface BookCopy {
  id: string;
  book_id: string;
  barcode: string;
  condition: BookCondition;
  is_available: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BookLoan {
  id: string;
  student_id: string;
  book_copy_id: string;
  borrowed_at: string;
  due_date: string;
  returned_at?: string;
  return_condition?: BookCondition;
  status: LoanStatus;
  notes?: string;
  issued_by?: string;
  returned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface LibraryFine {
  id: string;
  student_id: string;
  loan_id?: string;
  amount: number;
  reason: string;
  status: FineStatus;
  created_at: string;
  paid_at?: string;
  paid_by?: string;
  notes?: string;
}

export interface LibraryMember {
  id: string;
  student_id: string;
  membership_date: string;
  membership_status: string;
  max_books_allowed: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Extended interfaces with joined data
export interface BookWithAvailability extends Book {
  physical_copies: number;
  available_physical_copies: number;
}

export interface BookCopyWithDetails extends BookCopy {
  book: Book;
}

export interface LoanWithDetails extends BookLoan {
  student_name: string;
  student_email: string;
  register_number: string;
  book_title: string;
  book_author: string;
  barcode: string;
  loan_status: string;
  days_overdue: number;
}

export interface MemberSummary extends LibraryMember {
  register_number: string;
  full_name: string;
  email: string;
  faculty: string;
  year_of_study: number;
  current_loans: number;
  overdue_loans: number;
  pending_fines: number;
}

// API request/response types
export interface AddBookRequest {
  isbn?: string;
  title: string;
  author: string;
  publisher?: string;
  publication_year?: number;
  category?: string;
  description?: string;
  location?: string;
  copies: number;
}

export interface CheckoutRequest {
  student_id: string;
  book_copy_id: string;
  due_date: string;
  notes?: string;
}

export interface ReturnRequest {
  loan_id: string;
  return_condition: BookCondition;
  notes?: string;
}

export interface FineRequest {
  student_id: string;
  loan_id?: string;
  amount: number;
  reason: string;
}

export interface SearchBooksQuery {
  search?: string;
  category?: string;
  author?: string;
  available_only?: boolean;
  limit?: number;
  offset?: number;
}

export interface LibraryStats {
  total_books: number;
  total_copies: number;
  available_copies: number;
  total_loans: number;
  overdue_loans: number;
  total_members: number;
  pending_fines: number;
  total_fines_amount: number;
}

export interface CirculationReport {
  date_range: {
    start_date: string;
    end_date: string;
  };
  total_checkouts: number;
  total_returns: number;
  overdue_items: number;
  popular_books: Array<{
    book_id: string;
    title: string;
    author: string;
    checkout_count: number;
  }>;
  active_members: number;
}

export interface FinancialReport {
  date_range: {
    start_date: string;
    end_date: string;
  };
  total_fines_generated: number;
  total_fines_collected: number;
  pending_fines: number;
  fine_breakdown: Array<{
    reason: string;
    count: number;
    amount: number;
  }>;
}

export interface InventoryReport {
  total_books: number;
  total_copies: number;
  condition_breakdown: Array<{
    condition: BookCondition;
    count: number;
  }>;
  category_breakdown: Array<{
    category: string;
    book_count: number;
    copy_count: number;
  }>;
  low_stock_books: Array<{
    book_id: string;
    title: string;
    available_copies: number;
  }>;
}

export interface PopularBooksReport {
  book_id: string;
  title: string;
  author: string;
  loan_count: number;
}
