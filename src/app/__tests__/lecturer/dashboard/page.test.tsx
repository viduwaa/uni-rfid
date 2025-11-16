import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LectureDashboard from '@/app/lecturer/dashboard/page';

jest.mock('next/link', () => ({
	__esModule: true,
	default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

jest.mock('lucide-react', () => ({
	ChartColumn: () => <span data-testid="icon-chart" />,
	CalendarCheck2: () => <span data-testid="icon-calendar" />,
	Users: () => <span data-testid="icon-users" />,
	History: () => <span data-testid="icon-history" />,
	UserCheck: () => <span data-testid="icon-user-check" />,
	GraduationCap: () => <span data-testid="icon-graduation" />,
}));

jest.mock('@/components/ui/card', () => ({
	Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
	CardContent: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
	CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
	CardHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
	CardTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

jest.mock('@/components/PageHeader', () => ({
	__esModule: true,
	default: ({ title, subtitle }: { title: React.ReactNode; subtitle?: React.ReactNode }) => (
		<header>
			<h1>{title}</h1>
			{subtitle && <p>{subtitle}</p>}
		</header>
	),
}));

jest.mock('@/components/Logout', () => ({
	__esModule: true,
	default: () => <button>Logout</button>,
}));

jest.mock('@/components/ui/button', () => ({
	Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
		<button {...props}>{children}</button>
	),
}));

describe('Lecturer Dashboard Page', () => {
	it('renders the main heading and subtitle', () => {
		render(<LectureDashboard />);
		expect(screen.getByRole('heading', { level: 1, name: /lecturer dashboard/i })).toBeInTheDocument();
		expect(
			screen.getByText(/manage attendance, view reports and track participation/i)
		).toBeInTheDocument();
	});

	it('shows key navigation cards with descriptions', () => {
		render(<LectureDashboard />);
		expect(screen.getByRole('heading', { name: /get attendance/i })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: /generate reports/i })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: /my students/i })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: /class schedule/i })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: /attendance history/i })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: /student results/i })).toBeInTheDocument();
		expect(screen.getByText(/record students attendance/i)).toBeInTheDocument();
		expect(screen.getByText(/generate detailed attendance reports/i)).toBeInTheDocument();
	});

	it('renders a logout button', () => {
		render(<LectureDashboard />);
		const logoutButton = screen.getByRole('button', { name: /logout/i });
		expect(logoutButton).toBeInTheDocument();
	});
});
