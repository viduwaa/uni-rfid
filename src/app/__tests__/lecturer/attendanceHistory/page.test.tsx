import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import AttendanceHistory from '@/app/lecturer/attendanceHistory/page';

jest.mock('next/link', () => ({
	__esModule: true,
	default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
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
	Calendar: () => <span data-testid="icon-calendar" />,
	Search: () => <span data-testid="icon-search" />,
	Users: () => <span data-testid="icon-users" />,
	UserCheck: () => <span data-testid="icon-user-check" />,
	Clock: () => <span data-testid="icon-clock" />,
	Filter: () => <span data-testid="icon-filter" />,
	Download: () => <span data-testid="icon-download" />,
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
	CardContent: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
	CardHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
	CardTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

jest.mock('@/components/ui/select', () => ({
	Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	SelectItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	SelectValue: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
}));

jest.mock('@/components/ui/input', () => ({
	Input: ({ children, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
		<input {...props}>{children}</input>
	),
}));

jest.mock('@/components/ui/popover', () => ({
	Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	PopoverTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	PopoverContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/calendar', () => ({
	Calendar: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/badge', () => ({
	Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

const mockFetch = jest.fn();

beforeAll(() => {
	(global as typeof globalThis).fetch = mockFetch as unknown as typeof fetch;
});

afterEach(() => {
	jest.clearAllMocks();
});

const mockCourses = [
	{
		id: 'course-1',
		course_code: 'CS101',
		course_name: 'Computer Science Basics',
		faculty: 'Engineering',
		year: 1,
		enrolled_students: 120,
	},
];

const mockSummary = {
	total_present: 45,
	total_enrolled: 60,
	attendance_percentage: 75,
};

const mockRecords = [
	{
		id: 'record-1',
		date: '2024-05-01T08:00:00.000Z',
		checked_in: '08:05 AM',
		created_at: '2024-05-01T08:10:00.000Z',
		student_id: 'student-1',
		register_number: 'REG001',
		student_name: 'Alice Johnson',
		student_faculty: 'Engineering',
		year_of_study: 2,
		course_id: 'course-1',
		course_code: 'CS101',
		course_name: 'Computer Science Basics',
		course_faculty: 'Engineering',
		course_year: 1,
	},
];

const resolveJson = (data: unknown) =>
	Promise.resolve({
		ok: true,
		json: () => Promise.resolve(data),
	});

describe('Lecturer Attendance History Page', () => {
	beforeEach(() => {
		mockFetch.mockImplementation((url: string) => {
			if (url.startsWith('/api/lecturer/courses')) {
				return resolveJson({ success: true, courses: mockCourses });
			}
			if (url.startsWith('/api/lecturer/attendance')) {
				return resolveJson({ success: true, attendance: mockRecords, summary: mockSummary });
			}
			return resolveJson({ success: false });
		});
	});

	it('renders header and filter section', async () => {
		render(<AttendanceHistory />);
		await screen.findByText(/^attendance history$/i);
		expect(screen.getByRole('heading', { name: /^filters$/i })).toBeInTheDocument();
		expect(screen.getByText(/search/i)).toBeInTheDocument();
		expect(screen.getByText(/export csv/i)).toBeInTheDocument();
	});

	it('displays summary cards when summary data is available', async () => {
		render(<AttendanceHistory />);
		const summaryCard = await screen.findByText(/total present/i);
		expect(summaryCard).toBeInTheDocument();
	});

	it('renders attendance records table rows', async () => {
		render(<AttendanceHistory />);
		await screen.findByRole('heading', { name: /attendance records/i });
		const row = await screen.findByRole('row', { name: /alice johnson/i });
		const rowWithin = within(row);
		expect(rowWithin.getByText(/cs101/i)).toBeInTheDocument();
		expect(rowWithin.getByText(/reg001/i)).toBeInTheDocument();
	});

	it('shows empty state when no records are returned', async () => {
		mockFetch.mockImplementationOnce(() => resolveJson({ success: true, courses: mockCourses }))
			.mockImplementationOnce(() =>
				resolveJson({ success: true, attendance: [], summary: mockSummary })
			);
		render(<AttendanceHistory />);
		await screen.findByText(/no attendance records found/i);
		expect(screen.getByText(/no attendance records found/i)).toBeInTheDocument();
	});

	it('renders loader while attendance data is loading', () => {
		mockFetch.mockImplementationOnce(() => resolveJson({ success: true, courses: mockCourses }))
			.mockImplementationOnce(
				() => new Promise(() => {})
			);
		render(<AttendanceHistory />);
		expect(screen.getByText(/loading attendance history/i)).toBeInTheDocument();
	});
});
