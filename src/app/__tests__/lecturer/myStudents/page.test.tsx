import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MyStudents from '@/app/lecturer/myStudents/page';

jest.mock('next/link', () => ({
	__esModule: true,
	default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

jest.mock('sonner', () => ({
	toast: {
		success: jest.fn(),
		error: jest.fn(),
	},
}));

jest.mock('lucide-react', () => ({
	ArrowLeft: () => <span data-testid="icon-back" />,
	Search: () => <span data-testid="icon-search" />,
	Users: () => <span data-testid="icon-users" />,
	UserCheck: () => <span data-testid="icon-user-check" />,
	BookOpen: () => <span data-testid="icon-book" />,
	Filter: () => <span data-testid="icon-filter" />,
	Eye: () => <span data-testid="icon-eye" />,
}));

jest.mock('@/components/ui/breadcrumb', () => ({
	PageHeader: ({ title, children }: { title: string; children?: React.ReactNode }) => (
		<div data-testid="page-header">
			<h1>{title}</h1>
			{children}
		</div>
	),
}));

jest.mock('@/components/ui/button', () => ({
	Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
		<button {...props}>{children}</button>
	),
}));

jest.mock('@/components/ui/card', () => ({
	Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
	CardHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
	CardContent: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
	CardTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

jest.mock('@/components/ui/select', () => {
	const Select = ({ value, onValueChange, children }: { value: string; onValueChange: (val: string) => void; children: React.ReactNode }) => (
		<select data-testid="select" value={value || ''} onChange={(event) => onValueChange(event.target.value)}>
			{children}
		</select>
	);
	const SelectTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>;
	const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;
	const SelectValue = ({ placeholder, children }: { placeholder?: string; children?: React.ReactNode }) => (
		<option value="" disabled hidden>
			{children ?? placeholder ?? ''}
		</option>
	);
	const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
		<option value={value}>{children}</option>
	);
	return { Select, SelectTrigger, SelectContent, SelectValue, SelectItem };
});

jest.mock('@/components/ui/input', () => ({
	Input: ({ children, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props}>{children}</input>,
}));

jest.mock('@/components/ui/badge', () => ({
	Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

jest.mock('@/lib/utils', () => ({
	getFacultyName: jest.fn((value: string) => `Faculty ${value}`),
}));

const mockFetch = jest.fn();
let originalFetch: typeof fetch | undefined;

const mockCourses = [
	{
		id: 'course-1',
		course_code: 'CS101',
		course_name: 'Computer Science Basics',
		faculty: 'ENG',
		year: 1,
	},
	{
		id: 'course-2',
		course_code: 'CS201',
		course_name: 'Data Structures',
		faculty: 'ENG',
		year: 2,
	},
];

const mockStudents = [
	{
		user_id: 'student-1',
		register_number: 'REG001',
		full_name: 'Alice Johnson',
		initial_name: 'A. Johnson',
		email: 'alice@example.com',
		faculty: 'ENG',
		year_of_study: 1,
		phone: '1234567890',
		photo: '',
		enrolled_courses: [{ id: 'course-1' }],
		total_attendance: 12,
		recent_attendance: 3,
	},
	{
		user_id: 'student-2',
		register_number: 'REG002',
		full_name: 'Bob Smith',
		initial_name: 'B. Smith',
		email: 'bob@example.com',
		faculty: 'SCI',
		year_of_study: 2,
		phone: '0987654321',
		photo: '',
		enrolled_courses: [{ id: 'course-2' }, { id: 'course-1' }],
		total_attendance: 10,
		recent_attendance: 2,
	},
];

const mockSummary = {
	total_students: 2,
	unique_faculties: 2,
	total_courses: 3,
	avg_year: 1.5,
};

const resolveJson = (data: unknown) =>
	Promise.resolve({
		ok: true,
		json: () => Promise.resolve(data),
	});

beforeAll(() => {
	originalFetch = (global as typeof globalThis).fetch;
	(global as typeof globalThis).fetch = mockFetch as unknown as typeof fetch;
});

afterAll(() => {
	(global as typeof globalThis).fetch = originalFetch as typeof fetch;
	mockFetch.mockReset();
});

afterEach(() => {
	jest.clearAllMocks();
});

describe('Lecturer My Students Page', () => {
	beforeEach(() => {
		mockFetch.mockImplementation((url: string) => {
			if (url.startsWith('/api/lecturer/courses')) {
				return resolveJson({ success: true, courses: mockCourses });
			}
			if (url.startsWith('/api/lecturer/students')) {
				return resolveJson({ success: true, students: mockStudents, summary: mockSummary });
			}
			return resolveJson({ success: false });
		});
	});

	it('renders page header, summary cards, and filters', async () => {
		await act(async () => {
			render(<MyStudents />);
		});
		expect(await screen.findByRole('heading', { name: /my students/i })).toBeInTheDocument();
		expect(screen.getAllByTestId('card').length).toBeGreaterThanOrEqual(3);
		expect(screen.getByText(/total students/i)).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: /^filters$/i })).toBeInTheDocument();
		expect(screen.getAllByTestId('select').length).toBeGreaterThanOrEqual(3);
	});

	it('displays students table with records', async () => {
		await act(async () => {
			render(<MyStudents />);
		});
		expect(await screen.findByRole('table')).toBeInTheDocument();
		expect(screen.getByText(/alice johnson/i)).toBeInTheDocument();
		expect(screen.getByText(/faculty ENG/i)).toBeInTheDocument();
		expect(screen.getByText(/bob smith/i)).toBeInTheDocument();
	});

	it('filters students by search term', async () => {
		await act(async () => {
			render(<MyStudents />);
		});
		const searchInput = await screen.findByPlaceholderText(/search students/i);
		await act(async () => {
			fireEvent.change(searchInput, { target: { value: 'alice' } });
		});
		expect(screen.getByText(/alice johnson/i)).toBeInTheDocument();
		expect(screen.queryByText(/bob smith/i)).not.toBeInTheDocument();
	});

	it('shows empty state when no students are returned', async () => {
		mockFetch.mockImplementation((url: string) => {
			if (url.startsWith('/api/lecturer/courses')) {
				return resolveJson({ success: true, courses: mockCourses });
			}
			if (url.startsWith('/api/lecturer/students')) {
				return resolveJson({ success: true, students: [], summary: mockSummary });
			}
			return resolveJson({ success: false });
		});
		await act(async () => {
			render(<MyStudents />);
		});
		expect(await screen.findByText(/no students found/i)).toBeInTheDocument();
	});
});