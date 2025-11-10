import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminLoginPage from '@/app/admin/page';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    replace: jest.fn(),
  })),
}));

// Mock LoginForm component
jest.mock('@/components/LoginForm', () => {
  return function MockLoginForm({ role }: { role: string }) {
    return <div data-testid="login-form">Login Form for {role}</div>;
  };
});

describe('Admin Login Page', () => {
  it('renders the admin login page', () => {
    render(<AdminLoginPage />);
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('renders login form with admin role', () => {
    render(<AdminLoginPage />);
    expect(screen.getByText('Login Form for admin')).toBeInTheDocument();
  });
});
