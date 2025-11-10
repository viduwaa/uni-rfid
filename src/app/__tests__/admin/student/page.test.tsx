import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentManagement from '@/app/admin/students/page';

jest.mock('next/link', () => ({
	__esModule: true,
	default: ({ children, href }: { children: React.ReactNode; href: string }) => (
		<a href={href}>{children}</a>
	),
}));

jest.mock('lucide-react', () => ({
	Users: () => <span data-testid="icon-users" />,
	GraduationCap: () => <span data-testid="icon-graduation" />,
	BookOpen: () => <span data-testid="icon-book" />,
	Search: () => <span data-testid="icon-search" />,
	Edit: () => <span data-testid="icon-edit" />,
	Trash2: () => <span data-testid="icon-trash" />,
	UserCheck: () => <span data-testid="icon-user-check" />,
	UserX: () => <span data-testid="icon-user-x" />,
	Plus: () => <span data-testid="icon-plus" />,
	Save: () => <span data-testid="icon-save" />,
	X: () => <span data-testid="icon-x" />,
	ArrowLeft: () => <span data-testid="icon-arrow-left" />,
	Home: () => <span data-testid="icon-home" />,
}));

jest.mock('sonner', () => ({
	toast: {
		success: jest.fn(),
		error: jest.fn(),
	},
}));

jest.mock('@/lib/utils', () => ({
	getFacultyName: jest.fn((value: string) => value),
	cn: jest.fn((...args: string[]) => args.filter(Boolean).join(' ')),
}));

jest.mock('@/app/admin/students/StudentCourseEnrollmentDialog', () => ({
	__esModule: true,
	default: () => null,
}));

jest.mock('@/components/PageHeader', () => ({
	__esModule: true,
	default: ({ title, right }: { title: React.ReactNode; right?: React.ReactNode }) => (
		<header data-testid="page-header">
			<h1>{typeof title === 'string' ? title : 'Student Management'}</h1>
			{right}
		</header>
	),
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
	Input: ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

jest.mock('@/components/ui/badge', () => ({
	Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

jest.mock('@/components/ui/table', () => ({
	Table: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	TableBody: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	TableCell: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
	TableHead: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	TableHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	TableRow: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/dialog', () => ({
	Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
	DialogFooter: ({ children }: { children: React.ReactNode }) => <footer>{children}</footer>,
	DialogHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
	DialogTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
	DialogTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/label', () => ({
	Label: ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
		<label {...props}>{children}</label>
	),
}));

jest.mock('@/components/ui/select', () => {
	const Select = ({ value, onValueChange, children, disabled }: { value: string; onValueChange: (value: string) => void; children: React.ReactNode; disabled?: boolean }) => (
		<select
			data-testid="select"
			value={value || ''}
			disabled={disabled}
			onChange={(event) => onValueChange(event.target.value)}
		>
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
		<option value={value}>{typeof children === 'string' ? children : value}</option>
	);
	return { Select, SelectTrigger, SelectContent, SelectValue, SelectItem };
});

jest.mock('@/components/ui/textarea', () => ({
	Textarea: ({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} />,
}));

const mockStudents = [
	{
		user_id: 'stu-1',
		register_number: 'ENG001',
		full_name: 'Alice Johnson',
		initial_name: 'A. Johnson',
		nic_no: '123456789V',
		email: 'alice@example.com',
		faculty: 'tec',
		year_of_study: 3,
		address: 'Campus Housing',
		phone: '1234567890',
		photo: null,
		date_of_birth: '2002-01-01',
		created_at: '2024-01-01',
		updated_at: '2024-01-02',
		card_status: 'ACTIVE',
		card_uid: 'CARD-1',
		enrolled_courses: [
			{
				id: 'course-1',
				course_code: 'CS101',
				course_name: 'Algorithms',
				faculty: 'tec',
				year: 3,
				credits: 3,
			},
		],
	},
];

let originalFetch: typeof fetch;
let mockFetch: jest.Mock;

beforeAll(() => {
	originalFetch = global.fetch;
});

afterAll(() => {
	global.fetch = originalFetch;
});

afterEach(() => {
	jest.clearAllMocks();
});

describe('Student Management Page', () => {
	beforeEach(() => {
		mockFetch = jest.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ students: mockStudents }),
		});
		global.fetch = mockFetch as unknown as typeof fetch;
	});

	it('renders the student management heading', async () => {
		render(<StudentManagement />);
		expect(
			await screen.findByRole('heading', { name: /student management/i })
		).toBeInTheDocument();
	});

	it('shows the add new student action in the header', async () => {
		render(<StudentManagement />);
		expect(
			await screen.findByRole('button', { name: /add new student/i })
		).toBeInTheDocument();
	});

	it('renders student summary cards with key metrics', async () => {
		render(<StudentManagement />);
		expect(await screen.findByText(/total students/i)).toBeInTheDocument();
		expect(screen.getByText(/active cards/i)).toBeInTheDocument();
		expect(screen.getByText(/no cards/i)).toBeInTheDocument();
		expect(screen.getByText(/faculties/i, { selector: 'p' })).toBeInTheDocument();
	});

	it('displays the enhanced search input placeholder', async () => {
		render(<StudentManagement />);
		expect(
			await screen.findByPlaceholderText(
				/search by name, register number, email, or faculty/i
			)
		).toBeInTheDocument();
	});

	it('requests students on mount', async () => {
		render(<StudentManagement />);
		await waitFor(() => expect(mockFetch).toHaveBeenCalledWith('/api/admin/students'));
	});
});