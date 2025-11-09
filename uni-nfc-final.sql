--
-- PostgreSQL database dump
--

\restrict sUPjWIAj5mF1MHJEcwFBddSH8Ea7pavE7b1H3Ivhc5LOdKtOcUaxlOfRK0ZXYwK

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)

-- Started on 2025-09-30 03:22:14 +0530

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4491 (class 1262 OID 26006)
-- Name: uni-nfc-new; Type: DATABASE; Schema: -; Owner: vidda_postgre
--

CREATE DATABASE "uni-nfc-new" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE "uni-nfc-new" OWNER TO vidda_postgre;

\unrestrict sUPjWIAj5mF1MHJEcwFBddSH8Ea7pavE7b1H3Ivhc5LOdKtOcUaxlOfRK0ZXYwK
\encoding SQL_ASCII
\connect -reuse-previous=on "dbname='uni-nfc-new'"
\restrict sUPjWIAj5mF1MHJEcwFBddSH8Ea7pavE7b1H3Ivhc5LOdKtOcUaxlOfRK0ZXYwK

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: azure_pg_admin
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO azure_pg_admin;

--
-- TOC entry 897 (class 1247 OID 26908)
-- Name: book_condition; Type: TYPE; Schema: public; Owner: vidda_postgre
--

CREATE TYPE public.book_condition AS ENUM (
    'New',
    'Good',
    'Fair',
    'Poor',
    'Damaged',
    'Lost'
);


ALTER TYPE public.book_condition OWNER TO vidda_postgre;

--
-- TOC entry 894 (class 1247 OID 26898)
-- Name: canteen_transaction_status; Type: TYPE; Schema: public; Owner: vidda_postgre
--

CREATE TYPE public.canteen_transaction_status AS ENUM (
    'pending',
    'completed',
    'failed',
    'cancelled'
);


ALTER TYPE public.canteen_transaction_status OWNER TO vidda_postgre;

--
-- TOC entry 885 (class 1247 OID 26868)
-- Name: card_status; Type: TYPE; Schema: public; Owner: vidda_postgre
--

CREATE TYPE public.card_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'LOST',
    'DAMAGED',
    'RETURNED'
);


ALTER TYPE public.card_status OWNER TO vidda_postgre;

--
-- TOC entry 900 (class 1247 OID 26922)
-- Name: fine_status; Type: TYPE; Schema: public; Owner: vidda_postgre
--

CREATE TYPE public.fine_status AS ENUM (
    'pending',
    'paid',
    'waived'
);


ALTER TYPE public.fine_status OWNER TO vidda_postgre;

--
-- TOC entry 891 (class 1247 OID 26888)
-- Name: food_category; Type: TYPE; Schema: public; Owner: vidda_postgre
--

CREATE TYPE public.food_category AS ENUM (
    'Main',
    'Snack',
    'Drink',
    'Dessert'
);


ALTER TYPE public.food_category OWNER TO vidda_postgre;

--
-- TOC entry 903 (class 1247 OID 26930)
-- Name: loan_status; Type: TYPE; Schema: public; Owner: vidda_postgre
--

CREATE TYPE public.loan_status AS ENUM (
    'active',
    'returned',
    'overdue'
);


ALTER TYPE public.loan_status OWNER TO vidda_postgre;

--
-- TOC entry 888 (class 1247 OID 26880)
-- Name: transaction_status; Type: TYPE; Schema: public; Owner: vidda_postgre
--

CREATE TYPE public.transaction_status AS ENUM (
    'BORROWED',
    'RETURNED',
    'OVERDUE'
);


ALTER TYPE public.transaction_status OWNER TO vidda_postgre;

--
-- TOC entry 990 (class 1247 OID 27623)
-- Name: user_role; Type: TYPE; Schema: public; Owner: vidda_postgre
--

CREATE TYPE public.user_role AS ENUM (
    'USER',
    'STUDENT',
    'LECTURER',
    'ADMIN',
    'LIBRARIAN',
    'CANTEEN'
);


ALTER TYPE public.user_role OWNER TO vidda_postgre;

--
-- TOC entry 987 (class 1247 OID 26854)
-- Name: user_role_old; Type: TYPE; Schema: public; Owner: vidda_postgre
--

CREATE TYPE public.user_role_old AS ENUM (
    'USER',
    'STUDENT',
    'LECTURER',
    'ADMIN',
    'LIBRARIAN',
    'SYSTEM_ADMIN',
    'CANTEEN'
);


ALTER TYPE public.user_role_old OWNER TO vidda_postgre;

--
-- TOC entry 246 (class 1255 OID 27387)
-- Name: create_library_membership(); Type: FUNCTION; Schema: public; Owner: vidda_postgre
--

CREATE FUNCTION public.create_library_membership() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO library_members (student_id, membership_date, membership_status, max_books_allowed)
    VALUES (NEW.user_id, CURRENT_TIMESTAMP, 'active', 5);
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.create_library_membership() OWNER TO vidda_postgre;

--
-- TOC entry 247 (class 1255 OID 27345)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: vidda_postgre
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO vidda_postgre;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 229 (class 1259 OID 27187)
-- Name: book_copies; Type: TABLE; Schema: public; Owner: vidda_postgre
--

CREATE TABLE public.book_copies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    book_id uuid NOT NULL,
    barcode character varying(100) NOT NULL,
    condition public.book_condition DEFAULT 'Good'::public.book_condition,
    is_available boolean DEFAULT true,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.book_copies OWNER TO vidda_postgre;

--
-- TOC entry 230 (class 1259 OID 27206)
-- Name: book_loans; Type: TABLE; Schema: public; Owner: vidda_postgre
--

CREATE TABLE public.book_loans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    book_copy_id uuid NOT NULL,
    borrowed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    due_date date NOT NULL,
    returned_at timestamp without time zone,
    return_condition public.book_condition,
    status public.loan_status DEFAULT 'active'::public.loan_status,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.book_loans OWNER TO vidda_postgre;

--
-- TOC entry 228 (class 1259 OID 27168)
-- Name: books; Type: TABLE; Schema: public; Owner: vidda_postgre
--

CREATE TABLE public.books (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    isbn character varying(20),
    title character varying(255) NOT NULL,
    author character varying(255) NOT NULL,
    publisher character varying(255),
    publication_year integer,
    category character varying(100),
    description text,
    location character varying(100),
    total_copies integer DEFAULT 1 NOT NULL,
    available_copies integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.books OWNER TO vidda_postgre;

--
-- TOC entry 216 (class 1259 OID 26950)
-- Name: students; Type: TABLE; Schema: public; Owner: vidda_postgre
--

CREATE TABLE public.students (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    register_number character varying(50) NOT NULL,
    full_name character varying(100) NOT NULL,
    initial_name character varying(100) NOT NULL,
    nic_no character varying(20) NOT NULL,
    email character varying(255) NOT NULL,
    faculty character varying(100) NOT NULL,
    year_of_study integer NOT NULL,
    address text,
    phone character varying(50),
    photo text,
    date_of_birth date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.students OWNER TO vidda_postgre;

--
-- TOC entry 238 (class 1259 OID 27377)
-- Name: active_loans_with_details; Type: VIEW; Schema: public; Owner: vidda_postgre
--

CREATE VIEW public.active_loans_with_details AS
 SELECT bl.id,
    bl.student_id,
    s.register_number,
    s.full_name AS student_name,
    s.email AS student_email,
    b.title AS book_title,
    b.author AS book_author,
    bc.barcode,
    bl.borrowed_at,
    bl.due_date,
    bl.status,
        CASE
            WHEN ((bl.due_date < CURRENT_DATE) AND (bl.status = 'active'::public.loan_status)) THEN 'overdue'::text
            ELSE (bl.status)::text
        END AS loan_status,
        CASE
            WHEN ((bl.due_date < CURRENT_DATE) AND (bl.status = 'active'::public.loan_status)) THEN (CURRENT_DATE - bl.due_date)
            ELSE 0
        END AS days_overdue
   FROM (((public.book_loans bl
     JOIN public.students s ON ((bl.student_id = s.user_id)))
     JOIN public.book_copies bc ON ((bl.book_copy_id = bc.id)))
     JOIN public.books b ON ((bc.book_id = b.id)))
  WHERE (bl.status = 'active'::public.loan_status)
  ORDER BY bl.due_date;


ALTER VIEW public.active_loans_with_details OWNER TO vidda_postgre;

--
-- TOC entry 223 (class 1259 OID 27079)
-- Name: menu_items; Type: TABLE; Schema: public; Owner: vidda_postgre
--

CREATE TABLE public.menu_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    category public.food_category NOT NULL,
    price numeric(8,2) NOT NULL,
    description text,
    is_available boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT menu_items_price_check CHECK ((price >= (0)::numeric))
);


ALTER TABLE public.menu_items OWNER TO vidda_postgre;

--
-- TOC entry 234 (class 1259 OID 27359)
-- Name: active_menu; Type: VIEW; Schema: public; Owner: vidda_postgre
--

CREATE VIEW public.active_menu AS
 SELECT id,
    name,
    category,
    price,
    description,
    is_available,
    created_at,
    updated_at
   FROM public.menu_items
  WHERE (is_active = true);


ALTER VIEW public.active_menu OWNER TO vidda_postgre;

--
-- TOC entry 222 (class 1259 OID 27056)
-- Name: attendance; Type: TABLE; Schema: public; Owner: vidda_postgre
--

CREATE TABLE public.attendance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    course_id uuid NOT NULL,
    lecturer_id uuid,
    date date NOT NULL,
    checked_in time without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.attendance OWNER TO vidda_postgre;

--
-- TOC entry 225 (class 1259 OID 27108)
-- Name: balance_history; Type: TABLE; Schema: public; Owner: vidda_postgre
--

CREATE TABLE public.balance_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    card_id character varying(100) NOT NULL,
    transaction_id uuid,
    amount numeric(10,2) NOT NULL,
    balance_before numeric(10,2) NOT NULL,
    balance_after numeric(10,2) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.balance_history OWNER TO vidda_postgre;

--
-- TOC entry 237 (class 1259 OID 27372)
-- Name: books_with_availability; Type: VIEW; Schema: public; Owner: vidda_postgre
--

CREATE VIEW public.books_with_availability AS
 SELECT b.id,
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
    count(bc.id) AS physical_copies,
    count(
        CASE
            WHEN (bc.is_available = true) THEN 1
            ELSE NULL::integer
        END) AS available_physical_copies,
    b.created_at,
    b.updated_at
   FROM (public.books b
     LEFT JOIN public.book_copies bc ON ((b.id = bc.book_id)))
  GROUP BY b.id, b.isbn, b.title, b.author, b.publisher, b.publication_year, b.category, b.description, b.location, b.total_copies, b.available_copies, b.created_at, b.updated_at
  ORDER BY b.title;


ALTER VIEW public.books_with_availability OWNER TO vidda_postgre;

--
-- TOC entry 227 (class 1259 OID 27144)
-- Name: canteen_transaction_items; Type: TABLE; Schema: public; Owner: vidda_postgre
--

CREATE TABLE public.canteen_transaction_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    transaction_id uuid NOT NULL,
    menu_item_id uuid NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(8,2) NOT NULL,
    total_price numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT canteen_transaction_items_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT canteen_transaction_items_total_price_check CHECK ((total_price >= (0)::numeric)),
    CONSTRAINT canteen_transaction_items_unit_price_check CHECK ((unit_price >= (0)::numeric))
);


ALTER TABLE public.canteen_transaction_items OWNER TO vidda_postgre;

--
-- TOC entry 224 (class 1259 OID 27092)
-- Name: canteen_transactions; Type: TABLE; Schema: public; Owner: vidda_postgre
--

CREATE TABLE public.canteen_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    card_id character varying(100),
    amount numeric(10,2) NOT NULL,
    transaction_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    transaction_id character varying(50) NOT NULL,
    status public.canteen_transaction_status DEFAULT 'pending'::public.canteen_transaction_status,
    payment_method character varying(50) DEFAULT 'RFID'::character varying
);


ALTER TABLE public.canteen_transactions OWNER TO vidda_postgre;

--
-- TOC entry 240 (class 1259 OID 27396)
-- Name: course_schedules; Type: TABLE; Schema: public; Owner: vidda_postgre
--

CREATE TABLE public.course_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    room character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT course_schedules_day_of_week_check CHECK (((day_of_week >= 0) AND (day_of_week <= 6))),
    CONSTRAINT valid_time_range CHECK ((end_time > start_time))
);


ALTER TABLE public.course_schedules OWNER TO vidda_postgre;

--
-- TOC entry 219 (class 1259 OID 27008)
-- Name: courses; Type: TABLE; Schema: public; Owner: vidda_postgre
--

CREATE TABLE public.courses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_code character varying(50) NOT NULL,
    course_name character varying(255) NOT NULL,
    faculty character varying(100) NOT NULL,
    year integer NOT NULL,
    credits integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.courses OWNER TO vidda_postgre;

--
-- TOC entry 226 (class 1259 OID 27132)
-- Name: daily_sales; Type: TABLE; Schema: public; Owner: vidda_postgre
--

CREATE TABLE public.daily_sales (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    date date NOT NULL,
    total_transactions integer DEFAULT 0 NOT NULL,
    total_revenue numeric(12,2) DEFAULT 0.00 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.daily_sales OWNER TO vidda_postgre;

--
-- TOC entry 235 (class 1259 OID 27363)
-- Name: daily_transaction_summary; Type: VIEW; Schema: public; Owner: vidda_postgre
--

CREATE VIEW public.daily_transaction_summary AS
 SELECT date(created_at) AS transaction_date,
    count(*) AS total_transactions,
    sum(amount) AS total_revenue,
    avg(amount) AS average_transaction
   FROM public.canteen_transactions
  WHERE (status = 'completed'::public.canteen_transaction_status)
  GROUP BY (date(created_at))
  ORDER BY (date(created_at)) DESC;


ALTER VIEW public.daily_transaction_summary OWNER TO vidda_postgre;

--
-- TOC entry 233 (class 1259 OID 27283)
-- Name: exam_results; Type: TABLE; Schema: public; Owner: vidda_postgre
--

CREATE TABLE public.exam_results (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    course_id uuid NOT NULL,
    exam_date date NOT NULL,
    grade character varying(5) NOT NULL,
    remarks text,
    published_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.exam_results OWNER TO vidda_postgre;

--
-- TOC entry 221 (class 1259 OID 27037)
-- Name: lecturer_courses; Type: TABLE; Schema: public; Owner: vidda_postgre
--

CREATE TABLE public.lecturer_courses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lecturer_id uuid NOT NULL,
    course_id uuid NOT NULL,
    assigned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.lecturer_courses OWNER TO vidda_postgre;

--
-- TOC entry 217 (class 1259 OID 26971)
-- Name: lecturers; Type: TABLE; Schema: public; Owner: vidda_postgre
--

CREATE TABLE public.lecturers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    staff_id character varying(50) NOT NULL,
    nic_no character varying(20) NOT NULL,
    full_name character varying(100) NOT NULL,
    initial_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    faculty character varying(100) NOT NULL,
    "position" character varying(100) NOT NULL,
    specialization character varying(255),
    address text,
    phone character varying(50),
    photo text,
    date_of_birth date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.lecturers OWNER TO vidda_postgre;

--
-- TOC entry 231 (class 1259 OID 27238)
-- Name: library_fines; Type: TABLE; Schema: public; Owner: vidda_postgre
--

CREATE TABLE public.library_fines (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    loan_id uuid,
    amount numeric(10,2) NOT NULL,
    reason character varying(255) NOT NULL,
    status public.fine_status DEFAULT 'pending'::public.fine_status,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    paid_at timestamp without time zone,
    paid_by uuid,
    notes text
);


ALTER TABLE public.library_fines OWNER TO vidda_postgre;

--
-- TOC entry 232 (class 1259 OID 27263)
-- Name: library_members; Type: TABLE; Schema: public; Owner: vidda_postgre
--

CREATE TABLE public.library_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    membership_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    membership_status character varying(20) DEFAULT 'active'::character varying,
    max_books_allowed integer DEFAULT 5,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.library_members OWNER TO vidda_postgre;

--
-- TOC entry 239 (class 1259 OID 27382)
-- Name: library_member_summary; Type: VIEW; Schema: public; Owner: vidda_postgre
--

CREATE VIEW public.library_member_summary AS
 SELECT lm.id AS membership_id,
    lm.student_id,
    s.register_number,
    s.full_name,
    s.email,
    s.faculty,
    s.year_of_study,
    lm.membership_date,
    lm.membership_status,
    lm.max_books_allowed,
    count(bl.id) AS current_loans,
    count(
        CASE
            WHEN (bl.due_date < CURRENT_DATE) THEN 1
            ELSE NULL::integer
        END) AS overdue_loans,
    COALESCE(sum(
        CASE
            WHEN (lf.status = 'pending'::public.fine_status) THEN lf.amount
            ELSE (0)::numeric
        END), (0)::numeric) AS pending_fines
   FROM (((public.library_members lm
     JOIN public.students s ON ((lm.student_id = s.user_id)))
     LEFT JOIN public.book_loans bl ON (((lm.student_id = bl.student_id) AND (bl.status = 'active'::public.loan_status))))
     LEFT JOIN public.library_fines lf ON ((lm.student_id = lf.student_id)))
  GROUP BY lm.id, lm.student_id, s.register_number, s.full_name, s.email, s.faculty, s.year_of_study, lm.membership_date, lm.membership_status, lm.max_books_allowed
  ORDER BY s.full_name;


ALTER VIEW public.library_member_summary OWNER TO vidda_postgre;

--
-- TOC entry 241 (class 1259 OID 27422)
-- Name: nfc_attendance_log; Type: TABLE; Schema: public; Owner: vidda_postgre
--

CREATE TABLE public.nfc_attendance_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    attendance_id uuid,
    card_uid character varying(100) NOT NULL,
    reader_name character varying(255),
    swipe_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    student_id uuid NOT NULL,
    course_id uuid NOT NULL,
    lecturer_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.nfc_attendance_log OWNER TO vidda_postgre;

--
-- TOC entry 4567 (class 0 OID 0)
-- Dependencies: 241
-- Name: TABLE nfc_attendance_log; Type: COMMENT; Schema: public; Owner: vidda_postgre
--

COMMENT ON TABLE public.nfc_attendance_log IS 'Logs all NFC card swipes for attendance tracking';


--
-- TOC entry 4568 (class 0 OID 0)
-- Dependencies: 241
-- Name: COLUMN nfc_attendance_log.card_uid; Type: COMMENT; Schema: public; Owner: vidda_postgre
--

COMMENT ON COLUMN public.nfc_attendance_log.card_uid IS 'Unique identifier of the NFC card';


--
-- TOC entry 4569 (class 0 OID 0)
-- Dependencies: 241
-- Name: COLUMN nfc_attendance_log.reader_name; Type: COMMENT; Schema: public; Owner: vidda_postgre
--

COMMENT ON COLUMN public.nfc_attendance_log.reader_name IS 'Name/identifier of the NFC reader device';


--
-- TOC entry 4570 (class 0 OID 0)
-- Dependencies: 241
-- Name: COLUMN nfc_attendance_log.swipe_timestamp; Type: COMMENT; Schema: public; Owner: vidda_postgre
--

COMMENT ON COLUMN public.nfc_attendance_log.swipe_timestamp IS 'Exact timestamp when card was swiped';


--
-- TOC entry 242 (class 1259 OID 27650)
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: vidda_postgre
--

CREATE TABLE public.password_reset_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.password_reset_tokens OWNER TO vidda_postgre;

--
-- TOC entry 218 (class 1259 OID 26992)
-- Name: rfid_cards; Type: TABLE; Schema: public; Owner: vidda_postgre
--

CREATE TABLE public.rfid_cards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    card_uid character varying(100) NOT NULL,
    assigned_student uuid,
    assigned_date timestamp without time zone,
    status public.card_status DEFAULT 'ACTIVE'::public.card_status,
    balance numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.rfid_cards OWNER TO vidda_postgre;

--
-- TOC entry 236 (class 1259 OID 27367)
-- Name: student_canteen_history; Type: VIEW; Schema: public; Owner: vidda_postgre
--

CREATE VIEW public.student_canteen_history AS
 SELECT ct.id,
    ct.transaction_id,
    s.register_number,
    s.full_name AS student_name,
    ct.amount AS total_amount,
    ct.status,
    ct.created_at,
    COALESCE(json_agg(json_build_object('name', mi.name, 'category', mi.category, 'quantity', cti.quantity, 'unit_price', cti.unit_price, 'total_price', cti.total_price) ORDER BY cti.created_at) FILTER (WHERE (mi.id IS NOT NULL)), '[]'::json) AS items
   FROM (((public.canteen_transactions ct
     JOIN public.students s ON ((ct.student_id = s.user_id)))
     LEFT JOIN public.canteen_transaction_items cti ON ((ct.id = cti.transaction_id)))
     LEFT JOIN public.menu_items mi ON ((cti.menu_item_id = mi.id)))
  GROUP BY ct.id, ct.transaction_id, s.register_number, s.full_name, ct.amount, ct.status, ct.created_at
  ORDER BY ct.created_at DESC;


ALTER VIEW public.student_canteen_history OWNER TO vidda_postgre;

--
-- TOC entry 220 (class 1259 OID 27018)
-- Name: student_courses; Type: TABLE; Schema: public; Owner: vidda_postgre
--

CREATE TABLE public.student_courses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    course_id uuid NOT NULL,
    enrolled_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.student_courses OWNER TO vidda_postgre;

--
-- TOC entry 215 (class 1259 OID 26937)
-- Name: users; Type: TABLE; Schema: public; Owner: vidda_postgre
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role public.user_role DEFAULT 'USER'::public.user_role NOT NULL,
    email_verified timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO vidda_postgre;

--
-- TOC entry 4471 (class 0 OID 27056)
-- Dependencies: 222
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: vidda_postgre
--

COPY public.attendance (id, student_id, course_id, lecturer_id, date, checked_in, created_at, updated_at) FROM stdin;
2fc6a872-e17c-4363-b9a3-91301aefa764	9ee87fae-42c8-4105-8298-4851d17528fa	f653812d-7af8-4b8f-9f72-06c7492eca41	e0da8665-8d47-4557-9b8c-3c764aaf0e19	2025-09-29	14:19:00	2025-09-29 08:49:03.743894	2025-09-29 08:49:03.743894
dca0d09a-41ff-4958-82ea-7daa0f58b47a	e49fa1f0-d1eb-4ef7-abaa-0d6ea2f57aeb	f653812d-7af8-4b8f-9f72-06c7492eca41	e0da8665-8d47-4557-9b8c-3c764aaf0e19	2025-09-29	14:19:00	2025-09-29 08:49:14.166969	2025-09-29 08:49:14.166969
\.


--
-- TOC entry 4474 (class 0 OID 27108)
-- Dependencies: 225
-- Data for Name: balance_history; Type: TABLE DATA; Schema: public; Owner: vidda_postgre
--

COPY public.balance_history (id, student_id, card_id, transaction_id, amount, balance_before, balance_after, description, created_at) FROM stdin;
18eb0225-a456-46a2-8cce-68c07b23b1b5	e49fa1f0-d1eb-4ef7-abaa-0d6ea2f57aeb	b37f0608	98065f4f-544b-4482-b411-1955f7bdd353	-260.00	500.00	240.00	Purchase: TXN-1759139451509	2025-09-29 09:50:51.457524
9be5ae3a-8bc1-4446-9b0c-7ae1e28cefcf	9ee87fae-42c8-4105-8298-4851d17528fa	639ce007	086c62cb-273f-4290-a535-096c8820e6be	-160.00	500.00	340.00	Purchase: TXN-1759147464317	2025-09-29 12:04:24.284507
5949516d-6dd9-40e1-bd4a-01af8d15011a	9ee87fae-42c8-4105-8298-4851d17528fa	639ce007	0d8e7777-ef72-4377-af30-e886f4a414c9	-120.00	340.00	220.00	Purchase: TXN-1759147538573	2025-09-29 12:05:38.542706
15f323b2-8336-4ff6-80a5-14f34f42f313	9ee87fae-42c8-4105-8298-4851d17528fa	639ce007	903b140d-1ec8-4d37-b988-1b5f8ed0e5a1	-40.00	220.00	180.00	Purchase: TXN-1759147557420	2025-09-29 12:05:57.385184
b48c6a30-d1bf-4d5f-ad78-9b1ed9b48022	9ee87fae-42c8-4105-8298-4851d17528fa	639ce007	3260d97f-354d-498b-b5fd-f8444ae4767a	-120.00	180.00	60.00	Purchase: TXN-1759148377685	2025-09-29 12:19:37.654361
7ee766c2-507b-41dd-b634-a8690f08d75f	9ee87fae-42c8-4105-8298-4851d17528fa	639ce007	8e2b49fe-8faa-4543-a03a-fa2b44da9e3b	-220.00	500.00	280.00	Purchase: TXN-1759149717849	2025-09-29 12:41:57.856579
39ab84df-6d4c-4898-b47a-0a1a27ba9a1d	9ee87fae-42c8-4105-8298-4851d17528fa	639ce007	d6655417-bf4b-4938-985f-8222eea322f1	0.00	280.00	280.00	Manual payment: TXN-1759149784728	2025-09-29 12:43:04.729777
c5d478e5-198d-4f4e-8980-a5c5445d9237	9ee87fae-42c8-4105-8298-4851d17528fa	639ce007	2a2b48db-635c-4816-a200-c606732adf81	-120.00	280.00	160.00	Purchase: TXN-1759149982744	2025-09-29 12:46:22.7565
\.


--
-- TOC entry 4478 (class 0 OID 27187)
-- Dependencies: 229
-- Data for Name: book_copies; Type: TABLE DATA; Schema: public; Owner: vidda_postgre
--

COPY public.book_copies (id, book_id, barcode, condition, is_available, notes, created_at, updated_at) FROM stdin;
161e90c5-e305-431e-a0b2-9890052b4528	9231faa5-2a87-45da-b4b6-2f01f102915f	9231faa5-2a87-45da-b4b6-2f01f102915f-002	Good	t	\N	2025-09-29 15:31:32.708078	2025-09-29 15:31:32.708078
37f339dd-80ee-44f9-83ab-a6fafc45f5cf	9231faa5-2a87-45da-b4b6-2f01f102915f	9231faa5-2a87-45da-b4b6-2f01f102915f-003	Good	t	\N	2025-09-29 15:31:32.708078	2025-09-29 15:31:32.708078
c1df2b93-b628-45b5-a723-c335d0511626	9231faa5-2a87-45da-b4b6-2f01f102915f	9231faa5-2a87-45da-b4b6-2f01f102915f-004	Good	t	\N	2025-09-29 15:31:32.708078	2025-09-29 15:31:32.708078
419e8bbb-9303-49af-b579-c92f7cfaac2a	9231faa5-2a87-45da-b4b6-2f01f102915f	9231faa5-2a87-45da-b4b6-2f01f102915f-005	Good	t	\N	2025-09-29 15:31:32.708078	2025-09-29 15:31:32.708078
a6405926-d0c4-49ea-ab97-01b4e71000e3	9231faa5-2a87-45da-b4b6-2f01f102915f	9231faa5-2a87-45da-b4b6-2f01f102915f-006	Good	t	\N	2025-09-29 15:31:32.708078	2025-09-29 15:31:32.708078
98f2708b-13aa-45d2-8f63-3ad9c120edef	9231faa5-2a87-45da-b4b6-2f01f102915f	9231faa5-2a87-45da-b4b6-2f01f102915f-007	Good	t	\N	2025-09-29 15:31:32.708078	2025-09-29 15:31:32.708078
24c8a4b4-e5e0-42a2-839f-50159f0485ef	9231faa5-2a87-45da-b4b6-2f01f102915f	9231faa5-2a87-45da-b4b6-2f01f102915f-008	Good	t	\N	2025-09-29 15:31:32.708078	2025-09-29 15:31:32.708078
74d3c20c-2343-4c3f-a70a-3f897b51d01f	9231faa5-2a87-45da-b4b6-2f01f102915f	9231faa5-2a87-45da-b4b6-2f01f102915f-009	Good	t	\N	2025-09-29 15:31:32.708078	2025-09-29 15:31:32.708078
2f9004f8-d149-48b0-8f7f-89c99cb53dee	9231faa5-2a87-45da-b4b6-2f01f102915f	9231faa5-2a87-45da-b4b6-2f01f102915f-010	Good	t	\N	2025-09-29 15:31:32.708078	2025-09-29 15:31:32.708078
556bd7b8-fc9d-4593-a236-1d7ec8c15e1c	9231faa5-2a87-45da-b4b6-2f01f102915f	9231faa5-2a87-45da-b4b6-2f01f102915f-011	Good	t	\N	2025-09-29 15:31:32.708078	2025-09-29 15:31:32.708078
d3bd8c48-a94d-4673-848a-8463693252e9	9231faa5-2a87-45da-b4b6-2f01f102915f	9231faa5-2a87-45da-b4b6-2f01f102915f-012	Good	t	\N	2025-09-29 15:31:32.708078	2025-09-29 15:31:32.708078
48761c82-f65b-4bf2-bc14-d41b94bf2ca9	9231faa5-2a87-45da-b4b6-2f01f102915f	9231faa5-2a87-45da-b4b6-2f01f102915f-013	Good	t	\N	2025-09-29 15:31:32.708078	2025-09-29 15:31:32.708078
cd8e40ff-238f-4c8e-ab87-89f8e32360c1	9231faa5-2a87-45da-b4b6-2f01f102915f	9231faa5-2a87-45da-b4b6-2f01f102915f-014	Good	t	\N	2025-09-29 15:31:32.708078	2025-09-29 15:31:32.708078
d746045c-19d2-4f24-bd08-df46691545eb	9231faa5-2a87-45da-b4b6-2f01f102915f	9231faa5-2a87-45da-b4b6-2f01f102915f-015	Good	t	\N	2025-09-29 15:31:32.708078	2025-09-29 15:31:32.708078
ee4ba74c-1c5f-4c2c-8729-4936e5fc1d6a	9231faa5-2a87-45da-b4b6-2f01f102915f	9231faa5-2a87-45da-b4b6-2f01f102915f-001	Good	t	\N	2025-09-29 15:31:32.708078	2025-09-29 18:38:39.250603
\.


--
-- TOC entry 4479 (class 0 OID 27206)
-- Dependencies: 230
-- Data for Name: book_loans; Type: TABLE DATA; Schema: public; Owner: vidda_postgre
--

COPY public.book_loans (id, student_id, book_copy_id, borrowed_at, due_date, returned_at, return_condition, status, notes, created_at, updated_at) FROM stdin;
cedacfe1-08e7-4f16-a6b0-64157f10238a	9ee87fae-42c8-4105-8298-4851d17528fa	ee4ba74c-1c5f-4c2c-8729-4936e5fc1d6a	2025-09-29 17:12:54.799465	2025-10-13	2025-09-29 00:00:00	\N	returned	Checked out via library system | Return: Returned on time	2025-09-29 17:12:54.799465	2025-09-29 17:20:27.61865
dfb4327d-517f-44b1-aca0-645abfbc88ad	9ee87fae-42c8-4105-8298-4851d17528fa	ee4ba74c-1c5f-4c2c-8729-4936e5fc1d6a	2025-09-29 17:22:35.416859	2025-09-28	2025-09-29 00:00:00	\N	returned	Checked out via library system | Return: Returned 2 days late	2025-09-29 17:22:35.416859	2025-09-29 17:46:32.510185
77097d5a-8f00-4610-b20e-9da4228d4b9c	9ee87fae-42c8-4105-8298-4851d17528fa	ee4ba74c-1c5f-4c2c-8729-4936e5fc1d6a	2025-09-29 18:33:27.95289	2025-09-28	2025-09-29 00:00:00	\N	returned	Checked out via library system | Return: Returned 3 days late	2025-09-29 18:33:27.95289	2025-09-29 18:38:39.250603
\.


--
-- TOC entry 4477 (class 0 OID 27168)
-- Dependencies: 228
-- Data for Name: books; Type: TABLE DATA; Schema: public; Owner: vidda_postgre
--

COPY public.books (id, isbn, title, author, publisher, publication_year, category, description, location, total_copies, available_copies, created_at, updated_at) FROM stdin;
9231faa5-2a87-45da-b4b6-2f01f102915f	22222212121	Madol Duwa	Martin Wickramasinghe	Akura	1987	Novel	Madol duwa	Novels Section	15	15	2025-09-29 15:31:32.708078	2025-09-29 18:51:31.067708
\.


--
-- TOC entry 4476 (class 0 OID 27144)
-- Dependencies: 227
-- Data for Name: canteen_transaction_items; Type: TABLE DATA; Schema: public; Owner: vidda_postgre
--

COPY public.canteen_transaction_items (id, transaction_id, menu_item_id, quantity, unit_price, total_price, created_at) FROM stdin;
108ac0b7-1347-4033-ab3c-1ee87f08639a	98065f4f-544b-4482-b411-1955f7bdd353	7a278119-5685-48d9-a81c-3facf4f2980f	1	150.00	150.00	2025-09-29 09:50:51.457524
5c0c285d-f884-485e-b881-804b2e6a234b	98065f4f-544b-4482-b411-1955f7bdd353	1e3af7fa-aa5e-44f3-b9bc-b7c51ed1a895	1	40.00	40.00	2025-09-29 09:50:51.457524
8be3ec3a-2d1d-4399-8fb1-8c90b10acb4f	98065f4f-544b-4482-b411-1955f7bdd353	6a6c7c5f-1f1e-4cea-b828-2d5673b188a3	1	70.00	70.00	2025-09-29 09:50:51.457524
66d6476b-011b-4a7e-a4e5-693fddeee053	086c62cb-273f-4290-a535-096c8820e6be	1e3af7fa-aa5e-44f3-b9bc-b7c51ed1a895	4	40.00	160.00	2025-09-29 12:04:24.284507
125c9c71-69d2-4f1e-a351-f9c89a1d7d99	0d8e7777-ef72-4377-af30-e886f4a414c9	1e3af7fa-aa5e-44f3-b9bc-b7c51ed1a895	3	40.00	120.00	2025-09-29 12:05:38.542706
6dda2cd4-cf50-447f-b4dc-77714b11de11	903b140d-1ec8-4d37-b988-1b5f8ed0e5a1	1e3af7fa-aa5e-44f3-b9bc-b7c51ed1a895	1	40.00	40.00	2025-09-29 12:05:57.385184
00127ebc-3b8a-474d-ab87-2f354883971d	3260d97f-354d-498b-b5fd-f8444ae4767a	1e3af7fa-aa5e-44f3-b9bc-b7c51ed1a895	3	40.00	120.00	2025-09-29 12:19:37.654361
4a9bc4eb-df46-4f52-aacd-b2e772beb678	8e2b49fe-8faa-4543-a03a-fa2b44da9e3b	1e3af7fa-aa5e-44f3-b9bc-b7c51ed1a895	2	40.00	80.00	2025-09-29 12:41:57.856579
0710eec7-f6a8-414b-b815-6dd160a30237	8e2b49fe-8faa-4543-a03a-fa2b44da9e3b	6a6c7c5f-1f1e-4cea-b828-2d5673b188a3	2	70.00	140.00	2025-09-29 12:41:57.856579
d24a10c6-8cdc-4af9-bcc4-a5e5027b83b5	d6655417-bf4b-4938-985f-8222eea322f1	6a6c7c5f-1f1e-4cea-b828-2d5673b188a3	8	70.00	560.00	2025-09-29 12:43:04.729777
68d1f745-0607-450f-8fa8-cfb2ed3bafed	2a2b48db-635c-4816-a200-c606732adf81	1e3af7fa-aa5e-44f3-b9bc-b7c51ed1a895	3	40.00	120.00	2025-09-29 12:46:22.7565
\.


--
-- TOC entry 4473 (class 0 OID 27092)
-- Dependencies: 224
-- Data for Name: canteen_transactions; Type: TABLE DATA; Schema: public; Owner: vidda_postgre
--

COPY public.canteen_transactions (id, student_id, card_id, amount, transaction_date, description, created_at, updated_at, transaction_id, status, payment_method) FROM stdin;
98065f4f-544b-4482-b411-1955f7bdd353	e49fa1f0-d1eb-4ef7-abaa-0d6ea2f57aeb	b37f0608	260.00	2025-09-29 09:50:51.457524	Canteen purchase - 3 items	2025-09-29 09:50:51.457524	2025-09-29 09:50:51.457524	TXN-1759139451509	completed	RFID
086c62cb-273f-4290-a535-096c8820e6be	9ee87fae-42c8-4105-8298-4851d17528fa	639ce007	160.00	2025-09-29 12:04:24.284507	Canteen purchase - 1 items	2025-09-29 12:04:24.284507	2025-09-29 12:04:24.284507	TXN-1759147464317	completed	RFID
0d8e7777-ef72-4377-af30-e886f4a414c9	9ee87fae-42c8-4105-8298-4851d17528fa	639ce007	120.00	2025-09-29 12:05:38.542706	Canteen purchase - 1 items	2025-09-29 12:05:38.542706	2025-09-29 12:05:38.542706	TXN-1759147538573	completed	RFID
903b140d-1ec8-4d37-b988-1b5f8ed0e5a1	9ee87fae-42c8-4105-8298-4851d17528fa	639ce007	40.00	2025-09-29 12:05:57.385184	Canteen purchase - 1 items	2025-09-29 12:05:57.385184	2025-09-29 12:05:57.385184	TXN-1759147557420	completed	RFID
3260d97f-354d-498b-b5fd-f8444ae4767a	9ee87fae-42c8-4105-8298-4851d17528fa	639ce007	120.00	2025-09-29 12:19:37.654361	Canteen purchase - 1 items	2025-09-29 12:19:37.654361	2025-09-29 12:19:37.654361	TXN-1759148377685	completed	RFID
8e2b49fe-8faa-4543-a03a-fa2b44da9e3b	9ee87fae-42c8-4105-8298-4851d17528fa	639ce007	220.00	2025-09-29 12:41:57.856579	Canteen purchase - 2 items	2025-09-29 12:41:57.856579	2025-09-29 12:41:57.856579	TXN-1759149717849	completed	RFID
d6655417-bf4b-4938-985f-8222eea322f1	9ee87fae-42c8-4105-8298-4851d17528fa	639ce007	560.00	2025-09-29 12:43:04.729777	Manual payment - 1 items (Paid: Rs.560)	2025-09-29 12:43:04.729777	2025-09-29 12:43:04.729777	TXN-1759149784728	completed	RFID
2a2b48db-635c-4816-a200-c606732adf81	9ee87fae-42c8-4105-8298-4851d17528fa	639ce007	120.00	2025-09-29 12:46:22.7565	Canteen purchase - 1 items	2025-09-29 12:46:22.7565	2025-09-29 12:46:22.7565	TXN-1759149982744	completed	RFID
\.


--
-- TOC entry 4483 (class 0 OID 27396)
-- Dependencies: 240
-- Data for Name: course_schedules; Type: TABLE DATA; Schema: public; Owner: vidda_postgre
--

COPY public.course_schedules (id, course_id, day_of_week, start_time, end_time, room, created_at, updated_at) FROM stdin;
e7b15c27-1c92-420e-8add-e35fd3375238	f653812d-7af8-4b8f-9f72-06c7492eca41	0	09:00:00	11:00:00	Room 101	2025-09-25 11:30:26.067895+00	2025-09-25 11:30:26.067895+00
1da08888-2f03-4d98-aafa-006a86796ee6	f653812d-7af8-4b8f-9f72-06c7492eca41	2	14:00:00	16:00:00	Room 201	2025-09-25 11:30:26.067895+00	2025-09-25 11:30:26.067895+00
\.


--
-- TOC entry 4468 (class 0 OID 27008)
-- Dependencies: 219
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: vidda_postgre
--

COPY public.courses (id, course_code, course_name, faculty, year, credits, created_at, updated_at) FROM stdin;
f653812d-7af8-4b8f-9f72-06c7492eca41	CMT 2202	Communication Skills III	Faculty of Technology	2	1	2025-09-24 19:51:06.36126	2025-09-24 19:51:06.36126
\.


--
-- TOC entry 4475 (class 0 OID 27132)
-- Dependencies: 226
-- Data for Name: daily_sales; Type: TABLE DATA; Schema: public; Owner: vidda_postgre
--

COPY public.daily_sales (id, date, total_transactions, total_revenue, created_at, updated_at) FROM stdin;
f407fc4d-4bc4-4260-a8f5-22544061c1c6	2025-09-24	0	0.00	2025-09-24 07:06:01.307784	2025-09-24 07:06:01.307784
\.


--
-- TOC entry 4482 (class 0 OID 27283)
-- Dependencies: 233
-- Data for Name: exam_results; Type: TABLE DATA; Schema: public; Owner: vidda_postgre
--

COPY public.exam_results (id, student_id, course_id, exam_date, grade, remarks, published_at) FROM stdin;
cb49e0a8-8f8f-453a-a85b-f9d2cd4ab9d9	9ee87fae-42c8-4105-8298-4851d17528fa	f653812d-7af8-4b8f-9f72-06c7492eca41	2000-05-24	A	\N	2025-09-29 09:06:31.849881
b9783b43-5b61-45f8-92a5-51d06af757bd	e49fa1f0-d1eb-4ef7-abaa-0d6ea2f57aeb	f653812d-7af8-4b8f-9f72-06c7492eca41	2000-05-24	B	\N	2025-09-29 09:06:32.386485
\.


--
-- TOC entry 4470 (class 0 OID 27037)
-- Dependencies: 221
-- Data for Name: lecturer_courses; Type: TABLE DATA; Schema: public; Owner: vidda_postgre
--

COPY public.lecturer_courses (id, lecturer_id, course_id, assigned_at) FROM stdin;
30de4df7-a36e-40f8-8f43-7816e821adb2	e0da8665-8d47-4557-9b8c-3c764aaf0e19	f653812d-7af8-4b8f-9f72-06c7492eca41	2025-09-24 23:29:02.493074
\.


--
-- TOC entry 4466 (class 0 OID 26971)
-- Dependencies: 217
-- Data for Name: lecturers; Type: TABLE DATA; Schema: public; Owner: vidda_postgre
--

COPY public.lecturers (id, user_id, staff_id, nic_no, full_name, initial_name, email, faculty, "position", specialization, address, phone, photo, date_of_birth, created_at, updated_at) FROM stdin;
e0da8665-8d47-4557-9b8c-3c764aaf0e19	63168bcc-214a-4351-8cf7-1b4088138aff	STAFF2022081	2000145019731	Demo Lecturer 1	D. Lecturer 1	lecturer2@rfid.com	Faculty of Technology	Temporary Lecturer	Masters	76 1 Colombo	94770618957	\N	1995-05-24	2025-09-24 21:12:44.870324	2025-09-24 23:29:48.535246
\.


--
-- TOC entry 4480 (class 0 OID 27238)
-- Dependencies: 231
-- Data for Name: library_fines; Type: TABLE DATA; Schema: public; Owner: vidda_postgre
--

COPY public.library_fines (id, student_id, loan_id, amount, reason, status, created_at, paid_at, paid_by, notes) FROM stdin;
75017539-519d-4d41-bab3-f2a55a6e6169	9ee87fae-42c8-4105-8298-4851d17528fa	dfb4327d-517f-44b1-aca0-645abfbc88ad	10.00	Late return fine - 2 days overdue	paid	2025-09-29 00:00:00	2025-09-29 00:00:01	\N	\N
171585f5-edbc-4704-b013-10caa626a414	9ee87fae-42c8-4105-8298-4851d17528fa	77097d5a-8f00-4610-b20e-9da4228d4b9c	15.00	Late return fine - 2 days overdue	paid	2025-09-29 00:00:00	\N	\N	\N
\.


--
-- TOC entry 4481 (class 0 OID 27263)
-- Dependencies: 232
-- Data for Name: library_members; Type: TABLE DATA; Schema: public; Owner: vidda_postgre
--

COPY public.library_members (id, student_id, membership_date, membership_status, max_books_allowed, notes, created_at, updated_at) FROM stdin;
aa0b2237-34df-4698-8fc9-914071a68946	9ee87fae-42c8-4105-8298-4851d17528fa	2025-09-29 08:30:34.368573	active	5	\N	2025-09-29 08:30:34.368573	2025-09-29 08:30:34.368573
6a8803f8-c27b-44f4-953a-d9316b62316e	e49fa1f0-d1eb-4ef7-abaa-0d6ea2f57aeb	2025-09-29 08:35:53.544471	active	5	\N	2025-09-29 08:35:53.544471	2025-09-29 08:35:53.544471
\.


--
-- TOC entry 4472 (class 0 OID 27079)
-- Dependencies: 223
-- Data for Name: menu_items; Type: TABLE DATA; Schema: public; Owner: vidda_postgre
--

COPY public.menu_items (id, name, category, price, description, is_available, is_active, created_at, updated_at) FROM stdin;
6a6c7c5f-1f1e-4cea-b828-2d5673b188a3	Yogurt	Dessert	70.00	\N	t	t	2025-09-24 09:33:32.26621	2025-09-24 09:34:02.899106
1e3af7fa-aa5e-44f3-b9bc-b7c51ed1a895	Parata	Main	40.00	\N	t	t	2025-09-24 09:33:49.75502	2025-09-24 09:34:08.602548
7a278119-5685-48d9-a81c-3facf4f2980f	Fried Rice	Main	150.00	Chicken + Yellow Rice + Chillie Paste	f	t	2025-09-24 07:30:59.813266	2025-09-29 12:02:38.444935
\.


--
-- TOC entry 4484 (class 0 OID 27422)
-- Dependencies: 241
-- Data for Name: nfc_attendance_log; Type: TABLE DATA; Schema: public; Owner: vidda_postgre
--

COPY public.nfc_attendance_log (id, attendance_id, card_uid, reader_name, swipe_timestamp, student_id, course_id, lecturer_id, created_at) FROM stdin;
d762c911-ca48-4666-ba2b-47fa95f15f69	2fc6a872-e17c-4363-b9a3-91301aefa764	639ce007	ACS ACR122U 00 00	2025-09-29 14:19:02.991	9ee87fae-42c8-4105-8298-4851d17528fa	f653812d-7af8-4b8f-9f72-06c7492eca41	e0da8665-8d47-4557-9b8c-3c764aaf0e19	2025-09-29 08:49:03.804044
8a616e64-a2ca-47fa-b135-e663e4408db2	dca0d09a-41ff-4958-82ea-7daa0f58b47a	b37f0608	ACS ACR122U 00 00	2025-09-29 14:19:13.831	e49fa1f0-d1eb-4ef7-abaa-0d6ea2f57aeb	f653812d-7af8-4b8f-9f72-06c7492eca41	e0da8665-8d47-4557-9b8c-3c764aaf0e19	2025-09-29 08:49:14.216755
\.


--
-- TOC entry 4485 (class 0 OID 27650)
-- Dependencies: 242
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: vidda_postgre
--

COPY public.password_reset_tokens (id, user_id, token, expires_at, used, created_at, updated_at) FROM stdin;
2b5522ba-bc14-4ecc-831b-fb4d17587f0b	e49fa1f0-d1eb-4ef7-abaa-0d6ea2f57aeb	d071e12a28a4ec07da18be8b1863772c6ec81641845019c7ec8b82dc4d793521	2025-10-01 02:25:28.972	t	2025-09-29 20:55:29.329749	2025-09-29 20:56:44.392676
\.


--
-- TOC entry 4467 (class 0 OID 26992)
-- Dependencies: 218
-- Data for Name: rfid_cards; Type: TABLE DATA; Schema: public; Owner: vidda_postgre
--

COPY public.rfid_cards (id, card_uid, assigned_student, assigned_date, status, balance, created_at, updated_at) FROM stdin;
80706d84-2a8d-4562-902b-bd48f45d8e79	b37f0608	e49fa1f0-d1eb-4ef7-abaa-0d6ea2f57aeb	2025-09-29 08:40:53.641	ACTIVE	500.00	2025-09-29 08:40:53.672946	2025-09-29 12:41:14.180412
e4d32265-6db1-4de4-9222-fb60df3c2128	639ce007	9ee87fae-42c8-4105-8298-4851d17528fa	2025-09-29 08:31:03.301	ACTIVE	160.00	2025-09-29 08:31:03.312701	2025-09-29 12:46:22.7565
\.


--
-- TOC entry 4469 (class 0 OID 27018)
-- Dependencies: 220
-- Data for Name: student_courses; Type: TABLE DATA; Schema: public; Owner: vidda_postgre
--

COPY public.student_courses (id, student_id, course_id, enrolled_at) FROM stdin;
75322787-9fa0-40ee-996a-85306fc17ae0	e49fa1f0-d1eb-4ef7-abaa-0d6ea2f57aeb	f653812d-7af8-4b8f-9f72-06c7492eca41	2025-09-29 08:45:24.811943
738efa41-132c-4b41-9d98-6caee4d402f5	9ee87fae-42c8-4105-8298-4851d17528fa	f653812d-7af8-4b8f-9f72-06c7492eca41	2025-09-29 08:45:35.037703
\.


--
-- TOC entry 4465 (class 0 OID 26950)
-- Dependencies: 216
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: vidda_postgre
--

COPY public.students (id, user_id, register_number, full_name, initial_name, nic_no, email, faculty, year_of_study, address, phone, photo, date_of_birth, created_at, updated_at) FROM stdin;
20687802-74b7-4fbd-8189-9a40ab7cbbc1	9ee87fae-42c8-4105-8298-4851d17528fa	ITT/2022/050	Kalupahana Anuhas	K.Anuhas	20001250912	sdasun359@gmail.com	tec	2	MIhintale 485/2	07701223234	\N	2002-02-10	2025-09-29 08:30:34.368573	2025-09-29 08:30:34.368573
49def88f-691d-4178-af37-2e6a16187340	e49fa1f0-d1eb-4ef7-abaa-0d6ea2f57aeb	ITT/2022/085	Vidula Deneth Salwathura	W W V D S PERERA	200014501974	viduladenethsalwathura@gmail.com	tec	2	76/1 Wennawththa Wellampitiya	+94770718957	\N	2000-05-24	2025-09-29 08:35:53.544471	2025-09-29 08:35:53.544471
\.


--
-- TOC entry 4464 (class 0 OID 26937)
-- Dependencies: 215
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: vidda_postgre
--

COPY public.users (id, email, name, password, role, email_verified, created_at, updated_at) FROM stdin;
2da20088-377b-4993-89b0-32c2ab00af15	user1@rfid.com	Alice Johnson	$2b$10$8e9f0g1h2i3j4k5l6m7n8o9p0q1r2s3t4u5v6w7x8y9z0a1b2c3d4e	USER	\N	2025-09-24 10:00:54.32575	2025-09-24 10:00:54.32575
a5d1c216-1ba5-49f5-9eb2-753cbe1c40c8	admin@rfid.com	Admin User	$2a$12$ZFBLPJa3UTJRkovSJuLvMukbgGCrKUitu904OCo2F5RYANgGWrCGe	ADMIN	2025-09-24 10:00:54.32575	2025-09-24 10:00:54.32575	2025-09-24 10:03:14.990198
48069910-0f02-473d-92ac-bff799292725	student1@rfid.com	John Doe	$2a$12$qsQbA6sbiJb.7V5MKIvZde83SOa/395RvZfdfDg2DSh8LD7l6Zid2	STUDENT	\N	2025-09-24 10:00:54.32575	2025-09-24 19:09:29.649418
baf2b008-5d28-4b2c-ae29-0248ef614fed	librarian1@rfid.com	Emma Brown	$2a$12$ln1Fiuz89oygAKN./fReG.wmNUln.nZ6LJ/J0oSP24K31AAys3/Jy	LIBRARIAN	\N	2025-09-24 10:00:54.32575	2025-09-24 19:13:45.737502
c5beafba-873f-4195-a003-23178a28cd19	lecturer1@rfid.com	Jane Smith	$2a$12$sl.BWcHUGn/noHUwxLa00.tVP6UQsxgw.JP.0ycOWVzcFEVFr3ssm	LECTURER	2025-09-24 10:00:54.32575	2025-09-24 10:00:54.32575	2025-09-24 19:17:47.025261
63168bcc-214a-4351-8cf7-1b4088138aff	lecturer2@rfid.com	Demo Lecturer 1	$2a$12$ynNGB9RLAFqvIe8sxtOyIeZaFE4Xq3W1EVQZr5Ihdq461VHqbxIUO	LECTURER	\N	2025-09-24 21:12:44.870324	2025-09-25 12:11:22.566579
9ee87fae-42c8-4105-8298-4851d17528fa	sdasun359@gmail.com	Kalupahana Anuhas	$2b$10$GF1tC.YiHyDTQMq5OszMFOVDnSj4nC24Qgzf16LxoTGy.QF7mt2lS	STUDENT	\N	2025-09-29 08:30:34.368573	2025-09-29 08:30:34.368573
36a290ea-60da-4418-8683-4f8737922628	canteen@rfid.com	canteenAdmin	$2a$12$OHs94ALMpH5lo7c1B8vz8enV2Jv6Xb1DlBCBUT6Nzb09mBlF/euTa	CANTEEN	\N	2025-09-29 20:29:10.068164	2025-09-29 20:29:10.068164
e49fa1f0-d1eb-4ef7-abaa-0d6ea2f57aeb	viduladenethsalwathura@gmail.com	Vidula Deneth Salwathura	$2b$12$d7ocQSsWfSTzzbzAUeqdxuCDfHOvPXfJTx8AwACDqVE9BPkV4sTcK	STUDENT	\N	2025-09-29 08:35:53.544471	2025-09-29 20:56:44.174688
\.


--
-- TOC entry 4184 (class 2606 OID 27063)
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- TOC entry 4202 (class 2606 OID 27116)
-- Name: balance_history balance_history_pkey; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.balance_history
    ADD CONSTRAINT balance_history_pkey PRIMARY KEY (id);


--
-- TOC entry 4223 (class 2606 OID 27200)
-- Name: book_copies book_copies_barcode_key; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.book_copies
    ADD CONSTRAINT book_copies_barcode_key UNIQUE (barcode);


--
-- TOC entry 4225 (class 2606 OID 27198)
-- Name: book_copies book_copies_pkey; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.book_copies
    ADD CONSTRAINT book_copies_pkey PRIMARY KEY (id);


--
-- TOC entry 4230 (class 2606 OID 27217)
-- Name: book_loans book_loans_pkey; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.book_loans
    ADD CONSTRAINT book_loans_pkey PRIMARY KEY (id);


--
-- TOC entry 4215 (class 2606 OID 27181)
-- Name: books books_isbn_key; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_isbn_key UNIQUE (isbn);


--
-- TOC entry 4217 (class 2606 OID 27179)
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (id);


--
-- TOC entry 4211 (class 2606 OID 27153)
-- Name: canteen_transaction_items canteen_transaction_items_pkey; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.canteen_transaction_items
    ADD CONSTRAINT canteen_transaction_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4194 (class 2606 OID 27102)
-- Name: canteen_transactions canteen_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.canteen_transactions
    ADD CONSTRAINT canteen_transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 4196 (class 2606 OID 27167)
-- Name: canteen_transactions canteen_transactions_transaction_id_key; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.canteen_transactions
    ADD CONSTRAINT canteen_transactions_transaction_id_key UNIQUE (transaction_id);


--
-- TOC entry 4249 (class 2606 OID 27405)
-- Name: course_schedules course_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.course_schedules
    ADD CONSTRAINT course_schedules_pkey PRIMARY KEY (id);


--
-- TOC entry 4167 (class 2606 OID 27017)
-- Name: courses courses_course_code_key; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_course_code_key UNIQUE (course_code);


--
-- TOC entry 4169 (class 2606 OID 27015)
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- TOC entry 4206 (class 2606 OID 27143)
-- Name: daily_sales daily_sales_date_key; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.daily_sales
    ADD CONSTRAINT daily_sales_date_key UNIQUE (date);


--
-- TOC entry 4208 (class 2606 OID 27141)
-- Name: daily_sales daily_sales_pkey; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.daily_sales
    ADD CONSTRAINT daily_sales_pkey PRIMARY KEY (id);


--
-- TOC entry 4245 (class 2606 OID 27291)
-- Name: exam_results exam_results_pkey; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.exam_results
    ADD CONSTRAINT exam_results_pkey PRIMARY KEY (id);


--
-- TOC entry 4180 (class 2606 OID 27045)
-- Name: lecturer_courses lecturer_courses_lecturer_id_course_id_key; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.lecturer_courses
    ADD CONSTRAINT lecturer_courses_lecturer_id_course_id_key UNIQUE (lecturer_id, course_id);


--
-- TOC entry 4182 (class 2606 OID 27043)
-- Name: lecturer_courses lecturer_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.lecturer_courses
    ADD CONSTRAINT lecturer_courses_pkey PRIMARY KEY (id);


--
-- TOC entry 4153 (class 2606 OID 26986)
-- Name: lecturers lecturers_email_key; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.lecturers
    ADD CONSTRAINT lecturers_email_key UNIQUE (email);


--
-- TOC entry 4155 (class 2606 OID 26980)
-- Name: lecturers lecturers_pkey; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.lecturers
    ADD CONSTRAINT lecturers_pkey PRIMARY KEY (id);


--
-- TOC entry 4157 (class 2606 OID 26984)
-- Name: lecturers lecturers_staff_id_key; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.lecturers
    ADD CONSTRAINT lecturers_staff_id_key UNIQUE (staff_id);


--
-- TOC entry 4159 (class 2606 OID 26982)
-- Name: lecturers lecturers_user_id_key; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.lecturers
    ADD CONSTRAINT lecturers_user_id_key UNIQUE (user_id);


--
-- TOC entry 4238 (class 2606 OID 27247)
-- Name: library_fines library_fines_pkey; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.library_fines
    ADD CONSTRAINT library_fines_pkey PRIMARY KEY (id);


--
-- TOC entry 4241 (class 2606 OID 27275)
-- Name: library_members library_members_pkey; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.library_members
    ADD CONSTRAINT library_members_pkey PRIMARY KEY (id);


--
-- TOC entry 4243 (class 2606 OID 27277)
-- Name: library_members library_members_student_id_key; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.library_members
    ADD CONSTRAINT library_members_student_id_key UNIQUE (student_id);


--
-- TOC entry 4192 (class 2606 OID 27091)
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4260 (class 2606 OID 27429)
-- Name: nfc_attendance_log nfc_attendance_log_pkey; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.nfc_attendance_log
    ADD CONSTRAINT nfc_attendance_log_pkey PRIMARY KEY (id);


--
-- TOC entry 4265 (class 2606 OID 27658)
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4267 (class 2606 OID 27660)
-- Name: password_reset_tokens password_reset_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_key UNIQUE (token);


--
-- TOC entry 4163 (class 2606 OID 27002)
-- Name: rfid_cards rfid_cards_card_uid_key; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.rfid_cards
    ADD CONSTRAINT rfid_cards_card_uid_key UNIQUE (card_uid);


--
-- TOC entry 4165 (class 2606 OID 27000)
-- Name: rfid_cards rfid_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.rfid_cards
    ADD CONSTRAINT rfid_cards_pkey PRIMARY KEY (id);


--
-- TOC entry 4174 (class 2606 OID 27024)
-- Name: student_courses student_courses_pkey; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.student_courses
    ADD CONSTRAINT student_courses_pkey PRIMARY KEY (id);


--
-- TOC entry 4176 (class 2606 OID 27026)
-- Name: student_courses student_courses_student_id_course_id_key; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.student_courses
    ADD CONSTRAINT student_courses_student_id_course_id_key UNIQUE (student_id, course_id);


--
-- TOC entry 4143 (class 2606 OID 26965)
-- Name: students students_email_key; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_email_key UNIQUE (email);


--
-- TOC entry 4145 (class 2606 OID 26959)
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- TOC entry 4147 (class 2606 OID 26963)
-- Name: students students_register_number_key; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_register_number_key UNIQUE (register_number);


--
-- TOC entry 4149 (class 2606 OID 26961)
-- Name: students students_user_id_key; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_user_id_key UNIQUE (user_id);


--
-- TOC entry 4254 (class 2606 OID 27407)
-- Name: course_schedules unique_course_schedule; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.course_schedules
    ADD CONSTRAINT unique_course_schedule UNIQUE (course_id, day_of_week, start_time);


--
-- TOC entry 4136 (class 2606 OID 26949)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4138 (class 2606 OID 26947)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4185 (class 1259 OID 27315)
-- Name: idx_attendance_course_id; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_attendance_course_id ON public.attendance USING btree (course_id);


--
-- TOC entry 4186 (class 1259 OID 27316)
-- Name: idx_attendance_date; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_attendance_date ON public.attendance USING btree (date);


--
-- TOC entry 4187 (class 1259 OID 27314)
-- Name: idx_attendance_student_id; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_attendance_student_id ON public.attendance USING btree (student_id);


--
-- TOC entry 4203 (class 1259 OID 27341)
-- Name: idx_balance_history_card_id; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_balance_history_card_id ON public.balance_history USING btree (card_id);


--
-- TOC entry 4204 (class 1259 OID 27340)
-- Name: idx_balance_history_student_id; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_balance_history_student_id ON public.balance_history USING btree (student_id);


--
-- TOC entry 4226 (class 1259 OID 27325)
-- Name: idx_book_copies_available; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_book_copies_available ON public.book_copies USING btree (is_available);


--
-- TOC entry 4227 (class 1259 OID 27324)
-- Name: idx_book_copies_barcode; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_book_copies_barcode ON public.book_copies USING btree (barcode);


--
-- TOC entry 4228 (class 1259 OID 27323)
-- Name: idx_book_copies_book_id; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_book_copies_book_id ON public.book_copies USING btree (book_id);


--
-- TOC entry 4231 (class 1259 OID 27327)
-- Name: idx_book_loans_book_copy_id; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_book_loans_book_copy_id ON public.book_loans USING btree (book_copy_id);


--
-- TOC entry 4232 (class 1259 OID 27329)
-- Name: idx_book_loans_due_date; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_book_loans_due_date ON public.book_loans USING btree (due_date);


--
-- TOC entry 4233 (class 1259 OID 27328)
-- Name: idx_book_loans_status; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_book_loans_status ON public.book_loans USING btree (status);


--
-- TOC entry 4234 (class 1259 OID 27326)
-- Name: idx_book_loans_student_id; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_book_loans_student_id ON public.book_loans USING btree (student_id);


--
-- TOC entry 4218 (class 1259 OID 27321)
-- Name: idx_books_author; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_books_author ON public.books USING btree (author);


--
-- TOC entry 4219 (class 1259 OID 27322)
-- Name: idx_books_category; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_books_category ON public.books USING btree (category);


--
-- TOC entry 4220 (class 1259 OID 27319)
-- Name: idx_books_isbn; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_books_isbn ON public.books USING btree (isbn);


--
-- TOC entry 4221 (class 1259 OID 27320)
-- Name: idx_books_title; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_books_title ON public.books USING btree (title);


--
-- TOC entry 4212 (class 1259 OID 27339)
-- Name: idx_canteen_transaction_items_menu_item_id; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_canteen_transaction_items_menu_item_id ON public.canteen_transaction_items USING btree (menu_item_id);


--
-- TOC entry 4213 (class 1259 OID 27338)
-- Name: idx_canteen_transaction_items_transaction_id; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_canteen_transaction_items_transaction_id ON public.canteen_transaction_items USING btree (transaction_id);


--
-- TOC entry 4197 (class 1259 OID 27318)
-- Name: idx_canteen_transactions_card_id; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_canteen_transactions_card_id ON public.canteen_transactions USING btree (card_id);


--
-- TOC entry 4198 (class 1259 OID 27343)
-- Name: idx_canteen_transactions_status; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_canteen_transactions_status ON public.canteen_transactions USING btree (status);


--
-- TOC entry 4199 (class 1259 OID 27317)
-- Name: idx_canteen_transactions_student_id; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_canteen_transactions_student_id ON public.canteen_transactions USING btree (student_id);


--
-- TOC entry 4200 (class 1259 OID 27342)
-- Name: idx_canteen_transactions_transaction_id; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_canteen_transactions_transaction_id ON public.canteen_transactions USING btree (transaction_id);


--
-- TOC entry 4250 (class 1259 OID 27413)
-- Name: idx_course_schedules_course_id; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_course_schedules_course_id ON public.course_schedules USING btree (course_id);


--
-- TOC entry 4251 (class 1259 OID 27414)
-- Name: idx_course_schedules_day_time; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_course_schedules_day_time ON public.course_schedules USING btree (day_of_week, start_time);


--
-- TOC entry 4252 (class 1259 OID 27415)
-- Name: idx_course_schedules_room_day; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_course_schedules_room_day ON public.course_schedules USING btree (room, day_of_week);


--
-- TOC entry 4170 (class 1259 OID 27309)
-- Name: idx_courses_course_code; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_courses_course_code ON public.courses USING btree (course_code);


--
-- TOC entry 4209 (class 1259 OID 27344)
-- Name: idx_daily_sales_date; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_daily_sales_date ON public.daily_sales USING btree (date);


--
-- TOC entry 4246 (class 1259 OID 27334)
-- Name: idx_exam_results_course_id; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_exam_results_course_id ON public.exam_results USING btree (course_id);


--
-- TOC entry 4247 (class 1259 OID 27333)
-- Name: idx_exam_results_student_id; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_exam_results_student_id ON public.exam_results USING btree (student_id);


--
-- TOC entry 4177 (class 1259 OID 27313)
-- Name: idx_lecturer_courses_course_id; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_lecturer_courses_course_id ON public.lecturer_courses USING btree (course_id);


--
-- TOC entry 4178 (class 1259 OID 27312)
-- Name: idx_lecturer_courses_lecturer_id; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_lecturer_courses_lecturer_id ON public.lecturer_courses USING btree (lecturer_id);


--
-- TOC entry 4150 (class 1259 OID 27306)
-- Name: idx_lecturers_staff_id; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_lecturers_staff_id ON public.lecturers USING btree (staff_id);


--
-- TOC entry 4151 (class 1259 OID 27305)
-- Name: idx_lecturers_user_id; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_lecturers_user_id ON public.lecturers USING btree (user_id);


--
-- TOC entry 4235 (class 1259 OID 27331)
-- Name: idx_library_fines_status; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_library_fines_status ON public.library_fines USING btree (status);


--
-- TOC entry 4236 (class 1259 OID 27330)
-- Name: idx_library_fines_student_id; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_library_fines_student_id ON public.library_fines USING btree (student_id);


--
-- TOC entry 4239 (class 1259 OID 27332)
-- Name: idx_library_members_student_id; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_library_members_student_id ON public.library_members USING btree (student_id);


--
-- TOC entry 4188 (class 1259 OID 27337)
-- Name: idx_menu_items_active; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_menu_items_active ON public.menu_items USING btree (is_active);


--
-- TOC entry 4189 (class 1259 OID 27336)
-- Name: idx_menu_items_available; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_menu_items_available ON public.menu_items USING btree (is_available);


--
-- TOC entry 4190 (class 1259 OID 27335)
-- Name: idx_menu_items_category; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_menu_items_category ON public.menu_items USING btree (category);


--
-- TOC entry 4255 (class 1259 OID 27450)
-- Name: idx_nfc_log_card_uid; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_nfc_log_card_uid ON public.nfc_attendance_log USING btree (card_uid);


--
-- TOC entry 4256 (class 1259 OID 27453)
-- Name: idx_nfc_log_course; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_nfc_log_course ON public.nfc_attendance_log USING btree (course_id);


--
-- TOC entry 4257 (class 1259 OID 27452)
-- Name: idx_nfc_log_student; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_nfc_log_student ON public.nfc_attendance_log USING btree (student_id);


--
-- TOC entry 4258 (class 1259 OID 27451)
-- Name: idx_nfc_log_timestamp; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_nfc_log_timestamp ON public.nfc_attendance_log USING btree (swipe_timestamp);


--
-- TOC entry 4261 (class 1259 OID 27668)
-- Name: idx_password_reset_tokens_expires_at; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_password_reset_tokens_expires_at ON public.password_reset_tokens USING btree (expires_at);


--
-- TOC entry 4262 (class 1259 OID 27666)
-- Name: idx_password_reset_tokens_token; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_password_reset_tokens_token ON public.password_reset_tokens USING btree (token);


--
-- TOC entry 4263 (class 1259 OID 27667)
-- Name: idx_password_reset_tokens_user_id; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_password_reset_tokens_user_id ON public.password_reset_tokens USING btree (user_id);


--
-- TOC entry 4160 (class 1259 OID 27308)
-- Name: idx_rfid_cards_assigned_student; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_rfid_cards_assigned_student ON public.rfid_cards USING btree (assigned_student);


--
-- TOC entry 4161 (class 1259 OID 27307)
-- Name: idx_rfid_cards_card_uid; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_rfid_cards_card_uid ON public.rfid_cards USING btree (card_uid);


--
-- TOC entry 4171 (class 1259 OID 27311)
-- Name: idx_student_courses_course_id; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_student_courses_course_id ON public.student_courses USING btree (course_id);


--
-- TOC entry 4172 (class 1259 OID 27310)
-- Name: idx_student_courses_student_id; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_student_courses_student_id ON public.student_courses USING btree (student_id);


--
-- TOC entry 4139 (class 1259 OID 27304)
-- Name: idx_students_email; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_students_email ON public.students USING btree (email);


--
-- TOC entry 4140 (class 1259 OID 27303)
-- Name: idx_students_register_number; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_students_register_number ON public.students USING btree (register_number);


--
-- TOC entry 4141 (class 1259 OID 27302)
-- Name: idx_students_user_id; Type: INDEX; Schema: public; Owner: vidda_postgre
--

CREATE INDEX idx_students_user_id ON public.students USING btree (user_id);


--
-- TOC entry 4300 (class 2620 OID 27388)
-- Name: students auto_create_library_membership; Type: TRIGGER; Schema: public; Owner: vidda_postgre
--

CREATE TRIGGER auto_create_library_membership AFTER INSERT ON public.students FOR EACH ROW EXECUTE FUNCTION public.create_library_membership();


--
-- TOC entry 4305 (class 2620 OID 27351)
-- Name: attendance update_attendance_updated_at; Type: TRIGGER; Schema: public; Owner: vidda_postgre
--

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4310 (class 2620 OID 27354)
-- Name: book_copies update_book_copies_updated_at; Type: TRIGGER; Schema: public; Owner: vidda_postgre
--

CREATE TRIGGER update_book_copies_updated_at BEFORE UPDATE ON public.book_copies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4311 (class 2620 OID 27355)
-- Name: book_loans update_book_loans_updated_at; Type: TRIGGER; Schema: public; Owner: vidda_postgre
--

CREATE TRIGGER update_book_loans_updated_at BEFORE UPDATE ON public.book_loans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4309 (class 2620 OID 27353)
-- Name: books update_books_updated_at; Type: TRIGGER; Schema: public; Owner: vidda_postgre
--

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4307 (class 2620 OID 27352)
-- Name: canteen_transactions update_canteen_transactions_updated_at; Type: TRIGGER; Schema: public; Owner: vidda_postgre
--

CREATE TRIGGER update_canteen_transactions_updated_at BEFORE UPDATE ON public.canteen_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4313 (class 2620 OID 27416)
-- Name: course_schedules update_course_schedules_updated_at; Type: TRIGGER; Schema: public; Owner: vidda_postgre
--

CREATE TRIGGER update_course_schedules_updated_at BEFORE UPDATE ON public.course_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4304 (class 2620 OID 27350)
-- Name: courses update_courses_updated_at; Type: TRIGGER; Schema: public; Owner: vidda_postgre
--

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4308 (class 2620 OID 27358)
-- Name: daily_sales update_daily_sales_updated_at; Type: TRIGGER; Schema: public; Owner: vidda_postgre
--

CREATE TRIGGER update_daily_sales_updated_at BEFORE UPDATE ON public.daily_sales FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4302 (class 2620 OID 27348)
-- Name: lecturers update_lecturers_updated_at; Type: TRIGGER; Schema: public; Owner: vidda_postgre
--

CREATE TRIGGER update_lecturers_updated_at BEFORE UPDATE ON public.lecturers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4312 (class 2620 OID 27356)
-- Name: library_members update_library_members_updated_at; Type: TRIGGER; Schema: public; Owner: vidda_postgre
--

CREATE TRIGGER update_library_members_updated_at BEFORE UPDATE ON public.library_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4306 (class 2620 OID 27357)
-- Name: menu_items update_menu_items_updated_at; Type: TRIGGER; Schema: public; Owner: vidda_postgre
--

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4314 (class 2620 OID 27669)
-- Name: password_reset_tokens update_password_reset_tokens_updated_at; Type: TRIGGER; Schema: public; Owner: vidda_postgre
--

CREATE TRIGGER update_password_reset_tokens_updated_at BEFORE UPDATE ON public.password_reset_tokens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4303 (class 2620 OID 27349)
-- Name: rfid_cards update_rfid_cards_updated_at; Type: TRIGGER; Schema: public; Owner: vidda_postgre
--

CREATE TRIGGER update_rfid_cards_updated_at BEFORE UPDATE ON public.rfid_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4301 (class 2620 OID 27347)
-- Name: students update_students_updated_at; Type: TRIGGER; Schema: public; Owner: vidda_postgre
--

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4299 (class 2620 OID 27346)
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: vidda_postgre
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4293 (class 2606 OID 27408)
-- Name: course_schedules course_schedules_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.course_schedules
    ADD CONSTRAINT course_schedules_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 4275 (class 2606 OID 27069)
-- Name: attendance fk_attendance_course; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT fk_attendance_course FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 4276 (class 2606 OID 27074)
-- Name: attendance fk_attendance_lecturer; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT fk_attendance_lecturer FOREIGN KEY (lecturer_id) REFERENCES public.lecturers(id);


--
-- TOC entry 4277 (class 2606 OID 27617)
-- Name: attendance fk_attendance_student; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES public.students(user_id) ON DELETE CASCADE;


--
-- TOC entry 4279 (class 2606 OID 27122)
-- Name: balance_history fk_balance_history_card; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.balance_history
    ADD CONSTRAINT fk_balance_history_card FOREIGN KEY (card_id) REFERENCES public.rfid_cards(card_uid) ON DELETE CASCADE;


--
-- TOC entry 4280 (class 2606 OID 27117)
-- Name: balance_history fk_balance_history_student; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.balance_history
    ADD CONSTRAINT fk_balance_history_student FOREIGN KEY (student_id) REFERENCES public.students(user_id) ON DELETE CASCADE;


--
-- TOC entry 4281 (class 2606 OID 27127)
-- Name: balance_history fk_balance_history_transaction; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.balance_history
    ADD CONSTRAINT fk_balance_history_transaction FOREIGN KEY (transaction_id) REFERENCES public.canteen_transactions(id) ON DELETE SET NULL;


--
-- TOC entry 4284 (class 2606 OID 27201)
-- Name: book_copies fk_book_copies_book; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.book_copies
    ADD CONSTRAINT fk_book_copies_book FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- TOC entry 4285 (class 2606 OID 27223)
-- Name: book_loans fk_book_loans_book_copy; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.book_loans
    ADD CONSTRAINT fk_book_loans_book_copy FOREIGN KEY (book_copy_id) REFERENCES public.book_copies(id) ON DELETE CASCADE;


--
-- TOC entry 4286 (class 2606 OID 27218)
-- Name: book_loans fk_book_loans_student; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.book_loans
    ADD CONSTRAINT fk_book_loans_student FOREIGN KEY (student_id) REFERENCES public.students(user_id) ON DELETE CASCADE;


--
-- TOC entry 4282 (class 2606 OID 27159)
-- Name: canteen_transaction_items fk_canteen_transaction_items_menu_item; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.canteen_transaction_items
    ADD CONSTRAINT fk_canteen_transaction_items_menu_item FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id) ON DELETE CASCADE;


--
-- TOC entry 4283 (class 2606 OID 27154)
-- Name: canteen_transaction_items fk_canteen_transaction_items_transaction; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.canteen_transaction_items
    ADD CONSTRAINT fk_canteen_transaction_items_transaction FOREIGN KEY (transaction_id) REFERENCES public.canteen_transactions(id) ON DELETE CASCADE;


--
-- TOC entry 4278 (class 2606 OID 27103)
-- Name: canteen_transactions fk_canteen_transactions_card; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.canteen_transactions
    ADD CONSTRAINT fk_canteen_transactions_card FOREIGN KEY (card_id) REFERENCES public.rfid_cards(card_uid) ON DELETE CASCADE;


--
-- TOC entry 4291 (class 2606 OID 27297)
-- Name: exam_results fk_exam_results_course; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.exam_results
    ADD CONSTRAINT fk_exam_results_course FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 4292 (class 2606 OID 27417)
-- Name: exam_results fk_exam_results_student; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.exam_results
    ADD CONSTRAINT fk_exam_results_student FOREIGN KEY (student_id) REFERENCES public.students(user_id) ON DELETE CASCADE;


--
-- TOC entry 4273 (class 2606 OID 27051)
-- Name: lecturer_courses fk_lecturer_courses_course; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.lecturer_courses
    ADD CONSTRAINT fk_lecturer_courses_course FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 4274 (class 2606 OID 27046)
-- Name: lecturer_courses fk_lecturer_courses_lecturer; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.lecturer_courses
    ADD CONSTRAINT fk_lecturer_courses_lecturer FOREIGN KEY (lecturer_id) REFERENCES public.lecturers(id) ON DELETE CASCADE;


--
-- TOC entry 4269 (class 2606 OID 26987)
-- Name: lecturers fk_lecturers_user; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.lecturers
    ADD CONSTRAINT fk_lecturers_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4287 (class 2606 OID 27253)
-- Name: library_fines fk_library_fines_loan; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.library_fines
    ADD CONSTRAINT fk_library_fines_loan FOREIGN KEY (loan_id) REFERENCES public.book_loans(id) ON DELETE SET NULL;


--
-- TOC entry 4288 (class 2606 OID 27258)
-- Name: library_fines fk_library_fines_paid_by; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.library_fines
    ADD CONSTRAINT fk_library_fines_paid_by FOREIGN KEY (paid_by) REFERENCES public.users(id);


--
-- TOC entry 4289 (class 2606 OID 27248)
-- Name: library_fines fk_library_fines_student; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.library_fines
    ADD CONSTRAINT fk_library_fines_student FOREIGN KEY (student_id) REFERENCES public.students(user_id) ON DELETE CASCADE;


--
-- TOC entry 4290 (class 2606 OID 27278)
-- Name: library_members fk_library_members_student; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.library_members
    ADD CONSTRAINT fk_library_members_student FOREIGN KEY (student_id) REFERENCES public.students(user_id) ON DELETE CASCADE;


--
-- TOC entry 4294 (class 2606 OID 27430)
-- Name: nfc_attendance_log fk_nfc_log_attendance; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.nfc_attendance_log
    ADD CONSTRAINT fk_nfc_log_attendance FOREIGN KEY (attendance_id) REFERENCES public.attendance(id) ON DELETE CASCADE;


--
-- TOC entry 4295 (class 2606 OID 27440)
-- Name: nfc_attendance_log fk_nfc_log_course; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.nfc_attendance_log
    ADD CONSTRAINT fk_nfc_log_course FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 4296 (class 2606 OID 27445)
-- Name: nfc_attendance_log fk_nfc_log_lecturer; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.nfc_attendance_log
    ADD CONSTRAINT fk_nfc_log_lecturer FOREIGN KEY (lecturer_id) REFERENCES public.lecturers(id) ON DELETE CASCADE;


--
-- TOC entry 4297 (class 2606 OID 27435)
-- Name: nfc_attendance_log fk_nfc_log_student; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.nfc_attendance_log
    ADD CONSTRAINT fk_nfc_log_student FOREIGN KEY (student_id) REFERENCES public.students(user_id) ON DELETE CASCADE;


--
-- TOC entry 4270 (class 2606 OID 27003)
-- Name: rfid_cards fk_rfid_cards_student; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.rfid_cards
    ADD CONSTRAINT fk_rfid_cards_student FOREIGN KEY (assigned_student) REFERENCES public.students(user_id) ON DELETE CASCADE;


--
-- TOC entry 4271 (class 2606 OID 27032)
-- Name: student_courses fk_student_courses_course; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.student_courses
    ADD CONSTRAINT fk_student_courses_course FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 4272 (class 2606 OID 27391)
-- Name: student_courses fk_student_courses_student; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.student_courses
    ADD CONSTRAINT fk_student_courses_student FOREIGN KEY (student_id) REFERENCES public.students(user_id) ON DELETE CASCADE;


--
-- TOC entry 4268 (class 2606 OID 26966)
-- Name: students fk_students_user; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4298 (class 2606 OID 27661)
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: vidda_postgre
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4492 (class 0 OID 0)
-- Dependencies: 243
-- Name: FUNCTION pg_replication_origin_advance(text, pg_lsn); Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_advance(text, pg_lsn) TO azure_pg_admin;


--
-- TOC entry 4493 (class 0 OID 0)
-- Dependencies: 258
-- Name: FUNCTION pg_replication_origin_create(text); Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_create(text) TO azure_pg_admin;


--
-- TOC entry 4494 (class 0 OID 0)
-- Dependencies: 250
-- Name: FUNCTION pg_replication_origin_drop(text); Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_drop(text) TO azure_pg_admin;


--
-- TOC entry 4495 (class 0 OID 0)
-- Dependencies: 251
-- Name: FUNCTION pg_replication_origin_oid(text); Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_oid(text) TO azure_pg_admin;


--
-- TOC entry 4496 (class 0 OID 0)
-- Dependencies: 252
-- Name: FUNCTION pg_replication_origin_progress(text, boolean); Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_progress(text, boolean) TO azure_pg_admin;


--
-- TOC entry 4497 (class 0 OID 0)
-- Dependencies: 253
-- Name: FUNCTION pg_replication_origin_session_is_setup(); Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_session_is_setup() TO azure_pg_admin;


--
-- TOC entry 4498 (class 0 OID 0)
-- Dependencies: 254
-- Name: FUNCTION pg_replication_origin_session_progress(boolean); Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_session_progress(boolean) TO azure_pg_admin;


--
-- TOC entry 4499 (class 0 OID 0)
-- Dependencies: 259
-- Name: FUNCTION pg_replication_origin_session_reset(); Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_session_reset() TO azure_pg_admin;


--
-- TOC entry 4500 (class 0 OID 0)
-- Dependencies: 255
-- Name: FUNCTION pg_replication_origin_session_setup(text); Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_session_setup(text) TO azure_pg_admin;


--
-- TOC entry 4501 (class 0 OID 0)
-- Dependencies: 256
-- Name: FUNCTION pg_replication_origin_xact_reset(); Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_xact_reset() TO azure_pg_admin;


--
-- TOC entry 4502 (class 0 OID 0)
-- Dependencies: 257
-- Name: FUNCTION pg_replication_origin_xact_setup(pg_lsn, timestamp with time zone); Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT ALL ON FUNCTION pg_catalog.pg_replication_origin_xact_setup(pg_lsn, timestamp with time zone) TO azure_pg_admin;


--
-- TOC entry 4503 (class 0 OID 0)
-- Dependencies: 260
-- Name: FUNCTION pg_show_replication_origin_status(OUT local_id oid, OUT external_id text, OUT remote_lsn pg_lsn, OUT local_lsn pg_lsn); Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT ALL ON FUNCTION pg_catalog.pg_show_replication_origin_status(OUT local_id oid, OUT external_id text, OUT remote_lsn pg_lsn, OUT local_lsn pg_lsn) TO azure_pg_admin;


--
-- TOC entry 4504 (class 0 OID 0)
-- Dependencies: 244
-- Name: FUNCTION pg_stat_reset(); Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT ALL ON FUNCTION pg_catalog.pg_stat_reset() TO azure_pg_admin;


--
-- TOC entry 4505 (class 0 OID 0)
-- Dependencies: 245
-- Name: FUNCTION pg_stat_reset_shared(text); Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT ALL ON FUNCTION pg_catalog.pg_stat_reset_shared(text) TO azure_pg_admin;


--
-- TOC entry 4506 (class 0 OID 0)
-- Dependencies: 249
-- Name: FUNCTION pg_stat_reset_single_function_counters(oid); Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT ALL ON FUNCTION pg_catalog.pg_stat_reset_single_function_counters(oid) TO azure_pg_admin;


--
-- TOC entry 4507 (class 0 OID 0)
-- Dependencies: 248
-- Name: FUNCTION pg_stat_reset_single_table_counters(oid); Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT ALL ON FUNCTION pg_catalog.pg_stat_reset_single_table_counters(oid) TO azure_pg_admin;


--
-- TOC entry 4508 (class 0 OID 0)
-- Dependencies: 98
-- Name: COLUMN pg_config.name; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(name) ON TABLE pg_catalog.pg_config TO azure_pg_admin;


--
-- TOC entry 4509 (class 0 OID 0)
-- Dependencies: 98
-- Name: COLUMN pg_config.setting; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(setting) ON TABLE pg_catalog.pg_config TO azure_pg_admin;


--
-- TOC entry 4510 (class 0 OID 0)
-- Dependencies: 94
-- Name: COLUMN pg_hba_file_rules.line_number; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(line_number) ON TABLE pg_catalog.pg_hba_file_rules TO azure_pg_admin;


--
-- TOC entry 4511 (class 0 OID 0)
-- Dependencies: 94
-- Name: COLUMN pg_hba_file_rules.type; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(type) ON TABLE pg_catalog.pg_hba_file_rules TO azure_pg_admin;


--
-- TOC entry 4512 (class 0 OID 0)
-- Dependencies: 94
-- Name: COLUMN pg_hba_file_rules.database; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(database) ON TABLE pg_catalog.pg_hba_file_rules TO azure_pg_admin;


--
-- TOC entry 4513 (class 0 OID 0)
-- Dependencies: 94
-- Name: COLUMN pg_hba_file_rules.user_name; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(user_name) ON TABLE pg_catalog.pg_hba_file_rules TO azure_pg_admin;


--
-- TOC entry 4514 (class 0 OID 0)
-- Dependencies: 94
-- Name: COLUMN pg_hba_file_rules.address; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(address) ON TABLE pg_catalog.pg_hba_file_rules TO azure_pg_admin;


--
-- TOC entry 4515 (class 0 OID 0)
-- Dependencies: 94
-- Name: COLUMN pg_hba_file_rules.netmask; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(netmask) ON TABLE pg_catalog.pg_hba_file_rules TO azure_pg_admin;


--
-- TOC entry 4516 (class 0 OID 0)
-- Dependencies: 94
-- Name: COLUMN pg_hba_file_rules.auth_method; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(auth_method) ON TABLE pg_catalog.pg_hba_file_rules TO azure_pg_admin;


--
-- TOC entry 4517 (class 0 OID 0)
-- Dependencies: 94
-- Name: COLUMN pg_hba_file_rules.options; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(options) ON TABLE pg_catalog.pg_hba_file_rules TO azure_pg_admin;


--
-- TOC entry 4518 (class 0 OID 0)
-- Dependencies: 94
-- Name: COLUMN pg_hba_file_rules.error; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(error) ON TABLE pg_catalog.pg_hba_file_rules TO azure_pg_admin;


--
-- TOC entry 4519 (class 0 OID 0)
-- Dependencies: 144
-- Name: COLUMN pg_replication_origin_status.local_id; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(local_id) ON TABLE pg_catalog.pg_replication_origin_status TO azure_pg_admin;


--
-- TOC entry 4520 (class 0 OID 0)
-- Dependencies: 144
-- Name: COLUMN pg_replication_origin_status.external_id; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(external_id) ON TABLE pg_catalog.pg_replication_origin_status TO azure_pg_admin;


--
-- TOC entry 4521 (class 0 OID 0)
-- Dependencies: 144
-- Name: COLUMN pg_replication_origin_status.remote_lsn; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(remote_lsn) ON TABLE pg_catalog.pg_replication_origin_status TO azure_pg_admin;


--
-- TOC entry 4522 (class 0 OID 0)
-- Dependencies: 144
-- Name: COLUMN pg_replication_origin_status.local_lsn; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(local_lsn) ON TABLE pg_catalog.pg_replication_origin_status TO azure_pg_admin;


--
-- TOC entry 4523 (class 0 OID 0)
-- Dependencies: 99
-- Name: COLUMN pg_shmem_allocations.name; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(name) ON TABLE pg_catalog.pg_shmem_allocations TO azure_pg_admin;


--
-- TOC entry 4524 (class 0 OID 0)
-- Dependencies: 99
-- Name: COLUMN pg_shmem_allocations.off; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(off) ON TABLE pg_catalog.pg_shmem_allocations TO azure_pg_admin;


--
-- TOC entry 4525 (class 0 OID 0)
-- Dependencies: 99
-- Name: COLUMN pg_shmem_allocations.size; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(size) ON TABLE pg_catalog.pg_shmem_allocations TO azure_pg_admin;


--
-- TOC entry 4526 (class 0 OID 0)
-- Dependencies: 99
-- Name: COLUMN pg_shmem_allocations.allocated_size; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(allocated_size) ON TABLE pg_catalog.pg_shmem_allocations TO azure_pg_admin;


--
-- TOC entry 4527 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.starelid; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(starelid) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4528 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.staattnum; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(staattnum) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4529 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.stainherit; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(stainherit) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4530 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.stanullfrac; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(stanullfrac) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4531 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.stawidth; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(stawidth) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4532 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.stadistinct; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(stadistinct) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4533 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.stakind1; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(stakind1) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4534 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.stakind2; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(stakind2) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4535 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.stakind3; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(stakind3) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4536 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.stakind4; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(stakind4) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4537 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.stakind5; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(stakind5) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4538 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.staop1; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(staop1) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4539 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.staop2; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(staop2) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4540 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.staop3; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(staop3) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4541 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.staop4; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(staop4) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4542 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.staop5; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(staop5) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4543 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.stacoll1; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(stacoll1) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4544 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.stacoll2; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(stacoll2) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4545 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.stacoll3; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(stacoll3) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4546 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.stacoll4; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(stacoll4) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4547 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.stacoll5; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(stacoll5) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4548 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.stanumbers1; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(stanumbers1) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4549 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.stanumbers2; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(stanumbers2) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4550 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.stanumbers3; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(stanumbers3) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4551 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.stanumbers4; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(stanumbers4) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4552 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.stanumbers5; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(stanumbers5) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4553 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.stavalues1; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(stavalues1) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4554 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.stavalues2; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(stavalues2) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4555 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.stavalues3; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(stavalues3) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4556 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.stavalues4; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(stavalues4) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4557 (class 0 OID 0)
-- Dependencies: 39
-- Name: COLUMN pg_statistic.stavalues5; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(stavalues5) ON TABLE pg_catalog.pg_statistic TO azure_pg_admin;


--
-- TOC entry 4558 (class 0 OID 0)
-- Dependencies: 64
-- Name: COLUMN pg_subscription.oid; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(oid) ON TABLE pg_catalog.pg_subscription TO azure_pg_admin;


--
-- TOC entry 4559 (class 0 OID 0)
-- Dependencies: 64
-- Name: COLUMN pg_subscription.subdbid; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(subdbid) ON TABLE pg_catalog.pg_subscription TO azure_pg_admin;


--
-- TOC entry 4560 (class 0 OID 0)
-- Dependencies: 64
-- Name: COLUMN pg_subscription.subname; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(subname) ON TABLE pg_catalog.pg_subscription TO azure_pg_admin;


--
-- TOC entry 4561 (class 0 OID 0)
-- Dependencies: 64
-- Name: COLUMN pg_subscription.subowner; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(subowner) ON TABLE pg_catalog.pg_subscription TO azure_pg_admin;


--
-- TOC entry 4562 (class 0 OID 0)
-- Dependencies: 64
-- Name: COLUMN pg_subscription.subenabled; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(subenabled) ON TABLE pg_catalog.pg_subscription TO azure_pg_admin;


--
-- TOC entry 4563 (class 0 OID 0)
-- Dependencies: 64
-- Name: COLUMN pg_subscription.subconninfo; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(subconninfo) ON TABLE pg_catalog.pg_subscription TO azure_pg_admin;


--
-- TOC entry 4564 (class 0 OID 0)
-- Dependencies: 64
-- Name: COLUMN pg_subscription.subslotname; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(subslotname) ON TABLE pg_catalog.pg_subscription TO azure_pg_admin;


--
-- TOC entry 4565 (class 0 OID 0)
-- Dependencies: 64
-- Name: COLUMN pg_subscription.subsynccommit; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(subsynccommit) ON TABLE pg_catalog.pg_subscription TO azure_pg_admin;


--
-- TOC entry 4566 (class 0 OID 0)
-- Dependencies: 64
-- Name: COLUMN pg_subscription.subpublications; Type: ACL; Schema: pg_catalog; Owner: azuresu
--

GRANT SELECT(subpublications) ON TABLE pg_catalog.pg_subscription TO azure_pg_admin;


-- Completed on 2025-09-30 03:22:44 +0530

--
-- PostgreSQL database dump complete
--

-- =====================================================
-- RFID Student Transactions Table Migration
-- =====================================================
-- This migration creates a comprehensive transaction
-- tracking system for all RFID card activities
-- =====================================================

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.student_transactions CASCADE;

-- Drop existing enums if they exist (to recreate with correct values)
DROP TYPE IF EXISTS public.transaction_type CASCADE;
DROP TYPE IF EXISTS public.transaction_status CASCADE;

-- Create transaction type enum
CREATE TYPE public.transaction_type AS ENUM (
    'RECHARGE',
    'PURCHASE',
    'REFUND',
    'ADJUSTMENT',
    'FINE',
    'REVERSAL'
);

-- Create transaction status enum
CREATE TYPE public.transaction_status AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'CANCELLED',
    'REVERSED'
);

-- Create the student_transactions table
CREATE TABLE IF NOT EXISTS public.student_transactions (
    -- Primary identification
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id character varying(100) UNIQUE NOT NULL,
    
    -- Student and card information
    student_id uuid NOT NULL,
    card_uid character varying(100) NOT NULL,
    
    -- Transaction details
    transaction_type public.transaction_type NOT NULL,
    transaction_status public.transaction_status DEFAULT 'COMPLETED',
    
    -- Financial information
    amount numeric(10,2) NOT NULL,
    balance_before numeric(10,2) NOT NULL,
    balance_after numeric(10,2) NOT NULL,
    
    -- Additional context
    description text,
    reference_id character varying(100), -- Reference to canteen order, library fine, etc.
    reference_type character varying(50), -- 'canteen_order', 'library_fine', 'manual_recharge', etc.
    
    -- Location and operator
    location character varying(100), -- 'Admin Portal', 'Canteen', 'Library', etc.
    operator_id uuid, -- ID of admin/staff who performed the transaction
    operator_type character varying(50), -- 'admin', 'canteen_staff', 'library_staff'
    
    -- Payment method (for recharges)
    payment_method character varying(50), -- 'CASH', 'CARD', 'ONLINE', 'ADMIN'
    payment_reference character varying(100), -- Receipt number, transaction ID, etc.
    
    -- Metadata
    metadata jsonb, -- Additional flexible data
    notes text, -- Internal notes
    
    -- Timestamps
    transaction_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES public.students(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_card FOREIGN KEY (card_uid) REFERENCES public.rfid_cards(card_uid) ON DELETE CASCADE,
    
    -- Check constraints
    CONSTRAINT check_amount_not_zero CHECK (amount <> 0),
    CONSTRAINT check_valid_balances CHECK (balance_before >= 0 AND balance_after >= 0)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_student_transactions_student_id ON public.student_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_student_transactions_card_uid ON public.student_transactions(card_uid);
CREATE INDEX IF NOT EXISTS idx_student_transactions_transaction_type ON public.student_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_student_transactions_transaction_date ON public.student_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_student_transactions_reference ON public.student_transactions(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_student_transactions_status ON public.student_transactions(transaction_status);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_student_transactions_student_date ON public.student_transactions(student_id, transaction_date DESC);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic updated_at
DROP TRIGGER IF EXISTS update_student_transactions_updated_at ON public.student_transactions;
CREATE TRIGGER update_student_transactions_updated_at
    BEFORE UPDATE ON public.student_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a function to generate unique transaction IDs
CREATE OR REPLACE FUNCTION generate_transaction_id()
RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    done BOOL;
BEGIN
    done := FALSE;
    WHILE NOT done LOOP
        new_id := 'TXN' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        done := NOT EXISTS(SELECT 1 FROM student_transactions WHERE transaction_id = new_id);
    END LOOP;
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;



-- Add comments for documentation
COMMENT ON TABLE public.student_transactions IS 'Comprehensive transaction log for all RFID card activities';
COMMENT ON COLUMN public.student_transactions.transaction_type IS 'Type of transaction: RECHARGE, PURCHASE, REFUND, ADJUSTMENT, FINE, REVERSAL';
COMMENT ON COLUMN public.student_transactions.reference_id IS 'Links to related records (e.g., canteen order ID, library fine ID)';
COMMENT ON COLUMN public.student_transactions.balance_before IS 'Card balance before this transaction';
COMMENT ON COLUMN public.student_transactions.balance_after IS 'Card balance after this transaction';
COMMENT ON COLUMN public.student_transactions.metadata IS 'Flexible JSONB field for additional transaction data';

-- =====================================================
-- Sample Data Migration (Optional)
-- =====================================================
-- If you want to migrate existing canteen_transactions:
/*
INSERT INTO public.student_transactions (
    student_id,
    card_uid,
    transaction_type,
    transaction_status,
    amount,
    balance_before,
    balance_after,
    description,
    reference_id,
    reference_type,
    location,
    payment_method,
    transaction_date,
    transaction_id
)
SELECT 
    ct.student_id,
    ct.card_id,
    'PURCHASE'::public.transaction_type,
    CASE 
        WHEN ct.status = 'completed' THEN 'COMPLETED'::public.transaction_status
        WHEN ct.status = 'pending' THEN 'PENDING'::public.transaction_status
        ELSE 'FAILED'::public.transaction_status
    END,
    -ABS(ct.amount), -- Negative for purchases
    0, -- We don't have historical balance
    0, -- We don't have historical balance
    ct.description,
    ct.id::text,
    'canteen_order',
    'Canteen',
    ct.payment_method,
    ct.transaction_date,
    generate_transaction_id()
FROM public.canteen_transactions ct
WHERE ct.id NOT IN (
    SELECT reference_id::uuid 
    FROM public.student_transactions 
    WHERE reference_type = 'canteen_order'
);
*/

-- =====================================================
-- Verification Queries
-- =====================================================
-- Check table structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'student_transactions'
-- ORDER BY ordinal_position;

-- Check indexes
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'student_transactions';

-- Sample query to view recent transactions
-- SELECT 
--     st.transaction_id,
--     s.full_name,
--     st.transaction_type,
--     st.amount,
--     st.balance_after,
--     st.description,
--     st.transaction_date
-- FROM student_transactions st
-- JOIN students s ON st.student_id = s.user_id
-- ORDER BY st.transaction_date DESC
-- LIMIT 10;

-- =====================================================
-- Rollback (if needed)
-- =====================================================
-- DROP TABLE IF EXISTS public.student_transactions CASCADE;
-- DROP TYPE IF EXISTS public.transaction_type CASCADE;
-- DROP TYPE IF EXISTS public.transaction_status CASCADE;
-- DROP FUNCTION IF EXISTS generate_transaction_id() CASCADE;

-- Migration: Add RFID Tag support for Books
-- Created: 2025-11-09
-- Description: Creates book_rfid_tags table to store RFID tag information for book copies

-- Create RFID tag status enum if not exists (reusing card_status enum)
-- This enum already exists for student cards, we'll reuse it for consistency

-- Create book_rfid_tags table
CREATE TABLE IF NOT EXISTS public.book_rfid_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    rfid_uid character varying(100) NOT NULL UNIQUE,
    book_copy_id uuid,
    assigned_date timestamp without time zone,
    status public.card_status DEFAULT 'ACTIVE'::public.card_status,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key to book_copies
    CONSTRAINT fk_book_copy
        FOREIGN KEY (book_copy_id)
        REFERENCES public.book_copies(id)
        ON DELETE SET NULL
);

-- Add indexes for performance
CREATE INDEX idx_book_rfid_tags_rfid_uid ON public.book_rfid_tags USING btree (rfid_uid);
CREATE INDEX idx_book_rfid_tags_book_copy_id ON public.book_rfid_tags USING btree (book_copy_id);
CREATE INDEX idx_book_rfid_tags_status ON public.book_rfid_tags USING btree (status);

-- Add trigger to automatically update updated_at timestamp
CREATE TRIGGER update_book_rfid_tags_updated_at 
    BEFORE UPDATE ON public.book_rfid_tags 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.book_rfid_tags IS 'Stores RFID tag information for book copies';
COMMENT ON COLUMN public.book_rfid_tags.rfid_uid IS 'Unique RFID tag identifier';
COMMENT ON COLUMN public.book_rfid_tags.book_copy_id IS 'Reference to the book copy this tag is assigned to';
COMMENT ON COLUMN public.book_rfid_tags.status IS 'Current status of the RFID tag (ACTIVE, INACTIVE, LOST, DAMAGED, RETURNED)';

-- Grant permissions (adjust based on your setup)


-- Optional: Add a column to book_copies to track if it has an RFID tag
ALTER TABLE public.book_copies 
ADD COLUMN IF NOT EXISTS has_rfid_tag boolean DEFAULT false;

-- Create a view for book copies with RFID tag information
CREATE OR REPLACE VIEW public.book_copies_with_rfid AS
SELECT 
    bc.*,
    brt.id as rfid_tag_id,
    brt.rfid_uid,
    brt.assigned_date as rfid_assigned_date,
    brt.status as rfid_status,
    b.title as book_title,
    b.author as book_author,
    b.isbn,
    b.category
FROM public.book_copies bc
LEFT JOIN public.book_rfid_tags brt ON bc.id = brt.book_copy_id
JOIN public.books b ON bc.book_id = b.id
ORDER BY b.title, bc.barcode;



COMMENT ON VIEW public.book_copies_with_rfid IS 'Book copies with their RFID tag information';



\unrestrict sUPjWIAj5mF1MHJEcwFBddSH8Ea7pavE7b1H3Ivhc5LOdKtOcUaxlOfRK0ZXYwK

