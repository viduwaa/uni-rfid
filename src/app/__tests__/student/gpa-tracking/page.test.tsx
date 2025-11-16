import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GPATracking from '@/app/student/gpa-tracking/page';

jest.mock('next/link', () => ({
	__esModule: true,
	default: ({ children }: { children: React.ReactNode }) => <a href="#mock-link">{children}</a>,
}));

jest.mock('lucide-react', () => ({
	Award: () => <span data-testid="icon-award" />,
	Trash2: () => <span data-testid="icon-trash" />,
	Edit: () => <span data-testid="icon-edit" />,
	Plus: () => <span data-testid="icon-plus" />,
	ArrowLeft: () => <span data-testid="icon-back" />,
	Calculator: () => <span data-testid="icon-calculator" />,
	Loader2: () => <span data-testid="icon-loader" />,
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

jest.mock('@/components/ui/input', () => ({
	Input: ({ children, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
		<input {...props}>{children}</input>
	),
}));

jest.mock('@/components/ui/label', () => ({
	Label: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
}));

jest.mock('@/components/ui/select', () => ({
	Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	SelectItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	SelectValue: () => <span>Select Value</span>,
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
	useStudentGrades: () => mockUseStudentGrades(),
}));

const baseGrades = [
	{
		id: 'grade-1',
		course_code: 'CS101',
		course_name: 'Programming Fundamentals',
		credits: 3,
		grade: 'A',
	},
	{
		id: 'grade-2',
		course_code: 'CS102',
		course_name: 'Data Structures',
		credits: 4,
		grade: 'B+',
	},
];

describe('GPA Tracking Page', () => {
	beforeEach(() => {
		mockUseStudentGrades.mockReturnValue({
			grades: baseGrades,
			gpa: 3.5,
			loading: false,
			error: null,
		});
	});

	it('renders the header and summary cards', () => {
		render(<GPATracking />);
		expect(screen.getByRole('heading', { level: 1, name: /^gpa calculator$/i })).toBeInTheDocument();
		expect(screen.getByText(/calculate and track your gpa progress/i)).toBeInTheDocument();
		const summaryCards = screen.getAllByTestId('card').slice(0, 3);
		expect(summaryCards).toHaveLength(3);
		expect(screen.getByText(/current gpa/i)).toBeInTheDocument();
		expect(screen.getByText(/simulated gpa/i)).toBeInTheDocument();
		expect(screen.getByText(/projected gpa/i)).toBeInTheDocument();
	});

	it('shows actual grades table when data exists', () => {
		render(<GPATracking />);
		expect(screen.getByText('Programming Fundamentals')).toBeInTheDocument();
		expect(screen.getByText('Data Structures')).toBeInTheDocument();
		expect(screen.getAllByText(/grade/i)[0]).toBeInTheDocument();
	});

	it('renders the GPA calculator form controls', () => {
		render(<GPATracking />);
		expect(screen.getByText(/add courses to calculate and predict your gpa/i)).toBeInTheDocument();
		expect(screen.getByPlaceholderText(/e\.g\., data structures/i)).toBeInTheDocument();
		expect(screen.getAllByRole('button', { name: /add/i })[0]).toBeInTheDocument();
	});

	it('shows loader when grades are loading', () => {
		mockUseStudentGrades.mockReturnValueOnce({
			grades: [],
			gpa: 0,
			loading: true,
			error: null,
		});
		render(<GPATracking />);
		expect(screen.getByTestId('icon-loader')).toBeInTheDocument();
	});
});
