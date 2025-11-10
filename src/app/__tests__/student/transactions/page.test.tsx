import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentTransactions from '@/app/student/transactions/page';

jest.mock('next/link', () => ({
	__esModule: true,
	default: ({ children }: { children: React.ReactNode }) => <a href="#mock-link">{children}</a>,
}));

jest.mock('lucide-react', () => ({
	CreditCard: () => <span data-testid="icon-card" />,
	ArrowLeft: () => <span data-testid="icon-back" />,
	Loader2: () => <span data-testid="icon-loader" />,
	ShoppingCart: () => <span data-testid="icon-cart" />,
	Calendar: () => <span data-testid="icon-calendar" />,
	Receipt: () => <span data-testid="icon-receipt" />,
	TrendingUp: () => <span data-testid="icon-trending" />,
	Home: () => <span data-testid="icon-home" />,
	User: () => <span data-testid="icon-user" />,
	ChevronRight: () => <span data-testid="icon-chevron" />,
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
	Badge: ({ children, className }: { children: React.ReactNode; className?: string }) => (
		<span data-testid={className ? `badge-${className}` : undefined}>{children}</span>
	),
}));

jest.mock('@/components/PageHeader', () => ({
	__esModule: true,
	default: ({ title, subtitle }: { title: string; subtitle: string }) => (
		<div data-testid="page-header">
			<h1>{title}</h1>
			<p>{subtitle}</p>
		</div>
	),
}));

jest.mock('@/components/ui/table', () => ({
	Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
	TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
	TableCell: ({ children }: { children: React.ReactNode }) => <td>{children}</td>,
	TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
	TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
	TableRow: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
}));

const mockTransactions = [
	{
		id: '1',
		transaction_id: 'TXN-001',
		amount: 1200,
		description: 'Canteen lunch',
		status: 'completed',
		transaction_date: '2024-05-01T10:15:00.000Z',
		payment_method: 'NFC Card',
		items: [
			{ name: 'Chicken Rice', category: 'Food', quantity: 1, unit_price: 600, total_price: 600 },
			{ name: 'Juice', category: 'Drinks', quantity: 1, unit_price: 600, total_price: 600 },
		],
	},
	{
		id: '2',
		transaction_id: 'TXN-002',
		amount: 800,
		description: 'Snack purchase',
		status: 'pending',
		transaction_date: '2024-05-03T09:00:00.000Z',
		payment_method: 'Cash',
		items: [{ name: 'Snacks', category: 'Food', quantity: 2, unit_price: 400, total_price: 800 }],
	},
];

const mockFetch = jest.fn();
let originalFetch: typeof fetch;

beforeAll(() => {
	originalFetch = (global as typeof globalThis).fetch;
	(global as typeof globalThis).fetch = mockFetch as unknown as typeof fetch;
});

afterAll(() => {
	(global as typeof globalThis).fetch = originalFetch;
});

afterEach(() => {
	jest.clearAllMocks();
});

describe('Student Transactions Page', () => {
	const resolveWithData = (data: typeof mockTransactions) =>
		Promise.resolve({
			ok: true,
			json: () => Promise.resolve({ success: true, data }),
		});

	beforeEach(() => {
		mockFetch.mockImplementation(() => resolveWithData(mockTransactions));
	});

	it('renders header and summary cards', async () => {
		render(<StudentTransactions />);
		expect(screen.getByTestId('icon-loader')).toBeInTheDocument();
		expect(await screen.findByRole('heading', { level: 1, name: /transaction history/i })).toBeInTheDocument();
		expect(screen.getByText(/view your canteen and payment transactions/i)).toBeInTheDocument();
		const cards = screen.getAllByTestId('card').slice(0, 3);
		expect(within(cards[0]).getByText(/total transactions/i)).toBeInTheDocument();
		expect(within(cards[0]).getByText(String(mockTransactions.length))).toBeInTheDocument();
		expect(within(cards[1]).getByText(/total spent/i)).toBeInTheDocument();
		expect(within(cards[1]).getByText(/rs\./i)).toBeInTheDocument();
		expect(within(cards[2]).getByText(/this month/i)).toBeInTheDocument();
	});

	it('shows transaction rows when data is returned', async () => {
		render(<StudentTransactions />);
		const firstRow = await screen.findByText('TXN-001');
		expect(firstRow).toBeInTheDocument();
		expect(screen.getByText('TXN-002')).toBeInTheDocument();
		expect(screen.getAllByText(/nfc card/i).length).toBeGreaterThan(0);
		expect(screen.getAllByText(/cash/i).length).toBeGreaterThan(0);
		expect(screen.getAllByText(/rs\./i).length).toBeGreaterThan(0);
	});

	it('renders empty state when no transactions exist', async () => {
		mockFetch.mockImplementationOnce(() => resolveWithData([]));
		render(<StudentTransactions />);
		expect(await screen.findByText(/no transactions/i)).toBeInTheDocument();
		expect(screen.getByText(/you haven't made any transactions yet/i)).toBeInTheDocument();
	});

	it('shows loader while request is in-flight', () => {
		mockFetch.mockReturnValueOnce(new Promise(() => {}));
		render(<StudentTransactions />);
		expect(screen.getByTestId('icon-loader')).toBeInTheDocument();
	});

	it('displays error card when fetch fails', async () => {
		mockFetch.mockImplementationOnce(() =>
			Promise.resolve({
				ok: false,
				json: () => Promise.resolve({ message: 'Fetch failed' }),
			})
		);
		render(<StudentTransactions />);
		expect(await screen.findByText(/error/i)).toBeInTheDocument();
		expect(screen.getByText(/failed to fetch transactions/i)).toBeInTheDocument();
	});
});
