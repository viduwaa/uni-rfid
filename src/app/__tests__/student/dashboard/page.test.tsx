import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentDashboard from '@/app/student/dashboard/page';

jest.mock('next/link', () => ({
	__esModule: true,
	default: ({ children }: { children: React.ReactNode }) => <a href="#mock-link">{children}</a>,
}));

jest.mock('lucide-react', () => ({
	Award: () => <span data-testid="icon-award" />,
	ChartLine: () => <span data-testid="icon-chart" />,
	CalendarClock: () => <span data-testid="icon-calendar" />,
	CreditCard: () => <span data-testid="icon-credit" />,
	BookOpen: () => <span data-testid="icon-book" />,
	AlertTriangle: () => <span data-testid="icon-alert" />,
	User: () => <span data-testid="icon-user" />,
	GraduationCap: () => <span data-testid="icon-cap" />,
	TrendingUp: () => <span data-testid="icon-trending" />,
}));

jest.mock('@/components/Logout', () => ({
	__esModule: true,
	default: () => <button type="button">Logout</button>,
}));

const mockUseStudentDashboard = jest.fn();

jest.mock('@/hooks/useStudentDashboard', () => ({
	useStudentDashboard: () => mockUseStudentDashboard(),
}));

jest.mock('@/lib/utils', () => ({
	getFacultyName: jest.fn((value: string) => value || 'Faculty'),
	cn: (...args: Array<string | false | null | undefined>) => args.filter(Boolean).join(' '),
}));

jest.mock('@/components/ui/card', () => ({
	Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
	CardContent: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
	CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
	CardHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
	CardTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

jest.mock('@/components/ui/button', () => ({
	Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
		<button {...props}>{children}</button>
	),
}));

jest.mock('@/components/ui/badge', () => ({
	Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

jest.mock('@/components/ui/skeleton', () => ({
	SkeletonDashboard: () => <div data-testid="skeleton" />,
}));

describe('Student Dashboard Page', () => {
	beforeEach(() => {
		mockUseStudentDashboard.mockReturnValue({
			data: {
				student: {
					full_name: 'Jane Doe',
					register_number: 'REG123',
					faculty: 'Engineering',
					year_of_study: 3,
				},
				stats: {
					totalCourses: 5,
					totalAttendancePercentage: 95,
					currentGPA: 3.75,
					currentBalance: 2500,
					overdueBooks: 0,
					pendingFines: 0,
				},
				courses: [{ id: 'course-1' }],
			},
			loading: false,
			error: null,
		});
	});

	it('shows the welcome heading with student name', () => {
		render(<StudentDashboard />);
		expect(screen.getByRole('heading', { name: /welcome, jane doe/i })).toBeInTheDocument();
	});

	it('renders key summary cards', () => {
		render(<StudentDashboard />);
		const summaryCards = screen.getAllByTestId('card').slice(0, 3);
		expect(within(summaryCards[0]).getByText(/active this semester/i)).toBeInTheDocument();
		expect(within(summaryCards[1]).getByText(/cumulative gpa/i)).toBeInTheDocument();
		expect(within(summaryCards[2]).getByText(/available balance/i)).toBeInTheDocument();
	});

	it('shows navigation card descriptions', () => {
		render(<StudentDashboard />);
		expect(screen.getByText(/view grades and transcripts/i)).toBeInTheDocument();
		expect(screen.getByText(/track and calculate gpa/i)).toBeInTheDocument();
		expect(screen.getByText(/monitor class attendance/i)).toBeInTheDocument();
		expect(screen.getByText(/view payment history/i)).toBeInTheDocument();
	});

	it('renders loading skeleton while data loads', () => {
		mockUseStudentDashboard.mockReturnValueOnce({
			data: null,
			loading: true,
			error: null,
		});
		render(<StudentDashboard />);
		expect(screen.getByTestId('skeleton')).toBeInTheDocument();
	});

	it('shows error card when hook returns an error', () => {
		mockUseStudentDashboard.mockReturnValueOnce({
			data: null,
			loading: false,
			error: 'Unable to load dashboard',
		});
		render(<StudentDashboard />);
		expect(screen.getByRole('heading', { name: /error/i })).toBeInTheDocument();
		expect(screen.getByText(/unable to load dashboard/i)).toBeInTheDocument();
	});
});
