import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GetAttendance from '@/app/lecturer/getAttendance/page';

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
		info: jest.fn(),
		warning: jest.fn(),
	},
}));

jest.mock('lucide-react', () => ({
	UserCheck: () => <span data-testid="icon-user-check" />,
	Search: () => <span data-testid="icon-search" />,
	RefreshCw: () => <span data-testid="icon-refresh" />,
	Radio: () => <span data-testid="icon-radio" />,
	Zap: () => <span data-testid="icon-zap" />,
	GraduationCap: () => <span data-testid="icon-cap" />,
	Users: () => <span data-testid="icon-users" />,
	BookOpen: () => <span data-testid="icon-book" />,
	Save: () => <span data-testid="icon-save" />,
	CheckCircle: () => <span data-testid="icon-check" />,
	Clock: () => <span data-testid="icon-clock" />,
	Building: () => <span data-testid="icon-building" />,
}));

jest.mock('socket.io-client', () => ({
	io: jest.fn(() => ({
		on: jest.fn(),
		emit: jest.fn(),
		disconnect: jest.fn(),
	})),
}));

jest.mock('@/components/PageHeader', () => ({
	__esModule: true,
	default: ({ title, subtitle, right }: { title: React.ReactNode; subtitle?: React.ReactNode; right?: React.ReactNode }) => (
		<header data-testid="page-header">
			<h1 data-testid="page-title">{typeof title === 'string' ? title : 'Get Attendance'}</h1>
			{subtitle && <p>{subtitle}</p>}
			{right}
		</header>
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
	CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

jest.mock('@/components/ui/select', () => {
	const Select = ({ value, onValueChange, children, disabled }: { value: string; onValueChange: (val: string) => void; children: React.ReactNode; disabled?: boolean }) => (
		<select data-testid="select" value={value || ''} disabled={disabled} onChange={(event) => onValueChange(event.target.value)}>
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

jest.mock('@/components/ui/input', () => ({
	Input: ({ children, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props}>{children}</input>,
}));

jest.mock('@/components/ui/label', () => ({
	Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
		<label htmlFor={htmlFor}>{children}</label>
	),
}));

jest.mock('@/components/ui/badge', () => ({
	Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

jest.mock('@/components/DeviceStatus', () => ({
	__esModule: true,
	default: () => <div data-testid="device-status">Device Ready</div>,
}));

jest.mock('@/components/RFIDLogger', () => ({
	RFIDLogger: () => <div data-testid="rfid-logger">RFID Logger</div>,
}));

const mockFetch = jest.fn();
let originalFetch: typeof fetch;

const jsonResponse = (data: unknown) =>
	Promise.resolve({
		ok: true,
		headers: { get: () => 'application/json' },
		json: () => Promise.resolve(data),
	}) as unknown as Response;

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

const mockStudents = [
	{
		student_id: 'stu-1',
		full_name: 'Alice Johnson',
		register_number: 'REG001',
		faculty: 'eng',
		card_uid: 'CARD-1',
	},
	{
		student_id: 'stu-2',
		full_name: 'Bob Smith',
		register_number: 'REG002',
		faculty: 'eng',
		card_uid: 'CARD-2',
	},
];

const mockSummary = {
	total_present: 5,
	total_enrolled: 30,
	attendance_percentage: 50,
};

const mockAttendanceRecords = [
	{
		id: 'attendance-1',
		student_id: 'stu-1',
		register_number: 'REG001',
		student_name: 'Alice Johnson',
		checked_in: '09:05 AM',
		created_at: '2024-05-06T09:05:00.000Z',
	},
];

beforeAll(() => {
	originalFetch = global.fetch;
	global.fetch = mockFetch as unknown as typeof fetch;
});

afterAll(() => {
	global.fetch = originalFetch;
});

afterEach(() => {
	jest.clearAllMocks();
	mockFetch.mockReset();
});

describe('Lecturer Get Attendance Page', () => {
	beforeEach(() => {
		const defaultAttendance = { success: true, attendance: mockAttendanceRecords, summary: mockSummary };
		const attendanceResponses = [
			{ success: true, attendance: [], summary: null },
			{ success: true, attendance: [], summary: mockSummary },
			defaultAttendance,
		];

		mockFetch.mockImplementation((url: string, options?: RequestInit) => {
			if (url === '/api/lecturer/courses') {
				return jsonResponse({ success: true, courses: mockCourses });
			}
			if (url.startsWith('/api/lecturer/courses/') && url.endsWith('/students')) {
				return jsonResponse({ success: true, students: mockStudents });
			}
			if (url.startsWith('/api/lecturer/attendance?')) {
				const response = attendanceResponses.shift() || defaultAttendance;
				return jsonResponse(response);
			}
			if (url === '/api/lecturer/attendance' && options?.method === 'POST') {
				return jsonResponse({ success: true });
			}
			if (url === '/api/lecturer/attendance/session') {
				return jsonResponse({ success: true });
			}
			return jsonResponse({ success: false });
		});
	});

	it('renders header, device status, and disabled start button by default', async () => {
		await act(async () => {
			render(<GetAttendance />);
		});

		expect(await screen.findByText(/get attendance/i)).toBeInTheDocument();
		expect(screen.getByTestId('device-status')).toBeInTheDocument();
		const startButton = screen.getByRole('button', { name: /start attendance session/i });
		expect(startButton).toBeDisabled();
	});

	it('enables starting a session after selecting course and hall, then shows summary stats', async () => {
		await act(async () => {
			render(<GetAttendance />);
		});

		const courseSelect = screen.getAllByTestId('select')[0];
		const hallInput = screen.getByPlaceholderText(/enter hall name/i);

		await act(async () => {
			fireEvent.change(courseSelect, { target: { value: 'course-1' } });
			fireEvent.change(hallInput, { target: { value: 'Hall A' } });
		});

		const startButton = screen.getByRole('button', { name: /start attendance session/i });
		await waitFor(() => expect(startButton).not.toBeDisabled());

		await act(async () => {
			fireEvent.click(startButton);
		});

		expect(await screen.findByText(/session active/i)).toBeInTheDocument();
		expect(await screen.findByText(/cs101 - hall a/i)).toBeInTheDocument();
		expect(await screen.findByText(/no attendance recorded yet/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /swipe card on reader/i })).toBeDisabled();
	});

	it('allows selecting a student to record attendance', async () => {
		await act(async () => {
			render(<GetAttendance />);
		});

		const courseSelect = screen.getAllByTestId('select')[0];
		const hallInput = screen.getByPlaceholderText(/enter hall name/i);

		await act(async () => {
			fireEvent.change(courseSelect, { target: { value: 'course-1' } });
			fireEvent.change(hallInput, { target: { value: 'Hall A' } });
		});

		await act(async () => {
			fireEvent.click(screen.getByRole('button', { name: /start attendance session/i }));
		});

		const studentEntry = await screen.findByText('Alice Johnson');
		await act(async () => {
			fireEvent.click(studentEntry);
		});

		await waitFor(() =>
			expect(mockFetch).toHaveBeenCalledWith(
				'/api/lecturer/attendance',
				expect.objectContaining({
					method: 'POST',
					body: expect.any(String),
				}),
			)
		);

		expect(await screen.findByText(/present/i)).toBeInTheDocument();
		expect(screen.getAllByText('Alice Johnson').length).toBeGreaterThan(0);
	});
});
