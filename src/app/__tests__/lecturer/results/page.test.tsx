import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentResultsPage from '@/app/lecturer/results/page';

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

jest.mock('jspdf', () => {
	return jest.fn().mockImplementation(() => ({
		setFontSize: jest.fn(),
		text: jest.fn(),
		save: jest.fn(),
	}));
});

jest.mock('jspdf-autotable', () => jest.fn());

jest.mock('lucide-react', () => ({
	PlusIcon: () => <span data-testid="icon-plus" />,
	EditIcon: () => <span data-testid="icon-edit" />,
	Trash2Icon: () => <span data-testid="icon-trash" />,
	GraduationCapIcon: () => <span data-testid="icon-cap" />,
	TrophyIcon: () => <span data-testid="icon-trophy" />,
	FileTextIcon: () => <span data-testid="icon-file" />,
	UsersIcon: () => <span data-testid="icon-users" />,
	DownloadIcon: () => <span data-testid="icon-download" />,
}));

jest.mock('@/components/ui/breadcrumb', () => ({
	__esModule: true,
	PageHeader: ({ title, children }: { title: string; children?: React.ReactNode }) => (
		<div data-testid="page-header">
			<h1>{title}</h1>
			{children}
		</div>
	),
}));

jest.mock('@/components/ui/button', () => ({
	__esModule: true,
	Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
		<button {...props}>{children}</button>
	),
}));

jest.mock('@/components/ui/card', () => ({
	__esModule: true,
	Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
	CardHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
	CardContent: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
	CardTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
	CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

jest.mock('@/components/ui/select', () => ({
	__esModule: true,
	Select: ({ children }: { children: React.ReactNode }) => <div data-testid="select">{children}</div>,
	SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
	SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
		<div data-value={value}>{children}</div>
	),
}));

jest.mock('@/components/ui/input', () => ({
	__esModule: true,
	Input: ({ children, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props}>{children}</input>,
}));

jest.mock('@/components/ui/textarea', () => ({
	__esModule: true,
	Textarea: ({ children, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
		<textarea {...props}>{children}</textarea>
	),
}));

jest.mock('@/components/ui/label', () => ({
	__esModule: true,
	Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
		<label htmlFor={htmlFor}>{children}</label>
	),
}));

jest.mock('@/components/ui/badge', () => ({
	__esModule: true,
	Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

jest.mock('@/components/ui/table', () => ({
	__esModule: true,
	Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
	TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
	TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
	TableRow: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
	TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
	TableCell: ({ children }: { children: React.ReactNode }) => <td>{children}</td>,
}));

jest.mock('@/components/ui/dialog', () => ({
	__esModule: true,
	Dialog: ({ children, open = false }: { children: React.ReactNode; open?: boolean }) => (
		<div>{open ? children : null}</div>
	),
	DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
	DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
	DialogTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
	DialogTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/tabs', () => ({
	__esModule: true,
	Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	TabsTrigger: ({ value, children }: { value: string; children: React.ReactNode }) => (
		<button data-testid={`tab-${value}`}>{children}</button>
	),
	TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/BulkExamResults', () => ({
	__esModule: true,
	default: ({ onResultsAdded }: { onResultsAdded: () => void }) => (
		<div data-testid="bulk-results">
			Bulk Results Component
			<button onClick={onResultsAdded}>Trigger Refresh</button>
		</div>
	),
}));

const mockFetch = jest.fn();
let originalFetch: typeof fetch | undefined;

const mockCourses = [
	{
		id: 'course-1',
		course_code: 'CS101',
		course_name: 'Computer Science Basics',
		credits: 3,
	},
];

const mockStudents = [
	{
		user_id: 'student-1',
		register_number: 'REG001',
		full_name: 'Alice Johnson',
		email: 'alice@example.com',
		faculty: 'ENG',
		year_of_study: 1,
		enrolled_courses: [
			{ course_id: 'course-1', course_code: 'CS101', course_name: 'Computer Science Basics' },
		],
	},
];

const mockResults = [
	{
		id: 'result-1',
		student_id: 'student-1',
		course_id: 'course-1',
		exam_date: '2024-05-01',
		grade: 'A',
		remarks: 'Excellent performance',
		published_at: '2024-05-06T10:00:00.000Z',
		register_number: 'REG001',
		student_name: 'Alice Johnson',
		student_email: 'alice@example.com',
		course_code: 'CS101',
		course_name: 'Computer Science Basics',
		credits: 3,
	},
];

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
});

afterEach(() => {
	mockFetch.mockReset();
});

describe('Lecturer Student Results Page', () => {
	beforeEach(() => {
		mockFetch.mockImplementation((url: string, options?: RequestInit) => {
			if (url.startsWith('/api/lecturer/courses')) {
				return resolveJson({ success: true, courses: mockCourses });
			}
			if (url.startsWith('/api/lecturer/students')) {
				return resolveJson({ success: true, students: mockStudents });
			}
			if (url.startsWith('/api/lecturer/results')) {
				if (options?.method === 'POST') {
					return resolveJson({ success: true, message: 'Result saved' });
				}
				if (options?.method === 'DELETE') {
					return resolveJson({ success: true, message: 'Result deleted' });
				}
				return resolveJson({ success: true, results: mockResults });
			}
			return resolveJson({ success: false });
		});
	});

	it('renders header and tab triggers', async () => {
		render(<StudentResultsPage />);
		expect(await screen.findByRole('heading', { name: /student results management/i })).toBeInTheDocument();
		expect(screen.getByTestId('bulk-results')).toBeInTheDocument();
		expect(screen.getByTestId('tab-bulk')).toBeInTheDocument();
		expect(screen.getByTestId('tab-results')).toBeInTheDocument();
	});

	it('shows results table rows when data exists', async () => {
		render(<StudentResultsPage />);
		expect(await screen.findByText(/alice johnson/i)).toBeInTheDocument();
		expect(screen.getAllByText(/computer science basics/i).length).toBeGreaterThan(0);
		expect(screen.getByText(/excellent performance/i)).toBeInTheDocument();
	});

	it('shows empty state when no results exist', async () => {
		mockFetch.mockImplementation((url: string) => {
			if (url.startsWith('/api/lecturer/courses')) {
				return resolveJson({ success: true, courses: mockCourses });
			}
			if (url.startsWith('/api/lecturer/students')) {
				return resolveJson({ success: true, students: mockStudents });
			}
			if (url.startsWith('/api/lecturer/results')) {
				return resolveJson({ success: true, results: [] });
			}
			return resolveJson({ success: false });
		});
		render(<StudentResultsPage />);
		expect(await screen.findByText(/no exam results found/i)).toBeInTheDocument();
	});
});
