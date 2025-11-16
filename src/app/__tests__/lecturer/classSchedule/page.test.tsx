import React from 'react';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClassSchedule from '@/app/lecturer/classSchedule/page';

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
		info: jest.fn(),
		warning: jest.fn(),
	},
}));

jest.mock('lucide-react', () => ({
	Calendar: () => <span data-testid="icon-calendar" />,
	Clock: () => <span data-testid="icon-clock" />,
	MapPin: () => <span data-testid="icon-map" />,
	Plus: () => <span data-testid="icon-plus" />,
	Edit2: () => <span data-testid="icon-edit" />,
	Trash2: () => <span data-testid="icon-trash" />,
	BookOpen: () => <span data-testid="icon-book" />,
	Users: () => <span data-testid="icon-users" />,
	Save: () => <span data-testid="icon-save" />,
	X: () => <span data-testid="icon-x" />,
}));

const calendarSpy = jest.fn();

jest.mock('react-big-calendar', () => {
	const Calendar = (props: any) => {
		calendarSpy(props);
		return (
			<div data-testid="calendar">
				{props.events?.map((event: any) => (
					<div key={event.id}>{event.title}</div>
				))}
			</div>
		);
	};
	return {
		__esModule: true,
		Calendar,
		momentLocalizer: () => jest.fn(),
		View: {},
		Views: {},
		SlotInfo: {} as unknown,
	};
});

jest.mock('@/components/PageHeader', () => ({
	__esModule: true,
	default: ({ title, subtitle, right }: { title: React.ReactNode; subtitle?: React.ReactNode; right?: React.ReactNode }) => (
		<header data-testid="page-header">
			<h1>{typeof title === 'string' ? title : 'Class Schedule Calendar'}</h1>
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
	const Select = ({ value, onValueChange, children }: { value: string; onValueChange: (val: string) => void; children: React.ReactNode }) => (
		<select data-testid="select" value={value || ''} onChange={(event) => onValueChange(event.target.value)}>
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

jest.mock('@/components/ui/textarea', () => ({
	Textarea: ({ children, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props}>{children}</textarea>,
}));

jest.mock('@/components/ui/dialog', () => ({
	Dialog: ({ open, children }: { open?: boolean; children: React.ReactNode }) => (open ? <div data-testid="dialog">{children}</div> : null),
	DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/badge', () => ({
	Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
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

const today = new Date();
const eventDate = today.toISOString();

const mockCalendarResponse = {
	success: true,
	events: [
		{
			id: 'event-1',
			course_id: 'course-1',
			event_type: 'one-time',
			day_of_week: null,
			specific_date: eventDate,
			start_time: '09:00:00',
			end_time: '10:00:00',
			room: 'Room 101',
			color: '#3b82f6',
			notes: '',
			lecturer_id: 'lec-1',
			course_code: 'CS101',
			course_name: 'Computer Science Basics',
			course_faculty: 'Engineering',
			course_year: 1,
			enrolled_students: 120,
		},
	],
};

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
	calendarSpy.mockClear();
});

describe('Lecturer Class Schedule Page', () => {
	it('renders page header with add class action', async () => {
		mockFetch
			.mockImplementationOnce(() => jsonResponse({ success: true, courses: mockCourses }))
			.mockImplementationOnce(() => jsonResponse(mockCalendarResponse));

		await act(async () => {
			render(<ClassSchedule />);
		});

		expect(await screen.findByText(/class schedule calendar/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /add class/i })).toBeInTheDocument();
	});

	it('displays calendar events after data loads', async () => {
		mockFetch
			.mockImplementationOnce(() => jsonResponse({ success: true, courses: mockCourses }))
			.mockImplementationOnce(() => jsonResponse(mockCalendarResponse));

		await act(async () => {
			render(<ClassSchedule />);
		});

		expect(await screen.findByTestId('calendar')).toBeInTheDocument();
		expect(screen.getByText(/cs101 - room 101/i)).toBeInTheDocument();
	});

	it('shows loading indicator while schedules are still fetching', async () => {
		mockFetch
			.mockImplementationOnce(() => jsonResponse({ success: true, courses: mockCourses }))
			.mockImplementationOnce(() => new Promise(() => {}));

		await act(async () => {
			render(<ClassSchedule />);
		});

		expect(screen.getByText(/loading calendar/i)).toBeInTheDocument();
	});
});
