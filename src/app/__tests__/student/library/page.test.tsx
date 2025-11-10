import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentLibrary from '@/app/student/library/page';

jest.mock('next/link', () => ({
	__esModule: true,
	default: ({ children }: { children: React.ReactNode }) => <a href="#mock-link">{children}</a>,
}));

jest.mock('lucide-react', () => ({
	Book: () => <span data-testid="icon-book" />,
	ArrowLeft: () => <span data-testid="icon-back" />,
	Loader2: () => <span data-testid="icon-loader" />,
	Calendar: () => <span data-testid="icon-calendar" />,
	AlertTriangle: () => <span data-testid="icon-alert" />,
	CheckCircle: () => <span data-testid="icon-check" />,
	Clock: () => <span data-testid="icon-clock" />,
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

const mockFetch = jest.fn();

beforeAll(() => {
	(global as typeof globalThis).fetch = mockFetch as unknown as typeof fetch;
});

afterEach(() => {
	jest.clearAllMocks();
});

const baseLoans = [
	{
		id: 'loan-1',
		title: 'The Pragmatic Programmer',
		author: 'Andrew Hunt',
		barcode: 'B001',
		borrowed_at: '2024-05-01T00:00:00.000Z',
		due_date: '2024-05-15T00:00:00.000Z',
		returned_at: null,
		status: 'active',
		loan_status: 'active',
		days_overdue: 0,
	},
	{
		id: 'loan-2',
		title: 'Clean Code',
		author: 'Robert C. Martin',
		barcode: 'B002',
		borrowed_at: '2024-04-01T00:00:00.000Z',
		due_date: '2024-04-15T00:00:00.000Z',
		returned_at: null,
		status: 'active',
		loan_status: 'overdue',
		days_overdue: 5,
	},
	{
		id: 'loan-3',
		title: 'Refactoring',
		author: 'Martin Fowler',
		barcode: 'B003',
		borrowed_at: '2024-03-01T00:00:00.000Z',
		due_date: '2024-03-15T00:00:00.000Z',
		returned_at: '2024-03-10T00:00:00.000Z',
		status: 'returned',
		loan_status: 'returned',
		days_overdue: 0,
	},
];

const resolveWithData = (data: typeof baseLoans) =>
	Promise.resolve({
		ok: true,
		json: () => Promise.resolve({ success: true, data }),
	});

describe('Student Library Page', () => {
	beforeEach(() => {
		mockFetch.mockImplementation(() => resolveWithData(baseLoans));
	});

	it('renders header and summary cards', async () => {
		render(<StudentLibrary />);
		expect(screen.getByTestId('icon-loader')).toBeInTheDocument();
		await screen.findByRole('heading', { level: 1, name: /^library status$/i });
		expect(screen.getByRole('heading', { name: /active loans/i })).toBeInTheDocument();
		expect(screen.getByText(/currently borrowed/i)).toBeInTheDocument();
		expect(screen.getByText(/need immediate return/i)).toBeInTheDocument();
		expect(screen.getByText(/all time/i)).toBeInTheDocument();
	});

	it('displays overdue alert and active loan rows', async () => {
		render(<StudentLibrary />);
		await screen.findByText(/overdue books alert/i);
		expect(screen.getByText(/you have 1 overdue book/i)).toBeInTheDocument();
		const currentLoansCard = screen
			.getAllByTestId('card')
			.find((card) => within(card).queryByRole('heading', { name: /current borrowed books/i }));
		const currentWithin = within(currentLoansCard as HTMLElement);
		expect(currentWithin.getByText(/the pragmatic programmer/i)).toBeInTheDocument();
		expect(currentWithin.getByText(/clean code/i)).toBeInTheDocument();
	});

	it('renders loan history table', async () => {
		render(<StudentLibrary />);
		await screen.findByText(/loan history/i);
		const historyCard = screen
			.getAllByTestId('card')
			.find((card) => within(card).queryByRole('heading', { name: /loan history/i }));
		const historyWithin = within(historyCard as HTMLElement);
		expect(historyWithin.getByText(/refactoring/i)).toBeInTheDocument();
	});

	it('shows empty state when no active loans', async () => {
		mockFetch.mockResolvedValueOnce(
			resolveWithData([
				{
					id: 'loan-4',
					title: 'Domain-Driven Design',
					author: 'Eric Evans',
					barcode: 'B004',
					borrowed_at: '2024-02-01T00:00:00.000Z',
					due_date: '2024-02-15T00:00:00.000Z',
					returned_at: '2024-02-10T00:00:00.000Z',
					status: 'returned',
					loan_status: 'returned',
					days_overdue: 0,
				},
			])
		);
		render(<StudentLibrary />);
		await screen.findByText(/no active loans/i);
		expect(screen.getByText(/you don't have any books currently on loan/i)).toBeInTheDocument();
	});

	it('renders loader while request is pending', () => {
		mockFetch.mockReturnValueOnce(new Promise(() => {}));
		render(<StudentLibrary />);
		expect(screen.getByTestId('icon-loader')).toBeInTheDocument();
	});

	it('shows error card when fetch fails', async () => {
		mockFetch.mockResolvedValueOnce(
			Promise.resolve({
				ok: false,
				json: () => Promise.resolve({ message: 'Failure' }),
			})
		);
		render(<StudentLibrary />);
		await screen.findByRole('heading', { name: /error/i });
		expect(screen.getByText(/failed to fetch library data/i)).toBeInTheDocument();
	});
});
