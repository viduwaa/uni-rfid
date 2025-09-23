-- PostgreSQL Database Schema

-- ENUMs first (PostgreSQL requires explicit ENUM type creation)
CREATE TYPE user_role AS ENUM ('USER', 'STUDENT', 'LECTURER', 'ADMIN', 'LIBRARIAN', 'SYSTEM_ADMIN');
CREATE TYPE card_status AS ENUM ('ACTIVE', 'INACTIVE', 'LOST', 'DAMAGED', 'RETURNED');
CREATE TYPE transaction_status AS ENUM ('BORROWED', 'RETURNED', 'OVERDUE');
CREATE TYPE food_category AS ENUM ('Main', 'Snack', 'Drink', 'Dessert');
CREATE TYPE canteen_transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE book_condition AS ENUM ('New', 'Good', 'Fair', 'Poor', 'Damaged', 'Lost');
CREATE TYPE fine_status AS ENUM ('pending', 'paid', 'waived');
CREATE TYPE loan_status AS ENUM ('active', 'returned', 'overdue');


-- Users table for authentication and role management
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'USER',
  email_verified TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 

-- Sessions table (for NextAuth)
CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  expires TIMESTAMP NOT NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_session_user FOREIGN_KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- Students table
CREATE TABLE IF NOT EXISTS students (
  user_id UUID PRIMARY KEY DEFAULT,
  register_number VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  initial_name VARCHAR(100) NOT NULL,
  nic_no VARCHAR(20) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  faculty VARCHAR(100) NOT NULL,
  year_of_study INTEGER NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  photo TEXT,
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- Lecturers table
CREATE TABLE IF NOT EXISTS lecturers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  staff_id VARCHAR(50) UNIQUE NOT NULL,
  nic_no VARCHAR(20) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  initial_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  faculty VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  specialization VARCHAR(255),
  address TEXT,
  phone VARCHAR(50),
  photo TEXT,
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lecturers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- RFID (NFC) Cards Table
CREATE TABLE IF NOT EXISTS rfid_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_uid VARCHAR(100) UNIQUE NOT NULL,
  assigned_student UUID,
  assigned_date TIMESTAMP,
  status card_status DEFAULT 'ACTIVE',
  balance DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rfid_cards_student FOREIGN KEY (assigned_student) REFERENCES students(user_id) ON DELETE CASCADE
);


-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code VARCHAR(50) UNIQUE NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  faculty VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  credits INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student-Course Enrollment
CREATE TABLE IF NOT EXISTS student_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  course_id UUID NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_student_courses_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_student_courses_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE (student_id, course_id)
);

-- Lecturer-Course Assignment
CREATE TABLE IF NOT EXISTS lecturer_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecturer_id UUID NOT NULL,
  course_id UUID NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lecturer_courses_lecturer FOREIGN KEY (lecturer_id) REFERENCES lecturers(id) ON DELETE CASCADE,
  CONSTRAINT fk_lecturer_courses_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE (lecturer_id, course_id)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  course_id UUID NOT NULL,
  lecturer_id UUID,
  date DATE NOT NULL,
  checked_in TIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendance_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendance_lecturer FOREIGN KEY (lecturer_id) REFERENCES lecturers(id)
);

-- Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  category food_category NOT NULL,
  price DECIMAL(8,2) NOT NULL CHECK (price >= 0),
  description TEXT,
  is_available BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transaction Items Table (for storing individual items in each transaction)
CREATE TABLE IF NOT EXISTS canteen_transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL,
  menu_item_id UUID NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(8,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_canteen_transaction_items_transaction FOREIGN KEY (transaction_id) REFERENCES canteen_transactions(id) ON DELETE CASCADE,
  CONSTRAINT fk_canteen_transaction_items_menu_item FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- Balance History Table (for tracking balance changes)
CREATE TABLE IF NOT EXISTS balance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  card_id VARCHAR(100) NOT NULL,
  transaction_id UUID,
  amount DECIMAL(10,2) NOT NULL,
  balance_before DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_balance_history_student FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_balance_history_card FOREIGN KEY (card_id) REFERENCES rfid_cards(card_uid) ON DELETE CASCADE,
  CONSTRAINT fk_balance_history_transaction FOREIGN KEY (transaction_id) REFERENCES canteen_transactions(id) ON DELETE SET NULL
);

-- Daily Sales Summary Table
CREATE TABLE IF NOT EXISTS daily_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total_transactions INTEGER NOT NULL DEFAULT 0,
  total_revenue DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date)
);

-- Canteen transactions table
CREATE TABLE IF NOT EXISTS canteen_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  card_id VARCHAR(100),
  amount DECIMAL(10, 2) NOT NULL,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_canteen_transactions_card FOREIGN KEY (card_id) REFERENCES rfid_cards(card_uid) ON DELETE CASCADE
);

-- Modify existing canteen_transactions table to add missing fields
ALTER TABLE canteen_transactions 
ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS status canteen_transaction_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'RFID';

-- Update the transaction_id for existing records (if any)
UPDATE canteen_transactions 
SET transaction_id = 'TXN-' || EXTRACT(EPOCH FROM created_at)::bigint 
WHERE transaction_id IS NULL;

-- Make transaction_id NOT NULL after updating existing records
ALTER TABLE canteen_transactions 
ALTER COLUMN transaction_id SET NOT NULL;


-- Library Books
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  isbn VARCHAR(20) UNIQUE,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  publisher VARCHAR(255),
  publication_year INTEGER,
  category VARCHAR(100),
  description TEXT,
  location VARCHAR(100),
  total_copies INTEGER NOT NULL DEFAULT 1,
  available_copies INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  CONSTRAINT fk_books_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Book Copies (Individual copies of books with condition tracking)
CREATE TABLE IF NOT EXISTS book_copies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL,
  barcode VARCHAR(100) UNIQUE NOT NULL,
  condition book_condition DEFAULT 'Good',
  is_available BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_book_copies_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- Book Loans (Borrow/Return tracking)
CREATE TABLE IF NOT EXISTS book_loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  book_copy_id UUID NOT NULL,
  borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_date DATE NOT NULL,
  returned_at TIMESTAMP,
  return_condition book_condition,
  status loan_status DEFAULT 'active',
  notes TEXT,
  issued_by UUID,
  returned_to UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_book_loans_student FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_book_loans_book_copy FOREIGN KEY (book_copy_id) REFERENCES book_copies(id) ON DELETE CASCADE,
  CONSTRAINT fk_book_loans_issued_by FOREIGN KEY (issued_by) REFERENCES users(id),
  CONSTRAINT fk_book_loans_returned_to FOREIGN KEY (returned_to) REFERENCES users(id)
);

-- Library Fines
CREATE TABLE IF NOT EXISTS library_fines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  loan_id UUID,
  amount DECIMAL(10,2) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  status fine_status DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP,
  paid_by UUID,
  notes TEXT,
  CONSTRAINT fk_library_fines_student FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_library_fines_loan FOREIGN KEY (loan_id) REFERENCES book_loans(id) ON DELETE SET NULL,
  CONSTRAINT fk_library_fines_paid_by FOREIGN KEY (paid_by) REFERENCES users(id)
);

-- Library Members (Auto-created from students, but allows for additional library-specific info)
CREATE TABLE IF NOT EXISTS library_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID UNIQUE NOT NULL,
  membership_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  membership_status VARCHAR(20) DEFAULT 'active',
  max_books_allowed INTEGER DEFAULT 5,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_library_members_student FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE
);

-- Exam Results
CREATE TABLE IF NOT EXISTS exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  course_id UUID NOT NULL,
  exam_date DATE NOT NULL,
  grade VARCHAR(5) NOT NULL,
  remarks TEXT,
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_exam_results_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_exam_results_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_register_number ON students(register_number);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_lecturers_user_id ON lecturers(user_id);
CREATE INDEX IF NOT EXISTS idx_lecturers_staff_id ON lecturers(staff_id);
CREATE INDEX IF NOT EXISTS idx_rfid_cards_card_uid ON rfid_cards(card_uid);
CREATE INDEX IF NOT EXISTS idx_rfid_cards_assigned_student ON rfid_cards(assigned_student);
CREATE INDEX IF NOT EXISTS idx_courses_course_code ON courses(course_code);
CREATE INDEX IF NOT EXISTS idx_student_courses_student_id ON student_courses(student_id);
CREATE INDEX IF NOT EXISTS idx_student_courses_course_id ON student_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_lecturer_courses_lecturer_id ON lecturer_courses(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_lecturer_courses_course_id ON lecturer_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_course_id ON attendance(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_canteen_transactions_student_id ON canteen_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_canteen_transactions_card_id ON canteen_transactions(card_id);

-- Library indexes
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_book_copies_book_id ON book_copies(book_id);
CREATE INDEX IF NOT EXISTS idx_book_copies_barcode ON book_copies(barcode);
CREATE INDEX IF NOT EXISTS idx_book_copies_available ON book_copies(is_available);
CREATE INDEX IF NOT EXISTS idx_book_loans_student_id ON book_loans(student_id);
CREATE INDEX IF NOT EXISTS idx_book_loans_book_copy_id ON book_loans(book_copy_id);
CREATE INDEX IF NOT EXISTS idx_book_loans_status ON book_loans(status);
CREATE INDEX IF NOT EXISTS idx_book_loans_due_date ON book_loans(due_date);
CREATE INDEX IF NOT EXISTS idx_library_fines_student_id ON library_fines(student_id);
CREATE INDEX IF NOT EXISTS idx_library_fines_status ON library_fines(status);
CREATE INDEX IF NOT EXISTS idx_library_members_student_id ON library_members(student_id);

CREATE INDEX IF NOT EXISTS idx_exam_results_student_id ON exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_course_id ON exam_results(course_id);

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON menu_items(is_active);
CREATE INDEX IF NOT EXISTS idx_canteen_transaction_items_transaction_id ON canteen_transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_canteen_transaction_items_menu_item_id ON canteen_transaction_items(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_balance_history_student_id ON balance_history(student_id);
CREATE INDEX IF NOT EXISTS idx_balance_history_card_id ON balance_history(card_id);
CREATE INDEX IF NOT EXISTS idx_canteen_transactions_transaction_id ON canteen_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_canteen_transactions_status ON canteen_transactions(status);
CREATE INDEX IF NOT EXISTS idx_daily_sales_date ON daily_sales(date);


-- Create triggers for updating the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lecturers_updated_at BEFORE UPDATE ON lecturers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rfid_cards_updated_at BEFORE UPDATE ON rfid_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_canteen_transactions_updated_at BEFORE UPDATE ON canteen_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_book_copies_updated_at BEFORE UPDATE ON book_copies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_book_loans_updated_at BEFORE UPDATE ON book_loans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_library_members_updated_at BEFORE UPDATE ON library_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_sales_updated_at BEFORE UPDATE ON daily_sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Initialize daily sales for today
INSERT INTO daily_sales (date, total_transactions, total_revenue)
VALUES (CURRENT_DATE, 0, 0.00)
ON CONFLICT (date) DO NOTHING;

-- Create views for commonly used queries
CREATE OR REPLACE VIEW active_menu AS
SELECT 
    id,
    name,
    category,
    price,
    description,
    is_available,
    created_at,
    updated_at
FROM menu_items 
WHERE is_active = TRUE;

CREATE OR REPLACE VIEW daily_transaction_summary AS
SELECT 
    DATE(created_at) as transaction_date,
    COUNT(*) as total_transactions,
    SUM(amount) as total_revenue,
    AVG(amount) as average_transaction
FROM canteen_transactions 
WHERE status = 'completed'
GROUP BY DATE(created_at)
ORDER BY transaction_date DESC;

CREATE OR REPLACE VIEW student_canteen_history AS
SELECT 
    ct.id,
    ct.transaction_id,
    s.register_number,
    s.full_name as student_name,
    ct.amount as total_amount,
    ct.status,
    ct.created_at,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'name', mi.name,
                'category', mi.category,
                'quantity', cti.quantity,
                'unit_price', cti.unit_price,
                'total_price', cti.total_price
            ) ORDER BY cti.created_at
        ) FILTER (WHERE mi.id IS NOT NULL), 
        '[]'::json
    ) as items
FROM canteen_transactions ct
JOIN students s ON ct.student_id = s.user_id
LEFT JOIN canteen_transaction_items cti ON ct.id = cti.transaction_id
LEFT JOIN menu_items mi ON cti.menu_item_id = mi.id
GROUP BY ct.id, ct.transaction_id, s.register_number, s.full_name, ct.amount, ct.status, ct.created_at
ORDER BY ct.created_at DESC;

-- Library Views
CREATE OR REPLACE VIEW books_with_availability AS
SELECT 
    b.id,
    b.isbn,
    b.title,
    b.author,
    b.publisher,
    b.publication_year,
    b.category,
    b.description,
    b.location,
    b.total_copies,
    b.available_copies,
    COUNT(bc.id) as physical_copies,
    COUNT(CASE WHEN bc.is_available = true THEN 1 END) as available_physical_copies,
    b.created_at,
    b.updated_at
FROM books b
LEFT JOIN book_copies bc ON b.id = bc.book_id
GROUP BY b.id, b.isbn, b.title, b.author, b.publisher, b.publication_year, 
         b.category, b.description, b.location, b.total_copies, b.available_copies, 
         b.created_at, b.updated_at
ORDER BY b.title;

CREATE OR REPLACE VIEW active_loans_with_details AS
SELECT 
    bl.id,
    bl.student_id,
    s.register_number,
    s.full_name as student_name,
    s.email as student_email,
    b.title as book_title,
    b.author as book_author,
    bc.barcode,
    bl.borrowed_at,
    bl.due_date,
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
JOIN students s ON bl.student_id = s.user_id
JOIN book_copies bc ON bl.book_copy_id = bc.id
JOIN books b ON bc.book_id = b.id
WHERE bl.status = 'active'
ORDER BY bl.due_date;

CREATE OR REPLACE VIEW library_member_summary AS
SELECT 
    lm.id as membership_id,
    lm.student_id,
    s.register_number,
    s.full_name,
    s.email,
    s.faculty,
    s.year_of_study,
    lm.membership_date,
    lm.membership_status,
    lm.max_books_allowed,
    COUNT(bl.id) as current_loans,
    COUNT(CASE WHEN bl.due_date < CURRENT_DATE THEN 1 END) as overdue_loans,
    COALESCE(SUM(CASE WHEN lf.status = 'pending' THEN lf.amount ELSE 0 END), 0) as pending_fines
FROM library_members lm
JOIN students s ON lm.student_id = s.user_id
LEFT JOIN book_loans bl ON lm.student_id = bl.student_id AND bl.status = 'active'
LEFT JOIN library_fines lf ON lm.student_id = lf.student_id
GROUP BY lm.id, lm.student_id, s.register_number, s.full_name, s.email, 
         s.faculty, s.year_of_study, lm.membership_date, lm.membership_status, 
         lm.max_books_allowed
ORDER BY s.full_name;

-- Function to automatically create library membership when student is added
CREATE OR REPLACE FUNCTION create_library_membership()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO library_members (student_id, membership_date, membership_status, max_books_allowed)
    VALUES (NEW.user_id, CURRENT_TIMESTAMP, 'active', 5);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create library membership for new students
CREATE TRIGGER auto_create_library_membership
    AFTER INSERT ON students
    FOR EACH ROW
    EXECUTE FUNCTION create_library_membership();