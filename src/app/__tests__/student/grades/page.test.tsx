import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentGrades from '@/app/student/grades/page';

jest.mock('next/link', () => ({
	__esModule: true,
	default: ({ children }: { children: React.ReactNode }) => <a href="#mock-link">{children}</a>,
}));

jest.mock('lucide-react', () => ({
	Award: () => <span data-testid="icon-award" />,
	Download: () => <span data-testid="icon-download" />,
	ArrowLeft: () => <span data-testid="icon-back" />,
	Loader2: () => <span data-testid="icon-loader" />,
	TrendingUp: () => <span data-testid="icon-trending" />,
	FileText: () => <span data-testid="icon-file" />,
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

jest.mock('@/components/ui/table', () => ({
	Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
	TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
	TableCell: ({ children }: { children: React.ReactNode }) => <td>{children}</td>,
	TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
	TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
	TableRow: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
}));

const mockUseStudentGrades = jest.fn();

jest.mock('@/hooks/useStudentGrades', () => ({
	useStudentGrades: (selectedYear: string) => mockUseStudentGrades(selectedYear),
}));

const baseGrades = [
	{
		id: 'grade-1',
		course_code: 'CS101',
		course_name: 'Introduction to Programming',
		credits: 3,
		grade: 'A',
		exam_date: '2024-05-20T00:00:00.000Z',
		remarks: 'Excellent performance',
	},
	{
		id: 'grade-2',
		course_code: 'CS102',
		course_name: 'Data Structures',
		credits: 4,
		grade: 'B+',
		exam_date: '2024-05-22T00:00:00.000Z',
		remarks: 'Solid understanding',
	},
];

describe('Student Grades Page', () => {
	beforeEach(() => {
		mockUseStudentGrades.mockReturnValue({
			grades: baseGrades,
			gpa: 3.65,
			loading: false,
			error: null,
		});
	});

	it('renders the page header and summary cards', () => {
		render(<StudentGrades />);
		expect(screen.getByRole('heading', { level: 1, name: /^academic results$/i })).toBeInTheDocument();
		const summaryCards = screen.getAllByTestId('card').slice(0, 3);
		expect(within(summaryCards[0]).getByText(/current gpa/i)).toBeInTheDocument();
		expect(within(summaryCards[1]).getByText(/courses completed/i)).toBeInTheDocument();
		expect(within(summaryCards[2]).getByText(/total credits/i)).toBeInTheDocument();
	});

	it('shows grade rows when data is available', () => {
		render(<StudentGrades />);
		expect(screen.getByText('CS101')).toBeInTheDocument();
		expect(screen.getByText('Introduction to Programming')).toBeInTheDocument();
		expect(screen.getByText('A')).toBeInTheDocument();
		expect(screen.getByText('B+')).toBeInTheDocument();
	});

	it('displays year filter buttons', () => {
		render(<StudentGrades />);
		expect(screen.getByRole('button', { name: /all years/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /1st year/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /4th year/i })).toBeInTheDocument();
	});

	it('shows empty state when no grades are returned', () => {
		mockUseStudentGrades.mockReturnValueOnce({
			grades: [],
			gpa: 0,
			loading: false,
			error: null,
		});
		render(<StudentGrades />);
		expect(screen.getByText(/no grades available/i)).toBeInTheDocument();
	});

	it('renders loader while data is loading', () => {
		mockUseStudentGrades.mockReturnValueOnce({
			grades: [],
			gpa: 0,
			loading: true,
			error: null,
		});
		render(<StudentGrades />);
		expect(screen.getByTestId('icon-loader')).toBeInTheDocument();
	});

	it('shows error card when hook returns an error', () => {
		mockUseStudentGrades.mockReturnValueOnce({
			grades: [],
			gpa: 0,
			loading: false,
			error: 'Unable to load grades',
		});
		render(<StudentGrades />);
		expect(screen.getByRole('heading', { name: /error/i })).toBeInTheDocument();
		expect(screen.getByText(/unable to load grades/i)).toBeInTheDocument();
	});
});
