import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddStudent from '@/app/admin/students/add/page';

// Mock sonner toast notifications
jest.mock('sonner', () => ({
	toast: {
		success: jest.fn(),
		error: jest.fn(),
	},
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
	return ({ children, href }: { children: React.ReactNode; href: string }) => (
		<a href={href}>{children}</a>
	);
});

// Mock lucide-react icons used in the component
jest.mock('lucide-react', () => ({
	Upload: () => <span data-testid="icon-upload" />,
	ArrowLeft: () => <span data-testid="icon-arrow-left" />,
}));

// Mock shadcn/ui components to simple HTML equivalents
jest.mock('@/components/ui/card', () => ({
	Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
	CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
	CardTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
	CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
	CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
	Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
		<button {...props}>{children}</button>
	),
}));

jest.mock('@/components/ui/input', () => ({
	Input: ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

jest.mock('@/components/ui/label', () => ({
	Label: ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
		<label {...props}>{children}</label>
	),
}));

jest.mock('@/components/ui/textarea', () => ({
	Textarea: ({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} />,
}));

jest.mock('@/components/ui/select', () => ({
	Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	SelectTrigger: ({ children }: { children: React.ReactNode }) => <button type="button">{children}</button>,
	SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder ?? ''}</span>,
	SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
		<div data-value={value}>{children}</div>
	),
}));

// Mock validateForm to bypass heavy validation logic
jest.mock('@/app/admin/students/add/validateForm', () => ({
	validateForm: jest.fn(() => ({})),
}));

// Provide a noop fetch implementation to avoid network calls
global.fetch = jest.fn(() =>
	Promise.resolve({
		ok: true,
		json: () => Promise.resolve({}),
	})
) as jest.Mock;

describe('Add Student Page', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders the page heading', () => {
		render(<AddStudent />);
		expect(screen.getByText('Add New Student')).toBeInTheDocument();
	});

	it('shows the student information section', () => {
		render(<AddStudent />);
		expect(screen.getByText('Student Information')).toBeInTheDocument();
		expect(
			screen.getByText('Enter the details of the new student to register them in the system')
		).toBeInTheDocument();
	});

	it('renders the upload photo label', () => {
		render(<AddStudent />);
		expect(screen.getByText('Upload Photo')).toBeInTheDocument();
	});

	it('renders primary action buttons', () => {
		render(<AddStudent />);
		expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Add Student' })).toBeInTheDocument();
	});
});