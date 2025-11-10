import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LibraryDashboard from '@/app/library/dashboard/page';

jest.mock('next/link', () => ({
	__esModule: true,
	default: ({ href, children }: { href: string; children: React.ReactNode }) => (
		<a href={href}>{children}</a>
	),
}));

jest.mock('lucide-react', () => ({
	BookPlus: () => <span data-testid="icon-book-plus" />,
	BookOpenCheck: () => <span data-testid="icon-book-open-check" />,
	BookMarked: () => <span data-testid="icon-book-marked" />,
	UserPlus: () => <span data-testid="icon-user-plus" />,
	Users: () => <span data-testid="icon-users" />,
	LibraryBig: () => <span data-testid="icon-library-big" />,
	FileSearch: () => <span data-testid="icon-file-search" />,
	BarChart3: () => <span data-testid="icon-bar-chart" />,
	Settings: () => <span data-testid="icon-settings" />,
	CreditCard: () => <span data-testid="icon-credit-card" />,
	ArrowLeftRight: () => <span data-testid="icon-arrow-left-right" />,
	Tag: () => <span data-testid="icon-tag" />,
}));

jest.mock('@/components/ui/card', () => ({
	Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
	CardContent: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
	CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
	CardHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
	CardTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

jest.mock('@/components/ui/button', () => ({
	Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock('@/components/Logout', () => ({
	__esModule: true,
	default: () => <button data-testid="logout-button">Logout</button>,
}));

describe('Library Dashboard Page', () => {
	it('renders the library dashboard header and subtitle', () => {
		render(<LibraryDashboard />);

		expect(screen.getByRole('heading', { name: /library management system/i })).toBeInTheDocument();
		expect(screen.getByText(/comprehensive tools for library administration/i)).toBeInTheDocument();
	});

	it('shows the primary library management cards', () => {
		render(<LibraryDashboard />);

		expect(screen.getAllByTestId('card')).toHaveLength(5);
		expect(screen.getByText(/add new books/i)).toBeInTheDocument();
		expect(screen.getByText(/issue book tags/i)).toBeInTheDocument();
		expect(screen.getByText(/member management/i)).toBeInTheDocument();
		expect(screen.getByText(/catalog search/i)).toBeInTheDocument();
		expect(screen.getByText(/library reports/i)).toBeInTheDocument();
		expect(screen.getAllByText(/rfid/i)[0]).toBeInTheDocument();
	});

	it('links each management card to the expected routes', () => {
		render(<LibraryDashboard />);

		const addBooksLink = screen.getByRole('link', { name: /add new books/i });
		expect(addBooksLink).toHaveAttribute('href', './book-add/');

		const issueTagsLink = screen.getByRole('link', { name: /issue book tags/i });
		expect(issueTagsLink).toHaveAttribute('href', './issue-tags/');

		const memberLink = screen.getByRole('link', { name: /member management/i });
		expect(memberLink).toHaveAttribute('href', './member-management/');

		const catalogLink = screen.getByRole('link', { name: /catalog search/i });
		expect(catalogLink).toHaveAttribute('href', './catalog-search/');

		const reportsLink = screen.getByRole('link', { name: /library reports/i });
		expect(reportsLink).toHaveAttribute('href', './reports/');
	});

	it('displays the logout button for staff users', () => {
		render(<LibraryDashboard />);

		expect(screen.getByTestId('logout-button')).toBeInTheDocument();
	});
});
