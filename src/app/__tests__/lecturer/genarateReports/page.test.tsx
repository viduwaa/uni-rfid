import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import GenerateReports from '@/app/lecturer/genarateReports/page';

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
	Download: () => <span data-testid="icon-download" />,
	FileText: () => <span data-testid="icon-file" />,
	BarChart3: () => <span data-testid="icon-chart" />,
	Users: () => <span data-testid="icon-users" />,
	Calendar: () => <span data-testid="icon-calendar" />,
	TrendingUp: () => <span data-testid="icon-trending" />,
	Filter: () => <span data-testid="icon-filter" />,
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

jest.mock('@/components/ui/badge', () => ({
	Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

const mockFetch = jest.fn();
let originalFetch: typeof fetch | undefined;

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

const mockReportData = {
	success: true,
	reportType: 'summary',
	generatedAt: '2024-05-06T10:00:00.000Z',
	courses: [
		{
			course_code: 'CS101',
			course_name: 'Computer Science Basics',
			total_enrolled: 120,
			total_attended: 95,
			total_sessions: 12,
			overall_attendance_rate: 79,
		},
	],
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

describe('Lecturer Generate Reports Page', () => {
	beforeEach(() => {
		mockFetch.mockImplementation((url: string) => {
			if (url.startsWith('/api/lecturer/courses')) {
				return resolveJson({ success: true, courses: mockCourses });
			}
			if (url.startsWith('/api/lecturer/reports')) {
				return resolveJson(mockReportData);
			}
			return resolveJson({ success: false });
		});
	});

	it('renders page header and configuration controls', async () => {
		await act(async () => {
			render(<GenerateReports />);
		});
		expect(await screen.findByRole('heading', { name: /generate reports/i })).toBeInTheDocument();
		expect(screen.getByText(/report configuration/i)).toBeInTheDocument();
		expect(screen.getByText(/summary report/i)).toBeInTheDocument();
		expect(screen.getByText(/student report/i)).toBeInTheDocument();
		expect(document.querySelectorAll('input[type="date"]').length).toBe(2);
	});

	it('shows placeholder before any report is generated', async () => {
		await act(async () => {
			render(<GenerateReports />);
		});
		expect(await screen.findByText(/no report generated/i)).toBeInTheDocument();
		expect(screen.getByText(/configure your report settings/i)).toBeInTheDocument();
	});

	it('displays course summary after generating report', async () => {
		await act(async () => {
			render(<GenerateReports />);
		});
		const button = await screen.findByRole('button', { name: /generate report/i });
		await act(async () => {
			fireEvent.click(button);
		});
		const courseSummary = await screen.findByText(/course summary/i);
		expect(courseSummary).toBeInTheDocument();
		const card = courseSummary.closest('[data-testid="card"]');
		expect(card).toBeTruthy();
		const table = within(card as HTMLElement).getByRole('table');
		expect(within(table).getByText('CS101')).toBeInTheDocument();
		expect(within(table).getByText(/95/)).toBeInTheDocument();
	});
});
