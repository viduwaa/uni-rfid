import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../page';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  CircleUserRound: () => <div data-testid="icon-student" />,
  BookOpen: () => <div data-testid="icon-lecture" />,
  ShieldCheck: () => <div data-testid="icon-admin" />,
  SquareLibrary: () => <div data-testid="icon-library" />,
  Users: () => <div data-testid="icon-users" />,
  Hamburger: () => <div data-testid="icon-canteen" />,
}));

describe('Home Page', () => {
  beforeEach(() => {
    render(<Home />);
  });

  it('renders the main heading', () => {
    expect(
      screen.getByRole('heading', { name: /university management system/i })
    ).toBeInTheDocument();
  });

  it('renders the subtitle description', () => {
    expect(
      screen.getByText(/integrated with rfid card system/i)
    ).toBeInTheDocument();
  });

  describe('Admin Portal Card', () => {
    it('renders admin portal card with correct title', () => {
      expect(screen.getByText('Admin Portal')).toBeInTheDocument();
    });

    it('renders admin login button with correct link', () => {
      const link = screen.getByText('Admin Login').closest('a');
      expect(link).toHaveAttribute('href', '/admin');
    });

    it('renders admin icon', () => {
      expect(screen.getByTestId('icon-admin')).toBeInTheDocument();
    });

    it('displays admin portal description', () => {
      expect(
        screen.getByText('Manage students, lecturers, and system settings')
      ).toBeInTheDocument();
    });
  });

  describe('Lecture Portal Card', () => {
    it('renders lecture portal card with correct title', () => {
      expect(screen.getByText('Lecture Portal')).toBeInTheDocument();
    });

    it('renders lecture login button with correct link', () => {
      const link = screen.getByText('Lecture Login').closest('a');
      expect(link).toHaveAttribute('href', '/lecturer/');
    });

    it('renders lecture icon', () => {
      expect(screen.getByTestId('icon-lecture')).toBeInTheDocument();
    });

    it('displays lecture portal description', () => {
      expect(
        screen.getByText('Manage class attendance and student records')
      ).toBeInTheDocument();
    });
  });

  describe('Student Portal Card', () => {
    it('renders student portal card with correct title', () => {
      expect(screen.getByText('Student Portal')).toBeInTheDocument();
    });

    it('renders student login button with correct link', () => {
      const link = screen.getByText('Student Login').closest('a');
      expect(link).toHaveAttribute('href', '/student/');
    });

    it('renders student icon', () => {
      expect(screen.getByTestId('icon-student')).toBeInTheDocument();
    });

    it('displays student portal description', () => {
      expect(
        screen.getByText('View academic performance and personal records')
      ).toBeInTheDocument();
    });
  });

  describe('Library Portal Card', () => {
    it('renders library portal card with correct title', () => {
      expect(screen.getByText('Library Portal')).toBeInTheDocument();
    });

    it('renders library login button with correct link', () => {
      const link = screen.getByText('Library Login').closest('a');
      expect(link).toHaveAttribute('href', '/library/');
    });

    it('renders library icon', () => {
      expect(screen.getByTestId('icon-library')).toBeInTheDocument();
    });

    it('displays library portal description', () => {
      expect(
        screen.getByText('Manage library resources and services')
      ).toBeInTheDocument();
    });
  });

  describe('Canteen Portal Card', () => {
    it('renders canteen portal card with correct title', () => {
      expect(screen.getByText('Canteen Portal')).toBeInTheDocument();
    });

    it('renders canteen login button with correct link', () => {
      const link = screen.getByText('Canteen Login').closest('a');
      expect(link).toHaveAttribute('href', '/canteen/');
    });

    it('renders canteen icon', () => {
      expect(screen.getByTestId('icon-canteen')).toBeInTheDocument();
    });

    it('displays canteen portal description', () => {
      expect(
        screen.getByText('Manage canteen transactions and services')
      ).toBeInTheDocument();
    });
  });

  it('renders all 5 portal cards', () => {
    const cards = screen.getAllByRole('link');
    expect(cards).toHaveLength(5);
  });

  it('applies hover effects to cards', () => {
    const cards = screen.getAllByRole('link');
    cards.forEach((card) => {
      const cardElement = card.closest('.transition-all');
      expect(cardElement).toHaveClass('hover:shadow-md');
    });
  });
});
