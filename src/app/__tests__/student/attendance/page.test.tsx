import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import AttendanceTracking from '@/app/student/attendance/page';

jest.mock('next/link', () => ({
	__esModule: true,
	default: ({ children }: { children: React.ReactNode }) => <a href="#mock-link">{children}</a>,
}));

jest.mock('lucide-react', () => ({
	CalendarClock: () => <span data-testid="icon-calendar" />,
	TrendingUp: () => <span data-testid="icon-up" />,
	TrendingDown: () => <span data-testid="icon-down" />,
	Minus: () => <span data-testid="icon-minus" />,
	Loader2: () => <span data-testid="icon-loader" />,
	ArrowLeft: () => <span data-testid="icon-back" />,
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
	Badge: ({ children, ...props }: { children: React.ReactNode }) => <span {...props}>{children}</span>,
}));

jest.mock('@/components/ui/select', () => ({
	Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	SelectItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	SelectValue: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
}));

jest.mock('@/components/ui/table', () => ({
	Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
	TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
	TableCell: ({ children }: { children: React.ReactNode }) => <td>{children}</td>,
	TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
	TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
	TableRow: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
}));

const mockUseStudentAttendance = jest.fn();

jest.mock('@/hooks/useStudentAttendance', () => ({
	useStudentAttendance: (year: string, semester: string) => mockUseStudentAttendance(year, semester),
}));

const baseRecords = [
	{
		id: 'record-1',
		date: '2024-05-01T08:00:00.000Z',
		checked_in: '08:00 AM',
		course_code: 'CS101',
		course_name: 'Intro to Programming',
		lecturer_name: 'Dr. Smith',
	},
	{
		id: 'record-2',
		date: '2024-05-02T08:00:00.000Z',
		checked_in: '08:05 AM',
		course_code: 'CS102',
		course_name: 'Algorithms',
		lecturer_name: 'Prof. Allen',
	},
];

const baseSummary = [
	{
		course_code: 'CS101',
		course_name: 'Intro to Programming',
		year: 1,
		attended_classes: 28,
		total_classes: 30,
		attendance_percentage: 93,
	},
	{
		course_code: 'CS102',
		course_name: 'Algorithms',
		year: 1,
		attended_classes: 20,
		total_classes: 30,
		attendance_percentage: 67,
	},
];

describe('Attendance Tracking Page', () => {
	beforeEach(() => {
		mockUseStudentAttendance.mockReturnValue({
			records: baseRecords,
			summary: baseSummary,
			loading: false,
			error: null,
		});
	});

	it('renders the page heading and filter controls', () => {
		render(<AttendanceTracking />);
		expect(screen.getByRole('heading', { level: 1, name: /^attendance tracking$/i })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: /filter options/i })).toBeInTheDocument();
		expect(
			screen.getByText((content, element) =>
				element?.tagName === 'LABEL' && content.trim() === 'Year'
			)
		).toBeInTheDocument();
		expect(
			screen.getByText((content, element) =>
				element?.tagName === 'LABEL' && content.trim() === 'Semester'
			)
		).toBeInTheDocument();
	});

	it('displays attendance summary cards when data is available', () => {
		render(<AttendanceTracking />);
		const summaryCard = screen
			.getAllByTestId('card')
			.find((card) => within(card).queryByText(/attendance summary by course/i));
		const summaryWithin = within(summaryCard as HTMLElement);
		expect(summaryWithin.getByText(/attendance summary by course/i)).toBeInTheDocument();
		expect(summaryWithin.getByRole('heading', { level: 3, name: /cs101/i })).toBeInTheDocument();
		expect(summaryWithin.getByText(/intro to programming/i)).toBeInTheDocument();
		expect(screen.getByText(/93%/)).toBeInTheDocument();
		expect(screen.getByText(/67%/)).toBeInTheDocument();
	});

	it('shows attendance records table rows', () => {
		render(<AttendanceTracking />);
		const recordsCard = screen
			.getAllByTestId('card')
			.find((card) => within(card).queryByRole('heading', { name: /attendance records/i }));
		const tableWithin = within(recordsCard as HTMLElement);
		expect(tableWithin.getByText('CS101')).toBeInTheDocument();
		expect(tableWithin.getByText('CS102')).toBeInTheDocument();
		expect(tableWithin.getByText('Dr. Smith')).toBeInTheDocument();
		expect(tableWithin.getByText('Prof. Allen')).toBeInTheDocument();
	});

	it('renders loader when attendance data is loading', () => {
		mockUseStudentAttendance.mockReturnValueOnce({
			records: [],
			summary: [],
			loading: true,
			error: null,
		});
		render(<AttendanceTracking />);
		expect(screen.getByTestId('icon-loader')).toBeInTheDocument();
	});

	it('shows error card when hook returns an error', () => {
		mockUseStudentAttendance.mockReturnValueOnce({
			records: [],
			summary: [],
			loading: false,
			error: 'Unable to load attendance',
		});
		render(<AttendanceTracking />);
		expect(screen.getByRole('heading', { name: /error/i })).toBeInTheDocument();
		expect(screen.getByText(/unable to load attendance/i)).toBeInTheDocument();
	});
});
