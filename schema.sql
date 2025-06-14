-- PostgreSQL Database Schema

-- ENUMs first (PostgreSQL requires explicit ENUM type creation)
CREATE TYPE user_role AS ENUM ('USER', 'STUDENT', 'LECTURER', 'ADMIN', 'LIBRARIAN', 'SYSTEM_ADMIN');
CREATE TYPE card_status AS ENUM ('ACTIVE', 'INACTIVE', 'LOST', 'DAMAGED', 'RETURNED');
CREATE TYPE transaction_status AS ENUM ('BORROWED', 'RETURNED', 'OVERDUE');

-- Users table for authentication and role management
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  register_number VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  initial_name VARCHAR(100) NOT NULL,
  nic_no VARCHAR(20) NOT NULL
  email VARCHAR(255) UNIQUE NOT NULL,
  faculty VARCHAR(100) NOT NULL,
  year_of_study INTEGER NOT NULL,
  card_id VARCHAR(100) UNIQUE,
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
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  faculty VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  specialization VARCHAR(255),
  phone VARCHAR(50),
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
  CONSTRAINT fk_rfid_cards_student FOREIGN KEY (assigned_student) REFERENCES students(id) ON DELETE CASCADE
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

-- Library Books
CREATE TABLE IF NOT EXISTS library_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  copies_total INTEGER NOT NULL,
  copies_available INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Library Transactions (Borrow/Return)
CREATE TABLE IF NOT EXISTS library_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  book_id UUID NOT NULL,
  borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_date DATE NOT NULL,
  returned_at TIMESTAMP,
  status transaction_status DEFAULT 'BORROWED',
  CONSTRAINT fk_library_transactions_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_library_transactions_book FOREIGN KEY (book_id) REFERENCES library_books(id) ON DELETE CASCADE
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
CREATE INDEX IF NOT EXISTS idx_library_transactions_student_id ON library_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_library_transactions_book_id ON library_transactions(book_id);
CREATE INDEX IF NOT EXISTS idx_library_transactions_status ON library_transactions(status);
CREATE INDEX IF NOT EXISTS idx_exam_results_student_id ON exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_course_id ON exam_results(course_id);

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
CREATE TRIGGER update_library_books_updated_at BEFORE UPDATE ON library_books FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();